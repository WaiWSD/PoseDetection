import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import {
    View,
    StyleSheet,
    Platform,
    Dimensions,
    Text
} from 'react-native';

// TFCamera
import TFCamera from './TFCamera';

//SVG Animation
import { useSharedValue, useAnimatedStyle, SharedValue, AnimatedStyleProp } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import Svg, { Line, Path, SvgUri } from 'react-native-svg';

//SVG Frame
import AppleSvgFrame, { AppleCoor } from '../Svg/AppleSvgFrame';

// React useContext
import { ScoreContext } from '../../store/score-context';
import ScorePlate from '../Score/ScorePlate';

//SVG Global Variables
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export type Pose = {
    nose: { x: number, y: number },
    left_eye: { x: number, y: number },
    right_eye: { x: number, y: number },
    left_ear: { x: number, y: number },
    right_ear: { x: number, y: number },
    left_shoulder: { x: number, y: number },
    right_shoulder: { x: number, y: number },
    left_elbow: { x: number, y: number },
    right_elbow: { x: number, y: number },
    left_wrist: { x: number, y: number },
    right_wrist: { x: number, y: number },
    left_hip: { x: number, y: number },
    right_hip: { x: number, y: number },
    left_knee: { x: number, y: number },
    right_knee: { x: number, y: number },
    left_ankle: { x: number, y: number },
    right_ankle: { x: number, y: number },
}

const usePosition = (pose: SharedValue<Pose>, valueName1: string, valueName2: string) => {
    return useAnimatedStyle<any>(
        () => ({
            x1: pose.value[valueName1].x,
            y1: pose.value[valueName1].y,
            x2: pose.value[valueName2].x,
            y2: pose.value[valueName2].y,
        }),
        [pose],
    );
};

const defaultPose: Pose = {
    nose: { x: 0, y: 0 },
    left_eye: { x: 0, y: 0 },
    right_eye: { x: 0, y: 0 },
    left_ear: { x: 0, y: 0 },
    right_ear: { x: 0, y: 0 },
    left_shoulder: { x: 0, y: 0 },
    right_shoulder: { x: 0, y: 0 },
    left_elbow: { x: 0, y: 0 },
    right_elbow: { x: 0, y: 0 },
    left_wrist: { x: 0, y: 0 },
    right_wrist: { x: 0, y: 0 },
    left_hip: { x: 0, y: 0 },
    right_hip: { x: 0, y: 0 },
    left_knee: { x: 0, y: 0 },
    right_knee: { x: 0, y: 0 },
    left_ankle: { x: 0, y: 0 },
    right_ankle: { x: 0, y: 0 },
};

// camera size in imaginary pixel
const cameraWidth = Math.round(Dimensions.get('window').width * 0.9);
const cameraHeight = Math.round(Dimensions.get('window').height * 0.6);
// const cameraWidth = 350;
// const cameraHeight = 400;

