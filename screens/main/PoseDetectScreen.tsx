import React, { useState, useEffect, useRef } from 'react';
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

    const [score, setScore] = useState<number>(0);
    // const score = useRef<number>(0);

    const onPoseDetected = (pose: Pose) => {

        // console.log(`pose: ${JSON.stringify(pose)}`);
    }

    const onScoreUpdate = (tempScore: number) => {
        console.log('PoseDetectScreen onScoreUpdate score', tempScore);
        setScore(prevValue=>tempScore+prevValue);
        // const tempOriginalScore = score.current;
        console.log('PoseDetectScreen onScoreUpdate tempOriginalScore', score);
        // score.current = score.current + tempScore;
    }

    return (
        <View style={styles.container}>
            <PoseDetect
                onPoseDetected={onPoseDetected}
                onScoreUpdate={onScoreUpdate}
            />
            <Text>{`${score}`}</Text>
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