import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, CheckCircle2, AlertTriangle, BookOpen, Layers } from 'lucide-react';

export default function WrongAnswerAnalysis({ questions, userAnswers }) {
    // Compute wrong answers and theme statistics
    const { wrongQuestions, themeStats } = useMemo(() => {
        const wrong = [];
        const stats = {};

        questions.forEach((q, idx) => {
            const userAnswer = userAnswers && userAnswers[q.id];
            const isCorrect = userAnswer === q.answer;

            // Initialize theme stats if not exists
            if (!stats[q.theme]) {
                stats[q.theme] = { total: 0, correct: 0 };
            }

            stats[q.theme].total += 1;
            if (isCorrect) {
                stats[q.theme].correct += 1;
            } else {
                // Collect question data for the wrong answers list
                // Note: checking if userAnswer is undefined/null handles skipped questions
                wrong.push({
                    question: q,
                    userAnswerIdx: userAnswer,
                    questionIdx: idx
                });
            }
        });

        // Format theme stats for display
        const formattedStats = Object.keys(stats).map(theme => {
            const { total, correct } = stats[theme];
            const percentage = Math.round((correct / total) * 100);
            return {
                theme,
                total,
                correct,
                percentage,
                isWeak: percentage < 60
            };
        }).sort((a, b) => a.percentage - b.percentage); // Sort by weakest first

        return { wrongQuestions: wrong, themeStats: formattedStats };
    }, [questions, userAnswers]);

    if (wrongQuestions.length === 0) {
        return null; // Nothing to analyze if score is 100%
    }

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
            className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-10 text-left"
        >
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Performance Analysis</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Review your weak areas and missed questions</p>
                </div>
            </div>

            {/* Theme Breakdown Section */}
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                Theme Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {themeStats.map((stat, idx) => (
                    <div
                        key={idx}
                        className={`p-4 rounded-2xl border ${stat.isWeak ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className={`font-bold ${stat.isWeak ? 'text-red-900 dark:text-red-200' : 'text-slate-700 dark:text-slate-300'}`}>
                                {stat.theme}
                            </span>
                            <span className={`text-sm font-black px-2 py-1 rounded-lg ${stat.isWeak ? 'bg-red-200 dark:bg-red-900/50 text-red-700 dark:text-red-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                                {stat.percentage}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stat.percentage}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className={`h-2 rounded-full ${stat.isWeak ? 'bg-red-500' : 'bg-emerald-500'}`}
                            ></motion.div>
                        </div>
                        <p className={`text-xs mt-2 font-medium ${stat.isWeak ? 'text-red-600 dark:text-red-400' : 'text-slate-500'}`}>
                            Correct: {stat.correct} / {stat.total}
                        </p>
                    </div>
                ))}
            </div>

            {/* Wrong Questions Section */}
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                Review Incorrect Answers ({wrongQuestions.length})
            </h3>
            <div className="space-y-6">
                {wrongQuestions.map((item, idx) => {
                    const { question, userAnswerIdx, questionIdx } = item;
                    const hasAnswered = userAnswerIdx !== undefined && userAnswerIdx !== null;

                    return (
                        <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <span className="flex-shrink-0 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-bold px-2 py-1 rounded-md">
                                        Q{questionIdx + 1}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                        {question.theme}
                                    </span>
                                </div>
                                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                                    {question.question}
                                </h4>
                            </div>

                            <div className="p-5 space-y-3">
                                {/* User's incorrect answer */}
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
                                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-red-500 mb-1 block">Your Answer</span>
                                        <p className="text-red-900 dark:text-red-200 font-medium text-sm md:text-base">
                                            {hasAnswered ? question.options[userAnswerIdx] : <span className="italic">Skipped / Unanswered</span>}
                                        </p>
                                    </div>
                                </div>

                                {/* The correct answer */}
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1 block">Correct Answer</span>
                                        <p className="text-emerald-900 dark:text-emerald-200 font-bold text-sm md:text-base">
                                            {question.options[question.answer]}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
