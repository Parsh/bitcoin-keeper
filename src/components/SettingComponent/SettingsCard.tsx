import Text from 'src/components/KeeperText';
import { Box, Pressable } from 'native-base';

import LinkIcon from 'src/assets/icons/link.svg';
import React from 'react';
import RightArrowIcon from 'src/assets/icons/Wallets/icon_arrow.svg';

function SettingsCard(props) {
  return (
    <Pressable onPress={() => props.onPress()}>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        padding={3}
        borderRadius={10}
        {...props}
      >
        <Box flex={0.7}>
          <Text color="#041513" fontSize={14} letterSpacing={1.04}>
            {props.title}
          </Text>
          <Text color="light.GreyText" letterSpacing={0.36} fontSize={12}>
            {props.description}
          </Text>
        </Box>
        <Box flex={0.3} justifyContent="center" alignItems="flex-end">
          {props.renderStatus ? (
            props.renderStatus()
          ) : props.icon ? (
            <LinkIcon />
          ) : (
            <RightArrowIcon />
          )}
        </Box>
      </Box>
    </Pressable>
  );
}

export default SettingsCard;
