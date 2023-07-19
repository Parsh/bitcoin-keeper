import React from 'react';
import { Box } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import ToastErrorIcon from 'src/assets/images/download.svg';
import { hp } from 'src/common/data/responsiveness/responsive';


function InheritanceDownloadView(props) {
    return (
        <Box style={styles.wrapper}>
            <Box style={styles.iconWrapper}>
                {props.icon}
            </Box>
            <Box style={styles.titleWrapper}>
                <Text color="light.textWallet" style={styles.titleText}>{props.title}</Text>
                <Text color="light.secondaryText" style={styles.subTitleText}>{props.subTitle}</Text>
            </Box>
            <Box style={styles.btnWrapper}>
                {props.isDownload ?
                    <TouchableOpacity style={styles.downloadBtn} onPress={props.onPress}>
                        <ToastErrorIcon />
                        <Text style={styles.downloadBtnText}>&nbsp;&nbsp;Download</Text>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity style={styles.downloadBtn} onPress={props.onPress}>
                        <Text style={styles.downloadBtnText}>&nbsp;&nbsp;Setup</Text>
                    </TouchableOpacity>
                }
            </Box>
        </Box>
    )
}
const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        flexDirection: 'row',
        backgroundColor: '#FDF7F0',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 20,
        alignItems: 'center',
        marginTop: hp(15)
    },
    downloadBtn: {
        flexDirection: 'row',
        backgroundColor: '#E3BE96',
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    downloadBtnText: {
        color: '#725436',
        fontSize: 12,
    },
    iconWrapper: {
        width: '13%'
    },
    titleWrapper: {
        width: '57%',
    },
    btnWrapper: {
        width: '30%'
    },
    titleText: {
        fontSize: 14,
        fontWeight: '400',
        letterSpacing: 0.80

    },
    subTitleText: {
        fontSize: 12,
        letterSpacing: 0.80,
        width: '96%'
    }
})
export default InheritanceDownloadView