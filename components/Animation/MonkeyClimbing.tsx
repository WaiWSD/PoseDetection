import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from 'react';
import {
    View,
    Image,
    Animated
} from 'react-native';


const MonkeyClimbing: React.FC<{ score: number }> = ({
    score
}) => {

    // For the movement of monkey
    const monkeyBottomAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const distanceFromBottom = Math.min(score / 1000 * 240, 240);

        Animated.timing(monkeyBottomAnim, {
            toValue: distanceFromBottom,
            duration: 1000,
            useNativeDriver: false
        }).start();

    }, [score]);

    return <View style={{
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
    </View>;
}

export default MonkeyClimbing;