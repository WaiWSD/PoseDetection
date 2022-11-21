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
// import PoseDetectManager, { Pose } from '../../components/posedetect/PoseDetectManager';
import PoseDetect, { Pose } from '../../components/posedetect/PoseDetect';

const PoseDetectScreen: React.FC = () => {

    const [score, setScore] = useState<Number>(0);

    const onPoseDetected = (pose: Pose) => {

        // console.log(`pose: ${JSON.stringify(pose)}`);
    }

    const onScoreUpdate = (tempScore: Number) => {
        console.log('PoseDetectScreen onScoreUpdate score', score);
        setScore(tempScore);
    }

    return (
        <View style={styles.container}>
            <PoseDetect
                onPoseDetected={onPoseDetected}
                onScoreUpdate={onScoreUpdate}
            />
            <Text>{score.toString()}</Text>
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