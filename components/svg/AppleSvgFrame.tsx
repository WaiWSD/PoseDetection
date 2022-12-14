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
import Svg, { Line, Path, SvgUri } from 'react-native-svg';

//SVG Graph
// import AppleSVG from '../../assets/Apple.svg';

//SVG Global Variables
const AnimatedPath = Animated.createAnimatedComponent(Path);

// camera size in imaginary pixel
const cameraWidth = Platform.OS === "ios" ?
    Math.round(Dimensions.get('window').width * 0.9) :
    Math.round(Dimensions.get('window').height * 0.9);
const cameraHeight = Platform.OS === "ios" ?
    Math.round(Dimensions.get('window').height * 0.3) :
    Math.round(Dimensions.get('window').width * 0.4);
// const cameraWidth = 350;
// const cameraHeight = 400;

export type AppleCoor = { x: number, y: number };

const AppleSvgFrame: React.FC<{ onAppleCoorUpdate: (appleCoor: AppleCoor) => void, updateNumber: number }> = ({
    onAppleCoorUpdate,
    updateNumber
}) => {

    // Apple position
    const [appleCoor, setAppleCoor] = useState<AppleCoor>({ x: 0, y: 0 });

    const animatedStyleForApple = useAnimatedStyle(() => {
        return {
            left: appleCoor.x,
            top: appleCoor.y
        };
    });

    // Set random coor for apple
    useEffect(() => {
        function getRandomInt(max: any) {
            return Math.floor(Math.random() * max);
        }
        setAppleCoor(
            { x: getRandomInt(cameraWidth - 30), y: getRandomInt(cameraHeight - 31) }
        )
        const timerId = setInterval(
            () => {
                // // console.log("PoseDetect useEffect tempCoor", tempCoor);
                // // console.log("PoseDetect useEffect cameraWidth", {x: cameraWidth, y: cameraHeight});
                setAppleCoor(
                    { x: getRandomInt(cameraWidth - 30), y: getRandomInt(cameraHeight - 31) }
                )
            }
            , 5000);
        return function cleanup() {
            clearInterval(timerId);
        };
    }, [updateNumber]);

    useEffect(() => {
        onAppleCoorUpdate(appleCoor);
    }, [appleCoor]);


    return (
        <View style={styles.appleSvgView}>
            <Animated.View style={[styles.appleContainerView, animatedStyleForApple]}>
                <Svg
                    height={31}
                    width={30}
                    viewBox="0 0 30 31"
                    // fill='green'
                    style={{
                        ...styles.appleContainer,
                        // top: appleCoor.y,
                        // left: appleCoor.x,
                    }}>

                    <AnimatedPath fillRule="evenodd" clipRule="evenodd" d="M9.49505 0.000695735C9.19706 0.0279738 8.92892 0.249639 8.85551 0.529057C8.22977 2.87059 8.47036 4.8125 9.54067 6.33127C9.7308 6.60111 9.9452 6.86063 10.1802 7.10193C9.66199 7.04346 9.16315 7.01421 8.68422 7.01397C6.25711 7.01223 4.33217 7.73523 2.92897 8.98462C0.434358 11.206 -0.324207 14.8655 0.119773 18.5083C0.5638 22.1508 2.21576 25.8482 4.83579 28.2955C7.39442 30.6859 10.9971 31.8085 14.9872 30.2994C18.9775 31.8085 22.58 30.686 25.1386 28.2955C27.7586 25.8479 29.4106 22.1503 29.8546 18.5083C30.2986 14.8658 29.54 11.2061 27.0454 8.98462C25.6422 7.735 23.7172 7.01199 21.2901 7.01397C19.6629 7.01496 17.8111 7.34474 15.7288 8.05986C15.7288 7.87457 15.7329 7.69074 15.7288 7.50941V7.49832C15.8769 5.78053 16.4506 4.88918 17.3961 4.18437C18.3566 3.46824 19.7924 2.98193 21.5642 2.40068C21.8909 2.30091 22.1155 1.9571 22.0665 1.63001C22.0176 1.30292 21.7013 1.03136 21.3587 1.02448C21.2692 1.0235 21.1797 1.03849 21.0961 1.06847C19.3269 1.64869 17.7428 2.14144 16.4943 3.07235C16.0174 3.42795 15.6124 3.85529 15.2723 4.36061C15.0893 3.78874 14.8375 3.26134 14.496 2.7642C13.5796 1.43053 12.024 0.476277 9.71132 0.0117958C9.66238 0.00319444 9.61246 -0.000491423 9.56298 0.000737253C9.54032 -0.000245751 9.51737 -0.000245751 9.49442 0.000737253L9.49505 0.000695735ZM10.1116 1.55312C11.7373 1.9849 12.6746 2.66144 13.2749 3.53485C13.9468 4.51295 14.2188 5.8373 14.2685 7.47619V7.61944C14.2721 7.75878 14.2685 7.89519 14.2685 8.03773C12.6091 7.32699 11.4356 6.50939 10.7515 5.53838C10.0307 4.51532 9.76912 3.27997 10.112 1.55278L10.1116 1.55312ZM6.00072 12.1884V12.1882C6.05014 12.1833 6.09987 12.1833 6.1493 12.1882C6.42204 12.1992 6.66546 12.356 6.78091 12.5946C6.89611 12.8331 6.86401 13.1137 6.69732 13.3223C5.22859 15.1763 5.35045 17.3207 6.18346 19.4105C7.01646 21.5003 8.59168 23.4413 9.81463 24.5189H9.81492C10.1124 24.7809 10.134 25.2252 9.86386 25.5132C9.59342 25.8012 9.13256 25.8244 8.8328 25.5649C7.43572 24.3339 5.75597 22.2821 4.81308 19.917C3.87018 17.5519 3.7015 14.786 5.53236 12.4745H5.53261C5.6435 12.3234 5.81171 12.2207 6.00062 12.1882L6.00072 12.1884Z" fill="#D80000" />

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

export default AppleSvgFrame;