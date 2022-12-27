import React, { useContext, useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ImageBackground,
} from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, StatusBar } from 'native-base';

import LinearGradient from 'src/components/KeeperGradient';

import openLink from 'src/utils/OpenLink';
import { LocalizationContext } from 'src/common/content/LocContext';
import Illustration_1 from 'src/assets/images/svgs/illustration_1.svg';
import Illustration_2 from 'src/assets/images/svgs/illustration_2.svg';
import Skip from 'src/assets/images/svgs/skip.svg';
import OnboardingBackImage from 'src/assets/images/onboardingBackImage.png';

import OnboardingSlideComponent from 'src/components/onBoarding/OnboardingSlideComponent';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

const { width } = Dimensions.get('window');

function OnBoardingSlides({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { onboarding } = translations;
  const { common } = translations;
  const [currentPosition, setCurrentPosition] = useState(0);
  const [items] = useState([
    {
      id: '1',
      title: (
        <>
          {`${onboarding.Comprehensive} `}
          <Text style={styles.info}>{onboarding.security}</Text>
          {` ${onboarding.slide01Title}`}
        </>
      ),
      paragraph: onboarding.slide01Paragraph,
      illustration: <Illustration_1 />,
    },
    {
      id: '2',
      title: (
        <>
          {`${onboarding.slide02Title} `}
          <Text style={styles.info}>{onboarding.privacy}</Text>
        </>
      ),
      paragraph: onboarding.slide02Paragraph,
      illustration: <Illustration_2 />,
    },
  ]);

  const onViewRef = React.useRef((viewableItems) => {
    setCurrentPosition(viewableItems.changed[0].index);
  });
  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <LinearGradient colors={['light.gradientStart', 'light.gradientEnd']} style={{ flex: 1 }}>
      <ImageBackground resizeMode="contain" style={{ flex: 1 }} source={OnboardingBackImage}>
        <SafeAreaView style={{ flex: 1, position: 'relative' }}>
          <Box justifyContent="center" mr={4} mt={10}>
            {currentPosition !== 1 && (
              <TouchableOpacity
                onPress={() => navigation.replace('NewKeeperApp')}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}
              >
                <Text fontSize={14} color="light.white" bold textAlign="right" opacity={0.7}>
                  Skip&nbsp;&nbsp;
                </Text>
                <Skip />
              </TouchableOpacity>
            )}
          </Box>
          <Box flex={0.9}>
            <FlatList
              data={items}
              horizontal
              snapToInterval={width}
              showsHorizontalScrollIndicator={false}
              decelerationRate={0}
              snapToAlignment="center"
              onViewableItemsChanged={onViewRef.current}
              viewabilityConfig={viewConfigRef.current}
              renderItem={({ item }) => (
                <OnboardingSlideComponent
                  title={item.title}
                  illustration={item.illustration}
                  paragraph={item.paragraph}
                  currentPosition={currentPosition}
                  navigation={navigation}
                />
              )}
            />
          </Box>
          <Box
            position="absolute"
            flex={0.2}
            flexDirection="row"
            margin={5}
            alignItems="center"
            style={{
              bottom: hp(20),
              justifyContent: 'space-between',
              width: wp(350),
              paddingHorizontal: wp(20),
            }}
          >
            <Box width="70%">
              <TouchableOpacity onPress={() => openLink('https://hexawallet.io/faq/')}>
                <Box
                  borderColor="light.lightAccent"
                  borderWidth={0.7}
                  borderRadius={30}
                  width={120}
                  alignItems="center"
                  justifyContent="center"
                  style={{
                    height: hp(40),
                  }}
                >
                  <Text color="light.lightAccent" fontSize={14} bold>
                    {common.seeFAQs}
                  </Text>
                </Box>
              </TouchableOpacity>
            </Box>
            <Box flexDirection="row">
              {currentPosition < items.length - 1 ? (
                items.map((item, index) => {
                  console.log(index);
                  return (
                    <Box
                      key={index}
                      style={currentPosition === index ? styles.selectedDot : styles.unSelectedDot}
                    />
                  );
                })
              ) : (
                <Box alignSelf="center" backgroundColor="transparent">
                  <TouchableOpacity onPress={() => navigation.replace('NewKeeperApp')}>
                    <LinearGradient
                      start={[0, 0]}
                      end={[1, 1]}
                      colors={['#FFFFFF', '#80A8A1']}
                      style={styles.cta}
                    >
                      <Text fontSize={13} bold letterSpacing={1} color="light.greenText">
                        Start App
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Box>
              )}
            </Box>
          </Box>
        </SafeAreaView>
      </ImageBackground>
    </LinearGradient>
  );
}

export default OnBoardingSlides;

const styles = StyleSheet.create({
  selectedDot: {
    width: 25,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#E3BE96',
    marginEnd: 5,
  },
  unSelectedDot: {
    width: 6,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#89AEA7',
    marginEnd: 5,
  },
  cta: {
    borderRadius: 10,
    width: wp(110),
    height: hp(45),
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    fontStyle: 'italic',
    fontWeight: '900',
  },
});
