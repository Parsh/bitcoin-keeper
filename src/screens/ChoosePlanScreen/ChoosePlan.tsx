import { ActivityIndicator, Platform, ScrollView } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box } from 'native-base';
import RNIap, {
  Subscription,
  getSubscriptions,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap';
import React, { useContext, useEffect, useState } from 'react';

import ChoosePlanCarousel from 'src/components/Carousel/ChoosePlanCarousel';
import DiamondHands from 'src/assets/images/ic_diamond_hands.svg';
import DiamondHandsFocused from 'src/assets/images/ic_diamond_hands_focused.svg';
import HeaderTitle from 'src/components/HeaderTitle';
import Hodler from 'src/assets/images/ic_hodler.svg';
import HodlerFocused from 'src/assets/images/ic_hodler_focused.svg';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { LocalizationContext } from 'src/common/content/LocContext';
import Note from 'src/components/Note/Note';
import Pleb from 'src/assets/images/ic_pleb.svg';
import PlebFocused from 'src/assets/images/ic_pleb_focused.svg';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SubScription from 'src/common/data/models/interfaces/Subscription';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import dbManager from 'src/storage/realm/dbManager';
import { useNavigation } from '@react-navigation/native';
import { wp } from 'src/common/data/responsiveness/responsive';
import { useDispatch } from 'react-redux';
import { uaiChecks } from 'src/store/sagaActions/uai';
import { uaiType } from 'src/common/data/models/interfaces/Uai';
import { resetVaultMigration } from 'src/store/reducers/vaults';
import TierUpgradeModal from './TierUpgradeModal';

const plans = [
  {
    description: 'A good place to start',
    benifits: [
      'Add multiple BIP-85 wallets',
      'Autotransfer to vault',
      'Add one air gapped signing device',
      'Get community support via Telegram',
    ],
    name: 'Pleb',
    productId: 'Pleb',
    productType: 'free',
    subTitle: 'Beginner',
    icon: <Pleb />,
    iconFocused: <PlebFocused />,
    price: '',
  },
  {
    benifits: [
      'All features of Pleb tier',
      'Import wallets',
      'Add three signing devices',
      '2 of 3 multisig vault',
      'Email support(Coming Soon)',
    ],
    subTitle: 'Intermediate',
    icon: <Hodler />,
    iconFocused: <HodlerFocused />,
    price: '',
    name: 'Hodler',
    productId: 'hodler',
  },
  {
    benifits: [
      'All features of the Hodler tier',
      'Add five signing devices',
      '3 of 5 multisig vault',
      'Inheritance tools',
      'Dedicated email support(Coming Soon)',
    ],
    subTitle: 'Advanced',
    icon: <DiamondHands />,
    iconFocused: <DiamondHandsFocused />,
    price: '',
    name: 'Diamond Hands',
    productId: 'diamondhands',
  },
];

function ChoosePlan(props) {
  const { translations } = useContext(LocalizationContext);
  const { choosePlan } = translations;
  const [currentPosition, setCurrentPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([plans[0]]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isUpgrade, setIsUpgrade] = useState(false);
  const { useQuery } = useContext(RealmWrapperContext);
  const { subscription }: KeeperApp = useQuery(RealmSchema.KeeperApp)[0];
  const navigation = useNavigation();
  const disptach = useDispatch();

  useEffect(() => {
    let purchaseUpdateSubscription;
    let purchaseErrorSubscription;
    RNIap.initConnection()
      .then((connected) => {
        purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
          const receipt = purchase.transactionReceipt;
          const { id }: KeeperApp = dbManager.getObjectByIndex(RealmSchema.KeeperApp);
          const sub = await getSubscriptions([purchase.productId]);
          const subscription: SubScription = {
            productId: purchase.productId,
            receipt,
            name: sub[0].title.split(' ')[0],
            level: 1, // todo get level
          };

          dbManager.updateObjectById(RealmSchema.KeeperApp, id, {
            subscription,
          });
        });
        purchaseErrorSubscription = purchaseErrorListener((error) => {
          console.log('purchaseErrorListener', error);
        });
      })
      .catch((e) => {
        console.log(e);
      });
    return () => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    init();
  }, []);

  function getAmt(subscription: Subscription) {
    try {
      if (Platform.OS === 'ios') {
        return subscription.localizedPrice;
      }
      return subscription.subscriptionOfferDetails[0].pricingPhases.pricingPhaseList[0]
        .formattedPrice;
    } catch (error) {
      console.log('error', error);
    }
  }

  async function init() {
    try {
      setItems(plans);
      setLoading(false);
    } catch (error) {
      console.log('error', error);
    }
  }

  async function processSubscription(item: Subscription, level: number) {
    try {
      const { id }: KeeperApp = dbManager.getObjectByIndex(RealmSchema.KeeperApp);
      const sub: SubScription = {
        productId: item.productId,
        receipt: 'mock-purchase',
        name: item.name.split(' (')[0],
        level,
      };
      dbManager.updateObjectById(RealmSchema.KeeperApp, id, {
        subscription: sub,
      });
      disptach(uaiChecks([uaiType.VAULT_MIGRATION]));
      disptach(resetVaultMigration());
      if (item.productId === SubscriptionTier.L1) {
        setIsUpgrade(false);
      } else if (
        item.name.split(' ')[0] === SubscriptionTier.L2 &&
        subscription.name === SubscriptionTier.L3
      ) {
        setIsUpgrade(false);
      } else {
        setIsUpgrade(true);
      }
      setShowUpgradeModal(true);
      return;
    } catch (err) {
      console.log(err.code, err.message);
    }
  }

  const onPressModalBtn = () => {
    setShowUpgradeModal(false);
    navigation.navigate('AddSigningDevice');
  };

  const getBenifitsTitle = (name) => {
    if (name === 'Diamond Hands') {
      return `${name} means`;
    }
    return `A ${name} can`;
  };

  return (
    <ScreenWrapper barStyle="dark-content">
      <Box position="relative" flex={1}>
        <HeaderTitle
          title={choosePlan.choosePlantitle}
          subtitle={
            subscription.name === 'Diamond Hands'
              ? `You are currently a ${subscription.name.slice(0, -1)}`
              : `You are currently a ${subscription.name}`
          }
          headerTitleColor="light.primaryText"
        />

        <TierUpgradeModal
          visible={showUpgradeModal}
          close={() => setShowUpgradeModal(false)}
          onPress={onPressModalBtn}
          isUpgrade={isUpgrade}
          plan={subscription.name}
        />
        {loading ? (
          <ActivityIndicator style={{ height: '70%' }} size="large" />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ height: '80%', marginVertical: 0 }}
          >
            <ChoosePlanCarousel
              data={items}
              onPress={(item, level) => processSubscription(item, level)}
              onChange={(item) => setCurrentPosition(item)}
            />

            <Box opacity={0.1} backgroundColor="light.Border" width="100%" height={0.5} my={5} />

            <Box ml={8}>
              <Box>
                <Text fontSize={14} color="light.primaryText" letterSpacing={1.12}>
                  {getBenifitsTitle(items[currentPosition].name)}:
                </Text>
                {/* <Text fontSize={(12)} color={'light.GreyText'} >
            {items[currentPosition].subTitle}
          </Text> */}
              </Box>
              <Box mt={3}>
                {items[currentPosition].benifits.map((i) => (
                  <Box flexDirection="row" alignItems="center" key={i}>
                    <Text fontSize={13} color="light.GreyText" mb={2} ml={3} letterSpacing={0.65}>
                      {`• ${i}`}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </ScrollView>
        )}

        <Box
          backgroundColor="light.secondaryBackground"
          position="absolute"
          bottom={Platform.OS === 'android' ? 3 : -10}
          justifyContent="flex-end"
          width={wp(340)}
        >
          <Note title="Note" subtitle={choosePlan.noteSubTitle} subtitleColor="GreyText" />
        </Box>
      </Box>
    </ScreenWrapper>
  );
}
export default ChoosePlan;
