import { call, put, select } from 'redux-saga/effects';
import semver from 'semver';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { Platform } from 'react-native';
import Relay from 'src/services/operations/Relay';
import DeviceInfo from 'react-native-device-info';
import { getReleaseTopic } from 'src/utils/releaseTopic';
import messaging from '@react-native-firebase/messaging';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { encrypt, generateEncryptionKey } from 'src/services/operations/encryption';
import { BIP329Label, UTXOInfo } from 'src/core/wallets/interfaces';
import { LabelRefType } from 'src/core/wallets/enums';
import { genrateOutputDescriptors } from 'src/core/utils';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { setAppVersion, setPinHash } from '../reducers/storage';
import { stringToArrayBuffer } from './login';
import { createWatcher } from '../utilities';
import {
  resetReduxStore,
  updateVersionHistory,
  UPDATE_VERSION_HISTORY,
  migrateLabelsToBip329,
  MIGRATE_LABELS_329,
} from '../sagaActions/upgrade';
import { RootState } from '../store';
import { generateSeedHash } from '../sagaActions/login';
import { setupKeeperAppWorker } from './storage';

export const SWITCH_TO_MAINNET_VERSION = '0.0.99';
export const ADDITION_OF_VAULTSHELL_VERSION = '1.0.1';
export const BIP329_INTRODUCTION_VERSION = '1.0.7';
export const LABELS_INTRODUCTION_VERSION = '1.0.4';

export function* applyUpgradeSequence({
  previousVersion,
  newVersion,
}: {
  previousVersion: string;
  newVersion: string;
}) {
  console.log(`applying upgrade sequence - from: ${previousVersion} to ${newVersion}`);
  if (semver.lt(previousVersion, SWITCH_TO_MAINNET_VERSION)) yield call(switchToMainnet);
  if (semver.lte(previousVersion, ADDITION_OF_VAULTSHELL_VERSION))
    yield call(additionOfVaultShellId);
  yield put(setAppVersion(newVersion));
  yield put(updateVersionHistory(previousVersion, newVersion));
  if (
    semver.lt(previousVersion, BIP329_INTRODUCTION_VERSION) &&
    semver.gte(previousVersion, LABELS_INTRODUCTION_VERSION)
  ) {
    yield put(migrateLabelsToBip329());
  }
}

function* switchToMainnet() {
  const AES_KEY = yield select((state) => state.login.key);
  const uint8array = yield call(stringToArrayBuffer, AES_KEY);

  // remove existing realm database
  const deleted = yield call(dbManager.deleteRealm, uint8array);
  if (!deleted) throw new Error('failed to switch to mainnet');

  // reset redux store
  const pinHash = yield select((state: RootState) => state.storage.pinHash); // capture pinhash before resetting redux
  yield put(resetReduxStore());

  // re-initialise a fresh instance of realm
  yield call(dbManager.initializeRealm, uint8array);
  // setup the keeper app
  yield call(setupKeeperAppWorker, { payload: {} });

  // saturate the reducer w/ pin
  yield put(setPinHash(pinHash));
  yield put(generateSeedHash());
}

function* additionOfVaultShellId() {
  const { id, primarySeed }: KeeperApp = yield call(
    dbManager.getObjectByIndex,
    RealmSchema.KeeperApp
  );
  const vaults: Vault[] = yield call(dbManager.getCollection, RealmSchema.Vault);
  try {
    for (const vault of vaults) {
      vault.shellId = id;
      const encryptionKey = generateEncryptionKey(primarySeed);
      const vaultEncrypted = encrypt(encryptionKey, JSON.stringify(vault));
      // updating the vault image on relay
      const response = yield call(Relay.updateVaultImage, {
        vaultShellId: vault.shellId,
        vaultId: vault.id,
        vault: vaultEncrypted,
      });
      if (response.updated) {
        yield call(dbManager.updateObjectById, RealmSchema.Vault, vault.id, { shellId: id });
      }
    }
  } catch (err) {
    console.log(err);
  }
}

function* updateVersionHistoryWorker({
  payload,
}: {
  payload: { previousVersion: string; newVersion: string };
}) {
  const { previousVersion, newVersion } = payload;
  try {
    const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
    const response = yield call(Relay.updateAppImage, {
      appId: app.id,
      version: newVersion,
    });
    if (response.updated) {
      yield call(dbManager.createObject, RealmSchema.VersionHistory, {
        version: `${newVersion}(${DeviceInfo.getBuildNumber()})`,
        releaseNote: '',
        date: new Date().toString(),
        title: `Upgraded from ${previousVersion} to ${newVersion}`,
      });
      messaging().unsubscribeFromTopic(getReleaseTopic(previousVersion));
      messaging().subscribeToTopic(getReleaseTopic(newVersion));

      const res = yield call(Relay.fetchReleaseNotes, newVersion);

      let notes = '';
      if (res.release) {
        if (Platform.OS === 'ios') notes = res.release.releaseNotes.ios;
        else notes = res.release.releaseNotes.android;
      }
      yield call(
        dbManager.updateObjectById,
        RealmSchema.VersionHistory,
        `${newVersion}(${DeviceInfo.getBuildNumber()})`,
        {
          version: `${newVersion}(${DeviceInfo.getBuildNumber()})`,
          releaseNote: notes,
          date: new Date().toString(),
          title: `Upgraded from ${previousVersion} to ${newVersion}`,
        }
      );
    }
  } catch (error) {
    console.log({ error });
  }
}

export const updateVersionHistoryWatcher = createWatcher(
  updateVersionHistoryWorker,
  UPDATE_VERSION_HISTORY
);

function* migrateLablesWorker() {
  try {
    const UTXOLabels: UTXOInfo[] = yield call(dbManager.getCollection, RealmSchema.UTXOInfo);
    const tags = [];
    const wallets: Wallet[] = yield call(dbManager.getCollection, RealmSchema.Wallet);

    UTXOLabels.forEach((utxo) => {
      if (utxo.labels.length) {
        const wallet = wallets.find((w) => w.id === utxo.walletId);
        const origin = genrateOutputDescriptors(wallet, false);
        utxo.labels.forEach((label) => {
          const ref = `${utxo.txId}:${utxo.vout}`;
          const labelName = label.name;
          const tag: BIP329Label = {
            id: `${ref}${labelName}`,
            type: LabelRefType.OUTPUT,
            isSystem: false,
            label: labelName,
            ref,
            origin,
          };
          tags.push(tag);
        });
      }
    });
    if (tags.length) {
      const { id }: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
      const updated = yield call(Relay.modifyLabels, id, tags.length ? tags : [], []);
      if (updated) {
        const labelsmigrated = yield call(dbManager.createObjectBulk, RealmSchema.Tags, tags);
        console.log('Labels migrated: ', labelsmigrated);
      }
    }
  } catch (error) {
    console.log({ error });
  }
}

export const migrateLablesWatcher = createWatcher(migrateLablesWorker, MIGRATE_LABELS_329);
