import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Platform,
    Dimensions,
} from 'react-native';

//SVG Animation
import { useSharedValue, useAnimatedStyle, SharedValue, AnimatedStyleProp } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import Svg, { Line, Path, SvgUri, Circle } from 'react-native-svg';

//SVG Graph
// import AppleSVG from '../../assets/Apple.svg';

//SVG Global Variables
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// camera size in imaginary pixel
const cameraWidth = Platform.OS === "ios" ?
    Math.round(Dimensions.get('window').width * 0.3) :
    Math.round(Dimensions.get('window').height * 0.9);
const cameraHeight = Platform.OS === "ios" ?
    Math.round(Dimensions.get('window').height * 0.9) :
    Math.round(Dimensions.get('window').width * 0.4);
// const cameraWidth = 350;
// const cameraHeight = 400;

export type Coor = { x: number, y: number };

const StretchSvgFrame: React.FC<{ onHandsCoorUpdate: (coor: { left: Coor, right: Coor }) => void, stretchStage: number }> = ({
    onHandsCoorUpdate,
    stretchStage
}) => {

    // left and right hand positions
    const [leftCoor, setLeftCoor] = useState<Coor>({ x: 0, y: 0 });
    const [rightCoor, setRightCoor] = useState<Coor>({ x: 0, y: 0 });

    const animatedStyleForLeftHand = useAnimatedStyle(() => {
        return {
            left: leftCoor.x,
            top: leftCoor.y
        };
    });
    const animatedStyleForRightHand = useAnimatedStyle(() => {
        return {
            left: rightCoor.x,
            top: rightCoor.y
        };
    });

    // Set random coor for apple
    useEffect(() => {
        console.log("StretchSvgFrame useEffect stretchStage", stretchStage);
        if (stretchStage === 0) {
            setLeftCoor(
                { x: cameraWidth * 0.38, y: cameraHeight * 0.7 }
            )
            setRightCoor(
                { x: cameraWidth * 0.62, y: cameraHeight * 0.7 }
            )
        } else if (stretchStage === 1) {
            setLeftCoor(
                { x: cameraWidth * 0.38, y: cameraHeight * 0.7 }
            )
            setRightCoor(
                { x: cameraWidth * 0.62, y: cameraHeight * 0.7 }
            )
        } else if (stretchStage === 2) {
            setLeftCoor(
                { x: cameraWidth * 0.33, y: cameraHeight * 0.63 }
            )
            setRightCoor(
                { x: cameraWidth * 0.67, y: cameraHeight * 0.63 }
            )
        } else {
            setLeftCoor(
                { x: cameraWidth * 0.26, y: cameraHeight * 0.5 }
            )
            setRightCoor(
                { x: cameraWidth * 0.74, y: cameraHeight * 0.5 }
            )
        }

    }, [stretchStage]);

    useEffect(() => {
        onHandsCoorUpdate({ left: leftCoor, right: rightCoor });
    }, [leftCoor, rightCoor]);


    return (
        <View style={styles.appleSvgView}>
            {stretchStage === 0 && <Animated.View style={{ left: "32%", bottom: 0, position: 'absolute' }}>
                <Svg width="170" height="240" viewBox="0 0 615 896" fill="none">
                    <Circle cx="313.5" cy="106.5" r="91.5" stroke="black" strokeWidth="30" />
                    <Path d="M502 278.457C338.229 223.711 284.83 220.015 115.827 278.457M115.827 278.457C77.2327 447.973 17 712.53 17 712.53M115.827 278.457L17 712.53M17 712.53C17 712.53 43.9244 751.07 80.1164 740.003L17 712.53Z" stroke="black" strokeWidth="30" />
                    <Path d="M113 278.457C276.771 223.711 330.17 220.015 499.173 278.457M499.173 278.457C537.767 447.973 598 712.53 598 712.53M499.173 278.457L598 712.53M598 712.53C598 712.53 571.076 751.07 534.884 740.003L598 712.53Z" stroke="black" strokeWidth="30" />
                    <Line x1="157" y1="407" x2="157" y2="881" stroke="black" strokeWidth="30" strokeLinecap="round" />
                    <Line x1="305" y1="780" x2="305" y2="881" stroke="black" strokeWidth="30" strokeLinecap="round" />
                    <Line x1="455" y1="407" x2="455" y2="881" stroke="black" strokeWidth="30" strokeLinecap="round" />
                </Svg>
            </Animated.View>}
            <Animated.View style={[styles.appleContainerView, animatedStyleForLeftHand, { position: 'absolute' }]}>
                <Svg
                    height={31}
                    width={30}
                    viewBox="0 0 30 31"
                    // fill='green'
                    style={{
                        ...styles.appleContainer,
                    }}>
                    <AnimatedCircle cx="15" cy="15" r="15" fill="#FF0000"/>
                </Svg>
            </Animated.View>
            <Animated.View style={[styles.appleContainerView, animatedStyleForRightHand, { position: 'absolute', zIndex: -0.1 }]}>
                <Svg
                    height={31}
                    width={30}
                    viewBox="0 0 30 31"
                    // fill='green'
                    style={{
                        ...styles.appleContainer,
                    }}>
                    <AnimatedCircle cx="15" cy="15" r="15" fill="#00FF00"/>
                </Svg>
            </Animated.View>
        </View>
    );
}


const styles = StyleSheet.create({
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
        // position: 'absolute',
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

export default StretchSvgFrame;