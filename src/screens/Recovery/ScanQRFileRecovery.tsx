import { Alert, ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import { Box, HStack, Text } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import HeaderTitle from 'src/components/HeaderTitle';
import { RNCamera } from 'react-native-camera';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { URRegistryDecoder } from 'src/core/services/qr/bc-ur-registry';
import { decodeURBytes } from 'src/core/services/qr';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Note from 'src/components/Note/Note';
import useToastMessage from 'src/hooks/useToastMessage';
import UploadFile from 'src/components/UploadFile';
import useConfigRecovery from 'src/hooks/useConfigReocvery';
import { wp } from 'src/constants/responsive';

const { width } = Dimensions.get('screen');
let decoder = new URRegistryDecoder();

function ScanQRFileRecovery({ route }) {
  const { allowFileUploads = true } = route.params || {};
  const { initateRecovery } = useConfigRecovery();
  const [qrPercent, setQrPercent] = useState(0);
  const [qrData, setData] = useState(0);
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);

  const { common } = translations;

  // eslint-disable-next-line no-promise-executor-return
  const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const resetQR = async () => {
    await sleep(3000);
    setData(0);
    setQrPercent(0);
  };

  useEffect(() => {
    if (qrData) {
      Alert.alert(qrData.toString());
      console.log({ qrData });
      resetQR();
    }
    return () => {
      decoder = new URRegistryDecoder();
    };
  }, [qrData]);

  const onBarCodeRead = (data) => {
    if (!qrData) {
      if (!data.data.startsWith('UR') && !data.data.startsWith('ur')) {
        setData(data.data);
        setQrPercent(100);
      } else {
        const { data: qrInfo, percentage } = decodeURBytes(decoder, data.data);
        console.log({ qrInfo });
        if (qrInfo) {
          setData(qrInfo);
        }
        setQrPercent(percentage);
      }
    }
  };

  return (
    <ScreenWrapper>
      <Box flex={1}>
        <HeaderTitle
          title="Recover Using Vault Configuration File"
          subtitle="Recover the Vault from output descriptor or configuration"
          paddingLeft={wp(20)}
        />
        <Box style={styles.qrcontainer}>
          <RNCamera
            style={styles.cameraView}
            captureAudio={false}
            onBarCodeRead={onBarCodeRead}
            useNativeZoom
          />
        </Box>
        <HStack justifyContent="center" my={2}>
          {qrPercent !== 100 && <ActivityIndicator />}
          <Text>{`Scanned ${qrPercent}%`}</Text>
        </HStack>
        {allowFileUploads && <UploadFile fileHandler={initateRecovery} />}
        <Box style={styles.noteWrapper}>
          <Note
            title={common.note}
            subtitle="Make sure that the QR is well aligned, focused and visible as a whole"
            subtitleColor="GreyText"
          />
        </Box>
      </Box>
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  qrcontainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 15,
    alignItems: 'center',
  },
  cameraView: {
    height: width * 0.9,
    width: width * 0.9,
  },
  noteWrapper: {
    width: '100%',
    bottom: 0,
    position: 'absolute',
    paddingHorizontal: 20,
  },
});

export default ScanQRFileRecovery;
