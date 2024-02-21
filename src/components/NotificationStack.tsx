import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, StyleSheet, View } from 'react-native';
import {
  Directions,
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Box, useColorMode } from 'native-base';
import { UAI, uaiType } from 'src/models/interfaces/Uai';
import useUaiStack from 'src/hooks/useUaiStack';
import { useDispatch } from 'react-redux';
import { uaiActioned } from 'src/store/sagaActions/uai';
import { CommonActions, useNavigation } from '@react-navigation/native';
import useVault from 'src/hooks/useVault';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import InheritanceKeyServer from 'src/services/operations/InheritanceKey';
import UAIView from 'src/screens/Home/components/HeaderDetails/components/UAIView';
import { windowHeight, wp } from 'src/constants/responsive';
import { TransferType } from 'src/models/enums/TransferType';
import Text from './KeeperText';
import KeeperModal from './KeeperModal';
import ActivityIndicatorView from './AppActivityIndicator/ActivityIndicatorView';
import UAIEmptyState from './UAIEmptyState';

const { width } = Dimensions.get('window');

const _size = width * 0.95;
const layout = {
  borderRadius: 16,
  width: _size,
  height: 90,
  spacing: 12,
  cardsGap: 10,
};
const maxVisibleItems = 3;

const nonSkippableUAIs = [uaiType.DEFAULT, uaiType.SECURE_VAULT];

type CardProps = {
  totalLength: number;
  index: number;
  uai: any;
  activeIndex: SharedValue<number>;
};

interface uaiDefinationInterface {
  heading: string;
  body: string;
  btnConfig: {
    primary: {
      text: string;
      cta: any;
    };
    secondary: {
      text: string;
      cta: any;
    };
  };
  modalDetails: {
    heading: string;
    subTitle: string;
    body: any;
    btnConfig: {
      primary: {
        text: string;
        cta: any;
      };
      secondary: {
        text: string;
        cta: any;
      };
    };
  };
}

