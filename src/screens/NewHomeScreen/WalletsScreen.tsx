/* eslint-disable react/function-component-definition */
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import useWallets from 'src/hooks/useWallets';
import { useAppSelector } from 'src/store/hooks';
import useBalance from 'src/hooks/useBalance';
import { Box, FlatList, ScrollView } from 'native-base';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import { useNavigation } from '@react-navigation/native';
import { LocalizationContext } from 'src/common/content/LocContext';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { WalletType } from 'src/core/wallets/enums';
import GradientIcon from 'src/screens/WalletDetailScreen/components/GradientIcon';
import AddSCardIcon from 'src/assets/images/card_add.svg';
import WalletInsideGreen from 'src/assets/images/Wallet_inside_green.svg';
import WhirlpoolAccountIcon from 'src/assets/images/whirlpool_account.svg';
import InheritanceIcon from 'src/assets/images/inheritanceWhite.svg';
import WhirlpoolWhiteIcon from 'src/assets/images/white_icon_whirlpool.svg';
import AddNewWalletIllustration from 'src/assets/images/addNewWalletIllustration.svg';
import TickIcon from 'src/assets/images/icon_tick.svg';
import Text from 'src/components/KeeperText';
import KeeperModal from 'src/components/KeeperModal';
import TransferPolicy from 'src/components/XPub/TransferPolicy';
import useToastMessage from 'src/hooks/useToastMessage';
import idx from 'idx';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { Shadow } from 'react-native-shadow-2';
import DowngradeToPleb from 'src/assets/images/downgradetopleb.svg';
import dbManager from 'src/storage/realm/dbManager';
import { SubscriptionTier, AppSubscriptionLevel } from 'src/common/data/enums/SubscriptionTier';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import SubScription from 'src/common/data/models/interfaces/Subscription';
import Relay from 'src/core/services/operations/Relay';
import { RealmSchema } from 'src/storage/realm/enum';
import { useDispatch } from 'react-redux';
import { setRecepitVerificationFailed } from 'src/store/reducers/login';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import RampModal from '../WalletDetails/components/RampModal';
import CurrencyInfo from './components/CurrencyInfo';
import BalanceToggle from './components/BalanceToggle';
import HomeScreenWrapper from './components/HomeScreenWrapper';
import ListItemView from './components/ListItemView';

const TILE_MARGIN = wp(10);
const TILE_WIDTH = hp(170);
const VIEW_WIDTH = TILE_WIDTH + TILE_MARGIN;

