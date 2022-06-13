import axios, { AxiosResponse } from 'axios';
import config from '../config';
import idx from 'idx';
import crypto from 'crypto';
import TrustedContactsOperations from '../trusted_contacts/TrustedContactsOperations';
import { Gift, GiftMetaData } from '../wallets/interfaces/interface';
import { INotification } from './interfaces/interface';

const { AUTH_ID, RELAY_AXIOS } = config;
export default class Relay {
  public static checkCompatibility = async (
    method: string,
    version: string
  ): Promise<{
    compatible: boolean;
    alternatives: {
      update: boolean;
      message: string;
    };
  }> => {
    let res: AxiosResponse;
    try {
      res = await RELAY_AXIOS.post('checkCompatibility', {
        AUTH_ID,
        method,
        version,
      });
    } catch (err) {
      if (err.response) console.log(err.response.data.err);
      if (err.code) console.log(err.code);
    }
    const { compatible, alternatives } = res.data;
    return {
      compatible,
      alternatives,
    };
  };

  public static fetchReleases = async (
    build: string
  ): Promise<{
    releases: any[];
  }> => {
    let res: AxiosResponse;
    try {
      res = await RELAY_AXIOS.post('fetchReleases', {
        AUTH_ID,
        build,
      });
    } catch (err) {
      if (err.response) console.log(err.response.data.err);
      if (err.code) console.log(err.code);
    }
    const { releases = [] } = idx(res, (_) => _.data) || {};
    return {
      releases,
    };
  };

