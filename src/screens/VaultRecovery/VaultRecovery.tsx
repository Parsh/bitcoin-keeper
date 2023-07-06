import Text from 'src/components/KeeperText';
import { Box, HStack, Pressable, VStack } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { Alert, FlatList, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import AddIcon from 'src/assets/images/green_add.svg';
import AddSignerIcon from 'src/assets/images/addSigner.svg';
import Buttons from 'src/components/Buttons';
import HeaderTitle from 'src/components/HeaderTitle';
import IconArrowBlack from 'src/assets/images/icon_arrow_black.svg';
import Note from 'src/components/Note/Note';
import { ScaledSheet } from 'react-native-size-matters';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SuccessSvg from 'src/assets/images/successSvg.svg';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { removeSigningDeviceBhr, setRelayVaultRecoveryShellId } from 'src/store/reducers/bhr';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { setupKeeperApp } from 'src/store/sagaActions/storage';
import { NewVaultInfo } from 'src/store/sagas/wallets';
import { captureError } from 'src/core/services/sentry';
import { addNewVault } from 'src/store/sagaActions/vaults';
import { VaultType } from 'src/core/wallets/enums';
import Relay from 'src/core/services/operations/Relay';
import { generateVaultId } from 'src/core/wallets/factories/VaultFactory';
import config from 'src/core/config';
import { hash256 } from 'src/core/services/operations/encryption';

import { updateSignerForScheme } from 'src/hooks/useSignerIntel';
import KeeperModal from 'src/components/KeeperModal';
import { setTempShellId } from 'src/store/reducers/vaults';
import { SDIcons } from '../Vault/SigningDeviceIcons';

const allowedSignerLength = [1, 3, 5];

function AddSigningDevice({ error }) {
  const navigation = useNavigation();
  return (
    <Pressable
      onPress={
        error
          ? () =>
            Alert.alert(
              'Warning: No vault is assocaited with this signer, please reomve and try with another signer'
            )
          : () => navigation.navigate('LoginStack', { screen: 'SignersList' })
      }
    >
      <Box flexDir="row" alignItems="center" marginX="3" marginBottom="12" marginTop={5}>
        <HStack style={styles.signerItem}>
          <HStack alignItems="center">
            <AddIcon />
            <VStack marginX="4" maxWidth="64">
              <Text
                color="light.primaryText"
                fontSize={15}
                numberOfLines={2}
                alignItems="center"
                letterSpacing={1.12}
              >
                Add Another
              </Text>
              <Text color="light.GreyText" fontSize={13} letterSpacing={0.6}>
                Select signing device
              </Text>
            </VStack>
          </HStack>
          <Box width="15%" alignItems="center">
            <IconArrowBlack />
          </Box>
        </HStack>
      </Box>
    </Pressable>
  );
}

function SignerItem({ signer, index }: { signer: any | undefined; index: number }) {
  const dispatch = useDispatch();
  const removeSigningDevice = () => {
    dispatch(removeSigningDeviceBhr(signer));
  };
  return (
    <Box flexDir="row" alignItems="center" marginX="3" marginBottom="12">
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
          <VStack marginX="4" maxWidth="80%">
            <Text
              color="light.primaryText"
              fontSize={15}
              numberOfLines={2}
              alignItems="center"
              letterSpacing={1.12}
            >
              {signer.type}
            </Text>
          </VStack>
        </HStack>
        <Pressable style={styles.remove} onPress={removeSigningDevice}>
          <Text color="light.GreyText" fontSize={12} letterSpacing={0.6}>
            Remove
          </Text>
        </Pressable>
      </HStack>
    </Box>
  );
}

function SuccessModalContent() {
  return (
    <View>
      <Box alignSelf="center">
        <SuccessSvg />
      </Box>
      <Text color="light.greenText" fontSize={13} padding={2}>
        The BIP-85 wallets in the app are new as they can’t be recovered using this method
      </Text>
    </View>
  );
}

function VaultRecovery({ navigation }) {
  const dispatch = useDispatch();
  const { signingDevices, relayVaultError, relayVaultUpdate } = useAppSelector(
    (state) => state.bhr
  );
  const [scheme, setScheme] = useState();
  const { appId } = useAppSelector((state) => state.storage);
  const [signersList, setsignersList] = useState(signingDevices);
  const [error, setError] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  async function createNewApp() {
    try {
      const fcmToken = await messaging().getToken();
      dispatch(setupKeeperApp(fcmToken));
    } catch (error) {
      dispatch(setupKeeperApp());
    }
  }

  useEffect(() => {
    setsignersList(
      signingDevices.map((signer) => updateSignerForScheme(signer, signingDevices?.length))
    );
  }, [signingDevices]);

  useEffect(() => {
    if (signersList.length === 1) {
      getMetaData();
    }
  }, [signersList]);

  useEffect(() => {
    if (scheme && !appId) {
      createNewApp();
    }
  }, [scheme]);

  useEffect(() => {
    if (scheme && appId) {
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
    }
  }, [appId]);

  useEffect(() => {
    if (relayVaultUpdate) {
      setRecoveryLoading(false);
      setSuccessModalVisible(true);
    }
    if (relayVaultError) {
      Alert.alert('Something went wrong!');
    }
  }, [relayVaultUpdate, relayVaultError]);

  // try catch API error
  const vaultCheck = async () => {
    const vaultId = generateVaultId(signersList, config.NETWORK_TYPE);
    const response = await Relay.vaultCheck(vaultId);
    if (response.isVault) {
      setScheme(response.scheme);
    } else {
      setRecoveryLoading(false);
      Alert.alert('Vault does not exist with this signer combination');
    }
  };

  // try catch API error
  const getMetaData = async () => {
    try {
      setError(false);
      const xfpHash = hash256(signersList[0].masterFingerprint);

      const response = await Relay.getVaultMetaData(xfpHash);
      if (response?.vaultShellId) {
        dispatch(setRelayVaultRecoveryShellId(response.vaultShellId));
        dispatch(setTempShellId(response.vaultShellId));
      } else if (!response?.vaultShellId && response?.appId) {
        dispatch(setRelayVaultRecoveryShellId(response.appId));
        dispatch(setTempShellId(response.appId));
      } else if (response.error) {
        setError(true);
        Alert.alert('No vault is assocaited with this signer, try with another signer');
      }
    } catch (err) {
      console.log(err);
      setError(true);
      Alert.alert('Something Went Wrong!');
    }
  };

  const startRecovery = () => {
    if (allowedSignerLength.includes(signersList.length)) {
      setRecoveryLoading(true);
      vaultCheck();
    } else {
      Alert.alert("Vault can't be recreated in this scheme");
    }
  };

  const renderSigner = ({ item, index }) => <SignerItem signer={item} index={index} />;
  return (
    <ScreenWrapper>
      <HeaderTitle
        title="Add signing devices"
        subtitle="To recover your vault"
        headerTitleColor="light.textBlack"
        paddingTop={hp(5)}
        paddingLeft={wp(25)}
      />
      <Box style={styles.scrollViewWrapper}>
        {signersList.length > 0 ? (
          <Box>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={signersList}
              keyExtractor={(item, index) => item?.signerId ?? index}
              renderItem={renderSigner}
              style={{
                marginTop: hp(32),
              }}
            />
            <AddSigningDevice error={error} />
          </Box>
        ) : (
          <Box flex={1} alignItems="center" justifyContent="center">
            <TouchableOpacity
              onPress={() => navigation.navigate('LoginStack', { screen: 'SignersList' })}
            >
              <Box alignItems="center">
                <AddSignerIcon />
              </Box>
            </TouchableOpacity>
            <Text style={{ textAlign: 'center', width: '70%', marginTop: 20 }}>
              You can use any one of the signing devices to start with
            </Text>
          </Box>
        )}
      </Box>
      <Box style={styles.bottomViewWrapper}>
        {signingDevices.length > 0 && (
          <Box width="100%">
            <Buttons
              primaryText="Recover Vault"
              primaryCallback={startRecovery}
              primaryLoading={recoveryLoading}
            />
          </Box>
        )}
        <Note
          title="Note"
          subtitle="Signing Server cannot be used as the first signing device while recovering"
        />
      </Box>
      <KeeperModal
        visible={successModalVisible}
        title="Vault Recovered!"
        subTitle="Your Keeper vault has successfully been recovered."
        buttonText="Ok"
        Content={SuccessModalContent}
        close={() => { }}
        showCloseIcon={false}
        buttonCallback={() => {
          setSuccessModalVisible(false);
          navigation.replace('App');
        }}
      />
    </ScreenWrapper >
  );
}

const styles = ScaledSheet.create({
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
  scrollViewWrapper: {
    flex: 0.7,
    justifyContent: 'space-between',
  },
  bottomViewWrapper: {
    position: 'absolute',
    bottom: 5,
    width: '100%',
    marginHorizontal: 20,
  },
});

export default VaultRecovery;
