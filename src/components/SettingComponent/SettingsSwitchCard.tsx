import Text from 'src/components/KeeperText';
import { Box, Pressable } from 'native-base';

import React from 'react';
import Switch from '../../components/Switch/Switch';

function SettingsSwitchCard(props) {
  return (
    <Pressable
      onPress={(value) => props.onSwitchToggle(value)}
      flexDirection="row"
      justifyContent="space-evenly"
      padding={3}
      borderRadius={10}
      {...props}
    >
      <Box flex={1}>
        <Text color="light.primaryText" fontSize={14} letterSpacing={1.04}>
          {props.title}
        </Text>
        <Text color="light.GreyText" letterSpacing={0.36} fontSize={12}>
          {props.description}
        </Text>
      </Box>
      <Box justifyContent="center" alignItems="flex-end">
        {props.renderStatus ? (
          props.renderStatus()
        ) : (
          <Switch onValueChange={(value) => props.onSwitchToggle(value)} value={props.value} />
        )}
      </Box>
    </Pressable>
  );
}

export default SettingsSwitchCard;
