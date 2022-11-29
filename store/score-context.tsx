import React, { useState } from 'react';

type ScoreContextObj = {
    Score: number;
    addScore: (newPoint: number) => void;
    removeScore: () => void;
    whichScreen: number;
    setScreen: (whichScreen: number) => void;
}

export const ScoreContext = React.createContext<ScoreContextObj>({
    Score: 0,
    addScore: () => { },
    removeScore: () => { },
    whichScreen: 0,
    setScreen: () => {}
});

const ScoreContextProvider: React.FC<{children: any}> = (props) => {
    const [score, setScore] = useState<number>(0);
    const [whichScreen, setWhichScreen] = useState<number>(0);

    const addScoreHandler = (newPoint: number) => {
        setScore((prevScore) => prevScore + newPoint);
    }

    const removeScoreHandler = () => {
        setScore(0);
    }

    const setScreen = (_whichScreen: number) => {
        console.log("score-context setScreen _whichScreen", _whichScreen);
        console.log("score-context setScreen whichScreen", whichScreen);
        setWhichScreen(_whichScreen);
    }

    const contextValue: ScoreContextObj = {
        Score: score,
        addScore: addScoreHandler,
        removeScore: removeScoreHandler,
        whichScreen: whichScreen,
        setScreen: setScreen
    }

    return <ScoreContext.Provider value={contextValue}>{props.children}</ScoreContext.Provider>
}

export default ScoreContextProvider;