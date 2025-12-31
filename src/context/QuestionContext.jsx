
import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_QUESTIONS } from '../data/initialQuestions';

const QuestionContext = createContext();

export function useQuestions() {
    return useContext(QuestionContext);
}

export function QuestionProvider({ children }) {
    const [questions, setQuestions] = useState(() => {
        const saved = localStorage.getItem('exit-exam-questions');
        return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
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
