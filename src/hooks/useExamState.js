import { useState, useEffect, useMemo } from 'react';

export default function useExamState(questions) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [userAnswers, setUserAnswers] = useState(() => {
        try {
            const raw = localStorage.getItem('exit-exam-userAnswers');
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    });
    const [flagged, setFlagged] = useState(() => {
        try {
            const raw = localStorage.getItem('exit-exam-flagged');
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    });
    const [isExamMode, setIsExamMode] = useState(false);
    const [examCompleted, setExamCompleted] = useState(false);
    const [selectedThemes, setSelectedThemes] = useState([]);

    // Filtered questions based on themes
    const filteredQuestions = useMemo(() => {
        if (selectedThemes.length === 0 || selectedThemes.includes('All')) return questions;
        return questions.filter(q => selectedThemes.includes(q.theme));
    }, [selectedThemes, questions]);

    const themes = ['All', ...new Set(questions.map(q => q.theme))];

    // Practice State Persistence
    useEffect(() => {
        // If we're interacting with a quiz and it isn't exam mode, save the session state
        if (!isExamMode && Object.keys(userAnswers).length > 0) {
            const practiceState = {
                currentIdx,
                userAnswers,
                selectedThemes
            };
            localStorage.setItem('practiceState', JSON.stringify(practiceState));
        }

        // persist userAnswers and flags globally as well
        try {
            localStorage.setItem('exit-exam-userAnswers', JSON.stringify(userAnswers || {}));
            localStorage.setItem('exit-exam-flagged', JSON.stringify(flagged || {}));
        } catch (e) { }
    }, [currentIdx, userAnswers, selectedThemes, isExamMode, flagged]);

    const toggleFlag = (questionId) => {
        setFlagged(prev => {
            const next = { ...(prev || {}) };
            if (next[questionId]) delete next[questionId];
            else next[questionId] = true;
            try { localStorage.setItem('exit-exam-flagged', JSON.stringify(next)); } catch (e) { }
            return next;
        });
    };

    const handleAnswer = (questionId, optionIdx) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
    };

    const toggleTheme = (theme) => {
        if (theme === 'All') {
            setSelectedThemes([]);
            return;
        }
        setSelectedThemes(prev => {
            if (prev.includes(theme)) {
                return prev.filter(t => t !== theme);
            }
            return [...prev, theme];
        });
    };

    const resetExamState = (mode) => {
        setIsExamMode(mode === 'exam');
        setExamCompleted(false);
        setUserAnswers({});
        setCurrentIdx(0);
        setFlagged({});
    };

    return {
        currentIdx,
        setCurrentIdx,
        userAnswers,
        setUserAnswers,
        flagged,
        setFlagged,
        isExamMode,
        setIsExamMode,
        examCompleted,
        setExamCompleted,
        selectedThemes,
        setSelectedThemes,
        filteredQuestions,
        themes,
        toggleFlag,
        handleAnswer,
        toggleTheme,
        resetExamState
    };
}
