import React from 'react';

export default function QuestionSidebar({ questions, currentIdx, userAnswers, timeLeft, isExamMode, onJump, formatTime }) {
  return (
    <div className="w-80 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col hidden md:flex z-10 shadow-sm">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50">
        <h3 className="font-bold text-gray-800 dark:text-white mb-1">Questions</h3>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
          <span>Total: {questions.length}</span>
          {isExamMode && (
            <span className={`${timeLeft < 300 ? 'text-red-500 font-bold animate-pulse' : ''}`}>
              Time: {formatTime(timeLeft)}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => onJump(i)}
              className={`aspect-square flex items-center justify-center text-xs font-semibold rounded-lg transition-all ${currentIdx === i
                ? 'bg-blue-600 text-white ring-2 ring-blue-300 dark:ring-blue-700 ring-offset-1 dark:ring-offset-slate-800'
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

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="w-3 h-3 rounded bg-blue-600"></span> Current
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800"></span> Answered
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="w-3 h-3 rounded bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600"></span> Unanswered
        </div>
      </div>
    </div>
  );
}