  public static updateFCMTokens = async (
    appId: string,
    FCMs: string[]
  ): Promise<{
    updated: boolean;
  }> => {
    try {
      let res: AxiosResponse;
      try {
        res = await RELAY_AXIOS.post('updateFCMTokens', {
          AUTH_ID,
          appId,
          FCMs,
        });
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      return res.data;
    } catch (err) {
      throw new Error('Failed to fetch GetBittr Details');
    }
  };

  public static fetchNotifications = async (
    appId: string
  ): Promise<{
    notifications: INotification[];
    DHInfos: [{ address: string; publicKey: string }];
  }> => {
    let res: AxiosResponse;
    try {
      res = await RELAY_AXIOS.post('fetchNotifications', {
        AUTH_ID,
        appId,
      });
    } catch (err) {
      console.log({
        err,
      });
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { notifications, DHInfos } = res.data;
    return {
      notifications,
      DHInfos,
    };
  };

  public static sendNotifications = async (
    receivers: { appId: string; FCMs?: string[] }[],
    notification: INotification
  ): Promise<{
    sent: boolean;
  }> => {
    try {
      let res: AxiosResponse;

      if (!receivers.length) throw new Error('Failed to deliver notification: receivers missing');

      try {
        res = await RELAY_AXIOS.post('sendNotifications', {
          AUTH_ID,
          receivers,
          notification,
        });
        console.log('sendNotifications', {
          res,
        });
      } catch (err) {
        // console.log({ err });
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      const { sent } = res.data;
      if (!sent) throw new Error();

      return {
        sent,
      };
    } catch (err) {
      throw new Error('Failed to deliver notification');
    }
  };

  public static sendDonationNote = async (
    donationId: string,
    txNote: { txId: string; note: string }
  ): Promise<{
    added: boolean;
  }> => {
    try {
      if (!txNote || !txNote.txId || !txNote.note)
        throw new Error('Failed to send donation note: txid|note missing');

      const res: AxiosResponse = await RELAY_AXIOS.post('addDonationTxNote', {
        AUTH_ID,
        donationId,
        txNote,
      });

      const { added } = res.data;
      if (!added) throw new Error();

      return {
        added,
      };
    } catch (err) {
      throw new Error('Failed to send donation note');
    }
  };

  public static fetchFeeAndExchangeRates = async (
    currencyCode
  ): Promise<{
    exchangeRates: any;
    averageTxFees: any;
  }> => {
    try {
      let res: AxiosResponse;
      try {
        res = await RELAY_AXIOS.post('fetchFeeAndExchangeRates', {
          AUTH_ID,
          currencyCode,
        });
      } catch (err) {
        // console.log({ err });
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      const { exchangeRates, averageTxFees } = res.data;

      return {
        exchangeRates,
        averageTxFees,
      };
    } catch (err) {
      throw new Error('Failed fetch fee and exchange rates');
    }
  };

  public static getCampaignGift = async (campaignId: string, appId: string) => {
    try {
      let res: AxiosResponse;
      try {
        res = await RELAY_AXIOS.post('claimCampaignGift', {
          AUTH_ID,
          campaignId: campaignId,
          appId,
        });
        return res.data;
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
    } catch (err) {
      throw new Error(err);
    }
  };

  public static sendKeeperNotifications = async (
    receivers: string[],
    notification: INotification
  ) => {
    try {
      let res: AxiosResponse;
      const obj = {
        AUTH_ID,
        receivers,
        notification,
      };
      try {
        res = await RELAY_AXIOS.post('sendKeeperNotifications', {
          AUTH_ID,
          receivers,
          notification,
        });
        const { sent } = res.data;
        if (!sent) throw new Error();
        return {
          sent,
        };
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
    } catch (err) {
      throw new Error('Failed to deliver notification');
    }
  };

  public static getMessages = async (
    appId: string,
    timeStamp: Date
  ): Promise<{
    messages: [];
  }> => {
    let res: AxiosResponse;
    try {
      res = await RELAY_AXIOS.post('getMessages', {
        AUTH_ID,
        appId,
        timeStamp,
      });
    } catch (err) {
      console.log({
        err,
      });
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { messages } = res.data;
    return {
      messages,
    };
  };

  public static updateMessageStatus = async (
    appId: string,
    data: []
  ): Promise<{
    updated: boolean;
  }> => {
    try {
      let res: AxiosResponse;
      try {
        res = await RELAY_AXIOS.post('updateMessages', {
          AUTH_ID,
          appId,
          data,
        });
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      const { updated } = res.data;
      return {
        updated,
      };
    } catch (err) {
      throw new Error('Failed to fetch GetBittr Details');
    }
  };

  public static appCheckIn = async (
    currencyCode?: any
  ): Promise<{
    exchangeRates: { [currency: string]: number };
    averageTxFees: any;
  }> => {
    const res = await RELAY_AXIOS.post('v2/appCheckIn', {
      AUTH_ID,
      ...(currencyCode && {
        currencyCode,
      }),
    });

    const { exchangeRates, averageTxFees } = res.data;

    return {
      exchangeRates,
      averageTxFees,
    };
  };

  public static updateAppImage = async (
    appImage: any
  ): Promise<{
    status: number;
    data: {
      updated: boolean;
    };
    err?: undefined;
    message?: undefined;
  }> => {
    try {
      const res: AxiosResponse = await RELAY_AXIOS.post('v2/updateAppImage', {
        AUTH_ID,
        appId: appImage.appId,
        appImage,
      });
      const { updated } = res.data;
      return {
        status: res.status,
        data: updated,
      };
    } catch (err) {
      throw new Error('Failed to update App Image');
    }
  };

  public static fetchAppImage = async (
    appId: string
  ): Promise<{
    appImage: any;
  }> => {
    try {
      let res: AxiosResponse;
      try {
        res = await RELAY_AXIOS.post('v2/fetchappImage', {
          AUTH_ID,
          appId: appId,
        });
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      const { appImage } = res.data;
      return {
        appImage,
      };
    } catch (err) {
      throw new Error('Failed to fetch App Image');
    }
  };

  public static updateGiftChannel = async (
    encryptionKey: string,
    gift: Gift,
    metaData: GiftMetaData,
    previousChannelAddress?: string
  ): Promise<{
    updated: boolean;
  }> => {
    try {
      if (!gift.channelAddress) throw new Error('channel address missing');
      const encryptedGift = TrustedContactsOperations.encryptViaPsuedoKey(
        JSON.stringify(gift),
        encryptionKey
      );
      let res: AxiosResponse;
      try {
        res = await RELAY_AXIOS.post('updateGiftChannel', {
          AUTH_ID,
          channelAddress: gift.channelAddress,
          encryptedGift,
          metaData,
          previousChannelAddress,
        });
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      const { updated } = res.data;
      return {
        updated,
      };
    } catch (err) {
      throw new Error('Failed to update gift channel');
    }
  };

  public static fetchGiftChannel = async (
    channelAddress: string,
    decryptionKey: string
  ): Promise<{
    gift: Gift;
    metaData: GiftMetaData;
  }> => {
    try {
      let res: AxiosResponse;
      try {
        res = await RELAY_AXIOS.post('fetchGiftChannel', {
          AUTH_ID,
          channelAddress,
        });
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      const { encryptedGift, metaData } = res.data;

      let gift: Gift;
      if (encryptedGift)
        gift = JSON.parse(
          TrustedContactsOperations.decryptViaPsuedoKey(encryptedGift, decryptionKey)
        );

      return {
        gift,
        metaData,
      };
    } catch (err) {
      throw new Error('Failed to fetch gift channel');
    }
  };

  public static loginWithHexa = async (
    authToken: string,
    xPub: string
  ): Promise<{
    data: object;
  }> => {
    let res: AxiosResponse;
    try {
      res = await RELAY_AXIOS.post('scanAuthToken', {
        AUTH_ID,
        authToken,
        xPub,
      });
      return res.data;
    } catch (err) {
      console.log(err);
      return undefined;
    }
  };

  public static syncGiftChannelsMetaData = async (giftChannelsToSync: {
    [channelAddress: string]: {
      creator?: boolean;
      metaDataUpdates?: GiftMetaData;
    };
  }): Promise<{
    synchedGiftChannels: {
      [channelAddress: string]: {
        metaData: GiftMetaData;
      };
    };
  }> => {
    try {
      let res: AxiosResponse;
      try {
        res = await RELAY_AXIOS.post('syncGiftChannelsMetaData', {
          AUTH_ID,
          giftChannelsToSync,
        });
      } catch (err) {
        if (err.response) throw new Error(err.response.data.err);
        if (err.code) throw new Error(err.code);
      }
      const {
        synchedGiftChannels,
      }: {
        synchedGiftChannels: {
          [channelAddress: string]: {
            metaData: GiftMetaData;
          };
        };
      } = res.data;

      return {
        synchedGiftChannels,
      };
    } catch (err) {
      throw new Error('Failed to sync gift channels meta-data');
    }
  };
}
