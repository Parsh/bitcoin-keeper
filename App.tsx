import * as Sentry from '@sentry/react-native';

import { Platform, StatusBar, UIManager } from 'react-native';
import { persistor, store } from './src/store/store';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LocalizationProvider } from './src/common/content/LocContext';
import { LogBox } from 'react-native';
import { NativeBaseProvider } from 'native-base';
import Navigator from './src/navigation/Navigator';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import React from 'react';
import { customTheme } from './src/common/themes';
import { sentryConfig } from 'src/core/services/sentry';
import { withIAPContext } from 'react-native-iap';
import { AppContextProvider } from 'src/common/content/AppContext';

LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
  /[Require cycle]*/,
  'Warning: ...',
  /.+/s,
]);

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const App = () => {
  Sentry.init(sentryConfig);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <NativeBaseProvider theme={customTheme}>
          <StatusBar translucent backgroundColor="transparent" barStyle={'light-content'} />
          <LocalizationProvider>
            <AppContextProvider>
              <Navigator />
            </AppContextProvider>
          </LocalizationProvider>
        </NativeBaseProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

const AppWrapper = () => (
  <PersistGate persistor={persistor} loading={null}>
    <Provider store={store}>
      <App />
    </Provider>
  </PersistGate>
);

const SentryApp = Sentry.wrap(AppWrapper);

export default withIAPContext(SentryApp);
