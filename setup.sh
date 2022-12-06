# error resolvers @rn-nodeify
cp mods/source-map-support/source-map-support.js node_modules/source-map-support/source-map-support.js
cp mods/bunyan/bunyan.js node_modules/bunyan/lib/bunyan.js
# cp mods/react-native-mail/RNMailModule.java node_modules/react-native-mail/android/src/main/java/com/chirag/RNMail/RNMailModule.java
cp mods/react-native-safe-area-view/index.js node_modules/react-native-safe-area-view/index.js

# adding PSBT methods to support TapSigner in bitcoinjs-lib@5.1.6
cp mods/bitcoinjs-lib/psbt.js ./node_modules/bitcoinjs-lib/src/psbt.js
cp mods/bitcoinjs-lib/psbt.d.ts ./node_modules/bitcoinjs-lib/types/psbt.d.ts

# enabling node core modules
rn-nodeify --install buffer,events,process,stream,inherits,path,assert,crypto,constants --hack --yarn

# echo "patch cocoapods"

# ios dependency installation
cd ios && pod install

# android SDK location configuration
cd ../android && touch local.properties && echo "sdk.dir = /Users/$(whoami)/Library/Android/sdk" >local.properties

# Deleting UIWebView related files from node_modules. Which causes IPA rejection.
# echo "Deleting UIWebView related files from node_modules"
# cd ../
# test -f node_modules/react-native/React/Views/RCTWebView.h && rm -f node_modules/react-native/React/Views/RCTWebView.h
# test -f node_modules/react-native/React/Views/RCTWebView.m && rm -f node_modules/react-native/React/Views/RCTWebView.m
# test -f node_modules/react-native/React/Views/RCTWebViewManager.h && rm -f node_modules/react-native/React/Views/RCTWebViewManager.h
# test -f node_modules/react-native/React/Views/RCTWebViewManager.m && rm -f node_modules/react-native/React/Views/RCTWebViewManager.m
