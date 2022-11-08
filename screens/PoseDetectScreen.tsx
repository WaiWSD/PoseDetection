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
import Svg, { Line } from 'react-native-svg';

//SVG Global Variables
const AnimatedLine = Animated.createAnimatedComponent(Line);

type Pose = {
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

const PoseDetectScreen: React.FC = () => {
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
            cancelAnimationFrame(requestAnimationFrameId);
        };
    }, [requestAnimationFrameId]);

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

                if (poseOne.score > 0.2) {

                    const poseCopy = {
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

                    for (let i = 0; i < poseOne.keypoints.length; i++) {
                        poseCopy[poseOne.keypoints[i].name].x = cameraWidth - poseOne.keypoints[i].x * (cameraWidth / tensorDims.width);
                        poseCopy[poseOne.keypoints[i].name].y = poseOne.keypoints[i].y * (cameraHeight / tensorDims.height);
                    }

                    // console.log(`poseCopy: ${JSON.stringify(poseCopy)}`);

                    // setPostData(JSON.stringify(poseCopy));

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
            loop();
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
        <View style={styles.container}>
            {/* <View style={styles.header}>
        <Text style={styles.title}>
          Pose Detection
        </Text>
      </View> */}
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
                    </Svg>
                </View>
            </View>
            <Text>{poseData}</Text>

        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingTop: Constants.statusBarHeight,
        backgroundColor: '#E8E8E8',
    },
    header: {
        backgroundColor: '#41005d'
    },
    title: {
        margin: 10,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#ffffff'
    },
    body: {
        // padding: 5,
        // paddingTop: 25,
        backgroundColor: 'white',
        flex: 1,
        width: '100%',
        height: '100%',
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
    translationView: {
        marginTop: 30,
        padding: 20,
        borderColor: '#cccccc',
        borderWidth: 1,
        borderStyle: 'solid',
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
        height: 500
    },
    translationTextField: {
        fontSize: 60
    },
    wordTextField: {
        textAlign: 'right',
        fontSize: 20,
        marginBottom: 50
    },
    legendTextField: {
        fontStyle: 'italic',
        color: '#888888'
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: 'purple',
        borderStyle: 'solid',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30,
        backgroundColor: '#ffffff'
    },
});

export default PoseDetectScreen;