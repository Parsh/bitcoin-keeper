import React, { useContext, useEffect, useState } from 'react';
import { Box, useColorMode, View } from 'native-base';

import BtcInput from 'src/assets/images/btc_input.svg';
import BtcWhiteInput from 'src/assets/images/btc_white.svg';

import { LocalizationContext } from 'src/common/content/LocContext';
import { wp } from 'src/common/data/responsiveness/responsive';
import DeleteDarkIcon from 'src/assets/images/delete.svg';
import DeleteIcon from 'src/assets/images/deleteLight.svg';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import Text from 'src/components/KeeperText';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'src/store/hooks';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import { updateWalletProperty } from 'src/store/sagaActions/wallets';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { v4 as uuidv4 } from 'uuid';
import Buttons from '../Buttons';
import KeyPadView from '../AppNumPad/KeyPadView';
import ActivityIndicatorView from '../AppActivityIndicator/ActivityIndicatorView';

function TransferPolicy({
  wallet,
  close,
  secondaryBtnPress,
}: {
  wallet: Wallet;
  close: () => void;
  secondaryBtnPress: () => void;
}) {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const { relayWalletUpdateLoading, relayWalletUpdate, relayWalletError, realyWalletErrorMessage } =
    useAppSelector((state) => state.bhr);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const [policyText, setPolicyText] = useState(wallet?.transferPolicy?.threshold?.toString());
  const dispatch = useDispatch();

  const onPressNumber = (digit) => {
    let temp = policyText;
    if (digit !== 'x') {
      temp += digit;
      setPolicyText(temp);
    }
  };

  useEffect(() => {
    if (relayWalletError) {
      showToast('Something went wrong');
      dispatch(resetRealyWalletState());
    }
    if (relayWalletUpdate) {
      close();
      showToast('Transfer Policy Changed', <TickIcon />);
      dispatch(resetRealyWalletState());
    }
  }, [relayWalletUpdate, relayWalletError, realyWalletErrorMessage]);

  const onDeletePressed = () => {
    if (policyText) {
      setPolicyText(policyText.slice(0, -1));
    }
  };
  const presshandler = () => {
    if (Number(policyText) > 0) {
      wallet.transferPolicy.threshold = Number(policyText);
      dispatch(
        updateWalletProperty({
          walletId: wallet.id,
          key: 'transferPolicy',
          value: {
            id: uuidv4(),
            threshold: Number(policyText),
          },
        })
      );
    } else {
      showToast('Transfer Policy cannot be zero');
    }
  };
  return (
    <Box backgroundColor={`${colorMode}.modalWhiteBackground`} width={wp(275)} borderRadius={10}>
      <Box justifyContent="center" alignItems="center">
        <Box
          marginX="5%"
          flexDirection="row"
          width="100%"
          justifyContent="center"
          alignItems="center"
          borderRadius={5}
          backgroundColor={`${colorMode}.seashellWhite`}
          padding={3}
        >
          <View marginLeft={4}>{colorMode === 'light' ? <BtcInput /> : <BtcWhiteInput />}</View>
          <View marginLeft={2} width={0.5} backgroundColor="#BDB7B1" opacity={0.3} height={5} />
          <Text
            bold
            fontSize={15}
            color={`${colorMode}.greenText`}
            marginLeft={3}
            width="100%"
            letterSpacing={3}
          >
            {policyText && `${policyText} sats`}
          </Text>
        </Box>
      </Box>
      <Box py={5}>
        <Text fontSize={13} color={`${colorMode}.greenText`} letterSpacing={0.65}>
          This will trigger a transfer request which you need to approve
        </Text>
      </Box>
      <Buttons
        primaryCallback={presshandler}
        primaryText={common.confirm}
        secondaryCallback={secondaryBtnPress}
        secondaryText={common.cancel}
        paddingHorizontal={wp(30)}
        primaryDisable={relayWalletUpdateLoading || relayWalletUpdate}
      />
      {/* keyboardview start */}
      <KeyPadView
        onPressNumber={onPressNumber}
        onDeletePressed={onDeletePressed}
        keyColor={colorMode === 'light' ? '#041513' : '#FFF'}
        ClearIcon={colorMode === 'dark' ? <DeleteIcon /> : <DeleteDarkIcon />}
      />
      {relayWalletUpdateLoading && <ActivityIndicatorView visible={relayWalletUpdateLoading} />}
    </Box>
  );
}
export default TransferPolicy;
