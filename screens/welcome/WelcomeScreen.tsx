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

const WelcomeScreen: React.FC = () => {
    const scoreCtx = useContext(ScoreContext);

    const onStartButtonPressed = () => {
        scoreCtx.setScreen(1);
    };

    return (
        <View style={styles.container}>
            <View style={{
                   height: "80%",
            }}>
                <Image
                    source={require('../../assets/road.png')}
                    style={{
                        // width: "100%",
                        // width: 300,
                        flexShrink: 1,
                        resizeMode: 'contain',
                        // backgroundColor: 'green',
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
        // width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: Constants.statusBarHeight,
        // backgroundColor: 'yellow',
    },
});

export default WelcomeScreen;