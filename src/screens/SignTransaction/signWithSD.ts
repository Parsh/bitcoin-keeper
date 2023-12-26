import { Alert } from 'react-native';
import WalletOperations from 'src/core/wallets/operations';
import { captureError } from 'src/services/sentry';
import config from 'src/core/config';
import { generateSeedWordsKey } from 'src/core/wallets/factories/VaultFactory';
import idx from 'idx';
import { signWithTapsigner, readTapsigner } from 'src/hardware/tapsigner';
import { signWithColdCard } from 'src/hardware/coldcard';
import { isSignerAMF } from 'src/hardware';
import { EntityKind } from 'src/core/wallets/enums';
import InheritanceKeyServer from 'src/services/operations/InheritanceKey';
import SigningServer from 'src/services/operations/SigningServer';

export const signTransactionWithTapsigner = async ({
  setTapsignerModal,
  signingPayload,
  currentKey,
  withModal,
  defaultVault,
  serializedPSBT,
  card,
  cvc,
  signer,
}) => {
  setTapsignerModal(false);
  const { inputsToSign } = signingPayload[0];
  // AMF flow for signing
  if (isSignerAMF(signer)) {
    await withModal(() => readTapsigner(card, cvc))();
    const { xpriv } = currentKey;
    const inputs = idx(signingPayload, (_) => _[0].inputs);
    if (!inputs) throw new Error('Invalid signing payload, inputs missing');
    const { signedSerializedPSBT } = WalletOperations.internallySignVaultPSBT(
      defaultVault,
      inputs,
      serializedPSBT,
      xpriv
    );
    return { signedSerializedPSBT, signingPayload: null };
  }
  return withModal(async () => {
    const signedInput = await signWithTapsigner(card, inputsToSign, cvc, currentKey);
    signingPayload.forEach((payload) => {
      payload.inputsToSign = signedInput;
    });
    return { signingPayload, signedSerializedPSBT: null };
  })();
};

export const signTransactionWithColdCard = async ({
  setColdCardModal,
  withNfcModal,
  serializedPSBTEnvelop,
  closeNfc,
}) => {
  try {
    setColdCardModal(false);
    await withNfcModal(async () => signWithColdCard(serializedPSBTEnvelop.serializedPSBT));
  } catch (error) {
    if (error.toString() === 'Error') {
      // ignore if nfc modal is dismissed
    } else {
      closeNfc();
      captureError(error);
    }
  }
};

export const signTransactionWithMobileKey = async ({
  setPasswordModal,
  signingPayload,
  defaultVault,
  serializedPSBT,
  signerId,
}) => {
  setPasswordModal(false);
  const inputs = idx(signingPayload, (_) => _[0].inputs);
  if (!inputs) throw new Error('Invalid signing payload, inputs missing');
  const [signer] = defaultVault.signers.filter((signer) => signer.signerId === signerId);
  const { signedSerializedPSBT } = WalletOperations.internallySignVaultPSBT(
    defaultVault,
    inputs,
    serializedPSBT,
    signer.xpriv
  );
  return { signedSerializedPSBT };
};

export const signTransactionWithSigningServer = async ({
  signerId,
  signingPayload,
  signingServerOTP,
  serializedPSBT,
  showOTPModal,
  showToast,
}) => {
  try {
    showOTPModal(false);
    const childIndexArray = idx(signingPayload, (_) => _[0].childIndexArray);
    const outgoing = idx(signingPayload, (_) => _[0].outgoing);
    if (!childIndexArray) throw new Error('Invalid signing payload');

    const { signedPSBT } = await SigningServer.signPSBT(
      signerId,
      signingServerOTP ? Number(signingServerOTP) : null,
      serializedPSBT,
      childIndexArray,
      outgoing
    );
    if (!signedPSBT) throw new Error('signing server: failed to sign');
    return { signedSerializedPSBT: signedPSBT };
  } catch (error) {
    captureError(error);
    showToast(`${error.message}`);
  }
};

export const signTransactionWithInheritanceKey = async ({
  signingPayload,
  serializedPSBT,
  signerId,
  thresholdDescriptors,
}) => {
  try {
    const childIndexArray = idx(signingPayload, (_) => _[0].childIndexArray);
    if (!childIndexArray) throw new Error('Invalid signing payload');

    const { signedPSBT } = await InheritanceKeyServer.signPSBT(
      signerId,
      serializedPSBT,
      childIndexArray,
      thresholdDescriptors
    );
    if (!signedPSBT) throw new Error('inheritance key server: failed to sign');
    return { signedSerializedPSBT: signedPSBT };
  } catch (error) {
    captureError(error);
    Alert.alert(error.message);
  }
};

export const signTransactionWithSeedWords = async ({
  signingPayload,
  defaultVault,
  seedBasedSingerMnemonic,
  serializedPSBT,
  signerId,
  isMultisig,
}) => {
  try {
    const inputs = idx(signingPayload, (_) => _[0].inputs);
    if (!inputs) throw new Error('Invalid signing payload, inputs missing');
    const [signer] = defaultVault.signers.filter((signer) => signer.signerId === signerId);
    const networkType = config.NETWORK_TYPE;
    // we need this to generate xpriv that's not stored
    const { xpub, xpriv } = generateSeedWordsKey(
      seedBasedSingerMnemonic,
      networkType,
      isMultisig ? EntityKind.VAULT : EntityKind.WALLET
    );
    if (signer.xpub !== xpub) throw new Error('Invalid mnemonic; xpub mismatch');
    const { signedSerializedPSBT } = WalletOperations.internallySignVaultPSBT(
      defaultVault,
      inputs,
      serializedPSBT,
      xpriv
    );
    return { signedSerializedPSBT };
  } catch (err) {
    Alert.alert(err);
  }
};
