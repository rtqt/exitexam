import React from 'react';
import { Sparkles, ListChecks, ArrowRight, Clock, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomeView({ onStart, themes, selectedThemes, toggleTheme, questions }) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4" />
          <span>Model Exit Exam IV Now Available</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-6">
          Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Exit Exam</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Comprehensive preparation with real-time feedback, AI-powered explanations, and simulated exam environments for Informatics students.
        </p>
      </motion.div>

      {/* Feature Cards */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        <button
          onClick={() => onStart('practice')}
          className="group relative overflow-hidden bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all duration-300 text-left shadow-sm"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ListChecks className="w-32 h-32 transform rotate-12 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <ListChecks className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Practice Mode</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Learn at your own pace with instant correct/incorrect feedback and detailed AI explanations.
            </p>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform">
              Start Practice <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </button>

        <button
          onClick={() => onStart('exam')}
          className="group relative overflow-hidden bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-red-500/50 dark:hover:border-red-400/50 transition-all duration-300 text-left shadow-sm"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-32 h-32 transform -rotate-12 text-red-600 dark:text-red-400" />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Exam Mode</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Simulate the real exam experience with a 3-hour timer, no immediate answers, and final grading.
            </p>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold group-hover:translate-x-2 transition-transform">
              Start Exam <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </button>
      </motion.div>

      {/* Stats / Info */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{questions.length}</div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Questions</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">3h</div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time Limit</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{themes.length - 1}</div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Topics</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">AI</div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tutor Support</div>
        </div>
      </motion.div>

      {/* Filter Section */}
      <motion.div variants={itemVariants} className="mt-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Focus Your Study
          </h3>
          <span className="text-sm text-gray-500 dark:text-slate-400">Select one or more topics to filter questions</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {themes.map(t => {
            const isSelected = t === 'All' ? selectedThemes.length === 0 : selectedThemes.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleTheme(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${isSelected
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                  }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.main>
  );
}
