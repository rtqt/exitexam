import React from 'react';
import { Sparkles, ListChecks, ArrowRight, Clock, Target, BookOpen, Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomeView({ onStart, themes, selectedThemes, toggleTheme, questions }) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="text-center mb-20 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/60 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-sm font-semibold mb-4 border border-amber-200 dark:border-amber-800 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Exit Exam Preparation Platform</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-sans font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 drop-shadow-sm">
          Master Your <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-700 dark:from-amber-300 dark:via-yellow-400 dark:to-amber-500">Informatics Exam</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Elevate your readiness with AI-powered tutoring, real-time feedback, and comprehensive exam simulations tailored for succcess.
        </p>
      </motion.div>

      {/* Feature Cards */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
        <button
          onClick={() => onStart('practice')}
          className="group relative overflow-hidden bg-white/60 dark:bg-stone-900/60 p-8 rounded-3xl border border-white/40 dark:border-stone-700/50 hover:shadow-2xl hover:border-amber-500/30 dark:hover:border-amber-400/30 transition-all duration-300 text-left shadow-lg backdrop-blur-md"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ListChecks className="w-48 h-48 transform translate-x-10 -translate-y-10 rotate-12 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <Zap className="w-8 h-8 text-amber-600 dark:text-amber-400 fill-current" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-amber-50 mb-3">Practice Mode</h3>
            <p className="text-stone-600 dark:text-stone-400 mb-8 text-lg leading-relaxed">
              Learn efficiently with instant AI explanations, correct/incorrect feedback, and unlimited time to understand every concept.
            </p>
            <div className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-lg group-hover:gap-4 transition-all">
              Start Practice <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </button>

        <button
          onClick={() => onStart('exam')}
          className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 p-8 rounded-3xl border border-white/40 dark:border-slate-700/50 hover:shadow-2xl hover:border-red-500/30 dark:hover:border-red-400/30 transition-all duration-300 text-left shadow-lg backdrop-blur-md"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock className="w-48 h-48 transform translate-x-10 -translate-y-10 -rotate-12 text-red-600 dark:text-red-400" />
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <Trophy className="w-8 h-8 text-red-600 dark:text-red-400 fill-current" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Exam Mode</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg leading-relaxed">
              Simulate the pressure of the real exam with a strict 3-hour timer, no hints, and a comprehensive performance review at the end.
            </p>
            <div className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-lg group-hover:gap-4 transition-all">
              Start Simulation <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </button>
      </motion.div>

      {/* Stats / Info */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center max-w-6xl mx-auto mb-16">
        {[
          { label: 'Questions', value: questions.length, icon: BookOpen, color: 'text-amber-600' },
          { label: 'Time Limit', value: '3h', icon: Clock, color: 'text-yellow-600' },
          { label: 'Topics', value: themes.length - 1, icon: Target, color: 'text-amber-700' },
          { label: 'AI Tutor', value: 'Active', icon: Sparkles, color: 'text-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 shadow-sm backdrop-blur-sm hover:-translate-y-1 transition-transform cursor-default">
            <stat.icon className={`w-6 h-6 mx-auto mb-3 ${stat.color}`} />
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{stat.value}</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Filter Section */}
      <motion.div variants={itemVariants} className="mt-16 bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/50 rounded-3xl p-8 shadow-sm backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold text-stone-800 dark:text-amber-100 flex items-center gap-2">
            <Target className="w-6 h-6 text-amber-500" />
            Focus Your Study
          </h3>
          <span className="text-sm font-medium text-stone-500 dark:text-stone-400">Select topics to practice specifically</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {themes.map(t => {
            const isSelected = t === 'All' ? selectedThemes.length === 0 : selectedThemes.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleTheme(t)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${isSelected
                  ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/25 scale-105'
                  : 'bg-white dark:bg-stone-900/50 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-amber-50 dark:hover:bg-stone-800 hover:border-amber-300 dark:hover:border-stone-600'
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
