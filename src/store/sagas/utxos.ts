import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { call } from 'redux-saga/effects';
import { BIP329Label, UTXO } from 'src/core/wallets/interfaces';
import { LabelRefType, LabelType } from 'src/core/wallets/enums';
import Relay from 'src/core/services/operations/Relay';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { genrateOutputDescriptors } from 'src/core/utils';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { createWatcher } from '../utilities';

import { ADD_LABELS, BULK_UPDATE_LABELS, CREATE_UTXO_REFERENCE } from '../sagaActions/utxos';

export function* addLabelsWorker({
  payload,
}: {
  payload: {
    txId: string;
    vout?: number;
    wallet: Wallet | Vault;
    labels: { name: string; isSystem: boolean }[];
    type;
  };
}) {
  const { txId, vout, wallet, labels, type } = payload;
  const origin = genrateOutputDescriptors(wallet, false);
  const tags = [];
  labels.forEach((label) => {
    const ref = vout !== undefined ? `${txId}:${vout}` : txId;
    const tag = {
      id: `${ref}${label.name}`,
      label: label.name,
      isSystem: label.isSystem,
      ref,
      type,
      origin,
    };
    tags.push(tag);
  });
  yield call(dbManager.createObjectBulk, RealmSchema.Tags, tags);
}

export function* bulkUpdateLabelsWorker({
  payload,
}: {
  payload: {
    labelChanges: {
      added: { isSystem: boolean; name: string }[];
      deleted: { isSystem: boolean; name: string }[];
    };
    UTXO: UTXO;
    wallet: Wallet;
  };
}) {
  const { labelChanges, wallet, UTXO } = payload;
  const origin = genrateOutputDescriptors(wallet, false);
  const addedTags: BIP329Label[] = labelChanges.added.map((label) => ({
    id: `${UTXO.txId}:${UTXO.vout}${label.name}`,
    ref: `${UTXO.txId}:${UTXO.vout}`,
    type: LabelRefType.OUTPUT,
    label: label.name,
    origin,
    isSystem: label.isSystem,
  }));
  const deletedTagIds = labelChanges.deleted.map(
    (label) => `${UTXO.txId}:${UTXO.vout}${label.name}`
  );
  yield call(dbManager.createObjectBulk, RealmSchema.Tags, addedTags);
  for (let i = 0; i < deletedTagIds.length; i += 1) {
    yield call(dbManager.deleteObjectById, RealmSchema.Tags, deletedTagIds[i]);
  }
}

export function* createUTXOReferenceWorker({
  payload,
}: {
  payload: { labels: Array<{ name: string; type: LabelType }>; txId: string; vout: number }[];
}) {
  const UTXOInfos = [];
  payload.forEach((item) => {
    const { txId, vout, labels } = item;
    UTXOInfos.push({
      id: `${txId}${vout}`,
      txId,
      vout,
      walletId: 'ABC123',
      labels,
    });
  });
  const keeper = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
  yield call(Relay.addUTXOinfos, keeper.id, UTXOInfos);
  yield call(dbManager.createObjectBulk, RealmSchema.UTXOInfo, UTXOInfos);
}

export const addLabelsWatcher = createWatcher(addLabelsWorker, ADD_LABELS);
export const bulkUpdateLabelWatcher = createWatcher(bulkUpdateLabelsWorker, BULK_UPDATE_LABELS);
export const createUTXOReferenceWatcher = createWatcher(
  createUTXOReferenceWorker,
  CREATE_UTXO_REFERENCE
);
