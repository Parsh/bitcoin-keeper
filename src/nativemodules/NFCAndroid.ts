import { NativeModules } from 'react-native';

const { NFCHost } = NativeModules;

export default class NFCAndroid {
  public static startBroadCast = async (message: string): Promise<boolean> =>
    NFCHost.startBroadCast(message);

  static stopBroadCast = async (): Promise<boolean> => NFCHost.stopBroadCast();
}
