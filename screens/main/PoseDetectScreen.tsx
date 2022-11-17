import React, { useState, useEffect } from 'react';
import {
    Text,
    View,
    StyleSheet,
    Platform,
    ViewStyle,
    TextStyle,
    ImageStyle,
} from 'react-native';

//Expo
import Constants from 'expo-constants';

//Components
import PoseDetect, { Pose } from '../../components/posedetect/PoseDetect';

const PoseDetectScreen: React.FC = () => {

    const onPoseDetected = (pose: Pose) => {

        // console.log(`pose: ${JSON.stringify(pose)}`);
    }

    return (
        <View style={styles.container}>
            <PoseDetect 
                onPoseDetected={onPoseDetected}
            />
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: Constants.statusBarHeight,
        backgroundColor: 'yellow',
    },
});

export default PoseDetectScreen;