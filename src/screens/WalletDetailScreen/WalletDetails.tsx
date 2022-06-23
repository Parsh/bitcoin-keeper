import React, { useContext, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, RefreshControl, FlatList, BackHandler } from 'react-native';
import { Box, Text, Pressable } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import { RFValue } from 'react-native-responsive-fontsize';
import Carousel from 'react-native-snap-carousel';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
//components and images
import StatusBarComponent from 'src/components/StatusBarComponent';
import {
  hp, windowWidth, wp,
  getTransactionPadding,
} from 'src/common/data/responsiveness/responsive';
// icons and images
import ScannerIcon from 'src/assets/images/svgs/scan_green.svg';
import BackIcon from 'src/assets/images/svgs/back.svg';
import BTC from 'src/assets/images/svgs/btc_wallet.svg';
import Setting from 'src/assets/images/svgs/settings_small.svg';
import IconArrowBlack from 'src/assets/images/svgs/icon_arrow_black.svg';
import BtcBlack from 'src/assets/images/svgs/btc_black.svg';
import IconArrowGrey from 'src/assets/images/svgs/icon_arrow_grey.svg';
import IconRecieve from 'src/assets/images/svgs/icon_received.svg';
import Recieve from 'src/assets/images/svgs/receive.svg';
import Send from 'src/assets/images/svgs/send.svg';
import Buy from 'src/assets/images/svgs/icon_buy.svg';
import IconSettings from 'src/assets/images/svgs/icon_settings.svg';
import Arrow from 'src/assets/images/svgs/arrow_white.svg';
import AddSCardIcon from 'src/assets/images/svgs/card_add.svg';
import AddWalletIcon from 'src/assets/images/svgs/addWallet_illustration.svg';
import IconSent from 'src/assets/images/svgs/icon_sent.svg';
// data 
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { Transaction, Wallet } from 'src/core/wallets/interfaces/interface';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useAppSelector } from 'src/store/hooks';
// import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { LocalizationContext } from 'src/common/content/LocContext';
import { refreshWallets } from 'src/store/sagaActions/wallets';
const WalletDetails = () => {

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const carasualRef = useRef<Carousel<FlatList>>(null);
  const { useQuery } = useContext(RealmWrapperContext);
  const wallets: Wallet[] = useQuery(RealmSchema.Wallet).map(getJSONFromRealmObject);
  const netBalance = useAppSelector((state) => state.wallet.netBalance);
  // const exchangeRates = useAppSelector((state) => state.sendAndReceive.exchangeRates);
  // const currencyCode = useCurrencyCode();
  const { translations } = useContext(LocalizationContext);
  const wallet = translations['wallet'];

  const [walletIndex, setWalletIndex] = useState<number>(0);
  const [pullRefresh, setPullRefresh] = useState(false);
  const currentWallet = wallets[walletIndex]
  const transections = wallets[walletIndex]?.specs?.transactions || []

  const _onSnapToItem = (index: number) => {
    setWalletIndex(index);
  };

  const _renderItem = ({ item }: { item }) => {

    const walletName = item?.presentationData?.walletName;
    const walletDescription = item?.presentationData?.walletDescription;
    const balances = item?.specs?.balances;

    return (
      <LinearGradient
        colors={['#00836A', '#073E39']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: hp(20),
          width: wp(320),
          height: hp(120),
          position: 'relative'
        }}
      >
        {!(item?.presentationData && item?.specs) ? (
          <TouchableOpacity
            style={styles.addWalletContainer}
          >
            <AddSCardIcon />
            <Text
              color={'light.white'}
              fontFamily={'body'}
              fontWeight={'200'}
              fontSize={RFValue(14)}
            >
              {wallet.AddNewWallet}
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <Box
              marginTop={hp(21)}
              justifyContent={'space-between'}
              flexDirection={'row'}
              style={{
                marginHorizontal: wp(20)
              }}
            >
              <Pressable
                height={hp(20)}
                width={wp(60)}
                borderRadius={hp(5)}
                borderColor={'white'}
                borderWidth={0.5}
                justifyContent={'center'}
                alignItems={'center'}
                onPress={() => BackHandler.exitApp()}
              >
                <Text
                  color={'light.white'}
                  letterSpacing={0.6}
                  fontSize={RFValue(8)}
                  fontWeight={100}
                >
                  Know More
                </Text>
              </Pressable>
              <Pressable>
                <Setting />
              </Pressable>
            </Box>

            <Box
              marginTop={hp(21)}
              flexDirection={'row'}
              alignItems={'center'}
              justifyContent={'space-between'}
              style={{
                marginHorizontal: wp(20)
              }}
            >
              <Box>
                <Text
                  color={'light.white'}
                  letterSpacing={0.28}
                  fontSize={RFValue(14)}
                  fontWeight={200}
                >
                  {walletName}
                </Text>
                <Text
                  color={'light.white'}
                  letterSpacing={0.24}
                  fontSize={RFValue(12)}
                  fontWeight={100}
                >
                  {walletDescription}
                </Text>
              </Box>
              <Text
                color={'light.white'}
                letterSpacing={1.2}
                fontSize={RFValue(24)}
                fontWeight={200}
              >
                {balances.confirmed + balances.unconfirmed}
              </Text>
            </Box>
          </>)
        }
      </LinearGradient>
    );
  };

  const pullDownRefresh = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([currentWallet], { hardRefresh: true }));
    setPullRefresh(false);
  };

  const renderTransactionElement = ({ item }) => {
    return <TransactionElement transaction={item} />;
  };

  const TransactionElement = ({ transaction }: { transaction: Transaction }) => {

    return (
      <Box
        flexDirection={'row'}
        height={getTransactionPadding()}
        borderRadius={10}
        justifyContent={'space-between'}
        alignItems={'center'}
        marginTop={hp(25)}
      >
        <Box flexDirection={'row'} alignItems={'center'} justifyContent={'center'}>
          {transaction.transactionType == 'Received' ? <IconRecieve /> : <IconSent />}
          <Box flexDirection={'column'} marginLeft={1.5}>
            <Text
              color={'light.GreyText'}
              marginX={1}
              fontSize={13}
              fontWeight={200}
              letterSpacing={0.6}
              numberOfLines={1}
              width={wp(125)}
            >
              {transaction?.txid}
            </Text>
            <Text
              color={'light.dateText'}
              marginX={1}
              fontSize={11}
              fontWeight={100}
              letterSpacing={0.5}
              opacity={0.82}
            >
              {transaction.date}
            </Text>
          </Box>
        </Box>
        <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>
          <Box>
            <BtcBlack />
          </Box>
          <Text
            color={'light.textBlack'}
            fontSize={19}
            fontWeight={200}
            letterSpacing={0.95}
            marginX={2}
            marginRight={3}
          >
            {transaction.amount}
          </Text>
          <Box>
            <IconArrowGrey />
          </Box>
        </Box>
      </Box>
    );
  };

  const GradientIcon = ({ height, Icon }) => {
    return (
      <LinearGradient
        colors={['#00836A', '#073E39']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          height: hp(height),
          width: hp(height),
          borderRadius: height,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Icon />
      </LinearGradient>
    );
  }

  return (
    <Box
      backgroundColor={'light.lightYellow'}
      flex={1}
      paddingLeft={wp(28)}
      paddingRight={wp(27)}
      paddingTop={hp(27)}

    >
      <StatusBarComponent padding={50} />

      <Box
        flexDirection={'row'}
        justifyContent={'space-between'}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <BackIcon />
        </Pressable>
        <GradientIcon height={48} Icon={Arrow} />
        <Pressable>
          <ScannerIcon />
        </Pressable>
      </Box>

      <Box alignItems={'center'}>
        <Text
          color={'light.textWallet'}
          letterSpacing={0.96}
          fontSize={RFValue(14)}
          fontWeight={200}
          marginTop={hp(10)}
        >
          {wallets?.length} Linked Wallets
        </Text>

        <Text
          color={'light.textWallet'}
          letterSpacing={1.5}
          fontSize={RFValue(26)}
          fontWeight={200}
          marginTop={hp(2)}
        >
          <Box marginRight={wp(1)} marginTop={hp(4)}>
            <BTC />
          </Box>
          {netBalance}
        </Text>

      </Box>

      <Box
        alignItems={'center'}
        marginTop={hp(10)}
      >
        <Box
          height={hp(67)}
          width={wp(240)}
          borderRadius={hp(15)}
          backgroundColor={'light.transactionPolicyCard'}
          flexDirection={'row'}
          justifyContent={'space-between'}
          alignItems={'center'}
          style={{ paddingHorizontal: wp(10) }}
        >
          <Box style={{ paddingLeft: wp(10) }}>
            <Text
              color={'light.lightBlack'}
              letterSpacing={0.6}
              fontSize={RFValue(12)}
              fontWeight={200}
            >
              Transfer Policy
            </Text>
            <Text
              color={'light.textWallet'}
              letterSpacing={0.5}
              fontSize={RFValue(10)}
              fontWeight={200}
            >
              Secure to Vault after{' '} <Text fontWeight={'bold'}>0.1 btc</Text>
            </Text>
          </Box>
          <Pressable>
            <GradientIcon height={38} Icon={Arrow} />
          </Pressable>

        </Box>
      </Box>

      <Box
        marginTop={hp(18)}
        alignItems={'center'}>

        <Carousel
          onSnapToItem={_onSnapToItem}
          ref={carasualRef}
          data={[...wallets, { isEnd: true }]}
          renderItem={_renderItem}
          sliderWidth={windowWidth}
          itemWidth={wp(320)}
          itemHeight={hp(20)}
          layout={'default'}
        />
      </Box>
      {walletIndex !== wallets.length ?
        <>
          <Box
            flexDirection={'row'}
            justifyContent={'space-between'}
            marginTop={hp(15)}
            width={'100%'}
          >
            <Text
              color={'light.textBlack'}
              marginLeft={wp(3)}
              fontSize={16}
              fontWeight={200}
              letterSpacing={1.28}
            >
              Transactions
            </Text>
            <Box
              flexDirection={'row'}
              alignItems={'center'}
              marginRight={wp(2)}
            >
              <Text
                color={'light.light'}
                marginRight={1}
                fontSize={11}
                fontWeight={300}
                letterSpacing={0.6}
              >
                View All
              </Text>
              <IconArrowBlack />
            </Box>
          </Box>

          <Box
            marginTop={hp(10)}
            height={hp(250)}
          >
            <FlatList
              refreshControl={<RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />}
              data={transections}
              renderItem={renderTransactionElement}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
            />
          </Box>

          <Box
            borderWidth={0.5}
            borderColor={'light.GreyText'}
            borderRadius={20}
            opacity={0.2}
            marginTop={hp(20)}
          />

          <Box
            flexDirection={'row'}
            marginTop={2}
            justifyContent={'space-between'}
            marginX={10}
          >
            <TouchableOpacity
              style={styles.IconText}
              onPress={() => {
                navigation.navigate('Send', { wallet: currentWallet });
              }}
            >
              <Send />
              <Text color={'light.lightBlack'} fontSize={12} letterSpacing={0.84} marginY={2.5}>
                Send
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.IconText}
              onPress={() => {
                navigation.navigate('Receive', { wallet: currentWallet });
              }}
            >
              <Recieve />
              <Text color={'light.lightBlack'} fontSize={12} letterSpacing={0.84} marginY={2.5}>
                Recieve
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.IconText}
            >
              <Buy />
              <Text color={'light.lightBlack'} fontSize={12} letterSpacing={0.84} marginY={2.5}>
                Buy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.IconText}
              onPress={() => {
                navigation.navigate('ExportSeed', { seed: currentWallet?.derivationDetails?.mnemonic });
              }}
            >
              <IconSettings />
              <Text color={'light.lightBlack'} fontSize={12} letterSpacing={0.84} marginY={2.5}>
                Settings
              </Text>
            </TouchableOpacity>
          </Box>
        </> :
        <Box
          justifyContent={'center'}
          alignItems={'center'}
          flex={1}
        >
          <AddWalletIcon />
          <Text
            color={'light.lightBlack'}
            fontSize={12}
            letterSpacing={0.60}
            marginY={5}
            marginX={8}
            opacity={0.85}
            noOfLines={2}
            fontWeight={100}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
          </Text>
        </Box>
      }

    </Box>
  );
};

const styles = StyleSheet.create({
  IconText: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addWalletContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  },
});
export default WalletDetails;

