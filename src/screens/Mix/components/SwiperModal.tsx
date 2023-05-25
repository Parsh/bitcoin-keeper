import { Box, Pressable } from 'native-base';
import React, { MutableRefObject, useRef, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
// hooks, components, data
import KeeperModal from 'src/components/KeeperModal';
import Text from 'src/components/KeeperText';
import openLink from 'src/utils/OpenLink';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { hp, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import { setWhirlpoolSwiperModal } from 'src/store/reducers/settings';
// colors, aserts
import Colors from 'src/theme/Colors';
import SwiperModalIcon from 'src/assets/images/swiper_modal_icon.svg';
import CloseGreen from 'src/assets/images/modal_close_green.svg';
import { swiperData } from '../swiperModalData';

function SwiperModalContent({ contentTitle, contentSubTitle }) {
  return (
    <Box>
      <Box>
        <Text bold italic style={styles.modalTitle}>
          {contentTitle}
        </Text>
        <Text style={styles.modalSubTitle}>{contentSubTitle}</Text>
      </Box>
    </Box>
  );
}

const renderItem = ({ item }) => (
  <Box style={styles.contentContaner}>
    <SwiperModalContent
      contentTitle={item.firstContentHeading.contentTitle}
      contentSubTitle={item.firstContentHeading.contentSubTitle}
    />
    <SwiperModalContent
      contentTitle={item.secondContentHeading.contentTitle}
      contentSubTitle={item.secondContentHeading.contentSubTitle}
    />
    <Box style={styles.swiperModalIcon}>
      <SwiperModalIcon />
    </Box>
    <SwiperModalContent
      contentTitle={item.firstContentFooter.contentTitle}
      contentSubTitle={item.firstContentFooter.contentSubTitle}
    />
    <SwiperModalContent
      contentTitle={item.secondContentFooter.contentTitle}
      contentSubTitle={item.secondContentFooter.contentSubTitle}
    />
  </Box>
);
const linearGradientBtn = {
  colors: ['#FFFFFF', '#80A8A1'],
  start: [0, 0],
  end: [1, 1],
};
function List(props) {
  const listRef = useRef(null)
  const dispatch = useAppDispatch();
  const [currentPosition, setCurrentPosition] = useState(0);

  const onViewRef = React.useRef((viewableItems) => {
    setCurrentPosition(viewableItems.changed[0].index);
    // closeRef.current = viewableItems.changed[0].index !== 0
  });
  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 });

  const pressNext = () => {
    listRef.current.scrollToEnd({ animated: true });
  };

  return (
    <Box>
      {currentPosition !== 0 ?
        <TouchableOpacity style={styles.close} onPress={() => dispatch(setWhirlpoolSwiperModal(false))}>
          <CloseGreen />
        </TouchableOpacity> : null}
      <Box style={styles.headerContainer}>
        <Text style={styles.title} color='light.white'>
          Some Definitions:
        </Text>
      </Box>

      <FlatList
        ref={listRef}
        data={swiperData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        nestedScrollEnabled
        horizontal
        snapToInterval={windowWidth}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
      />
      <Box style={styles.ctaWrapper}>
        <Box borderColor="light.lightAccent" style={styles.learnMoreContainer}>
          <Pressable onPress={() => { openLink('https://www.bitcoinkeeper.app/') }}>
            <Text color="light.lightAccent" style={styles.seeFAQs} bold>
              See FAQs
            </Text>
          </Pressable>
        </Box>
        <Box>
          <TouchableOpacity onPress={() => currentPosition === 0 ? pressNext() : dispatch(setWhirlpoolSwiperModal(false))}>
            <Box backgroundColor={{ linearGradient: linearGradientBtn }} style={styles.cta}>
              <Text style={styles.ctaText} color='light.greenText02' bold>
                {currentPosition === 0 ? 'Next' : 'Proceed'}
              </Text>
            </Box>
          </TouchableOpacity>
        </Box>
      </Box>
    </Box>
  );
}

function SwiperModal() {
  const { whirlpoolSwiperModal } = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();
  return (
    <KeeperModal
      visible={whirlpoolSwiperModal}
      close={() => {
        dispatch(setWhirlpoolSwiperModal(false));
      }}
      title=""
      modalBackground={['light.gradientStart', 'light.gradientEnd']}
      textColor="light.white"
      Content={() => <List />}
      showCloseIcon={false}
    />
  );
}

const styles = StyleSheet.create({
  contentContaner: {
    width: wp(286),
  },
  swiperModalIcon: {
    alignSelf: 'center',
    marginTop: hp(-15),
    marginBottom: hp(8),
  },
  modalTitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'left',
    letterSpacing: 0.65,
    color: Colors.White,
  },
  modalSubTitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'left',
    letterSpacing: 0.65,
    color: Colors.White,
    marginBottom: hp(15),
    maxWidth: wp(270),
  },
  seeFAQs: {
    fontSize: 13,
  },
  learnMoreContainer: {
    borderRadius: hp(40),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00433A',
    height: hp(34),
    width: wp(110),
  },
  ctaWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cta: {
    borderRadius: 10,
    width: wp(110),
    height: hp(45),
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 13,
    letterSpacing: 1,
  },
  headerContainer: {
    alignSelf: 'flex-start',
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
    width: '90%',
  },
  title: {
    fontSize: 19,
    letterSpacing: 1,
    marginVertical: 20
  },
  close: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

export default SwiperModal;
