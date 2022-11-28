import React, { useState } from 'react';

type ScoreContextObj = {
    Score: number;
    addScore: (newPoint: number) => void;
    removeScore: () => void;
    isTimerCounting: boolean;
    setIsTimerCountingTrueFalse: (isOn: boolean) => void;
}

export const ScoreContext = React.createContext<ScoreContextObj>({
    Score: 0,
    addScore: () => { },
    removeScore: () => { },
    isTimerCounting: false,
    setIsTimerCountingTrueFalse: () => {},
});

const ScoreContextProvider: React.FC<{children: any}> = (props) => {
    const [score, setScore] = useState<number>(0);
    const [isTimerCounting, setIsTimerCounting] = useState<boolean>(false);

    const addScoreHandler = (newPoint: number) => {
        setScore((prevScore) => prevScore + newPoint);
    }

    const removeScoreHandler = () => {
        setScore(0);
    }

    const setIsTimerCountingTrueFalse = (isOn: boolean) => {
        setIsTimerCounting(isOn);
    }

    const contextValue: ScoreContextObj = {
        Score: score,
        addScore: addScoreHandler,
        removeScore: removeScoreHandler,
        isTimerCounting: isTimerCounting,
        setIsTimerCountingTrueFalse: setIsTimerCountingTrueFalse
    }

    return <ScoreContext.Provider value={contextValue}>{props.children}</ScoreContext.Provider>
}

export default ScoreContextProvider;