const PoseDetect: React.FC<{
    onPoseDetected: (pose: Pose) => void,
    onScoreUpdate: (score: number) => void
}> = ({
    onPoseDetected,
    onScoreUpdate
}) => {

        //performance hacks (Platform dependent)
        const tensorDims = { width: 152, height: 200 };

        // Pose related variables initialising
        const pose = useSharedValue(defaultPose);

        // Coordination of the lines linking body points for SVG drawing 
        const leftWristToElbowPosition = usePosition(pose, 'left_wrist', 'left_elbow');
        const leftElbowToShoulderPosition = usePosition(pose, 'left_elbow', 'left_shoulder');
        const leftShoulderToHipPosition = usePosition(pose, 'left_shoulder', 'left_hip');
        const leftHipToKneePosition = usePosition(pose, 'left_hip', 'left_knee');
        const leftKneeToAnklePosition = usePosition(pose, 'left_knee', 'left_ankle');

        const rightWristToElbowPosition = usePosition(pose, 'right_wrist', 'right_elbow');
        const rightElbowToShoulderPosition = usePosition(pose, 'right_elbow', 'right_shoulder');
        const rightShoulderToHipPosition = usePosition(pose, 'right_shoulder', 'right_hip');
        const rightHipToKneePosition = usePosition(pose, 'right_hip', 'right_knee');
        const rightKneeToAnklePosition = usePosition(pose, 'right_knee', 'right_ankle');

        const shoulderToShoulderPosition = usePosition(pose, 'left_shoulder', 'right_shoulder');
        const hipToHipPosition = usePosition(pose, 'left_hip', 'right_hip');

        // Apple position
        // const [appleCoor, setAppleCoor] = useState<AppleCoor>({ x: 0, y: 0 });
        const appleCoor = useRef<AppleCoor>({ x: 0, y: 0 });

        // Score of game
        // const [score, setScore] = useState<number>(0);
        // const scoreCtx = useContext(ScoreContext);

        // updateApplePositionPrompt
        const [shouldUpdate, setShouldUpdate] = useState<number>(0);

        // Apple position listener
        const onAppleCoorUpdate = (tempAppleCoor: AppleCoor) => {
            // console.log("PoseDetect onAppleCoorUpdate appleCoor", tempAppleCoor);
            // setAppleCoor(tempAppleCoor);
            appleCoor.current = tempAppleCoor
        }

        //----------------------------------------------------------------------------------------
        // MobileNet tensorflow model classify operation returns an array of prediction objects 
        // with this structure: prediction = [ {"className": "object name", "probability": 0-1 } ]
        // where:
        // className = The class of the object being identified. Currently, this model identifies 1000 different classes.
        // probability = Number between 0 and 1 that represents the prediction's probability 
        // Example (with a topk parameter set to 3 => default):
        // [
        //   {"className":"joystick","probability":0.8070220947265625},
        //   {"className":"screen, CRT screen","probability":0.06108357384800911},
        //   {"className":"monitor","probability":0.04016926884651184}
        // ]
        // In this case, we use topk set to 1 as we are interested in the higest result for
        // both performance and simplicity. This means the array will return 1 prediction only!
        //----------------------------------------------------------------------------------------
        const getPrediction = async (tensor: any, mobilenetModel: any) => {
            if (!tensor) { return; }
            if (mobilenetModel.estimatePoses == null) {
                console.log("TFCamera getPrediction estimatePoses is null");
                return;
            }
            // //topk set to 1, if use mobilenet
            // const prediction = await mobilenetModel.classify(tensor, 1);
            try {

                // if use poseDetection
                const poses = await mobilenetModel.estimatePoses(tensor);
                if (poses.length > 0) {

                    const poseOne = poses[0]
                    // console.log(`poses prediction: ${JSON.stringify(poseOne)}`);

                    const poseCopy: Pose = {
                        nose: { x: 0, y: 0 },
                        left_eye: { x: 0, y: 0 },
                        right_eye: { x: 0, y: 0 },
                        left_ear: { x: 0, y: 0 },
                        right_ear: { x: 0, y: 0 },
                        left_shoulder: { x: 0, y: 0 },
                        right_shoulder: { x: 0, y: 0 },
                        left_elbow: { x: 0, y: 0 },
                        right_elbow: { x: 0, y: 0 },
                        left_wrist: { x: 0, y: 0 },
                        right_wrist: { x: 0, y: 0 },
                        left_hip: { x: 0, y: 0 },
                        right_hip: { x: 0, y: 0 },
                        left_knee: { x: 0, y: 0 },
                        right_knee: { x: 0, y: 0 },
                        left_ankle: { x: 0, y: 0 },
                        right_ankle: { x: 0, y: 0 },
                    };

                    if (poseOne.score > 0.2) {

                        for (let i = 0; i < poseOne.keypoints.length; i++) {
                            poseCopy[poseOne.keypoints[i].name].x = cameraWidth - poseOne.keypoints[i].x * (cameraWidth / tensorDims.width);
                            poseCopy[poseOne.keypoints[i].name].y = poseOne.keypoints[i].y * (cameraHeight / tensorDims.height);
                        }

                        // console.log(`poseCopy: ${JSON.stringify(poseCopy)}`);
                        onPoseDetected(poseCopy);

                        // setPostData(JSON.stringify(poseCopy));

                        if (appleCoor.current.x !== 0 && appleCoor.current.y !== 0) {
                            if (poseCopy.left_wrist.x - 20 <= appleCoor.current.x && poseCopy.left_wrist.x + 20 >= appleCoor.current.x) {
                                console.log("PoseDetect score!!");
                                // setScore(prevValue => ++prevValue);
                                onScoreUpdate(100);
                                // scoreCtx.addScore(1);
                                // score.current = score.current + 1;
                                setShouldUpdate(prevValue=>++prevValue);
                            }
                            if (poseCopy.right_wrist.x - 20 <= appleCoor.current.x && poseCopy.right_wrist.x + 20 >= appleCoor.current.x) {
                                console.log("PoseDetect score!!");
                                // setScore(prevValue => ++prevValue);
                                onScoreUpdate(100);
                                // scoreCtx.addScore(1);
                                // score.current = score.current + 1;
                                setShouldUpdate(prevValue=>++prevValue);
                            }
                        }

                        pose.value = poseCopy;

                    } else {
                        pose.value = poseCopy;
                    }

                }

            } catch (err) {
                console.log("PoseDetectScreen getPrediction Error", err);
            }

            // Run inference and get output tensors.
            // let prediction = tfliteModel.predict(tensor);

            // console.log(`prediction: ${JSON.stringify(prediction)}`);

            // if (!prediction || prediction.length === 0) { return; }

            // //only attempt translation when confidence is higher than 20%
            // if (prediction[0].probability > 0.3) {

            //   //stop looping!
            //   cancelAnimationFrame(requestAnimationFrameId);
            //   setPredictionFound(true);

            //   //get translation!
            //   // await getTranslation(prediction[0].className);
            //   console.log("prediction no.1 ", prediction[0].className);
            // }
        }


        return (
            <View style={styles.body}>
                {useMemo(() => <TFCamera
                    getPrediction={getPrediction}
                />, [])}
                <View style={styles.svgView}>
                    <Svg
                        height={cameraHeight}
                        width={cameraWidth}
                        style={styles.linesContainer}>
                        <AnimatedLine animatedProps={leftWristToElbowPosition} stroke="red" strokeWidth="2" />
                        <AnimatedLine animatedProps={leftElbowToShoulderPosition} stroke="red" strokeWidth="2" />
                        <AnimatedLine animatedProps={leftShoulderToHipPosition} stroke="red" strokeWidth="2" />
                        <AnimatedLine animatedProps={leftHipToKneePosition} stroke="red" strokeWidth="2" />
                        <AnimatedLine animatedProps={leftKneeToAnklePosition} stroke="red" strokeWidth="2" />
                        <AnimatedLine animatedProps={rightWristToElbowPosition} stroke="red" strokeWidth="2" />
                        <AnimatedLine animatedProps={rightElbowToShoulderPosition} stroke="red" strokeWidth="2" />
                        <AnimatedLine animatedProps={rightShoulderToHipPosition} stroke="red" strokeWidth="2" />
                        <AnimatedLine animatedProps={rightHipToKneePosition} stroke="red" strokeWidth="2" />
                        <AnimatedLine animatedProps={rightKneeToAnklePosition} stroke="red" strokeWidth="2" />
                        <AnimatedLine animatedProps={shoulderToShoulderPosition} stroke="red" strokeWidth="2" />
                        <AnimatedLine animatedProps={hipToHipPosition} stroke="red" strokeWidth="2" />
                    </Svg>
                </View>
                <AppleSvgFrame
                    updateNumber={shouldUpdate}
                    onAppleCoorUpdate={onAppleCoorUpdate}
                />
            </View>
        );
    }


