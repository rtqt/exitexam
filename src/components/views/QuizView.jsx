import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import QuestionSidebar from '../quiz/QuestionSidebar';
import QuestionCard from '../quiz/QuestionCard';

export default function QuizView({
  questions,
  currentIdx,
  userAnswers,
  timeLeft,
  isExamMode,
  examCompleted,
  flagged,
  onToggleFlag,
  formatTime,
  onJump, // expects (index)
  onAnswer, // expects (questionId, optionIndex)
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
  const isAnswered = currentQuestion && userAnswers[currentQuestion.id] !== undefined;
  const isLastQuestion = currentIdx === questions.length - 1;

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input (though unlikely in this view)
      if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea') return;

      if (e.key === 'ArrowRight') {
        if (isAnswered && !isLastQuestion) onNext();
      } else if (e.key === 'ArrowLeft') {
        if (currentIdx > 0) onPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, isAnswered, isLastQuestion, onNext, onPrev]);

  if (!currentQuestion) return null;

  return (
    <motion.div
      className="flex h-[calc(100vh-80px)] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <QuestionSidebar
        questions={questions}
        currentIdx={currentIdx}
        userAnswers={userAnswers}
        timeLeft={timeLeft}
        isExamMode={isExamMode}
          flagged={flagged}
          onToggleFlag={onToggleFlag}
        onJump={onJump}
        formatTime={formatTime}
      />

      {/* MAIN CONTENT (Right) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth custom-scrollbar">
        {/* Mobile Header (Timer & Close) */}
        <div className="md:hidden flex justify-between items-center mb-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <span className="text-sm font-bold text-slate-500">Q{currentIdx + 1} / {questions.length}</span>
          {isExamMode && (
            <div className={`flex items-center gap-2 font-mono font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
              <div className={`w-2 h-2 rounded-full ${timeLeft < 300 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        <QuestionCard
          question={currentQuestion}
          currentIdx={currentIdx}
          totalCount={questions.length}
          userAnswer={currentQuestion ? userAnswers[currentQuestion.id] : undefined}
          isAnswered={isAnswered}
          isExamMode={isExamMode}
          examCompleted={examCompleted}
          flagged={flagged && currentQuestion ? !!flagged[currentQuestion.id] : false}
          onToggleFlag={onToggleFlag}
          onAnswer={onAnswer}
          onQuit={onQuit}
          explanation={explanation}
          isExplaining={isExplaining}
          explainError={explainError}
          onAskAI={onAskAI}
          onOpenSettings={onOpenSettings}
        />

        {/* Navigation Bar */}
        <div className="mt-8 flex justify-between items-center bg-white/70 dark:bg-slate-800/70 p-5 rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-lg backdrop-blur-md max-w-4xl mx-auto sticky bottom-4 z-10">
          <button
            disabled={currentIdx === 0}
            onClick={onPrev}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:block">
            Use Arrow Keys ◀ ▶
          </div>

          {isLastQuestion ? (
            <button
              disabled={!currentQuestion || userAnswers[currentQuestion.id] === undefined}
              onClick={onFinish}
              className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-xl shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:shadow-none active:scale-95"
            >
              Finish Exam
              <CheckCircle className="w-5 h-5" />
            </button>
          ) : (
            <button
              disabled={!currentQuestion || userAnswers[currentQuestion.id] === undefined}
              onClick={onNext}
              className="flex items-center gap-2 bg-amber-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-600 shadow-xl shadow-amber-500/30 transition-all disabled:opacity-50 disabled:shadow-none active:scale-95"
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
