import React, { useContext, useState } from 'react';
import Text from 'src/components/KeeperText';
import { Box, Pressable, ScrollView, useToast } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { wp, hp } from 'src/common/data/responsiveness/responsive';
import Note from 'src/components/Note/Note';
import Arrow from 'src/assets/images/icon_arrow_Wallet.svg';
import KeeperModal from 'src/components/KeeperModal';
import ShowXPub from 'src/components/XPub/ShowXPub';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { SignerType } from 'src/core/wallets/enums';
import { signCosignerPSBT } from 'src/core/wallets/factories/WalletFactory';
import useWallets from 'src/hooks/useWallets';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { genrateOutputDescriptors } from 'src/core/utils';
import { DescritporsModalContent } from '../Vault/VaultSettings';

type Props = {
  title: string;
  subTitle: string;
  onPress: () => void;
};

function Option({ title, subTitle, onPress }: Props) {
  return (
    <Pressable
      style={styles.optionContainer}
      onPress={onPress}
      testID={`btn_${title.replace(/ /g, '_')}`}
    >
      <Box style={{ width: '96%' }}>
        <Text
          color="light.primaryText"
          style={styles.optionTitle}
          testID={`text_${title.replace(/ /g, '_')}`}
        >
          {title}
        </Text>
        <Text
          color="light.GreyText"
          style={styles.optionSubtitle}
          numberOfLines={2}
          testID={`text_${subTitle.replace(/ /g, '_')}`}
        >
          {subTitle}
        </Text>
      </Box>
      <Box style={{ width: '4%' }}>
        <Arrow />
      </Box>
    </Pressable>
  );
}

function CollabrativeWalletSettings() {
  const route = useRoute();
  const { wallet: collaborativeWallet } = route.params as { wallet: Vault };
  const navigation = useNavigation();
  const showToast = useToast();
  const [cosignerVisible, setCosignerVisible] = useState(false);
  const { useQuery } = useContext(RealmWrapperContext);
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const wallet = useWallets({ walletIds: [collaborativeWallet.collaborativeWalletId] }).wallets[0];
  const descriptorString = genrateOutputDescriptors(collaborativeWallet);
  const [genratorModalVisible, setGenratorModalVisible] = useState(false);

  const signPSBT = (serializedPSBT) => {
    const signedSerialisedPSBT = signCosignerPSBT(wallet, serializedPSBT);
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ShowQR',
        params: {
          data: signedSerialisedPSBT,
          encodeToBytes: false,
          title: 'Signed PSBT',
          subtitle: 'Please scan until all the QR data has been retrieved',
          type: SignerType.KEEPER,
        },
      })
    );
  };

  return (
    <Box style={styles.Container} background="light.secondaryBackground">
      <StatusBarComponent padding={50} />
      <Box>
        <HeaderTitle
          title="Collaborative Wallet Settings"
          subtitle={collaborativeWallet.presentationData.description}
          onPressHandler={() => navigation.goBack()}
          headerTitleColor="light.textBlack"
          titleFontSize={20}
          paddingTop={hp(5)}
          paddingLeft={20}
        />
      </Box>
      <Box
        style={{
          marginTop: hp(35),
          marginLeft: wp(25),
        }}
      />
      <Box style={styles.optionsListContainer}>
        <ScrollView
          style={{
            marginBottom: hp(40),
          }}
          showsVerticalScrollIndicator={false}
        >
          <Option
            title="View CoSigner Details"
            subTitle="View CoSigner Details"
            onPress={() => {
              setCosignerVisible(true);
            }}
          />
          <Option
            title="Sign a PSBT"
            subTitle="Sign a transaction"
            onPress={() => {
              navigation.dispatch(
                CommonActions.navigate({
                  name: 'ScanQR',
                  params: {
                    title: `Scan PSBT to Sign`,
                    subtitle: 'Please scan until all the QR data has been retrieved',
                    onQrScan: signPSBT,
                    type: SignerType.KEEPER,
                  },
                })
              );
            }}
          />
          <Option
            title="Exporting Output Descriptor/ BSMS"
            subTitle="To recreate collaborative wallet"
            onPress={() => {
              navigation.dispatch(
                CommonActions.navigate('GenerateVaultDescriptor', { descriptorString })
              );
            }}
          />
        </ScrollView>
      </Box>
      {/* {Bottom note} */}
      <Box style={styles.note} backgroundColor="light.secondaryBackground">
        <Note
          title="Note"
          subtitle="Keeper supports ONE collaborative wallet per hot wallet only. So if you import another Output Descriptor, you will see a new Collaborative Wallet"
          subtitleColor="GreyText"
        />
      </Box>
      <Box>
        <KeeperModal
          visible={cosignerVisible}
          close={() => setCosignerVisible(false)}
          title="Cosigner Details"
          subTitleWidth={wp(260)}
          subTitle="Scan the cosigner details from another app in order to add this as a signer"
          subTitleColor="light.secondaryText"
          textColor="light.primaryText"
          buttonText="Done"
          buttonCallback={() => {
            setCosignerVisible(false);
            // setAddWalletCosignerVisible(true)
          }}
          Content={() => (
            <ShowXPub
              data=""
              wallet={collaborativeWallet}
              cosignerDetails
              copy={() => showToast('Cosigner Details Copied Successfully')}
              subText="Cosigner Details"
              noteSubText="The cosigner details are for the selected wallet only"
              copyable={false}
              keeper={keeper}
            />
          )}
        />
      </Box>
      {/* end */}
    </Box>
  );
}

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: 20,
    position: 'relative',
  },
  note: {
    position: 'absolute',
    bottom: hp(35),
    marginLeft: 26,
    width: '90%',
    paddingTop: hp(10),
  },
  walletCardContainer: {
    borderRadius: hp(20),
    width: wp(320),
    paddingHorizontal: 5,
    paddingVertical: 20,
    position: 'relative',
    marginLeft: -wp(20),
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: wp(10),
  },
  walletDetailsWrapper: {
    width: wp(155),
  },
  walletName: {
    letterSpacing: 0.28,
    fontSize: 15,
  },
  walletDescription: {
    letterSpacing: 0.24,
    fontSize: 13,
    fontWeight: '300',
  },
  walletBalance: {
    letterSpacing: 1.2,
    fontSize: 23,
    padding: 5,
  },
  optionsListContainer: {
    alignItems: 'center',
    marginLeft: wp(25),
    marginTop: 10,
    height: hp(425),
  },
  optionContainer: {
    marginTop: hp(20),
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  optionTitle: {
    fontSize: 14,
    letterSpacing: 1.12,
  },
  optionSubtitle: {
    fontSize: 12,
    letterSpacing: 0.6,
    width: '90%',
  },
});
export default CollabrativeWalletSettings;
