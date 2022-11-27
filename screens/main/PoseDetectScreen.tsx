import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from 'react';
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
import ScorePlate from '../../components/score/ScorePlate';

// React useContext
import { ScoreContext } from '../../store/score-context';

const PoseDetectScreen: React.FC = () => {

    const [score, setScore] = useState<number>(0);
    // const scoreCtx = useContext(ScoreContext);
    // const score = useRef<number>(0);

    const onPoseDetected = (pose: Pose) => {

        // console.log(`pose: ${JSON.stringify(pose)}`);
    }

    const onScoreUpdate = useCallback((tempScore: number) => {
        console.log('PoseDetectScreen onScoreUpdate score', tempScore);
        setScore(prevValue=>tempScore+prevValue);
        // const tempOriginalScore = score.current;
        console.log('PoseDetectScreen onScoreUpdate tempOriginalScore', score);
        // score.current = score.current + tempScore;
    }, []);

    return (
        <View style={styles.container}>
            {useMemo(() => <PoseDetect
                onPoseDetected={onPoseDetected}
                onScoreUpdate={onScoreUpdate}
            />, [])}
            {/* <PoseDetect
                onPoseDetected={onPoseDetected}
                onScoreUpdate={onScoreUpdate}
            /> */}
            <ScorePlate 
                score={score}
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