function AddNewWalletTile({ walletIndex, isActive, wallet, navigation }) {
  return (
    <View style={styles.addWalletContent}>
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
        <Text color="light.white" style={styles.addWalletText}>
          {wallet.AddNewWallet}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.addWalletContainer}
        onPress={() => navigation.navigate('ImportWallet')}
      >
        <Text color="light.white" style={styles.addWalletText}>
          {wallet.ImportAWallet}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function WalletItem({
  item,
  index,
  walletIndex,
  navigation,
  translations,
  hideAmounts,
}: {
  currentIndex: number;
  item: Wallet;
  index: number;
  walletIndex: number;
  navigation;
  translations;
  hideAmounts: boolean;
}) {
  if (!item) {
    return null;
  }
  const isWhirlpoolWallet = Boolean(item?.whirlpoolConfig?.whirlpoolWalletDetails);
  const isActive = index === walletIndex;
  const { wallet } = translations;
  const opacity = isActive ? 1 : 0.5;
  return (
    <View style={[styles.walletContainer, { width: TILE_WIDTH, opacity }]}>
      <TouchableOpacity
        onPress={() => navigation.navigate('WalletDetails', { walletId: item.id, walletIndex })}
      >
        {!(item?.presentationData && item?.specs) ? (
          <AddNewWalletTile
            walletIndex={walletIndex}
            isActive={isActive}
            wallet={wallet}
            navigation={navigation}
          />
        ) : (
          <WalletTile
            isWhirlpoolWallet={isWhirlpoolWallet}
            isActive={isActive}
            wallet={item}
            balances={item?.specs?.balances}
            hideAmounts={hideAmounts}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

function WalletList({ walletIndex, onViewRef, viewConfigRef, wallets, hideAmounts }: any) {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);

  return (
    <Box style={styles.walletsContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={wallets.concat({ isEnd: true })}
        disableIntervalMomentum
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: VIEW_WIDTH / 2 }}
        snapToInterval={VIEW_WIDTH}
        snapToAlignment="start"
        renderItem={({ item, index }) => (
          <WalletItem
            hideAmounts={hideAmounts}
            item={item}
            index={index}
            walletIndex={walletIndex}
            navigation={navigation}
            translations={translations}
          />
        )}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
      />
    </Box>
  );
}

function WalletTile({ isActive, wallet, balances, isWhirlpoolWallet, hideAmounts }) {
  const { getBalance, getCurrencyIcon, getSatUnit } = useBalance();

  return (
    <Box>
      <Box style={styles.walletCard}>
        <Box style={styles.walletInnerView}>
          {isWhirlpoolWallet ? (
            <GradientIcon
              Icon={WhirlpoolAccountIcon}
              height={35}
              gradient={isActive ? ['#FFFFFF', '#80A8A1'] : ['#9BB4AF', '#9BB4AF']}
            />
          ) : (
            <GradientIcon
              Icon={WalletInsideGreen}
              height={35}
              gradient={isActive ? ['#FFFFFF', '#80A8A1'] : ['#9BB4AF', '#9BB4AF']}
            />
          )}

          <Box style={styles.walletDetailsWrapper}>
            <Text color="light.white" style={styles.walletName}>
              {wallet?.presentationData?.name}
            </Text>
            <Text
              color="light.white"
              style={styles.walletDescription}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {wallet?.presentationData?.description}
            </Text>
          </Box>
        </Box>
      </Box>

      <Box style={styles.walletBalance}>
        <Text color="light.white" style={styles.walletName}>
          Available Balance
        </Text>
        <CurrencyInfo
          hideAmounts={hideAmounts}
          amount={balances?.confirmed + balances?.unconfirmed}
          fontSize={20}
          color={Colors.White}
          variation="light"
        />
      </Box>
    </Box>
  );
}

const WalletsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { wallets } = useWallets();
  const netBalance = useAppSelector((state) => state.wallet.netBalance);
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();
  const [walletIndex, setWalletIndex] = useState<number>(0);
  const [transferPolicyVisible, setTransferPolicyVisible] = useState(false);
  const currentWallet = wallets[walletIndex];
  const flatListRef = useRef(null);
  const [hideAmounts, setHideAmounts] = useState(false);
  const [showBuyRampModal, setShowBuyRampModal] = useState(false);
  const { showToast } = useToastMessage();
  const onViewRef = useRef((viewableItems) => {
    const index = viewableItems.changed.find((item) => item.isViewable === true);
    if (index?.index !== undefined) {
      setWalletIndex(index?.index);
    }
  });
  const { recepitVerificationError, recepitVerificationFailed } = useAppSelector(
    (state) => state.login
  );

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 40 });

  const receivingAddress = idx(currentWallet, (_) => _.specs.receivingAddress) || '';
  const balance = idx(currentWallet, (_) => _.specs.balances.confirmed) || 0;
  const presentationName = idx(currentWallet, (_) => _.presentationData.name) || '';
  const electrumClientConnectionStatus = useAppSelector(
    (state) => state.login.electrumClientConnectionStatus
  );

  useEffect(() => {
    if (electrumClientConnectionStatus.success) {
      showToast(`Connected to: ${electrumClientConnectionStatus.connectedTo}`, <TickIcon />);
    } else if (electrumClientConnectionStatus.failed) {
      showToast(`${electrumClientConnectionStatus.error}`, <ToastErrorIcon />);
    }
  }, [electrumClientConnectionStatus.success, electrumClientConnectionStatus.error]);

  useEffect(() => {}, [recepitVerificationError, recepitVerificationFailed]);

  async function downgradeToPleb() {
    try {
      const app: KeeperApp = dbManager.getCollection(RealmSchema.KeeperApp)[0];
      const updatedSubscription: SubScription = {
        receipt: '',
        productId: SubscriptionTier.L1,
        name: SubscriptionTier.L1,
        level: AppSubscriptionLevel.L1,
        icon: 'assets/ic_pleb.svg',
      };
      dbManager.updateObjectById(RealmSchema.KeeperApp, app.id, {
        subscription: updatedSubscription,
      });
      dispatch(setRecepitVerificationFailed(false));
      const response = await Relay.updateSubscription(app.id, app.publicId, {
        productId: SubscriptionTier.L1.toLowerCase(),
      });
    } catch (error) {
      //
    }
  }

  // eslint-disable-next-line react/no-unstable-nested-components
  function DowngradeModalContent() {
    return (
      <Box>
        <DowngradeToPleb />
        {/* <Text numberOfLines={1} style={[styles.btnText, { marginBottom: 30, marginTop: 20 }]}>You may choose to downgrade to Pleb</Text> */}
        <Box alignItems="center" flexDirection="row">
          <TouchableOpacity
            style={[styles.cancelBtn]}
            onPress={() => {
              navigation.replace('ChoosePlan');
              dispatch(setRecepitVerificationFailed(false));
            }}
            activeOpacity={0.5}
          >
            <Text numberOfLines={1} style={styles.btnText} color="light.greenText" bold>
              View Subscription
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              downgradeToPleb();
            }}
          >
            <Shadow distance={10} startColor="#073E3926" offset={[3, 4]}>
              <Box
                style={[styles.createBtn]}
                backgroundColor={{
                  linearGradient: {
                    colors: ['light.gradientStart', 'light.gradientEnd'],
                    start: [0, 0],
                    end: [1, 1],
                  },
                }}
              >
                <Text numberOfLines={1} style={styles.btnText} color="light.white" bold>
                  Continue as Pleb
                </Text>
              </Box>
            </Shadow>
          </TouchableOpacity>
        </Box>
      </Box>
    );
  }

  return (
    <HomeScreenWrapper>
      {/* <BalanceToggle hideAmounts={hideAmounts} setHideAmounts={setHideAmounts} /> */}
      <Box style={styles.titleWrapper}>
        <Box style={styles.titleInfoView}>
          <Text style={styles.titleText} color="light.primaryText">
            {wallets?.length} Hot Wallet{wallets?.length > 1 && 's'}
          </Text>
          <Text style={styles.subTitleText} color="light.secondaryText">
            Keys on this app
          </Text>
        </Box>
        <Box style={styles.netBalanceView}>
          <CurrencyInfo
            hideAmounts={hideAmounts}
            amount={netBalance}
            fontSize={20}
            color={Colors.black}
            variation="dark"
          />
        </Box>
      </Box>
      <WalletList
        hideAmounts={hideAmounts}
        flatListRef={flatListRef}
        walletIndex={walletIndex}
        onViewRef={onViewRef}
        viewConfigRef={viewConfigRef}
        wallets={wallets}
      />
      <Box style={styles.listItemsWrapper}>
        <Box style={styles.whirlpoolListItemWrapper}>
          {presentationName.length > 0 ? (
            <ListItemView
              icon={<WhirlpoolWhiteIcon />}
              title="Whirlpool & UTXOs"
              subTitle="Manage wallet UTXOs and use Whirlpool"
              iconBackColor="light.greenText2"
              onPress={() => {
                if (Platform.OS === 'ios') {
                  if (currentWallet)
                    navigation.navigate('UTXOManagement', {
                      data: currentWallet,
                      routeName: 'Wallet',
                      accountType: WalletType.DEFAULT,
                    });
                } else {
                  showToast('Coming Soon');
                }
              }}
            />
          ) : (
            <Box style={styles.AddNewWalletIllustrationWrapper}>
              <Box style={styles.addNewWallIconWrapper}>
                <AddNewWalletIllustration />
              </Box>
              <Box style={styles.addNewWallTextWrapper}>
                <Text color="light.secondaryText" style={styles.addNewWallText}>
                  Add a new Wallet or Import one
                </Text>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      <KeeperModal
        visible={transferPolicyVisible}
        close={() => {
          setTransferPolicyVisible(false);
        }}
        title="Edit Transfer Policy"
        subTitle="Threshold amount at which transfer is triggered"
        subTitleColor="light.secondaryText"
        textColor="light.primaryText"
        Content={() => (
          <TransferPolicy
            wallet={currentWallet}
            close={() => {
              showToast('Transfer Policy Changed', <TickIcon />);
              setTransferPolicyVisible(false);
            }}
            secondaryBtnPress={() => {
              setTransferPolicyVisible(false);
            }}
          />
        )}
      />
      <RampModal
        showBuyRampModal={showBuyRampModal}
        setShowBuyRampModal={setShowBuyRampModal}
        receivingAddress={receivingAddress}
        balance={balance}
        name={presentationName}
      />

      <KeeperModal
        dismissible={false}
        close={() => {}}
        visible={recepitVerificationFailed}
        title="Failed to validate your subscription"
        subTitle="Do you want to downgrade to Pleb and continue?"
        Content={DowngradeModalContent}
        subTitleColor="light.secondaryText"
        subTitleWidth={wp(210)}
        closeOnOverlayClick={() => {}}
        showButtons
        showCloseIcon={false}
      />
    </HomeScreenWrapper>
  );
};

export default WalletsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F2EC',
    paddingVertical: 15,
    paddingHorizontal: 20,
    position: 'relative',
  },
  titleWrapper: {
    marginVertical: windowHeight > 680 ? hp(5) : 0,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginTop: hp(20),
  },
  titleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  subTitleText: {
    fontSize: 12,
  },
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
    height: windowHeight > 680 ? hp(210) : hp(190),
    width: '100%',
  },
  walletContainer: {
    backgroundColor: '#2D6759',
    borderRadius: hp(10),
    width: wp(TILE_WIDTH),
    marginHorizontal: TILE_MARGIN / 2,
    height: windowHeight > 680 ? hp(210) : hp(190),
    padding: wp(15),
    alignContent: 'space-between',
  },
  addWalletText: {
    fontSize: 14,
    marginTop: hp(10),
  },
  walletCard: {
    paddingTop: windowHeight > 680 ? hp(20) : 0,
  },
  walletInnerView: {
    flexDirection: 'column',
    width: wp(170),
  },
  walletDescription: {
    letterSpacing: 0.2,
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
  walletDetailsWrapper: {
    marginTop: 5,
    width: '68%',
  },
  listViewWrapper: {
    flexDirection: 'row',
    width: '99%',
    justifyContent: 'space-around',
  },
  tranferPolicyWrapper: {
    width: '48%',
    marginRight: wp(10),
  },
  buyWrapper: {
    width: '51%',
  },
  listItemsWrapper: {
    marginTop: hp(20),
    width: '99%',
  },
  whirlpoolListItemWrapper: {
    width: '99%',
  },
  titleInfoView: {
    width: '60%',
  },
  netBalanceView: {
    width: '40%',
    alignItems: 'center',
  },
  addWalletContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  AddNewWalletIllustrationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: wp(30),
    marginTop: hp(20),
    width: '100%',
  },
  addNewWallIconWrapper: {
    marginRight: wp(10),
    alignItems: 'flex-start',
  },
  addNewWallTextWrapper: {
    width: '30%',
    justifyContent: 'center',
  },
  addNewWallText: {
    fontSize: 14,
  },
  cancelBtn: {
    marginRight: wp(20),
    borderRadius: 10,
  },
  btnText: {
    fontSize: 12,
    letterSpacing: 0.84,
  },
  createBtn: {
    paddingVertical: hp(15),
    borderRadius: 10,
    paddingHorizontal: 20,
  },
});
