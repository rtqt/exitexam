
import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_QUESTIONS } from '../data/initialQuestions';

const QuestionContext = createContext();

export function useQuestions() {
    return useContext(QuestionContext);
}

export function QuestionProvider({ children }) {
    // track whether we're using the built-in questions or a clean slate
    const [initMode, setInitMode] = useState(() => {
        return localStorage.getItem('exit-exam-init-mode') || 'default';
    });

    const [questions, setQuestions] = useState(() => {
        const savedMode = localStorage.getItem('exit-exam-init-mode') || 'default';
        const saved = localStorage.getItem('exit-exam-questions');
        if (saved) {
            const parsedSaved = JSON.parse(saved);
            // if user explicitly started clean, just return whatever is saved (likely [])
            if (savedMode === 'clean') {
                return parsedSaved;
            }
            // if the hardcoded initial questions grew larger (i.e. developer added more),
            // let's prefer the new list or merge. Because we want new ones to show up.
            // For simplicity, if parsed length is less than initial length, we merge or override.
            if (parsedSaved.length < INITIAL_QUESTIONS.length) {
                const existingIds = new Set(parsedSaved.map(q => q.id));
                const newQuestions = INITIAL_QUESTIONS.filter(q => !existingIds.has(q.id));
                return [...parsedSaved, ...newQuestions];
            }
            return parsedSaved;
        }
        // no saved questions yet, choose based on mode
        return savedMode === 'clean' ? [] : INITIAL_QUESTIONS;
    });

    useEffect(() => {
        localStorage.setItem('exit-exam-questions', JSON.stringify(questions));
        localStorage.setItem('exit-exam-init-mode', initMode);
    }, [questions, initMode]);

    const addQuestion = (question) => {
        setQuestions(prev => {
            const newQuestion = { ...question, id: Date.now() }; // Simple ID generation
            return [...prev, newQuestion];
        });
    };

    const addQuestions = (newQuestions) => {
        setQuestions(prev => {
            // Ensure unique IDs
            const timestamp = Date.now();
            const labeledQuestions = newQuestions.map((q, idx) => ({
                ...q,
                id: timestamp + idx
            }));
            return [...prev, ...labeledQuestions];
        });
    };

    const deleteQuestion = (id) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
    };

    const updateQuestion = (id, updatedData) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updatedData } : q));
    };

    const clearQuestions = () => {
        setQuestions([]);
        setInitMode('clean');
    };

    const resetToDefault = () => {
        setQuestions(INITIAL_QUESTIONS);
        setInitMode('default');
    };

    return (
        <QuestionContext.Provider value={{ questions, addQuestion, addQuestions, deleteQuestion, updateQuestion, resetToDefault, clearQuestions, initMode }}>
            {children}
        </QuestionContext.Provider>
    );
}
