
import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_QUESTIONS } from '../data/initialQuestions';

const QuestionContext = createContext();

export function useQuestions() {
    return useContext(QuestionContext);
}

export function QuestionProvider({ children }) {
    const [questions, setQuestions] = useState(() => {
        const saved = localStorage.getItem('exit-exam-questions');
        if (saved) {
            const parsedSaved = JSON.parse(saved);
            // If the hardcoded initial questions grew larger (i.e. developer added more),
            // let's prefer the new list or merge. Because we want new ones to show up.
            // For simplicity, if parsed length is less than initial length, we merge or override.
            if (parsedSaved.length < INITIAL_QUESTIONS.length) {
                // To keep custom added tracking, you could merge, but resetting to INITIAL_QUESTIONS + custom is tricky.
                // Simple approach: just use the new INITIAL_QUESTIONS entirely,
                // or concatenate INITIAL_QUESTIONS that aren't in parsedSaved.
                const existingIds = new Set(parsedSaved.map(q => q.id));
                const newQuestions = INITIAL_QUESTIONS.filter(q => !existingIds.has(q.id));
                return [...parsedSaved, ...newQuestions];
            }
            return parsedSaved;
        }
        return INITIAL_QUESTIONS;
    });

    useEffect(() => {
        localStorage.setItem('exit-exam-questions', JSON.stringify(questions));
    }, [questions]);

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

    const resetToDefault = () => {
        setQuestions(INITIAL_QUESTIONS);
    };

    return (
        <QuestionContext.Provider value={{ questions, addQuestion, addQuestions, deleteQuestion, updateQuestion, resetToDefault }}>
            {children}
        </QuestionContext.Provider>
    );
}
