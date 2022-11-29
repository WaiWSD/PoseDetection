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

const WelcomeScreen: React.FC = () => {
    const scoreCtx = useContext(ScoreContext);

    const onStartButtonPressed = () => {
        scoreCtx.setScreen(1);
    };

    return (
        <View style={styles.container}>
            <View>
                <Image
                    source={require('../../assets/road.png')}
                    style={{
                        // width: "100%",
                        height: 150,
                        resizeMode: 'stretch',
                        backgroundColor: 'green',
                    }}
                />
            </View>
            <MainButton
                onPress={onStartButtonPressed}
            >
                Start
            </MainButton>
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

export default WelcomeScreen;