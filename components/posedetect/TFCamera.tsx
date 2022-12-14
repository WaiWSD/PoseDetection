import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import {
    View,
    StyleSheet,
    Platform,
    Dimensions,
    Text
} from 'react-native';

//Expo
import { Camera, CameraType } from 'expo-camera';

//Tensorflow
import * as tf from '@tensorflow/tfjs';
// import * as mobilenet from '@tensorflow-models/mobilenet';
import * as poseDetection from '@tensorflow-models/pose-detection';
// import * as mpPose from '@mediapipe/pose';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';

// camera size in imaginary pixel
const cameraWidth = Math.round(Dimensions.get('window').width * 0.9);
const cameraHeight = Math.round(Dimensions.get('window').height * 0.6);
// const cameraWidth = 350;
// const cameraHeight = 400;

const TFCamera: React.FC<{
    getPrediction: (tensor: IterableIterator<tf.Tensor3D>, mobilenetModel: any) => Promise<boolean>,
    whichCamera: CameraType
}> = ({
    getPrediction,
    whichCamera
}) => {
        //------------------------------------------------
        //state variables for image/translation processing
        //------------------------------------------------
        const [hasPermission, setHasPermission] = useState(null);

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

                        console.log("tf.engine().memory()", tf.engine().memory());

                        tf.engine().startScope()

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
                    tf.engine().endScope();
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

        //------------------------------------------------------------------------------
        // Helper function to handle the camera tensor streams. Here, to keep up reading
        // input streams, we use requestAnimationFrame JS method to keep looping for 
        // getting better predictions (until we get one with enough confidence level).
        // More info on RAF:
        // https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
        //------------------------------------------------------------------------------
        const handleCameraStream = (imageAsTensors: IterableIterator<tf.Tensor3D>) => {
            const loop = async () => {
                tf.engine().startScope()
                const nextImageTensor = await imageAsTensors.next().value;
                const predictionSuccessful = await getPrediction(nextImageTensor, mobilenetModel);
                tf.engine().endScope()
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
        return <View style={styles.cameraView}>
            <TensorCamera
                style={styles.camera}
                type={whichCamera}
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
        </View>

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

export default TFCamera;