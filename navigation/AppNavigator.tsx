import React, { useContext, useEffect } from 'react';
import {
    View,
    StyleSheet,
} from 'react-native';

import PoseDetectScreen from '../screens/main/PoseDetectScreen';
import WelcomeScreen from '../screens/welcome/WelcomeScreen';

import { ScoreContext } from '../store/score-context';

const AppNavigator: React.FC = () => {
    const scoreCtx = useContext(ScoreContext);

    useEffect(() => {
        console.log("App.tsx useEffect scoreCtx.whichScreen", scoreCtx.whichScreen);
    }, [scoreCtx.whichScreen]);

    return (
        <View style={styles.container}>
            {scoreCtx.whichScreen === 1 ?
                <PoseDetectScreen />
                : <WelcomeScreen />
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default AppNavigator;