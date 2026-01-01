import React from 'react';
import { Brain, Settings, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIExplanation({
  userAnswer,
  explanation,
  isExplaining,
  explainError,
  onAskAI,
  onOpenSettings,
  question,
  options,
  answerIdx
}) {
  if (userAnswer === undefined) return null;

  return (
    <div className="bg-gray-50 dark:bg-slate-900/50 p-6 border-t border-gray-100 dark:border-slate-700">
      {!explanation && !isExplaining && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onAskAI(question, options, answerIdx)}
            className="flex-1 flex items-center justify-center gap-2 text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 px-6 py-3 rounded-xl font-bold transition-all"
          >
            <Brain className="w-5 h-5" />
            Why is this correct? (Ask AI)
          </button>
          <button
            onClick={onOpenSettings}
            className="px-4 py-3 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-slate-800 border border-purple-200 dark:border-purple-800 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all"
            title="AI Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      )}

      {isExplaining && (
        <div className="flex items-center justify-center gap-3 text-purple-600 dark:text-purple-400 animate-pulse font-medium py-4">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="tracking-wide text-sm uppercase">Analyzing Question...</span>
        </div>
      )}

      {explainError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 text-sm">
          ⚠️ {explainError}
        </div>
      )}

      {explanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-purple-100 dark:border-purple-900/50 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
          <h3 className="flex items-center gap-2 font-bold text-purple-800 dark:text-purple-300 mb-3">
            <Brain className="w-5 h-5" />
            AI Explanation
          </h3>
          <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {explanation}
          </div>
        </motion.div>
      )}
    </div>
  );
}
