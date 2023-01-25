import Text from 'src/components/KeeperText';
import { Box, HStack, Pressable, VStack } from 'native-base';
import { NavigationRouteContext, useNavigation } from '@react-navigation/native';
import { Alert, FlatList, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import AddIcon from 'src/assets/images/green_add.svg';
import AddSignerIcon from 'src/assets/images/addSigner.svg';
import Buttons from 'src/components/Buttons';
import HeaderTitle from 'src/components/HeaderTitle';
import IconArrowBlack from 'src/assets/images/icon_arrow_black.svg';
import Note from 'src/components/Note/Note';
import { ScaledSheet } from 'react-native-size-matters';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SuccessSvg from 'src/assets/images/successSvg.svg';
import { hp } from 'src/common/data/responsiveness/responsive';
import { removeSigningDeviceBhr, setRelayVaultRecoveryAppId } from 'src/store/reducers/bhr';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { WalletMap } from '../Vault/WalletMap';
import { setupKeeperApp } from 'src/store/sagaActions/storage';
import { NewVaultInfo } from 'src/store/sagas/wallets';
import { captureError } from 'src/core/services/sentry';
import { addNewVault } from 'src/store/sagaActions/vaults';
import { VaultType } from 'src/core/wallets/enums';
import Relay from 'src/core/services/operations/Relay';
import { generateVaultId } from 'src/core/wallets/factories/VaultFactory';
import config from 'src/core/config';
import useToastMessage from 'src/hooks/useToastMessage';

const allowedSignerLength = [1, 3, 5];

const AddSigningDevice = ({ error }) => {
  const navigation = useNavigation();
  console.log({ error });
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
      <Box flexDir="row" alignItems="center" marginX="3" marginBottom="12">
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
                {`Add Another`}
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
};

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
            {WalletMap(signer.type, true).Icon}
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

function VaultRecovery({ navigation }) {
  const dispatch = useDispatch();
  const { signingDevices, relayVaultUpdate } = useAppSelector((state) => state.bhr);
  const [scheme, setScheme] = useState();
  const { appId } = useAppSelector((state) => state.storage);
  const [signersList, setsignersList] = useState([]);
  const [successModal, setSuccessModal] = useState(false);
  const { showToast } = useToastMessage();
  const [error, setError] = useState(false);

  const getMetaData = async () => {
    const response = await Relay.getVaultMetaData(signingDevices[0].signerId);
    if (response?.appId) {
      dispatch(setRelayVaultRecoveryAppId(response.appId));
      setError(false);
    } else {
      if (response.error) {
        setError(true);
        Alert.alert(
          'Warning: No vault is assocaited with this signer, please reomve and try with another signer'
        );
        // showToast('Warning: No Vault Exisits for this Signer', <ToastErrorIcon />);
      } else {
        setError(true);
        Alert.alert('Warning: Something Went Wrong!');
        // showToast('Warning: Something Went Wrong!', <ToastErrorIcon />);
      }
    }
  };

  useEffect(() => {
    if (signingDevices.length === 1) {
      getMetaData();
    }
  }, [signingDevices]);

  const vaultCheck = async () => {
    const vaultId = generateVaultId(signingDevices, config.NETWORK_TYPE);
    const response = await Relay.vaultCheck({ vaultId });
    if (response.isVault) {
      setScheme(response.scheme);
    } else {
      Alert.alert('Vault does not exist with this signer comnination');
    }
  };

  useEffect(() => {
    if (scheme && !appId) dispatch(setupKeeperApp());
  }, [scheme]);

  const startRecovery = () => {
    if (allowedSignerLength.includes(signingDevices.length)) {
      vaultCheck();
    } else {
      Alert.alert("Vault can't be recreated in this scheme");
    }
  };

  useEffect(() => {
    if (appId) {
      try {
        const vaultInfo: NewVaultInfo = {
          vaultType: VaultType.DEFAULT,
          vaultScheme: scheme,
          vaultSigners: signingDevices,
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
    setsignersList(signingDevices);
  }, [signingDevices]);

  useEffect(() => {
    if (appId) {
      setSuccessModal(true);
    }
  }, [appId]);

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

  const renderSigner = ({ item, index }) => <SignerItem signer={item} index={index} />;
  return (
    <ScreenWrapper>
      <HeaderTitle
        title="Add signing devices"
        subtitle="To recover your inherited vault"
        headerTitleColor="light.textBlack"
        paddingTop={hp(5)}
      />
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        {signersList.length > 0 ? (
          <Box>
            <FlatList
              data={signersList}
              keyExtractor={(item, index) => item?.signerId ?? index}
              renderItem={renderSigner}
              style={{
                marginTop: hp(52),
              }}
            />
            <AddSigningDevice error={error} />
          </Box>
        ) : (
          <Box alignItems="center" style={{ flex: 1, justifyContent: 'center' }}>
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
        {signingDevices.length > 0 && (
          <Box position="absolute" bottom={10} width="100%" marginBottom={10}>
            <Buttons primaryText="Recover Vault" primaryCallback={startRecovery} />
          </Box>
        )}
        <Note
          title="Note"
          subtitle="Signing Server cannot be used as the first signing device while recovering"
        />
      </View>
      {/* <KeeperModal
        visible={successModal}
        title="Vault Recovered!"
        subTitle="Your Keeper vault has successfully been recovered."
        buttonText="View Vault"
        Content={SuccessModalContent}
        close={() => setSuccessModal(false)}
        buttonCallback={() =>
          navigation.dispatch(CommonActions.navigate('App', { name: 'VaultDetails', params: {} }))
        }
      /> */}
    </ScreenWrapper>
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
});

export default VaultRecovery;
