import React from 'react';
import { XCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIExplanation from './AIExplanation';

export default function QuestionCard({
  question,
  currentIdx,
  totalCount,
  userAnswer,
  isAnswered,
  isExamMode,
  onAnswer,
  onQuit,
  // AI Props
  explanation,
  isExplaining,
  explainError,
  onAskAI,
  onOpenSettings
}) {

  // Animation for question transition
  const cardVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full justify-between gap-6">
      <div>
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-1">Question {currentIdx + 1} of {totalCount}</span>
            <span className="inline-block px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-xs font-bold uppercase tracking-wide">
              {question.theme}
            </span>
          </div>
          <button
            onClick={onQuit}
            className="text-slate-400 hover:text-red-500 transition-colors p-2"
            title="Quit Exam"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              duration: 0.2,
              opacity: { duration: 0.2 },
              x: { duration: 0.2 }
            }}
            className="bg-slate-50 dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Progress Bar Top */}
            <div className="h-1 w-full bg-gray-100 dark:bg-slate-700">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: `${(currentIdx / totalCount) * 100}%` }}
                animate={{ width: `${((currentIdx + 1) / totalCount) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white leading-relaxed mb-8">
                {question.question}
              </h2>

              {question.image && (
                <div className="mb-8 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <img
                    src={question.image}
                    alt="Question Reference"
                    className="w-full max-h-96 object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="grid gap-3">
                {question.options.map((option, i) => {
                  const isCorrect = i === question.answer;
                  const isSelected = userAnswer === i;
                  let statusStyles = "border-gray-200 dark:border-slate-700 hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:bg-gray-50 dark:hover:bg-slate-700/50";
                  let icon = null;

                  if (isAnswered) {
                    if (isSelected) {
                      statusStyles = isCorrect
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500"
                        : "border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-500";
                      icon = isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />;
                    } else if (isCorrect && !isExamMode) {
                      statusStyles = "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10";
                    } else {
                      statusStyles = "opacity-50 pointer-events-none grayscale";
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={isAnswered}
                      onClick={() => onAnswer(i)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left w-full group ${statusStyles}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-700 text-gray-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                          }`}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="font-medium text-gray-700 dark:text-slate-200">{option}</span>
                      </div>
                      {icon}
                    </button>
                  )
                })}
              </div>
            </div>

            {!isExamMode && (
              <AIExplanation
                userAnswer={userAnswer}
                explanation={explanation}
                isExplaining={isExplaining}
                explainError={explainError}
                onAskAI={onAskAI}
                onOpenSettings={onOpenSettings}
                question={question.question}
                options={question.options}
                answerIdx={question.answer}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