const styles = StyleSheet.create({
    body: {
        // padding: 5,
        // paddingTop: 25,
        backgroundColor: 'green',
        // flex: 1,
        width: cameraWidth,
        height: cameraHeight,
    },
    cameraView: {
        // display: 'flex',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: cameraWidth,
        height: cameraHeight,
        // paddingTop: 10,
        zIndex: -0.1,
        // backgroundColor: 'yellow',
    },
    svgView: {
        position: 'absolute',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: cameraWidth,
        height: cameraHeight,
        zIndex: 0.1,
        // backgroundColor: 'green',
    },
    camera: {
        width: cameraWidth,
        height: cameraHeight,
        zIndex: -0.1,
        borderWidth: 0,
        borderRadius: 0,
        // backgroundColor: 'green',
    },
    linesContainer: {
        // position: 'absolute',
        top: 0,
        left: 0,
        height: cameraHeight,
        width: cameraWidth,
        zIndex: 0.1,
        // backgroundColor: 'green',
    },
    appleSvgView: {
        position: 'absolute',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        width: cameraWidth,
        height: cameraHeight,
        zIndex: 0.1,
        // backgroundColor: 'transparent',
    },
    appleContainerView: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        width: 30,
        height: 31,
        top: 0,
        left: 0,
        zIndex: 0.1,
        // backgroundColor: 'transparent',
    },
    appleContainer: {
        // position: 'absolute',
        top: 0,
        left: 0,
        height: 31,
        width: 30,
        zIndex: 0.2,
        // backgroundColor: 'green',
    },
});

export default PoseDetect;