import { useState, useEffect } from 'react';

export default function useExamTimer({ isExamMode, view, onFinish }) {
    const [timeLeft, setTimeLeft] = useState(180 * 60); // 3 hours in seconds

    useEffect(() => {
        let timer;
        if (view === 'quiz' && isExamMode && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            onFinish();
        }
        return () => clearInterval(timer);
    }, [view, isExamMode, timeLeft, onFinish]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return { timeLeft, setTimeLeft, formatTime };
}
