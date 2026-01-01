import React from 'react';
import { Trophy, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResultsView({ score, total, passed, percentage, onHome }) {
  const resultID = React.useMemo(() => Math.random().toString(36).substr(2, 9).toUpperCase(), []);
  const date = React.useMemo(() => new Date().toLocaleDateString(), []);

  return (
    <motion.div
      className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        <motion.div
          className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ring-4 ring-offset-4 ring-offset-white dark:ring-offset-slate-800 ${passed ? 'bg-emerald-100 dark:bg-emerald-900/30 ring-emerald-500' : 'bg-red-100 dark:bg-red-900/30 ring-red-500'}`}
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <Trophy className={`w-12 h-12 ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
        </motion.div>

        <motion.h1
          className="text-4xl font-black text-slate-900 dark:text-white mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {passed ? 'Outstanding Job!' : 'Keep Pushing!'}
        </motion.h1>
        <motion.p
          className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {passed
            ? "You have demonstrated excellent knowledge in this domain. You are ready for the next challenge."
            : "Don't give up. Review your answers, use the practice mode, and try again."}
        </motion.p>

        <motion.div
          className="grid grid-cols-2 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
            <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Score</span>
            <span className="text-4xl font-black text-slate-800 dark:text-white">{score} <span className="text-lg text-slate-400 font-medium">/ {total}</span></span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
            <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Accuracy</span>
            <span className={`text-4xl font-black ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {percentage}%
            </span>
          </div>
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <button
            onClick={onHome}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="text-xs text-slate-400 mt-4">
            Result ID: {resultID} • {date}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
