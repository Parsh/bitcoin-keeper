/* eslint-disable react/no-unstable-nested-components */
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActionCard from 'src/components/ActionCard';
import WalletInfoCard from 'src/components/WalletInfoCard';
import AddCard from 'src/components/AddCard';
import HomeScreenWrapper from './components/HomeScreenWrapper';
import BalanceComponent from './components/BalanceComponent';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import React, { useEffect, useState } from 'react';
import useWallets from 'src/hooks/useWallets';
import { useAppSelector } from 'src/store/hooks';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { EntityKind, VaultType, VisibilityType } from 'src/core/wallets/enums';
import TickIcon from 'src/assets/images/icon_tick.svg';
import useToastMessage from 'src/hooks/useToastMessage';
import { useDispatch } from 'react-redux';
import { resetElectrumNotConnectedErr } from 'src/store/reducers/login';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { Vault } from 'src/core/wallets/interfaces/vault';
import useCollaborativeWallet from 'src/hooks/useCollaborativeWallet';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import useVault from 'src/hooks/useVault';
import idx from 'idx';
import AddWalletModal from '../Home/components/AddWalletModal';
import { CommonActions } from '@react-navigation/native';
import BTC from 'src/assets/images/icon_bitcoin_white.svg';

const calculateBalancesForVaults = (vaults) => {
  let totalUnconfirmedBalance = 0;
  let totalConfirmedBalance = 0;

  vaults.forEach((vault) => {
    const unconfirmedBalance = idx(vault, (_) => _.specs.balances.unconfirmed) || 0;
    const confirmedBalance = idx(vault, (_) => _.specs.balances.confirmed) || 0;

    totalUnconfirmedBalance += unconfirmedBalance;
    totalConfirmedBalance += confirmedBalance;
  });
  return totalUnconfirmedBalance + totalConfirmedBalance;
};

