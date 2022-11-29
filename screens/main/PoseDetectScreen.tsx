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
    Image,
    Dimensions
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
import { ScoreContext } from '../../store/score-context';

// camera size in imaginary pixel
const cameraWidth = Math.round(Dimensions.get('window').width * 0.9);
const cameraHeight = Math.round(Dimensions.get('window').height * 0.6);

const PoseDetectScreen: React.FC = () => {

    const [finishTime, setFinishTime] = useState(new Date(new Date().valueOf()));
    const [isTimerOn, setIsTimerOn] = useState<boolean>(false);

    const [score, setScore] = useState<number>(0);
    const [scoreReal, setScoreReal] = useState<number>(0);
    const scoreCtx = useContext(ScoreContext);
    // const score = useRef<number>(0);

    const [notice, setNotice] = useState<string>("");
    const [isAppInit, setIsAppInit] = useState<boolean>(true);
    const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
    const [gameCounter, setGameCounter] = useState<number>(0);

    useEffect(() => {
        if (notice !== "") {
            console.log("Alert CameraScreen", notice);
            Alert.alert("Congratulations", notice, [{
                text: "OK", onPress: () => {
                    setNotice("");
                    setGameCounter(prevValue => ++prevValue);
                }
            }]);
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
        setIsCameraOpen(true);
        // const timerId = setTimeout(() => {
        setFinishTime(new Date(new Date().valueOf() + 60 * 1000));
        setIsAppInit(false);
        // }, 2* 1000);
    };

    const onTimerClicked = (_isTimerOn: boolean) => {
        console.log("PoseDetectScreen onTimerClicked _isTimerOn", _isTimerOn);
        // scoreCtx.setIsTimerCountingTrueFalse(true);
        setIsTimerOn(_isTimerOn);
        if (!_isTimerOn) {
            if (!isAppInit) {
                setNotice(`You have scored ${scoreReal}`);
                setIsAppInit(true);
                setIsCameraOpen(false);
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

    useEffect(() => {
        if (gameCounter >= 2) {
            setGameCounter(0);
            scoreCtx.setScreen(0);
        }
    }, [gameCounter]);

    return (
        <View style={styles.container}>
            <View
                style={{
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                }}
            >
                <MainButton
                    onPress={() => {
                        scoreCtx.setScreen(0);
                    }}
                >
                    Back
                </MainButton>
                <MainButton
                    onPress={onStartButtonPressed}
                >
                    Start
                </MainButton>
            </View>
            {/* {useMemo(() => <PoseDetect
                onPoseDetected={onPoseDetected}
                onScoreUpdate={onScoreUpdate}
            />, [])} */}
            <PoseDetect
                onPoseDetected={onPoseDetected}
                onScoreUpdate={onScoreUpdate}
            />
            {/* {isCameraOpen ? <PoseDetect
                onPoseDetected={onPoseDetected}
                onScoreUpdate={onScoreUpdate}
            /> :
                <View
                    style={{
                        height: cameraHeight,
                        width: cameraWidth,
                        backgroundColor: 'black'
                    }}
                ></View>
            } */}
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
            {/* <View>
                <Image
                    source={require('../../assets/road.png')}
                    style={{
                        // width: "100%",
                        height: 150,
                        resizeMode: 'stretch',
                        backgroundColor: 'green',
                    }}
                />
            </View> */}
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