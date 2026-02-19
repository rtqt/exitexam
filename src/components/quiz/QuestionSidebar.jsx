import React from 'react';
import { LayoutGrid, Clock, CheckCircle, Circle, HelpCircle } from 'lucide-react';

export default function QuestionSidebar({ questions, currentIdx, userAnswers, timeLeft, isExamMode, onJump, formatTime }) {
  // Calculate stats
  const answeredCount = Object.keys(userAnswers).length;
  const totalCount = questions.length;
  const progress = Math.round((answeredCount / totalCount) * 100);

  return (
    <div className="w-80 h-full flex flex-col hidden md:flex z-20 border-r border-amber-100 dark:border-stone-800 bg-amber-50/30 dark:bg-stone-900 shadow-xl transition-all duration-300">

      {/* Sidebar Header */}
      <div className="p-6 border-b border-amber-100 dark:border-stone-800 bg-amber-50/50 dark:bg-stone-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white leading-tight">Navigator</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Question Overview</span>
          </div>
        </div>

        {/* Progres Bar */}
        <div className="space-y-2 mb-2">
          <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {isExamMode && (
          <div className={`mt-4 flex items-center justify-between p-3 rounded-xl border ${timeLeft < 300 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${timeLeft < 300 ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Time Left</span>
            </div>
            <span className={`font-mono font-bold ${timeLeft < 300 ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/30">
        <div className="grid grid-cols-5 gap-2.5">
          {questions.map((_, i) => {
            const isCurrent = currentIdx === i;
            const isAnswered = userAnswers[i] !== undefined;

            let btnClass = "aspect-square flex flex-col items-center justify-center text-xs font-bold rounded-xl transition-all duration-200 relative group ";

            if (isCurrent) {
              btnClass += "bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105 z-10 ring-2 ring-white dark:ring-stone-800";
            } else if (isAnswered) {
              btnClass += "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-200 dark:hover:bg-amber-800/50";
            } else {
              btnClass += "bg-white dark:bg-stone-800 text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700 hover:border-amber-300 dark:hover:border-amber-600 hover:text-amber-500 dark:hover:text-amber-400 hover:shadow-sm";
            }

            return (
              <button
                key={i}
                onClick={() => onJump(i)}
                className={btnClass}
              >
                <span className="z-10">{i + 1}</span>
                {isAnswered && !isCurrent && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend Footer */}
      <div className="p-4 border-t border-amber-100 dark:border-stone-800 bg-amber-50/30 dark:bg-stone-900 text-xs space-y-3">
        <div className="flex items-center gap-2.5 text-stone-600 dark:text-stone-400 font-medium">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></div> Current
        </div>
        <div className="flex items-center gap-2.5 text-stone-600 dark:text-stone-400 font-medium">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-200 dark:bg-amber-800 border border-amber-300 dark:border-amber-700"></div> Answered
        </div>
        <div className="flex items-center gap-2.5 text-stone-600 dark:text-stone-400 font-medium">
          <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600"></div> Unanswered
        </div>
      </div>
    </div>
  );
}
