import React, { useContext } from 'react';
import {
    View,
    StyleSheet,
    Text
} from 'react-native';

// React useContext
import { ScoreContext } from '../../store/score-context';

const ScorePlate: React.FC = () => {

    const scoreCtx = useContext(ScoreContext);

    return (
        <View style={styles.container}>
            <Text>{`${scoreCtx.Score}`}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        // height: '100%',
    }
});

export default ScorePlate;