const NewHomeScreen = ({ navigation }) => {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const { wallets } = useWallets({ getAll: true });
  const { collaborativeWallets } = useCollaborativeWallet();
  const { allVaults } = useVault({});
  const nonHiddenWallets = wallets.filter(
    (wallet) => wallet.presentationData.visibility !== VisibilityType.HIDDEN
  );
  const allWallets: (Wallet | Vault)[] = [...nonHiddenWallets, ...allVaults].filter(
    (item) => item !== null
  );

  const [addImportVisible, setAddImportVisible] = useState(false);
  const [electrumErrorVisible, setElectrumErrorVisible] = useState(false);
  const { relayWalletUpdate, relayWalletError, realyWalletErrorMessage } = useAppSelector(
    (state) => state.bhr
  );
  const netBalanceWallets = useAppSelector((state) => state.wallet.netBalance);
  const netBalanceAllVaults = calculateBalancesForVaults(allVaults);

  const [defaultWalletCreation, setDefaultWalletCreation] = useState(false);
  const { showToast } = useToastMessage();
  const electrumClientConnectionStatus = useAppSelector(
    (state) => state.login.electrumClientConnectionStatus
  );

  useEffect(() => {
    if (electrumClientConnectionStatus.success) {
      showToast(`Connected to: ${electrumClientConnectionStatus.connectedTo}`, <TickIcon />);
      if (electrumErrorVisible) setElectrumErrorVisible(false);
    } else if (electrumClientConnectionStatus.failed) {
      showToast(`${electrumClientConnectionStatus.error}`, <ToastErrorIcon />);
      setElectrumErrorVisible(true);
    }
  }, [electrumClientConnectionStatus.success, electrumClientConnectionStatus.error]);

  useEffect(() => {
    if (electrumClientConnectionStatus.setElectrumNotConnectedErr) {
      showToast(`${electrumClientConnectionStatus.setElectrumNotConnectedErr}`, <ToastErrorIcon />);
      dispatch(resetElectrumNotConnectedErr());
    }
  }, [electrumClientConnectionStatus.setElectrumNotConnectedErr]);

  useEffect(() => {
    if (relayWalletUpdate) {
      if (defaultWalletCreation && wallets[collaborativeWallets.length]) {
        navigation.navigate('SetupCollaborativeWallet', {
          coSigner: wallets[collaborativeWallets.length],
          walletId: wallets[collaborativeWallets.length].id,
          collaborativeWalletsCount: collaborativeWallets.length,
        });
        dispatch(resetRealyWalletState());
        setDefaultWalletCreation(false);
      }
    }
    if (relayWalletError) {
      showToast(
        realyWalletErrorMessage || 'Something went wrong - Wallet creation failed',
        <ToastErrorIcon />
      );
      setDefaultWalletCreation(false);
      dispatch(resetRealyWalletState());
    }
  }, [relayWalletUpdate, relayWalletError, wallets]);

  const { top } = useSafeAreaInsets();

  const dummyData = [
    {
      name: 'Setup Inheritance',
      icon: null,
      callback: () => navigation.dispatch(CommonActions.navigate({ name: 'SetupInheritance' })),
    },
    {
      name: 'Buy Bitcoin',
      icon: <BTC />,
      callback: () => {},
    },
    {
      name: 'Manage All Signers',
      icon: null,
      callback: () => navigation.dispatch(CommonActions.navigate({ name: 'ManageSigners' })),
    },
  ];

  const styles = getStyles(colorMode);
  return (
    <Box backgroundColor={`${colorMode}.Linen`} style={[styles.container]}>
      <Box
        backgroundColor={`${colorMode}.primaryGreenBackground`}
        style={[styles.wrapper, { paddingTop: top }]}
      >
        <HomeScreenWrapper>
          <Box style={styles.actionContainer}>
            {dummyData.map((data, index) => (
              <ActionCard
                key={`${index}_${data.name}`}
                cardName={data.name}
                callback={data.callback}
                icon={data.icon}
              />
            ))}
          </Box>
        </HomeScreenWrapper>
      </Box>
      <Box style={styles.valueWrapper}>
        <BalanceComponent
          count={allWallets.length}
          balance={netBalanceWallets + netBalanceAllVaults}
        />
        <FlatList
          style={styles.walletDetailWrapper}
          horizontal
          data={allWallets}
          keyExtractor={(item) => item.id}
          renderItem={({ item: wallet }) => {
            const { confirmed, unconfirmed } = wallet.specs.balances;
            const balance = confirmed + unconfirmed;
            const tags =
              wallet.entityKind === EntityKind.VAULT
                ? [
                    `${(wallet as Vault).scheme.m} of ${(wallet as Vault).scheme.n}`,
                    `${wallet.type === VaultType.COLLABORATIVE ? 'COLLABORATIVE' : 'VAULT'}`,
                  ]
                : [`SINGLE SIG`, wallet.type];
            return (
              <TouchableOpacity
                style={styles.wallerCardWrapper}
                onPress={() => {
                  if (wallet.entityKind === EntityKind.VAULT) {
                    switch (wallet.type) {
                      case VaultType.COLLABORATIVE:
                        navigation.navigate('VaultDetails', {
                          collaborativeWalletId: (wallet as Vault).collaborativeWalletId,
                        });
                        return;
                      case VaultType.DEFAULT:
                      default:
                        navigation.navigate('VaultDetails', { vaultId: wallet.id });
                        return;
                    }
                  } else {
                    navigation.navigate('WalletDetails', { walletId: wallet.id });
                  }
                }}
              >
                <WalletInfoCard
                  tags={tags}
                  walletName={wallet.presentationData.name}
                  walletDescription={wallet.presentationData.description}
                  icon={wallet.entityKind === EntityKind.VAULT ? <VaultIcon /> : <WalletIcon />}
                  amount={balance}
                />
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={() => (
            <AddCard
              name={'Add'}
              cardStyles={{ height: 260, width: 130 }}
              callback={() => setAddImportVisible(true)}
            />
          )}
        />
        <Box style={{ flexDirection: 'row', gap: 20, marginVertical: 20 }}></Box>
      </Box>
      <AddWalletModal
        navigation={navigation}
        visible={addImportVisible}
        setAddImportVisible={setAddImportVisible}
        wallets={wallets}
        collaborativeWallets={collaborativeWallets}
        setDefaultWalletCreation={setDefaultWalletCreation}
      />
    </Box>
  );
};
export default NewHomeScreen;

const getStyles = (colorMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    valueWrapper: {
      flex: 0.65,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 100,
    },
    wrapper: {
      flex: 0.35,
      paddingHorizontal: 15,
      paddingVertical: 8,
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
    actionContainer: {
      flexDirection: 'row',
      gap: 10,
      marginTop: -100,
    },
    walletDetailWrapper: { marginTop: 27.25, paddingHorizontal: 10 },
    wallerCardWrapper: { marginRight: 10 },
  });
