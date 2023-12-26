import { useEffect, useState } from 'react';
import { ParsedVauleText, parseTextforVaultConfig } from 'src/core/utils';
import { generateSignerFromMetaData } from 'src/hardware';
import { SignerStorage, SignerType, VaultType } from 'src/core/wallets/enums';
import { useAppSelector } from 'src/store/hooks';
import { NewVaultInfo } from 'src/store/sagas/wallets';
import { useDispatch } from 'react-redux';
import { addNewVault } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/services/sentry';
import { setupKeeperApp } from 'src/store/sagaActions/storage';
import { VaultScheme } from 'src/core/wallets/interfaces/vault';
import messaging from '@react-native-firebase/messaging';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { setRecoveryCreatedApp } from 'src/store/reducers/storage';

const useConfigRecovery = () => {
  const { appId } = useAppSelector((state) => state.storage);
  const { relayVaultError, relayVaultUpdate } = useAppSelector((state) => state.bhr);

  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [scheme, setScheme] = useState<VaultScheme>();
  const [signersList, setSignersList] = useState([]);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  async function createNewApp() {
    try {
      const fcmToken = await messaging().getToken();
      dispatch(setRecoveryCreatedApp(true));
      dispatch(setupKeeperApp(fcmToken));
    } catch (error) {
      dispatch(setRecoveryCreatedApp(true));
      dispatch(setupKeeperApp());
    }
  }

  useEffect(() => {
    if (appId && scheme) {
      try {
        const vaultInfo: NewVaultInfo = {
          vaultType: VaultType.DEFAULT,
          vaultScheme: scheme,
          vaultSigners: signersList,
          vaultDetails: {
            name: 'Vault',
            description: 'Secure your sats',
          },
        };
        dispatch(addNewVault({ newVaultInfo: vaultInfo }));
      } catch (err) {
        captureError(err);
      }
      setRecoveryLoading(false);
    }
  }, [appId, signersList]);

  useEffect(() => {
    if (relayVaultUpdate) {
      setRecoveryLoading(false);
      navigation.replace('App');
    }
    if (relayVaultError) {
      setRecoveryLoading(false);
      Alert.alert('Something went wrong!');
    }
  }, [relayVaultUpdate, relayVaultError]);

  const initateRecovery = (text) => {
    setRecoveryLoading(true);
    try {
      const parsedText: ParsedVauleText = parseTextforVaultConfig(text);
      if (parsedText) {
        const signers = [];
        parsedText.signersDetails.forEach((config) => {
          const { signer } = generateSignerFromMetaData({
            xpub: config.xpub,
            derivationPath: config.path,
            xfp: config.masterFingerprint,
            signerType: SignerType.OTHER_SD,
            storageType: SignerStorage.WARM,
            isMultisig: config.isMultisig,
          });
          signers.push(signer);
        });
        setScheme(parsedText.scheme);
        setSignersList(signers);
        if (!appId) {
          createNewApp();
        }
      }
    } catch (err) {
      setRecoveryLoading(false);
      console.log(err);
      Alert.alert(`Something went wrong!`);
    }
  };

  return { recoveryLoading, initateRecovery };
};

export default useConfigRecovery;
