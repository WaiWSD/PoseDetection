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
    Dimensions,
    Animated
} from 'react-native';

//Expo
import Constants from 'expo-constants';
import { CameraType } from 'expo-camera';

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

    const [whichCamera, setWhichCamera] = useState<CameraType>(CameraType.front)

    // For the movement of monkey
    const monkeyBottomAnim = useRef(new Animated.Value(0)).current;

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
        const distanceFromBottom = Math.max(scoreReal / 1000 * 240, 240);

        Animated.timing(monkeyBottomAnim, {
            toValue: distanceFromBottom,
            duration: 1000,
            useNativeDriver: false
        }).start();

    }, [scoreReal]);

    useEffect(() => {
        if (gameCounter >= 100) {
            setGameCounter(0);
            scoreCtx.setScreen(0);
        }
    }, [gameCounter]);

    return (
        <View style={styles.container}>
            <View style={{
                width: "25%",
                height: "100%",
                justifyContent: 'center',
                alignItems: 'center',
            }}
            >
                <View style={{
                    height: 300,
                }}>

                    <View style={{
                        bottom: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        zIndex: -1,
                    }}>
                        <Image
                            source={require('../../assets/ladder.png')}
                            style={{
                                height: "100%",
                                resizeMode: 'contain',
                                backgroundColor: 'green',
                            }}
                        />
                    </View>
                    <Animated.View style={[
                        {
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            zIndex: 1,
                        },
                        {
                            bottom: monkeyBottomAnim
                        }
                    ]}>
                        <Image
                            source={require('../../assets/monkey.png')}
                            style={{
                                resizeMode: 'contain',
                                backgroundColor: 'green',
                            }}
                        />
                    </Animated.View>
                </View>
            </View>
            <View style={{
                width: "75%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
            }}>
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
                        onPress={() => {
                            setWhichCamera((prevValue) => {
                                if (prevValue === CameraType.front) {
                                    return CameraType.back
                                } else {
                                    return CameraType.front
                                }
                            })
                        }}
                    >
                        Switch
                    </MainButton>
                    <MainButton
                        onPress={onStartButtonPressed}
                    >
                        Start
                    </MainButton>
                </View>
                <PoseDetect
                    onPoseDetected={onPoseDetected}
                    onScoreUpdate={onScoreUpdate}
                    whichCamera={whichCamera}
                />
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
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: Constants.statusBarHeight,
        backgroundColor: 'yellow',
    },
});

export default PoseDetectScreen;