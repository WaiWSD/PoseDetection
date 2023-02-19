import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text
} from 'react-native';

const twoDigit = (number: number) => {
    return ('0' + number).slice(-2);
};

const MarkCounter: React.FC<{
    totalMarkToAchieve: number;
    currentMark: number;
    shouldGameStop: (yesOrNo: boolean) => void
    isOn?: boolean
}> = ({
    totalMarkToAchieve,
    currentMark,
    shouldGameStop,
    isOn = true
}) => {

        const _totalMarkToAchieve = useMemo(() => totalMarkToAchieve, [totalMarkToAchieve]);

        const _currentMark = useMemo(() => currentMark, [currentMark]);

        useEffect(() => {
            console.log("_totalMarkToAchieve", _totalMarkToAchieve);
            console.log("_currentMark", _currentMark);

            if (_totalMarkToAchieve !== 0){
                if (_totalMarkToAchieve <= _currentMark) {
                    shouldGameStop(true);
                } else {
                    shouldGameStop(false);
                }
            } else {
                shouldGameStop(false);
            }


        }, [_totalMarkToAchieve, _currentMark]);

        return (<View>
            <Text
                style={{
                    fontSize: 30,
                }}
            >
                {`分數: ${Math.floor(_currentMark / 6)}/5`}
            </Text>
        </View>);
    };

export default MarkCounter;