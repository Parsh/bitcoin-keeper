import { useMemo } from 'react';
import BitcoinUnit, { displayNameForBitcoinUnit } from 'src/models/enums/BitcoinUnit';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { useAppSelector } from 'src/store/hooks';

export type Props = {
  bitcoinUnit?: BitcoinUnit;
  currencyKind?: CurrencyKind;
};

export default function useFormattedUnitText({ bitcoinUnit = BitcoinUnit.SATS }: Props): string {
  const currencyKind = useAppSelector((state) => state.settings.currencyKind);
  const fiatCurrencyCode = useCurrencyCode();
  const prefersBitcoin: boolean = useMemo(
    () => currencyKind === CurrencyKind.BITCOIN,
    [currencyKind]
  );

  if (prefersBitcoin) {
    return displayNameForBitcoinUnit(bitcoinUnit);
  }
  return fiatCurrencyCode;
}
