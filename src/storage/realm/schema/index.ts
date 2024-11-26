import {
  BIP85ConfigSchema,
  TransactionSchema,
  TransactionToAddressMappingSchema,
  UTXOSchema,
  WalletDerivationDetailsSchema,
  WalletPresentationDataSchema,
  WalletSchema,
  WalletSpecsSchema,
  TransferPolicySchema,
  WhirlpoolConfigSchema,
  WhirlpoolWalletDetailsSchema,
  LabelSchema,
  UTXOInfoSchema,
  Tags,
  AddressCacheSchema,
} from './wallet';
import {
  VaultPresentationDataSchema,
  VaultSchema,
  VaultSpecsSchema,
  VaultSignerSchema,
  SignerPolicy,
  SignerXpubsSchema,
  KeySpecsSchema,
  SignerSchema,
  RegistrationInfoSchema,
  InheritanceKeyInfoSchema,
  InheritanceConfigurationSchema,
  InheritancePolicySchema,
  InheritancePolicyNotificationSchema,
  InheritancePolicyAlertSchema,
  HealthCheckDetails,
  MiniscriptElementsSchema,
  MiniscriptSchemeSchema,
  VaultSchemeSchema,
  MiniscriptKeyInfoSchema,
  MiniscriptPathSchema,
  MiniscriptPhaseSchema,
} from './vault';
import { KeeperAppSchema } from './app';
import { UAIDetailsSchema, UAISchema } from './uai';
import { VersionHistorySchema } from './versionHistory';
import { CloudBackupHistorySchema } from './cloudBackupHistory';
import { BackupHistorySchema } from './backupHistory';
import { StoreSubscriptionSchema } from './subscription';
import { BackupSchema } from './backup';
import { DefualtNodeConnectSchema, NodeConnectSchema } from './nodeConnect';

export default [
  KeeperAppSchema,
  StoreSubscriptionSchema,
  WalletSchema,
  WalletDerivationDetailsSchema,
  WalletPresentationDataSchema,
  BIP85ConfigSchema,
  UTXOSchema,
  UTXOInfoSchema,
  Tags,
  AddressCacheSchema,
  LabelSchema,
  TransactionSchema,
  TransactionToAddressMappingSchema,
  WalletSpecsSchema,
  TransferPolicySchema,
  VaultSchema,
  SignerXpubsSchema,
  KeySpecsSchema,
  SignerSchema,
  RegistrationInfoSchema,
  VaultPresentationDataSchema,
  SignerPolicy,
  HealthCheckDetails,
  InheritanceConfigurationSchema,
  InheritancePolicyNotificationSchema,
  InheritancePolicyAlertSchema,
  InheritancePolicySchema,
  InheritanceKeyInfoSchema,
  MiniscriptKeyInfoSchema,
  MiniscriptPathSchema,
  MiniscriptPhaseSchema,
  MiniscriptElementsSchema,
  MiniscriptSchemeSchema,
  VaultSchemeSchema,
  VaultSpecsSchema,
  BackupSchema,
  UAISchema,
  UAIDetailsSchema,
  VaultSignerSchema,
  VersionHistorySchema,
  BackupHistorySchema,
  NodeConnectSchema,
  DefualtNodeConnectSchema,
  WhirlpoolConfigSchema,
  WhirlpoolWalletDetailsSchema,
  CloudBackupHistorySchema,
];
