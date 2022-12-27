import Text from 'src/components/KeeperText';
import { Box } from 'native-base';
import React, { useState } from 'react';

import DotView from 'src/components/DotView';
import { ScrollView } from 'react-native';
import moment from 'moment';

function SigningDeviceChecklist({ date }) {
  const [data, SetData] = useState([
    {
      id: '1',
      date: moment(date).calendar(),
      title: 'Health Check Successful',
      subTitle: 'Lorem ipsum dolor sit amet, cons ectetur adipiscing elit',
    },
  ]);

  return (
    <ScrollView style={{ overflow: 'visible' }}>
      {data.map((item) => (
        <Box padding={1}>
          <Box
            padding={1}
            borderLeftColor="light.lightAccent"
            borderLeftWidth={1}
            width="100%"
            position="relative"
          >
            <Box
              zIndex={99}
              position="absolute"
              left={-8}
              backgroundColor="light.secondaryBackground"
              padding={1}
              borderRadius={15}
            >
              <DotView height={2} width={2} color="light.lightAccent" />
            </Box>
            <Text color="light.GreyText" fontSize={10} bold ml={5} opacity={0.7}>
              {item.date}
            </Text>
            <Box
              backgroundColor="light.primaryBackground"
              padding={5}
              borderRadius={10}
              my={2}
              ml={5}
            >
              <Text letterSpacing={0.96}>{item.title}</Text>
            </Box>
          </Box>
        </Box>
      ))}
    </ScrollView>
  );
}
export default SigningDeviceChecklist;
