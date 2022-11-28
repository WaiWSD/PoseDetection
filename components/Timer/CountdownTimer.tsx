import React, { useState, useEffect } from 'react';
import {
    View,
    Text
} from 'react-native';

const twoDigit = (number: number) => {
    return ('0' + number).slice(-2);
};

const CountdownTimer: React.FC<{finishTime: Date, onTimerClicked: (isTimerOn: boolean) => void}> = ({
    finishTime,
    onTimerClicked
}) => {

    const [_finishTime, set_finishTime] = useState(new Date());
    const [remainingTime, setRemainingTime] = useState(0);

    useEffect(() => {
        console.log("CountdownTimer useEffect finishTime", finishTime);
        set_finishTime(finishTime);
    }, [finishTime]);

    useEffect(() => {
        const timerId = setInterval(refreshClock, 1000);
        return function cleanup() {
            clearInterval(timerId);
        };
    }, [_finishTime, onTimerClicked]);

    function refreshClock() {
        const currentDate = new Date();
        console.log("CountdownTimer _finishTime", _finishTime);
        console.log("CountdownTimer currentDate", currentDate);
        console.log("CountdownTimer _finishTime.valueOf() - currentDate.valueOf()", _finishTime.valueOf() - currentDate.valueOf());
        if (_finishTime.valueOf() - currentDate.valueOf() >= 0){
            const tempRemainingTime = Math.round((_finishTime.valueOf() - currentDate.valueOf()) / 1000);
            setRemainingTime(tempRemainingTime);
            onTimerClicked(true);
        } else {
            setRemainingTime(0);
            onTimerClicked(false);
        }
    }

    return (<View>
        <Text>
            {`00:${twoDigit(remainingTime)}`}
        </Text>
    </View>);
};

export default CountdownTimer;