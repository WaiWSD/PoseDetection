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
}> = ({
    totalMarkToAchieve,
    currentMark,
    shouldGameStop,
}) => {

        const _totalMarkToAchieve = useMemo(() => totalMarkToAchieve, [totalMarkToAchieve]);

        const _currentMark = useMemo(() => currentMark, [currentMark]);

        useEffect(() => {
            console.log("_totalMarkToAchieve", _totalMarkToAchieve);
            console.log("_currentMark", _currentMark);

            if (_totalMarkToAchieve <= _currentMark) {
                shouldGameStop(true);
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
                {`分數: ${_currentMark}`}
            </Text>
        </View>);
    };

export default MarkCounter;