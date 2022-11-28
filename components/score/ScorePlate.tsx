import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    Text
} from 'react-native';

// React useContext
// import { ScoreContext } from '../../store/score-context';

const ScorePlate: React.FC<{ score: number }> = ({ score }) => {

    // const scoreCtx = useContext(ScoreContext);
    const [_score, set_score] = useState<number>(0);
    console.log("ScorePlate score", score);

    useEffect(() => {
        set_score(score);
    }, [score]);

    return (
        <View style={styles.container}>
            {/* <Text>{`${scoreCtx.Score}`}</Text> */}
            <Text
                style={{
                    fontSize: 30,
                }}
            >{`Marks: ${_score}`}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        // width: '100%',
        // height: '100%',
    }
});

export default ScorePlate;
