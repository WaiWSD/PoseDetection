import React, { useState } from 'react';

type ScoreContextObj = {
    Score: number;
    addScore: (newPoint: number) => void;
    removeScore: () => void;
}

export const ScoreContext = React.createContext<ScoreContextObj>({
    Score: 0,
    addScore: () => { },
    removeScore: () => { }
});

const ScoreContextProvider: React.FC<{children: any}> = (props) => {
    const [score, setScore] = useState<number>(0);

    const addScoreHandler = (newPoint: number) => {
        setScore((prevScore) => prevScore + newPoint);
    }

    const removeScoreHandler = () => {
        setScore(0);
    }

    const contextValue: ScoreContextObj = {
        Score: score,
        addScore: addScoreHandler,
        removeScore: removeScoreHandler,
    }

    return <ScoreContext.Provider value={contextValue}>{props.children}</ScoreContext.Provider>
}

export default ScoreContextProvider;