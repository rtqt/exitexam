import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import QuestionSidebar from '../quiz/QuestionSidebar';
import QuestionCard from '../quiz/QuestionCard';

export default function QuizView({
  questions,
  currentIdx,
  userAnswers,
  timeLeft,
  isExamMode,
  formatTime,
  onJump, // expects (index)
  onAnswer, // expects (optionIndex)
  onNext,
  onPrev,
  onFinish,
  onQuit,
  // AI props
  explanation,
  isExplaining,
  explainError,
  onAskAI,
  onOpenSettings
}) {
  const currentQuestion = questions[currentIdx];
  const isAnswered = userAnswers[currentIdx] !== undefined;
  const isLastQuestion = currentIdx === questions.length - 1;

  if (!currentQuestion) return null;

  return (
    <motion.div
      className="flex h-[calc(100vh-64px)] overflow-hidden bg-white dark:bg-slate-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, opacity: { duration: 0.3 } }}
    >
      <QuestionSidebar
        questions={questions}
        currentIdx={currentIdx}
        userAnswers={userAnswers}
        timeLeft={timeLeft}
        isExamMode={isExamMode}
        onJump={onJump}
        formatTime={formatTime}
      />

      {/* MAIN CONTENT (Right) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth">
        {/* Mobile Header (Timer & Close) */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-slate-500">Q{currentIdx + 1} / {questions.length}</span>
          {isExamMode && (
            <span className={`font-mono font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
              {formatTime(timeLeft)}
            </span>
          )}
        </div>

        <QuestionCard
          question={currentQuestion}
          currentIdx={currentIdx}
          totalCount={questions.length}
          userAnswer={userAnswers[currentIdx]}
          isAnswered={isAnswered}
          isExamMode={isExamMode}
          onAnswer={onAnswer}
          onQuit={onQuit}
          explanation={explanation}
          isExplaining={isExplaining}
          explainError={explainError}
          onAskAI={onAskAI}
          onOpenSettings={onOpenSettings}
        />

        {/* Navigation Bar (Sticky Bottom of container or just block) */}
        <div className="mt-8 flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-4xl mx-auto">
          <button
            disabled={currentIdx === 0}
            onClick={onPrev}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-gray-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="text-sm font-medium text-gray-400 hidden sm:block">
            Use Arrow Keys ◀ ▶
          </div>

          {isLastQuestion ? (
            <button
              disabled={userAnswers[currentIdx] === undefined}
              onClick={onFinish}
              className="bg-emerald-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              Finish Exam
            </button>
          ) : (
            <button
              disabled={userAnswers[currentIdx] === undefined}
              onClick={onNext}
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Mobile-Only Quick Nav Grid */}
        <div className="md:hidden mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
          <h3 className="font-bold text-gray-700 dark:text-slate-300 mb-4 text-sm uppercase tracking-wider">Question Navigator</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  onJump(i);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`aspect-square flex items-center justify-center text-xs font-semibold rounded-lg transition-all ${currentIdx === i
                  ? 'bg-blue-600 text-white ring-2 ring-blue-300 dark:ring-blue-700 ring-offset-1 dark:ring-offset-slate-900'
                  : userAnswers[i] !== undefined
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'bg-white dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
