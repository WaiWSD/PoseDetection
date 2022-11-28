import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from 'react';
import {
    Text,
    View,
    StyleSheet,
    Platform,
    ViewStyle,
    TextStyle,
    ImageStyle,
    Alert,
} from 'react-native';

//Expo
import Constants from 'expo-constants';

//Components
// import PoseDetectManager, { Pose } from '../../components/posedetect/PoseDetectManager';
import PoseDetect, { Pose } from '../../components/Posedetect/PoseDetect';
import ScorePlate from '../../components/Score/ScorePlate';
import MainButton from '../../components/Buttons/MainButton';
import CountdownTimer from '../../components/Timer/CountdownTimer';

// React useContext
// import { ScoreContext } from '../../store/score-context';

const PoseDetectScreen: React.FC = () => {

    const [finishTime, setFinishTime] = useState(new Date(new Date().valueOf()));
    const [isTimerOn, setIsTimerOn] = useState<boolean>(false);

    const [score, setScore] = useState<number>(0);
    const [scoreReal, setScoreReal] = useState<number>(0);
    // const scoreCtx = useContext(ScoreContext);
    // const score = useRef<number>(0);

    const [notice, setNotice] = useState<string>("");
    const [isAppInit, setIsAppInit] = useState<boolean>(true);

    useEffect(() => {
        if (notice !== "") {
            console.log("Alert CameraScreen", notice);
            Alert.alert("Congratulations", notice, [{ text: "OK", onPress: () => {
                setIsAppInit(true);
                setNotice("");
            } }]);
        }
    }, [notice]);

    const onPoseDetected = (pose: Pose) => {
        // console.log(`pose: ${JSON.stringify(pose)}`);
    }

    const onScoreUpdate = (tempScore: number) => {
        console.log('PoseDetectScreen onScoreUpdate score', tempScore);

        setScore(prevValue => tempScore + prevValue);

        // const tempOriginalScore = score.current;
        // console.log('PoseDetectScreen onScoreUpdate tempOriginalScore', score);
        // score.current = score.current + tempScore;
    };

    const onStartButtonPressed = () => {
        setScore(0);
        setFinishTime(new Date(new Date().valueOf() + 60 * 1000));
        setIsAppInit(false);
    };

    const onTimerClicked = (_isTimerOn: boolean) => {
        console.log("PoseDetectScreen onTimerClicked _isTimerOn", _isTimerOn);
        // scoreCtx.setIsTimerCountingTrueFalse(true);
        setIsTimerOn(_isTimerOn);
        if (!_isTimerOn) {
            if (!isAppInit) {
                setNotice(`You have scored ${scoreReal}`);
            }
        }
    };

    useEffect(() => {
        if (score != 0) {
            if (isTimerOn) {
                setScoreReal(prevValue => prevValue + 100);
            }
        } else {
            setScoreReal(0);
        }
    }, [score]);

    return (
        <View style={styles.container}>
            <MainButton
                onPress={onStartButtonPressed}
            >
                Start
            </MainButton>
            {useMemo(() => <PoseDetect
                onPoseDetected={onPoseDetected}
                onScoreUpdate={onScoreUpdate}
            />, [])}
            {/* <PoseDetect
                onPoseDetected={onPoseDetected}
                onScoreUpdate={onScoreUpdate}
            /> */}
            <View
                style={{
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                }}
            >
                <CountdownTimer
                    finishTime={finishTime}
                    onTimerClicked={onTimerClicked}
                />
                <ScorePlate
                    score={scoreReal}
                />
            </View>
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