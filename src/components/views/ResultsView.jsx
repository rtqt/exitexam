import React, { useState } from 'react';
import { Trophy, RotateCcw, Target, Award, Star, ExternalLink, RefreshCw, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import WrongAnswerAnalysis from '../quiz/WrongAnswerAnalysis';

export default function ResultsView({ score, total, passed, percentage, questions, userAnswers, flagged, onHome }) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const resultID = React.useMemo(() => Math.random().toString(36).substr(2, 9).toUpperCase(), []);
  const date = React.useMemo(() => new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }), []);

  // Window size for confetti
  const { innerWidth: width, innerHeight: height } = window;

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        duration: 0.5,
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0, scale: 0.9 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {passed && <Confetti width={width} height={height} numberOfPieces={200} recycle={false} gravity={0.2} />}

      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[128px] ${passed ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[128px] ${passed ? 'bg-amber-400/10' : 'bg-orange-500/10'}`}></div>
      </div>

      <motion.div
        className="max-w-3xl w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50 dark:border-slate-700/50 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Top Header Strip */}
        <div className={`h-3 w-full bg-gradient-to-r ${passed ? 'from-emerald-400 via-teal-500 to-blue-500' : 'from-red-500 via-orange-500 to-amber-500'}`}></div>

        <div className="p-8 md:p-12 text-center">

          <motion.div
            variants={itemVariants}
            className="mb-8 relative inline-block"
          >
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center shadow-2xl ${passed ? 'bg-gradient-to-tr from-emerald-50 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30' : 'bg-gradient-to-tr from-red-50 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30'}`}>
              {passed ? (
                <Trophy className="w-16 h-16 text-emerald-500 dark:text-emerald-400 drop-shadow-sm" />
              ) : (
                <Target className="w-16 h-16 text-red-500 dark:text-red-400 drop-shadow-sm" />
              )}
            </div>
            {passed && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -bottom-2 -right-2 bg-yellow-400 text-white p-2 rounded-full shadow-lg border-4 border-white dark:border-slate-900"
              >
                <Star className="w-6 h-6 fill-white" />
              </motion.div>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              {passed ? (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400">
                  Outstanding Performance!
                </span>
              ) : (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 dark:from-red-400 dark:to-orange-400">
                  Keep Pushing Forward
                </span>
              )}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              {passed
                ? "You've successfully mastered this section. Your dedication is paying off with excellent results."
                : "Don't be discouraged. Review the questions you missed, use the practice mode, and come back stronger."}
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12"
          >
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center">
              <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                <Award className="w-3 h-3" /> Score
              </span>
              <span className="text-3xl font-black text-slate-800 dark:text-white">
                {score} <span className="text-base text-slate-400 font-bold">/ {total}</span>
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center">
              <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                <Target className="w-3 h-3" /> Accuracy
              </span>
              <span className={`text-3xl font-black ${passed ? 'text-emerald-500' : 'text-red-500'}`}>
                {percentage}%
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center">
              <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                <Award className="w-3 h-3" /> Status
              </span>
              <span className={`text-2xl font-black px-3 py-1 rounded-lg ${passed ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                {passed ? 'PASSED' : 'FAILED'}
              </span>
            </div>
          </motion.div>

          {questions && userAnswers && (score < total || Object.keys(flagged || {}).length > 0) && (
            <motion.div variants={itemVariants} className="mb-8 flex justify-center">
              <button
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold hover:text-amber-700 dark:hover:text-amber-300 transition-colors bg-amber-50 dark:bg-amber-900/20 px-6 py-3 rounded-xl border border-amber-200 dark:border-amber-800"
              >
                {showAnalysis ? 'Hide Details' : 'Review Wrong & Flagged'}
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showAnalysis ? 'rotate-180' : ''}`} />
              </button>
            </motion.div>
          )}

          <AnimatePresence>
            {showAnalysis && questions && userAnswers && (
              <WrongAnswerAnalysis questions={questions} userAnswers={userAnswers} flagged={flagged} />
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <button
              onClick={onHome}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-4 px-8 rounded-xl font-bold shadow-xl shadow-amber-500/20 hover:shadow-2xl hover:shadow-amber-500/30 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 group"
            >
              <RotateCcw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
              Return to Dashboard
            </button>
            {/* <button
              onClick={() => window.print()}
              className="flex-1 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white py-4 px-8 rounded-xl font-bold border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              Start New Exam
              <ExternalLink className="w-4 h-4" />
            </button> */}
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-4">
              <span>ID: <span className="font-mono text-slate-500 dark:text-slate-300">{resultID}</span></span>
              <span>•</span>
              <span>{date}</span>
            </p>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
