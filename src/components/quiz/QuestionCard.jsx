import React, { useState } from 'react';
import { XCircle, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuestionCard({
  question,
  currentIdx,
  totalCount,
  userAnswer,
  isAnswered,
  isExamMode,
  examCompleted,
  flagged,
  onToggleFlag,
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
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Question {currentIdx + 1} of {totalCount}</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white hidden sm:block">
                {question.theme}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFlag && onToggleFlag(question.id)}
              className={`p-2 rounded-lg text-sm font-bold ${flagged ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-slate-500 hover:bg-slate-100/50 dark:text-slate-400'}`}
              aria-label="Flag question"
            >
              {flagged ? '⚑ Flagged' : 'Flag'}
            </button>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wide border border-amber-200 dark:border-amber-800">
              {question.theme}
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              duration: 0.3,
              type: "spring",
              stiffness: 100,
              damping: 20
            }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative"
          >
            {/* Progress Bar Top */}
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-500"
                initial={{ width: `${(currentIdx / totalCount) * 100}%` }}
                animate={{ width: `${((currentIdx + 1) / totalCount) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>

            <div className="p-6 md:p-10">
              <h3 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50 leading-relaxed mb-8 font-display">
                {question.question}
              </h3>

              {question.image && (
                <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-black/20 p-2">
                  <img
                    src={question.image}
                    alt="Question Reference"
                    className="w-full max-h-[400px] object-contain rounded-xl"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {question.imageDescription && (
                <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r-xl text-sm text-amber-800 dark:text-amber-300 flex gap-3">
                  <HelpCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <span className="font-bold block mb-1">Diagram Description</span>
                    <i className="opacity-90">{question.imageDescription}</i>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {question.options.map((option, i) => {
                  const isCorrect = i === question.answer;
                  const isSelected = userAnswer === i;

                  // Base styles
                  let containerClasses = "relative flex items-center p-4 rounded-xl border-2 transition-all duration-200 w-full text-left group overflow-hidden";
                  let bgClasses = "bg-white dark:bg-stone-800 hover:bg-amber-50/60 dark:hover:bg-stone-700/50 border-stone-200 dark:border-stone-700 hover:border-amber-300 dark:hover:border-amber-600";
                  let textClasses = "text-stone-600 dark:text-stone-300 font-medium";
                  let indicatorClasses = "bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 group-hover:text-amber-600 dark:group-hover:text-amber-400";
                  let indicatorBorder = "border border-stone-200 dark:border-stone-600";

                  if (isAnswered) {
                    // Disabled state by default if answered
                    containerClasses += " cursor-default";

                    if (isSelected) {
                      if (!isExamMode || examCompleted) {
                        if (isCorrect) {
                          // User selected correct
                          bgClasses = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 dark:border-emerald-500/50";
                          textClasses = "text-emerald-800 dark:text-emerald-200 font-bold";
                          indicatorClasses = "bg-emerald-500 text-white";
                          indicatorBorder = "border-transparent";
                        } else {
                          // User selected incorrect
                          bgClasses = "bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-500/50";
                          textClasses = "text-red-800 dark:text-red-200 font-bold";
                          indicatorClasses = "bg-red-500 text-white";
                          indicatorBorder = "border-transparent";
                        }
                      } else {
                        // Exam mode but still editable: keep neutral selected styling
                        bgClasses = "bg-amber-50 dark:bg-amber-900/20 border-amber-500";
                        textClasses = "text-stone-700 dark:text-stone-100 font-medium";
                        indicatorClasses = "bg-amber-100 dark:bg-amber-900/30 text-amber-600";
                        indicatorBorder = "border-amber-200 dark:border-amber-800";
                      }
                    } else if (isCorrect && (!isExamMode || examCompleted)) {
                      // Correct answer (reveal)
                      bgClasses = "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 border-dashed";
                      textClasses = "text-emerald-700 dark:text-emerald-300 font-medium";
                      indicatorClasses = "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400";
                      indicatorBorder = "border-emerald-200 dark:border-emerald-800";
                    } else {
                      // Other options
                      bgClasses = "opacity-50 grayscale border-transparent bg-slate-50 dark:bg-slate-800/50";
                    }
                  } else {
                    // Not answered yet
                    containerClasses += " active:scale-[0.99] cursor-pointer shadow-sm hover:shadow-md";
                    if (isSelected) {
                      // Just formatted as selected before confirming? (Not really used in this logic but good for future)
                      bgClasses = "bg-amber-50 dark:bg-amber-900/20 border-amber-500";
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={!isExamMode && isAnswered}
                      onClick={() => onAnswer(question.id, i)}
                      className={`${containerClasses} ${bgClasses}`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg mr-4 text-sm font-bold transition-colors ${indicatorClasses} ${indicatorBorder}`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className={`flex-grow ${textClasses}`}>{option}</span>

                      {isAnswered && isSelected && (!isExamMode || examCompleted) && (
                        <div className="ml-3 flex-shrink-0">
                          {isCorrect ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Explanations Area */}
            {isAnswered && !isExamMode && (
              <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: isExplaining ? 360 : 0 }}
                      transition={{ duration: 2, repeat: isExplaining ? Infinity : 0, ease: "linear" }}
                    >
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                    </motion.div>
                    AI Explanation
                  </h4>
                  <button
                    onClick={() => onAskAI(question.question, question.options, question.answer)}
                    disabled={isExplaining}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-lg transition-colors border border-amber-200 dark:border-amber-800"
                  >
                    {isExplaining ? 'Thinking...' : explanation ? 'Regenerate' : 'Ask AI Tutor'}
                  </button>
                </div>

                {explainError && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm mb-4 border border-red-100 dark:border-red-800">
                    {explainError}
                    <button onClick={onOpenSettings} className="underline ml-2 font-bold">Check API Key</button>
                  </div>
                )}

                <AnimatePresence>
                  {explanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed prose dark:prose-invert max-w-none"
                    >
                      <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                        {/* Simple markdown parser or just text for now - preserving whitespace */}
                        <div className="whitespace-pre-wrap font-medium">{explanation}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!explanation && !isExplaining && !explainError && (
                  <p className="text-slate-400 dark:text-slate-500 text-sm italic">
                    Click "Ask AI Tutor" to get a detailed breakdown of this question.
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
