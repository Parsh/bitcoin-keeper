import { Box, Image, Pressable, Text, View, Input, ScrollView } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  FlatList,
  TextInput,
} from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import SeedWordsView from 'src/components/SeedWordsView';
import { LocalizationContext } from 'src/common/content/LocContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import StatusBarComponent from 'src/components/StatusBarComponent';
import LinearGradient from 'react-native-linear-gradient';
import KeeperModal from 'src/components/KeeperModal';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import InvalidSeeds from 'src/assets/images/seedillustration.svg';
import CreateCloudBackup from 'src/components/CloudBackup/CreateCloudBackup';
import Illustration from 'src/assets/images/illustration.svg';
import { useDispatch } from 'react-redux';
import { getAppImage } from 'src/store/sagaActions/bhr';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';

const EnterSeedScreen = () => {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const seed = translations['seed'];
  const common = translations['common'];
  const [seedData, setSeedData] = useState([
    {
      id: 1,
      name: '',
    },
    {
      id: 2,
      name: '',
    },
    {
      id: 3,
      name: '',
    },
    {
      id: 4,
      name: '',
    },
    {
      id: 5,
      name: '',
    },
    {
      id: 6,
      name: '',
    },
    {
      id: 7,
      name: '',
    },
    {
      id: 8,
      name: '',
    },
    {
      id: 9,
      name: '',
    },
    {
      id: 10,
      name: '',
    },
    {
      id: 11,
      name: '',
    },
    {
      id: 12,
      name: '',
    },
  ]);

  const [invalidSeedsModal, setInvalidSeedsModal] = useState(false);
  const [createCloudBackupModal, setCreateCloudBackupModal] = useState(false);
  const [walletRecoverySuccessModal, setWalletRecoverySuccessModal] = useState(false);

  const openInvalidSeedsModal = () => setInvalidSeedsModal(true);
  const closeInvalidSeedsModal = () => setInvalidSeedsModal(false);

  const openLoaderModal = () => setCreateCloudBackupModal(true);
  const closeLoaderModal = () => setCreateCloudBackupModal(false);
  const walletRecoverySuccess = () => setWalletRecoverySuccessModal(true);
  const closeRecovery = () => setWalletRecoverySuccessModal(false);

  const closeWalletSuccessModal = () => {
    setWalletRecoverySuccessModal(false);
  };

  const { showToast } = useToastMessage();

  const dispatch = useDispatch();
  const { appImageRecoverd, appRecreated, appRecoveryLoading, appImageError } = useAppSelector(
    (state) => state.bhr
  );

  useEffect(() => {
    if (appImageError) openInvalidSeedsModal();

    if (appRecoveryLoading) {
      openLoaderModal();
    }
    if (appRecreated) {
      setTimeout(() => {
        closeLoaderModal();
        navigation.navigate('App', { screen: 'NewHome' });
      }, 3000);
    }
  }, [appRecoveryLoading, appImageError]);

  const emptySeedCheck = () => {
    for (let i = 0; i < 12; i++) {
      if (seedData[i].name === '') {
        showToast('Enter all seeds', <TickIcon />);
      }
    }
  };

  const getSeedWord = () => {
    let seedWord = '';
    for (let i = 0; i < 12; i++) {
      seedWord += seedData[i].name + ' ';
    }
    return seedWord;
  };

  const onPressNext = async () => {
    emptySeedCheck();
    let seedWord = getSeedWord();
    dispatch(getAppImage(seedWord));
    // dispatch(
    //   getAppImage('stereo clay oil subway satoshi muffin claw clever mandate treat clay farm')
    // );
  };

  const RecoverWalletScreen = () => {
    return (
      <View>
        <Illustration />
        <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'200'}>
          {'Lorem ipsum dolor sit amet, consectetur adipiscing elit, iqua'}
        </Text>
      </View>
    );
  };

  const InValidSeedsScreen = () => {
    return (
      <View>
        <Box alignSelf={'center'}>
          <InvalidSeeds />
        </Box>
        <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'200'} p={2}>
          {
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit'
          }
        </Text>
      </View>
    );
  };

  const getFormattedNumber = (number) => {
    if (number < 9) return '0' + (number + 1);
    else return number + 1;
  };

  const getPlaceholder = (index) => {
    const mainIndex = index + 1;
    if (mainIndex == 1) return mainIndex + 'st';
    else if (mainIndex == 2) return mainIndex + 'nd';
    else if (mainIndex == 3) return mainIndex + 'rd';
    else return mainIndex + 'th';
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.container}
      >
        <ScrollView marginTop={10}>
          <StatusBarComponent />
          <Box marginX={10}>
            <SeedWordsView
              title={seed.EnterSeed}
              subtitle={seed.recoverWallet}
              onPressHandler={() => navigation.navigate('NewKeeperApp')}
            />
          </Box>
          <View>
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              data={seedData}
              extraData={seedData}
              showsVerticalScrollIndicator={false}
              numColumns={2}
              contentContainerStyle={{
                marginStart: 15,
              }}
              renderItem={({ value, index }) => {
                return (
                  <View
                    style={{
                      flexDirection: 'row',
                      marginHorizontal: 20,
                      marginVertical: 10,
                    }}
                  >
                    <Text
                      style={{ fontSize: 16, color: '#00836A', fontWeight: 'bold', marginTop: 8 }}
                    >
                      {getFormattedNumber(index)}
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: '#FDF7F0',
                        shadowColor: 'black',
                        shadowOpacity: 0.4,
                        shadowColor: 'rgba(0, 0, 0, 0.05)',
                        elevation: 6,
                        shadowRadius: 10,
                        shadowOffset: { width: 1, height: 10 },
                        borderRadius: 10,
                        height: 35,
                        width: 110,
                        marginLeft: 10,
                      }}
                      placeholder={`  enter ${getPlaceholder(index)} word`}
                      value={value?.name}
                      textContentType="none"
                      returnKeyType="next"
                      autoCorrect={false}
                      autoCapitalize="none"
                      onChangeText={(text) => {
                        const data = [...seedData];
                        data[index].name = text.trim();
                        setSeedData(data);
                      }}
                    />
                  </View>
                );
              }}
            />
          </View>
          <Text color={'#4F5955'} marginX={10} marginY={10} fontSize={12}>
            {seed.seedDescription}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Box bg={'transparent'} flexDirection={'row'} marginLeft={10} marginTop={4}>
              <View style={styles.dot}></View>
              <View style={styles.dash}></View>
            </Box>
            <Box bg={'transparent'} flexDirection={'row'} marginRight={10}>
              <TouchableOpacity>
                <Text
                  fontSize={13}
                  fontFamily={'body'}
                  fontWeight={'300'}
                  letterSpacing={1}
                  marginTop={2}
                  //   color={buttonCancelColor}
                  marginRight={5}
                >
                  {common.needHelp}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onPressNext}>
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  colors={['#00836A', '#073E39']}
                  style={styles.cta}
                >
                  <Text
                    fontSize={13}
                    fontFamily={'body'}
                    fontWeight={'300'}
                    letterSpacing={1}
                    color={'white'}
                  >
                    {common.next}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Box>
            <KeeperModal
              visible={invalidSeedsModal}
              close={closeInvalidSeedsModal}
              title={seed.InvalidSeeds}
              subTitle={seed.seedDescription}
              modalBackground={['#F7F2EC', '#F7F2EC']}
              buttonBackground={['#00836A', '#073E39']}
              buttonText={'Retry'}
              buttonTextColor={'#FAFAFA'}
              buttonCallback={closeInvalidSeedsModal}
              textColor={'#041513'}
              Content={InValidSeedsScreen}
            />
            <KeeperModal
              visible={walletRecoverySuccessModal}
              close={closeRecovery}
              title={seed.walletRecoverySuccessful}
              subTitle={seed.seedDescription}
              modalBackground={['#F7F2EC', '#F7F2EC']}
              buttonBackground={['#00836A', '#073E39']}
              buttonText={'View Wallet'}
              buttonTextColor={'#FAFAFA'}
              buttonCallback={closeWalletSuccessModal}
              textColor={'#041513'}
              Content={RecoverWalletScreen}
            />
            <ModalWrapper
              visible={createCloudBackupModal}
              onSwipeComplete={() => setCreateCloudBackupModal(false)}
            >
              <CreateCloudBackup closeBottomSheet={() => setCreateCloudBackupModal(false)} />
            </ModalWrapper>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  cta: {
    paddingVertical: 10,
    paddingHorizontal: 35,
    borderRadius: 10,
  },
  dot: {
    backgroundColor: '#A7A7A7',
    width: 6,
    height: 4,
    marginRight: 6,
  },
  dash: {
    backgroundColor: '#676767',
    width: 26,
    height: 4,
  },
  inputcontainer: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
  },
  numbers: {
    fontSize: 16,
    color: '#00836A',
    fontWeight: 'bold',
    marginTop: 8,
  },
  ctabutton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
});

export default EnterSeedScreen;
