import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, Pressable } from 'native-base';
import React, { useContext } from 'react';
import { getAmt, getCurrencyImageByRegion, getUnit } from 'src/common/constants/Bitcoin';
import { Shadow } from 'react-native-shadow-2';
import AddSCardIcon from 'src/assets/images/card_add.svg';
import BtcWallet from 'src/assets/images/btc_walletCard.svg';

import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletInsideGreen from 'src/assets/images/Wallet_inside_green.svg';
import { WalletType } from 'src/core/wallets/enums';
import { useNavigation } from '@react-navigation/native';
import { LocalizationContext } from 'src/common/content/LocContext';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { useAppSelector } from 'src/store/hooks';
import GradientIcon from './GradientIcon';

function WalletItem({
  item,
  index,
  walletIndex,
  exchangeRates,
  currencyCode,
  currentCurrency,
  satsEnabled,
  navigation,
  translations,
  setselectAccount,
}: {
  item: Wallet;
  index: number;
  walletIndex: number;
  exchangeRates: any;
  currencyCode: string;
  currentCurrency: any;
  satsEnabled: boolean;
  navigation;
  translations;
  setselectAccount: () => void;
}) {
  if (!item) {
    return null;
  }
  const { wallet } = translations;
  const walletName = item?.presentationData?.name;
  const walletDescription = item?.presentationData?.description;
  const balances = item?.specs?.balances;
  const walletBalance = balances?.confirmed + balances?.unconfirmed;
  const isActive = index === walletIndex;

  return (
    <Shadow
      distance={9}
      startColor="#e4e4e4"
      offset={[0, 14]}
      viewStyle={{
        height: hp(137),
        marginRight: 15,
      }}
    >
      <Box
        variant={isActive ? 'linearGradient' : 'InactiveGradient'}
        style={styles.walletContainer}
      >
        {!(item?.presentationData && item?.specs) ? (
          <TouchableOpacity
            style={styles.addWalletContainer}
            onPress={() =>
              navigation.navigate('EnterWalletDetail', {
                name: `Wallet ${walletIndex + 1}`,
                description: 'Single-sig Wallet',
                type: WalletType.DEFAULT,
              })
            }
          >
            <GradientIcon
              Icon={AddSCardIcon}
              height={40}
              gradient={isActive ? ['#FFFFFF', '#80A8A1'] : ['#9BB4AF', '#9BB4AF']}
            />

            <Text color="light.white" style={styles.addWalletText}>
              {wallet.AddNewWallet}
            </Text>
          </TouchableOpacity>
        ) : true ? (
          <Box>
            <Box style={{ ...styles.walletCard, height: wp(40) }}>
              <Box style={styles.walletInnerView}>
                <GradientIcon
                  Icon={WalletInsideGreen}
                  height={35}
                  gradient={isActive ? ['#FFFFFF', '#80A8A1'] : ['#9BB4AF', '#9BB4AF']}
                />
                <Box
                  style={{
                    marginLeft: 10,
                  }}
                >
                  <Text color="light.white" style={styles.walletName}>
                    {walletName}
                  </Text>
                  <Text
                    color="light.white"
                    style={styles.walletDescription}
                    ellipsizeMode="tail"
                    numberOfLines={1}
                  >
                    {walletDescription}
                  </Text>
                </Box>
              </Box>
            </Box>

            <Pressable
              style={{
                marginTop: hp(20),
                paddingHorizontal: wp(15),
                paddingVertical: hp(10),
                height: hp(55),
                width: wp(270),
                alignSelf: 'center',
                justifyContent: 'center',
                borderRadius: hp(5),
              }}
              backgroundColor="light.Glass"
              onPress={() => setselectAccount(true)}
            >
              <Box
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text color="light.white" style={{ fontSize: 13, letterSpacing: 1 }}>
                  PerMix Account
                </Text>
                <Box>
                  <Box flexDirection={'row'}>
                    <Box
                      style={{
                        marginRight: 3,
                        marginTop: 3,
                      }}
                    >
                      {getCurrencyImageByRegion(currencyCode, 'light', currentCurrency, BtcWallet)}
                    </Box>
                    <Text color="light.white" style={{ fontSize: 20, letterSpacing: 1 }}>
                      0.000024
                    </Text>
                  </Box>
                  <Text color="light.white" style={{ fontSize: 13, letterSpacing: 1 }}>
                    Unconfirmed 0.00050
                  </Text>
                </Box>
              </Box>
            </Pressable>
          </Box>
        ) : (
          <Box>
            <Box style={styles.walletCard}>
              <Box style={styles.walletInnerView}>
                <GradientIcon
                  Icon={WalletInsideGreen}
                  height={35}
                  gradient={isActive ? ['#FFFFFF', '#80A8A1'] : ['#9BB4AF', '#9BB4AF']}
                />
                <Box
                  style={{
                    marginLeft: 10,
                  }}
                >
                  <Text color="light.white" style={styles.walletName}>
                    {walletName}
                  </Text>
                  <Text
                    color="light.white"
                    style={styles.walletDescription}
                    ellipsizeMode="tail"
                    numberOfLines={1}
                  >
                    {walletDescription}
                  </Text>
                </Box>
              </Box>
              <Box>
                <Text color="light.white" style={styles.unconfirmedText}>
                  Unconfirmed
                </Text>
                <Box style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Box
                    style={{
                      marginRight: 3,
                    }}
                  >
                    {getCurrencyImageByRegion(currencyCode, 'light', currentCurrency, BtcWallet)}
                  </Box>
                  <Text color="light.white" style={styles.unconfirmedBalance}>
                    {getAmt(
                      balances?.unconfirmed,
                      exchangeRates,
                      currencyCode,
                      currentCurrency,
                      satsEnabled
                    )}
                  </Text>
                </Box>
              </Box>
            </Box>

            <Box style={styles.walletBalance}>
              <Text color="light.white" style={styles.walletName}>
                Available Balance
              </Text>
              <Box style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Box
                  style={{
                    marginRight: 3,
                  }}
                >
                  {getCurrencyImageByRegion(currencyCode, 'light', currentCurrency, BtcWallet)}
                </Box>
                <Text color="light.white" style={styles.availableBalance}>
                  {getAmt(walletBalance, exchangeRates, currencyCode, currentCurrency, satsEnabled)}
                  <Text color="light.textColor" style={styles.balanceUnit}>
                    {getUnit(currentCurrency, satsEnabled)}
                  </Text>
                </Text>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Shadow>
  );
}

function WalletList({ flatListRef, walletIndex, onViewRef, viewConfigRef, wallets }: any) {
  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  return (
    <Box style={styles.walletsContainer}>
      <FlatList
        ref={flatListRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={wallets.concat({ isEnd: true })}
        renderItem={({ item, index }) => (
          <WalletItem
            item={item}
            index={index}
            walletIndex={walletIndex}
            exchangeRates={exchangeRates}
            currencyCode={currencyCode}
            currentCurrency={currentCurrency}
            satsEnabled={satsEnabled}
            navigation={navigation}
            translations={translations}
            setselectAccount={setselectAccount}
          />
        )}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        snapToAlignment="start"
      />
    </Box>
  );
}

export default WalletList;

const styles = StyleSheet.create({
  addWalletContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  balanceUnit: {
    letterSpacing: 0.6,
    fontSize: 12,
  },
  walletsContainer: {
    marginTop: 18,
    height: hp(165),
    width: '100%',
  },
  walletContainer: {
    borderRadius: hp(10),
    width: wp(310),
    height: hp(windowHeight > 700 ? 145 : 150),
    padding: wp(15),
    position: 'relative',
    marginLeft: 0,
  },
  addWalletText: {
    fontSize: 14,
    marginTop: hp(10),
  },
  walletCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: hp(60),
  },
  walletInnerView: {
    flexDirection: 'row',
    alignItems: 'center',
    width: wp(173),
  },
  walletDescription: {
    letterSpacing: 0.24,
    fontSize: 13,
  },
  walletName: {
    letterSpacing: 0.2,
    fontSize: 11,
    fontWeight: '400',
  },
  walletBalance: {
    marginTop: hp(12),
  },
  border: {
    borderWidth: 0.5,
    borderRadius: 20,
    opacity: 0.2,
  },

  unconfirmedText: {
    fontSize: 11,
    letterSpacing: 0.72,
    textAlign: 'right',
  },
  unconfirmedBalance: {
    fontSize: 17,
    letterSpacing: 0.6,
    alignSelf: 'flex-end',
  },
  availableBalance: {
    fontSize: hp(24),
    letterSpacing: 1.2,
    lineHeight: hp(30),
  },
  atViewWrapper: {
    marginVertical: 4,
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: '#FDF7F0',
    flexDirection: 'row',
  },
});
