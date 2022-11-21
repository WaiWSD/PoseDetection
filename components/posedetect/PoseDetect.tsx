import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Platform,
} from 'react-native';

//Expo
import { Camera, CameraType } from 'expo-camera';

//Tensorflow
import * as tf from '@tensorflow/tfjs';
// import * as mobilenet from '@tensorflow-models/mobilenet';
import * as poseDetection from '@tensorflow-models/pose-detection';
// import * as mpPose from '@mediapipe/pose';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';

//SVG Animation
import { useSharedValue, useAnimatedStyle, SharedValue, AnimatedStyleProp } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import Svg, { Line, Path, SvgUri } from 'react-native-svg';

//SVG Graph
// import AppleSVG from '../../assets/Apple.svg';

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
const cameraWidth = 350;
const cameraHeight = 400;

const PoseDetect: React.FC<{ onPoseDetected: (pose: Pose) => void }> = ({
    onPoseDetected
}) => {
    //------------------------------------------------
    //state variables for image/translation processing
    //------------------------------------------------
    const [hasPermission, setHasPermission] = useState(null);
    const [poseData, setPostData] = useState("");

    //Tensorflow and Permissions
    const [mobilenetModel, setMobilenetModel] = useState(null);
    const [frameworkReady, setFrameworkReady] = useState(false);

    //TF Camera Decorator
    const TensorCamera = cameraWithTensors(Camera);

    //RAF ID
    let requestAnimationFrameId = 0;

    //performance hacks (Platform dependent)
    const textureDims = Platform.OS === "ios" ? { width: 1080, height: 1920 } : { width: 1600, height: 1200 };
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

    //-----------------------------
    // Run effect once
    // 1. Check camera permissions
    // 2. Initialize TensorFlow
    // 3. Load Mobilenet Model
    //-----------------------------
    useEffect(() => {
        try {
            if (!frameworkReady) {
                (async () => {

                    //check permissions
                    const { status } = await Camera.requestCameraPermissionsAsync();
                    console.log(`permissions status: ${status}`);
                    setHasPermission(status === 'granted');

                    //we must always wait for the Tensorflow API to be ready before any TF operation...
                    await tf.ready();

                    //load the mobilenet model and save it in state
                    setMobilenetModel(await loadMobileNetModel());

                    setFrameworkReady(true);
                })();
            }
        } catch (err) {
            console.log("PoseDetectScreen useEffect initialising error", err);
        }

    }, []);

    //--------------------------
    // Run onUnmount routine
    // for cancelling animation 
    // if running to avoid leaks
    //--------------------------
    useEffect(() => {
        return () => {
            if (frameworkReady) {
                cancelAnimationFrame(requestAnimationFrameId);
            }
        };
    }, [requestAnimationFrameId, frameworkReady]);

    //-----------------------------------------------------------------
    // Loads the mobilenet Tensorflow model: 
    // https://github.com/tensorflow/tfjs-models/tree/master/mobilenet
    // Parameters:
    // 
    // NOTE: Here, I suggest you play with the version and alpha params
    // as they control performance and accuracy for your app. For instance,
    // a lower alpha increases performance but decreases accuracy. More
    // information on this topic can be found in the link above.  In this
    // tutorial, I am going with the defaults: v1 and alpha 1.0
    //-----------------------------------------------------------------
    const loadMobileNetModel = async () => {
        // if you choose tflite over mobilenet uncomment this one
        // const model = await tflite.loadTFLiteModel('https://tfhub.dev/tensorflow/lite-model/mobilenet_v2_1.0_224/1/metadata/1');

        // or using poseDetection
        const model = poseDetection.SupportedModels.PoseNet;
        const detector = await poseDetection.createDetector(model,
            {
                quantBytes: 4,
                architecture: 'MobileNetV1',
                outputStride: 16,
                inputResolution: { width: tensorDims.width, height: tensorDims.height },
                multiplier: 0.75
            }
        );
        return detector
        //// otherwise, use mobilenet by uncomment this
        // const model = await mobilenet.load();
        // return model;
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
    const getPrediction = async (tensor: any) => {
        if (!tensor) { return; }
        if (mobilenetModel.estimatePoses == null) {
            console.log("PoseDetectScreen getPrediction estimatePoses is null");
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


    //------------------------------------------------------------------------------
    // Helper function to handle the camera tensor streams. Here, to keep up reading
    // input streams, we use requestAnimationFrame JS method to keep looping for 
    // getting better predictions (until we get one with enough confidence level).
    // More info on RAF:
    // https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
    //------------------------------------------------------------------------------
    const handleCameraStream = (imageAsTensors: IterableIterator<tf.Tensor3D>) => {
        const loop = async () => {
            const nextImageTensor = await imageAsTensors.next().value;
            await getPrediction(nextImageTensor);
            requestAnimationFrameId = requestAnimationFrame(loop);
        };
        try {
            if (frameworkReady) {
                loop();
            }
        } catch (err) {
            console.log("PoseDetectScreen handleCameraStream", err);
        }
    }

    //--------------------------------------------------------------------------------
    // Helper function to show the Camera View. 
    //
    // NOTE: Please note we are using TensorCamera component which is constructed 
    // on line: 37 of this function component. This is just a decorated expo.Camera 
    // component with extra functionality to stream Tensors, define texture dimensions
    // and other goods. For further research:
    // https://js.tensorflow.org/api_react_native/0.2.1/#cameraWithTensors
    //--------------------------------------------------------------------------------
    const renderCameraView = () => {
        return <View style={styles.cameraView}>
            <TensorCamera
                style={styles.camera}
                type={CameraType.back}
                zoom={0}
                cameraTextureHeight={textureDims.height}
                cameraTextureWidth={textureDims.width}
                resizeHeight={tensorDims.height}
                resizeWidth={tensorDims.width}
                resizeDepth={3}
                onReady={(imageAsTensors) => handleCameraStream(imageAsTensors)}
                autorender={true}
                useCustomShadersToResize={false}
            />
        </View>;
    }

    return (
        <View style={styles.body}>
            {renderCameraView()}
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

                    <AnimatedPath fillRule="evenodd" clipRule="evenodd" d="M9.49505 0.000695735C9.19706 0.0279738 8.92892 0.249639 8.85551 0.529057C8.22977 2.87059 8.47036 4.8125 9.54067 6.33127C9.7308 6.60111 9.9452 6.86063 10.1802 7.10193C9.66199 7.04346 9.16315 7.01421 8.68422 7.01397C6.25711 7.01223 4.33217 7.73523 2.92897 8.98462C0.434358 11.206 -0.324207 14.8655 0.119773 18.5083C0.5638 22.1508 2.21576 25.8482 4.83579 28.2955C7.39442 30.6859 10.9971 31.8085 14.9872 30.2994C18.9775 31.8085 22.58 30.686 25.1386 28.2955C27.7586 25.8479 29.4106 22.1503 29.8546 18.5083C30.2986 14.8658 29.54 11.2061 27.0454 8.98462C25.6422 7.735 23.7172 7.01199 21.2901 7.01397C19.6629 7.01496 17.8111 7.34474 15.7288 8.05986C15.7288 7.87457 15.7329 7.69074 15.7288 7.50941V7.49832C15.8769 5.78053 16.4506 4.88918 17.3961 4.18437C18.3566 3.46824 19.7924 2.98193 21.5642 2.40068C21.8909 2.30091 22.1155 1.9571 22.0665 1.63001C22.0176 1.30292 21.7013 1.03136 21.3587 1.02448C21.2692 1.0235 21.1797 1.03849 21.0961 1.06847C19.3269 1.64869 17.7428 2.14144 16.4943 3.07235C16.0174 3.42795 15.6124 3.85529 15.2723 4.36061C15.0893 3.78874 14.8375 3.26134 14.496 2.7642C13.5796 1.43053 12.024 0.476277 9.71132 0.0117958C9.66238 0.00319444 9.61246 -0.000491423 9.56298 0.000737253C9.54032 -0.000245751 9.51737 -0.000245751 9.49442 0.000737253L9.49505 0.000695735ZM10.1116 1.55312C11.7373 1.9849 12.6746 2.66144 13.2749 3.53485C13.9468 4.51295 14.2188 5.8373 14.2685 7.47619V7.61944C14.2721 7.75878 14.2685 7.89519 14.2685 8.03773C12.6091 7.32699 11.4356 6.50939 10.7515 5.53838C10.0307 4.51532 9.76912 3.27997 10.112 1.55278L10.1116 1.55312ZM6.00072 12.1884V12.1882C6.05014 12.1833 6.09987 12.1833 6.1493 12.1882C6.42204 12.1992 6.66546 12.356 6.78091 12.5946C6.89611 12.8331 6.86401 13.1137 6.69732 13.3223C5.22859 15.1763 5.35045 17.3207 6.18346 19.4105C7.01646 21.5003 8.59168 23.4413 9.81463 24.5189H9.81492C10.1124 24.7809 10.134 25.2252 9.86386 25.5132C9.59342 25.8012 9.13256 25.8244 8.8328 25.5649C7.43572 24.3339 5.75597 22.2821 4.81308 19.917C3.87018 17.5519 3.7015 14.786 5.53236 12.4745H5.53261C5.6435 12.3234 5.81171 12.2207 6.00062 12.1882L6.00072 12.1884Z" fill="#D80000" />

                </Svg>
            </View>
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
});

export default PoseDetect;