function Card({ uai, index, totalLength, activeIndex }: CardProps) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const navigtaion = useNavigation();
  const { showToast } = useToastMessage();

  const [showModal, setShowModal] = useState(false);
  const [modalActionLoader, setmodalActionLoader] = useState(false);

  const skipUaiHandler = (uai: UAI) => {
    dispatch(uaiActioned({ uaiId: uai.id, action: false }));
  };

  const skipBtnConfig = (uai) => {
    return {
      text: 'Skip',
      cta: () => skipUaiHandler(uai),
    };
  };

  const getUaiTypeDefinations = (uai: UAI): uaiDefinationInterface => {
    switch (uai.uaiType) {
      case uaiType.SECURE_VAULT:
        return {
          heading: 'Create your first vault',
          body: 'Secure your sats with a vault',
          btnConfig: {
            primary: {
              text: 'Continue',
              cta: () => {
                setShowModal(true);
                navigtaion.navigate('AddWallet');
              },
            },
            secondary: skipBtnConfig(uai),
          },
          modalDetails: {
            heading: 'Set up you first vault',
            subTitle: 'Create your vault',
            body: 'Set up vault from these options',
            btnConfig: {
              primary: {
                text: 'Continue',
                cta: () => {
                  setShowModal(false);
                  skipUaiHandler(uai);
                },
              },
              secondary: {
                text: 'Skip',
                cta: () => {
                  navigtaion.goBack(); //TO-DO-UAI
                  skipUaiHandler(uai);
                },
              },
            },
          },
        };
      case uaiType.VAULT_TRANSFER:
        return {
          heading: 'Trasfer to Vault',
          body: uai.uaiDetails?.body,
          btnConfig: {
            primary: {
              text: 'Continue',
              cta: () => setShowModal(true),
            },
            secondary: skipBtnConfig(uai),
          },
          modalDetails: {
            heading: 'Trasfer to Vault',
            subTitle: 'Auto-transfer policy has been triggered',
            body: 'Transfer policy you established has been activated. You can move funds into the Vault for enhanced protection.',
            btnConfig: {
              primary: {
                text: 'Continue',
                cta: (uai) => {
                  setShowModal(false);
                  activeVault
                    ? navigtaion.navigate('SendConfirmation', {
                        uaiSetActionFalse,
                        walletId: uai.entityId,
                        transferType: TransferType.WALLET_TO_VAULT,
                      })
                    : showToast('No vaults found', <ToastErrorIcon />);
                },
              },
              secondary: {
                text: 'Do it later',
                cta: () => skipUaiHandler(uai),
              },
            },
          },
        };
      case uaiType.IKS_REQUEST:
        return {
          heading: 'Inheritance Key request',
          body: 'Inheritance Key request adsfasdfasdf',
          btnConfig: {
            primary: {
              text: 'Continue',
              cta: () => {},
            },
            secondary: skipBtnConfig(uai),
          },
          modalDetails: {
            heading: 'Inheritance Key request',
            subTitle: 'Inheritance Key request adsfasdfasdf',
            body: 'There is a request by someone for accessing the Inheritance Key you have set up using this app',
            btnConfig: {
              primary: {
                text: 'Continue',
                cta: async (entityId) => {
                  try {
                    setmodalActionLoader(true);
                    if (entityId) {
                      const res = await InheritanceKeyServer.declineInheritanceKeyRequest(entityId);
                      if (res?.declined) {
                        showToast('IKS declined');
                        uaiSetActionFalse();
                        setShowModal(false);
                      } else {
                        Alert.alert('Something went Wrong!');
                      }
                    }
                  } catch (err) {
                    Alert.alert('Something went Wrong!');
                    console.log('Error in declining request');
                  }
                  setShowModal(false);
                  setmodalActionLoader(false);
                },
              },
              secondary: {
                text: 'Skip',
                cta: () => {},
              },
            },
          },
        };
      case uaiType.SIGNING_DEVICES_HEALTH_CHECK:
        return {
          heading: 'Health Check Pending',
          body: uai.uaiDetails?.body,
          btnConfig: {
            primary: {
              text: 'Continue',
              cta: () => {},
            },
            secondary: skipBtnConfig(uai),
          },
          modalDetails: {
            heading: 'Health Check Pending',
            subTitle: 'Device health reminder',
            body: 'Vault Setup Instructions',
            btnConfig: {
              primary: {
                text: 'Continue',
                cta: () => {},
              },
              secondary: {
                text: 'Skip',
                cta: () => {},
              },
            },
          },
        };
      case uaiType.RECOVERY_PHRASE_HEALTH_CHECK:
        return {
          heading: 'Backup recoveryphrase',
          body: 'Backup of reocveryphrase pending',
          btnConfig: {
            primary: {
              text: 'Continue',
              cta: () => {},
            },
            secondary: skipBtnConfig(uai),
          },
          modalDetails: {
            heading: 'Set up Vault',
            subTitle: 'Vault Setup.....',
            body: 'Vault Setup Instructions',
            btnConfig: {
              primary: {
                text: 'Continue',
                cta: () => {},
              },
              secondary: {
                text: 'Skip',
                cta: () => {},
              },
            },
          },
        };
    }
  };

  const uaiConfig = getUaiTypeDefinations(uai);
  const { activeVault } = useVault({ getFirst: true });

  const animations = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      zIndex: totalLength - index,
      opacity: interpolate(
        activeIndex.value,
        [index - 1, index, index + 1],
        [1 - 1 / maxVisibleItems, 1, 1]
      ),
      transform: [
        {
          translateY: interpolate(
            activeIndex.value,
            [index - 1, index, index + 1],
            [layout.cardsGap, 0, layout.height + layout.cardsGap]
          ),
        },
        {
          scale: interpolate(activeIndex.value, [index - 1, index, index + 1], [0.96, 1, 1]),
        },
      ],
    };
  });

  const uaiSetActionFalse = () => {
    dispatch(uaiActioned({ uaiId: uai.id, action: true }));
  };

  return (
    <>
      <Animated.View style={[animations]}>
        <Box style={styles.card} backgroundColor={`${colorMode}.seashellWhite`}>
          <UAIView
            title={uaiConfig.heading}
            subTitle={uaiConfig.body}
            primaryCallbackText={uaiConfig.btnConfig.primary.text}
            secondaryCallbackText={uaiConfig.btnConfig.secondary.text}
            primaryCallback={uaiConfig.btnConfig.primary.cta}
            secondaryCallback={uaiConfig.btnConfig.secondary.cta}
          />
        </Box>
      </Animated.View>

      <KeeperModal
        visible={showModal}
        close={() => setShowModal(false)}
        title={uaiConfig.modalDetails.heading}
        subTitle={uaiConfig.modalDetails.subTitle}
        buttonText={uaiConfig.modalDetails.btnConfig.primary.text}
        buttonCallback={uaiConfig.modalDetails.btnConfig.primary.cta}
        secondaryButtonText={uaiConfig.btnConfig.secondary.text}
        secondaryCallback={uaiConfig.btnConfig.secondary.cta}
        buttonTextColor="light.white"
        Content={() => <Text color="light.greenText">{uaiConfig.modalDetails.body}</Text>}
      />
      <ActivityIndicatorView visible={modalActionLoader} showLoader />
    </>
  );
}

export default function NotificationStack() {
  const { colorMode } = useColorMode();
  const activeIndex = useSharedValue(0);
  const { uaiStack } = useUaiStack();

  const removeCard = () => {};

  const flingUp = Gesture.Fling()
    .direction(Directions.UP)
    .onStart(() => {
      runOnJS(removeCard)();
    });

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={Gesture.Exclusive(flingUp)}>
        <View style={styles.viewWrapper}>
          {uaiStack.length > 0 ? (
            uaiStack.map((uai, index) => {
              return (
                <Card
                  uai={uai}
                  key={uai.id}
                  index={index}
                  totalLength={uaiStack.length - 1}
                  activeIndex={activeIndex}
                />
              );
            })
          ) : (
            <UAIEmptyState />
          )}
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    top: windowHeight / 8,
  },
  viewWrapper: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  card: {
    borderRadius: layout.borderRadius,
    width: layout.width,
    height: layout.height,
    justifyContent: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
  },
});
