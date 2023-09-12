import { Dimensions, Pressable } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, FlatList, HStack, useColorMode, VStack } from 'native-base';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { SignerType, VaultMigrationType } from 'src/core/wallets/enums';
import {
  addSigningDevice,
  removeSigningDevice,
  updateSigningDevice,
} from 'src/store/reducers/vaults';

import AddIcon from 'src/assets/images/green_add.svg';
import Buttons from 'src/components/Buttons';
import HeaderTitle from 'src/components/HeaderTitle';
import IconArrowBlack from 'src/assets/images/icon_arrow_black.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Note from 'src/components/Note/Note';
import Relay from 'src/core/services/operations/Relay';
import { ScaledSheet } from 'react-native-size-matters';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import moment from 'moment';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { getPlaceholder } from 'src/utils/utilities';
import usePlan from 'src/hooks/usePlan';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import { getSignerNameFromType, getSignerSigTypeInfo } from 'src/hardware';
import useVault from 'src/hooks/useVault';
import useSignerIntel from 'src/hooks/useSignerIntel';
import { globalStyles } from 'src/constants/globalStyles';
import { SDIcons } from './SigningDeviceIcons';
import DescriptionModal from './components/EditDescriptionModal';
import VaultMigrationController from './VaultMigrationController';
import AddIKS from '../SigningDeveices/AddIKS';

const { width } = Dimensions.get('screen');

export const checkSigningDevice = async (id) => {
  try {
    const exisits = await Relay.getSignerIdInfo(id);
    return exisits;
  } catch (err) {
    // ignoring temporarily if the network call fails
    return true;
  }
};

function SignerItem({
  signer,
  index,
  setInheritanceInit,
  inheritanceSigner,
}: {
  signer: VaultSigner | undefined;
  index: number;
  setInheritanceInit: any;
  inheritanceSigner: VaultSigner;
}) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { plan } = usePlan();
  const [visible, setVisible] = useState(false);

  const removeSigner = () => dispatch(removeSigningDevice(signer));
  const navigateToSignerList = () =>
    navigation.dispatch(CommonActions.navigate('SigningDeviceList'));

  const callback = () => {
    if (index === 5 && !inheritanceSigner) {
      setInheritanceInit(true);
    } else {
      navigateToSignerList();
    }
  };
  const openDescriptionModal = () => setVisible(true);
  const closeDescriptionModal = () => setVisible(false);

  if (!signer) {
    return (
      <Pressable onPress={callback}>
        <Box style={styles.signerItemContainer}>
          <HStack style={styles.signerItem}>
            <HStack alignItems="center">
              <AddIcon />
              <VStack marginX="4" maxWidth="64">
                <Text
                  color={`${colorMode}.primaryText`}
                  numberOfLines={2}
                  style={[globalStyles.font15, { letterSpacing: 1.12, alignItems: 'center' }]}
                >
                  {`Add ${getPlaceholder(index)} Signing Device`}
                </Text>
                <Text
                  color={`${colorMode}.GreyText`}
                  style={[globalStyles.font13, { letterSpacing: 0.06 }]}
                >
                  Select signing device
                </Text>
              </VStack>
            </HStack>
            <Box style={styles.backArrow}>
              <IconArrowBlack />
            </Box>
          </HStack>
        </Box>
      </Pressable>
    );
  }
  const { isSingleSig, isMultiSig } = getSignerSigTypeInfo(signer);
  let shouldReconfigure = false;
  if (
    (plan === SubscriptionTier.L1.toUpperCase() && !isSingleSig) ||
    (plan !== SubscriptionTier.L1.toUpperCase() && !isMultiSig)
  ) {
    shouldReconfigure = true;
  }
  return (
    <Box
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        marginBottom: hp(windowHeight < 700 ? 5 : 25),
      }}
    >
      <HStack style={styles.signerItem}>
        <HStack>
          <Box
            width="8"
            height="8"
            borderRadius={30}
            backgroundColor="#725436"
            justifyContent="center"
            alignItems="center"
            alignSelf="center"
          >
            {SDIcons(signer.type, true).Icon}
          </Box>
          <VStack marginLeft="4" maxWidth="80%">
            <Text
              color={`${colorMode}.primaryText`}
              numberOfLines={1}
              style={[
                globalStyles.font15,
                { alignItems: 'center', letterSpacing: 1.12, maxWidth: width * 0.5 },
              ]}
            >
              {`${signer.signerName}`}
              <Text style={[globalStyles.font12]}>{` (${signer.masterFingerprint})`}</Text>
            </Text>
            <Text
              color={`${colorMode}.GreyText`}
              style={[globalStyles.font12, { letterSpacing: 0.6 }]}
            >
              {`Added ${moment(signer.lastHealthCheck).calendar()}`}
            </Text>
            <Pressable onPress={openDescriptionModal}>
              <Box style={styles.descriptionBox} backgroundColor={`${colorMode}.seashellWhite`}>
                <Text
                  numberOfLines={1}
                  color={signer.signerDescription ? '#6A7772' : '#387F6A'}
                  style={[
                    globalStyles.font12,
                    { letterSpacing: 0.6, fontStyle: signer.signerDescription ? null : 'italic' },
                  ]}
                  bold={!signer.signerDescription}
                >
                  {signer.signerDescription ? signer.signerDescription : 'Add Description'}
                </Text>
              </Box>
            </Pressable>
          </VStack>
        </HStack>
        <Pressable style={styles.remove} onPress={() => removeSigner()}>
          <Text color={`${colorMode}.black`} style={[globalStyles.font12, { letterSpacing: 0.6 }]}>
            {shouldReconfigure ? 'Re-configure' : 'Remove'}
          </Text>
        </Pressable>
      </HStack>
      <DescriptionModal
        visible={visible}
        close={closeDescriptionModal}
        signer={signer}
        callback={(value: any) =>
          dispatch(updateSigningDevice({ signer, key: 'signerDescription', value }))
        }
      />
    </Box>
  );
}

