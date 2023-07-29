# Bitcoin Keeper - Your Private Bitcoin Vault

Affordable and easy-to-use, security for all your sats, BIP-85, Multisig, Own Node, Whirlpool, and Hardware Wallet support. Built with React Native

<img width="1728" alt="Screenshot 2023-05-26 at 6 41 23 PM" src="https://github.com/bithyve/bitcoin-keeper/assets/50690016/fe3a8cdb-260f-44a0-913a-8f94d5791b6b">


[![Playstore](https://bitcoinkeeper.app/wp-content/uploads/2023/05/gpbtn.png)](https://play.google.com/store/apps/details?id=io.hexawallet.bitcoinkeeper)
[![Appstore](https://bitcoinkeeper.app/wp-content/uploads/2023/05/applebtn.png)](https://apps.apple.com/us/app/bitcoin-keeper/id1545535925)


## Prerequisites

Before getting started, make sure you have proper [React Native development environment](https://reactnative.dev/docs/environment-setup) on your machine


## Getting Started

1. Clone this repository to your local machine:

   ```shell
   git clone https://github.com/bithyve/bitcoin-keeper.git
    ```

2. Navigate to the project directory:
    ```shell
   cd bitcoin-keeper
    ```
3. Install the project dependencies using Yarn:
    The prepare scripts will automaticall install pods and nodify crypto related packages for react-netive
     ```shell
   yarn install
    ```
   
## Build and Run

### Whirlpool prerequisites
To use the Whirlpool, you'll need to have the following platform-specific binaries and place them in the specified directories:

#### Android

* Extract [jniLibs](https://github.com/bithyve/bitcoin-keeper/releases/download/v1.0.8/jniLibs.zip) to the following directory if not present already:
```bash
android/app/src/main/
```

#### iOS

* Copy the [libwhirlpool.a](https://github.com/bithyve/bitcoin-keeper/releases/download/v1.0.8/libwhirlpool.a) to the following directory:
```bash
ios/libwhirlpool.a
```

### Varients
The project has testnet and mainnet varients. The development varient is configured to use testnet and production varient to use mainnet.

Start metro metro
```bash
yarn start
```

#### Development
To run the development app on a connected device or emulator:

**Android**
```bash
yarn androidDevelopmentDebug
```
    
**iOS**
```bash
yarn ios --scheme=hexa_keeper_dev
```

#### Production
To run the production app on a connected device or emulator:

**Android**
```bash
yarn androidProductionDebug
```
    
**iOS**
```bash
yarn ios --scheme=hexa_keeper
```
These commands will build and launch the app on the respective platforms.


## Testing
This project uses **Jest** as the testing framework. To run the tests, use the following command:
```bash
yarn test
```
## License
This project is licensed under the **MIT License.**

## Community
* Follow us on [Twitter](https://twitter.com/bitcoinKeeper_)
* Join our [Telegram](https://t.me/bitcoinkeeper) 
    