function AddSigningDevice() {
  const { colorMode } = useColorMode();
  const [vaultCreating, setCreating] = useState(false);
  const { activeVault } = useVault();
  const navigation = useNavigation();
  const route = useRoute() as { params: { isInheritance: boolean } };
  const dispatch = useDispatch();
  const { subscriptionScheme, plan } = usePlan();
  const vaultSigners = useAppSelector((state) => state.vault.signers);
  const { relayVaultUpdateLoading } = useAppSelector((state) => state.bhr);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const [inheritanceInit, setInheritanceInit] = useState(false);

  const signers = activeVault?.signers || [];
  const isInheritance =
    route?.params?.isInheritance ||
    signers.filter((signer) => signer.type === SignerType.INHERITANCEKEY)[0];

  const {
    planStatus,
    signersState,
    areSignersValid,
    amfSigners,
    misMatchedSigners,
    invalidSigners,
  } = useSignerIntel({ isInheritance });

  const inheritanceSigner: VaultSigner = signersState.filter(
    (signer) => signer?.type === SignerType.INHERITANCEKEY
  )[0];

  useEffect(() => {
    if (activeVault && !vaultSigners.length) {
      dispatch(addSigningDevice(activeVault.signers));
    }
  }, []);

  const triggerVaultCreation = () => {
    setCreating(true);
  };

  const renderSigner = ({ item, index }) => (
    <SignerItem
      signer={item}
      index={index}
      setInheritanceInit={setInheritanceInit}
      inheritanceSigner={inheritanceSigner}
    />
  );

  let preTitle: string;
  if (planStatus === VaultMigrationType.DOWNGRADE) {
    preTitle = 'Remove Signing Devices';
  } else if (planStatus === VaultMigrationType.UPGRADE) {
    preTitle = 'Add Signing Devices';
  } else {
    preTitle = 'Signing Devices';
  }
  const subtitle =
    subscriptionScheme.n > 1
      ? `Vault with a ${subscriptionScheme.m} of ${
          subscriptionScheme.n + (isInheritance ? 1 : 0)
        } setup will be created${isInheritance ? ' for Inheritance' : ''}`
      : `Vault with ${subscriptionScheme.m} of ${subscriptionScheme.n} setup will be created`;

  const trezorNotInPleb =
    plan !== SubscriptionTier.L1.toUpperCase() &&
    signersState.find((signer) => signer && signer.type === SignerType.TREZOR);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <HeaderTitle
        title={`${preTitle}`}
        subtitle={subtitle}
        headerTitleColor={`${colorMode}.black`}
        enableBack={planStatus !== VaultMigrationType.DOWNGRADE}
        paddingLeft={25}
      />
      <VaultMigrationController
        vaultCreating={vaultCreating}
        setCreating={setCreating}
        signersState={signersState}
        planStatus={planStatus}
        isInheritance={isInheritance}
      />
      <FlatList
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        extraData={vaultSigners}
        data={signersState}
        keyExtractor={(item, index) => item?.signerId ?? index}
        renderItem={renderSigner}
        style={{
          marginTop: hp(52),
        }}
      />
      <Box style={styles.bottomContainer} backgroundColor={`${colorMode}.primaryBackground`}>
        {amfSigners.length ? (
          <Box style={styles.noteContainer}>
            <Note
              title={common.note}
              subtitle={`* ${amfSigners.join(
                ' and '
              )} does not support Testnet directly, so the app creates a proxy Testnet key for you in the beta app`}
            />
          </Box>
        ) : null}
        {invalidSigners.length ? (
          <Box style={styles.noteContainer}>
            <Note
              title="WARNING"
              subtitle={`A few signers (${invalidSigners
                .map((signer) => getSignerNameFromType(signer.type))
                .join(', ')}) are only valid at ${SubscriptionTier.L2} and ${
                SubscriptionTier.L3
              }. Please remove them or upgrade your plan.`}
              subtitleColor="error"
            />
          </Box>
        ) : misMatchedSigners.length ? (
          <Box style={styles.noteContainer}>
            <Note
              title="WARNING"
              subtitle={`Looks like you've added a ${
                plan === SubscriptionTier.L1.toUpperCase() ? 'multisig' : 'singlesig'
              } xPub\nPlease export ${misMatchedSigners.join(', ')}'s xpub from the right section`}
              subtitleColor="error"
            />
          </Box>
        ) : trezorNotInPleb ? (
          <Box style={styles.noteContainer}>
            <Note
              title="WARNING"
              subtitle="Trezor multisig is coming soon. Please replace it for now or use it with a sigle sig vault"
              subtitleColor="error"
            />
          </Box>
        ) : null}
        <Buttons
          primaryDisable={areSignersValid || trezorNotInPleb}
          primaryLoading={relayVaultUpdateLoading}
          primaryText="Create Vault"
          primaryCallback={triggerVaultCreation}
          secondaryText="Cancel"
          secondaryCallback={
            planStatus !== VaultMigrationType.DOWNGRADE
              ? navigation.goBack
              : () => navigation.replace('App')
          }
          paddingHorizontal={wp(30)}
        />
      </Box>
      <AddIKS
        vault={activeVault}
        visible={inheritanceInit}
        close={() => setInheritanceInit(false)}
      />
    </ScreenWrapper>
  );
}

const styles = ScaledSheet.create({
  signerItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: hp(25),
  },
  signerItem: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  remove: {
    height: 26,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: '#FAC48B',
    justifyContent: 'center',
  },
  bottomContainer: {
    width: windowWidth,
    bottom: 5,
    right: 20,
    padding: 20,
  },
  noteContainer: {
    width: wp(330),
  },
  descriptionBox: {
    height: 24,
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  descriptionEdit: {
    height: 50,
    backgroundColor: '#FDF7F0',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  descriptionContainer: {
    width: width * 0.8,
  },
  backArrow: {
    width: '15%',
    alignItems: 'center',
  },
});

export default AddSigningDevice;
