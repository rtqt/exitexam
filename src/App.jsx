import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Trophy,
  ListChecks,
  Settings,
  Brain,
  Loader2,
  GraduationCap,
  Target,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { QuestionProvider, useQuestions } from './context/QuestionContext';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import { extractQuestionsFromText, explainQuestionGemini, getGeminiModels } from './services/gemini';
import { extractTextFromPDF } from './services/pdf';
import { parseQuestionsRegex } from './services/regexParser';
import { explainQuestionGroq, extractQuestionsGroq, getGroqModels } from './services/groq';

function ExamApp() {
  const { questions } = useQuestions();
  const [view, setView] = useState('home'); // home, quiz, results, admin
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(180 * 60); // 3 hours in seconds
  const [isExamMode, setIsExamMode] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('All');

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' ||
        (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // AI Explanation State
  const [explanation, setExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [explainError, setExplainError] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [aiProvider, setAiProvider] = useState(localStorage.getItem('preferred_ai_provider') || 'groq');
  const [geminiModel, setGeminiModel] = useState(localStorage.getItem('gemini_model') || 'gemini-2.5-flash');
  const [groqModel, setGroqModel] = useState(localStorage.getItem('groq_model') || 'llama-3.3-70b-versatile');
  const [availableModels, setAvailableModels] = useState([]);
  const [checkingModels, setCheckingModels] = useState(false);

  // Filtered questions based on theme
  const filteredQuestions = useMemo(() => {
    if (selectedTheme === 'All') return questions;
    return questions.filter(q => q.theme === selectedTheme);
  }, [selectedTheme, questions]);

  const themes = ['All', ...new Set(questions.map(q => q.theme))];

  // Dark Mode Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    let timer;
    if (view === 'quiz' && isExamMode && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleFinish();
    }
    return () => clearInterval(timer);
  }, [view, isExamMode, timeLeft]);

  const handleStart = (mode) => {
    setIsExamMode(mode === 'exam');
    setUserAnswers({});
    setCurrentIdx(0);
    setTimeLeft(180 * 60);
    setView('quiz');
    setExplanation(''); // Reset explanation on start
    setExplainError('');
  };

  const handleAnswer = (optionIdx) => {
    setUserAnswers({ ...userAnswers, [currentIdx]: optionIdx });
  };

  const handleFinish = () => {
    setView('results');
  };

  const calculateScore = () => {
    let score = 0;
    filteredQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) score++;
    });
    return score;
  };

  const score = calculateScore();
  const percentage = Math.round((score && filteredQuestions.length ? (score / filteredQuestions.length) : 0) * 100);
  const passed = percentage >= 50;




  const handleExplain = async (question, options, answerIdx) => {
    const providerKeyName = aiProvider === 'gemini' ? 'gemini_api_key' : 'groq_api_key';
    const savedKey = localStorage.getItem(providerKeyName);

    if (!savedKey) {
      setShowApiKeyModal(true);
      return;
    }

    setIsExplaining(true);
    setExplanation('');
    setExplainError('');

    try {
      let result;
      if (aiProvider === 'gemini') {
        result = await explainQuestionGemini(savedKey, question, options, answerIdx, geminiModel);
      } else {
        result = await explainQuestionGroq(savedKey, question, options, answerIdx, groqModel);
      }
      setExplanation(result);
    } catch (err) {
      setExplainError(err.message);
      if (err.message.includes("401") || err.message.includes("Permission denied") || err.message.includes("API Key")) {
        localStorage.removeItem(providerKeyName);
        setShowApiKeyModal(true); // Re-prompt if key is invalid
      }
    } finally {
      setIsExplaining(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Main Render Logic
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900">

      {view !== 'admin' && (
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onAdminClick={() => setView('admin')}
          goHome={() => setView('home')}
        />
      )}

      {view === 'admin' ? (
        <AdminDashboard onExit={() => setView('home')} />
      ) : view === 'home' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Model Exit Exam IV Now Available</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
              Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Exit Exam</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Comprehensive preparation with real-time feedback, AI-powered explanations, and simulated exam environments for Informatics students.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            <button
              onClick={() => handleStart('practice')}
              className="group relative overflow-hidden bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all duration-300 text-left"
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
              onClick={() => handleStart('exam')}
              className="group relative overflow-hidden bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:border-red-500/50 dark:hover:border-red-400/50 transition-all duration-300 text-left"
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
          </div>

          {/* Stats / Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
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
          </div>

          {/* Filter Section */}
          <div className="mt-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Focus Your Study
              </h3>
              <span className="text-sm text-slate-500 dark:text-slate-400">Select a topic to filter questions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {themes.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTheme(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedTheme === t
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </main>
      ) : view === 'quiz' ? (
        <div className="flex flex-col items-center p-4 md:p-8">
          {filteredQuestions.length === 0 ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
              <p className="mb-4">No questions found for this category.</p>
              <button onClick={() => setView('home')} className="text-blue-600 dark:text-blue-400 hover:underline">Go Back Home</button>
            </div>
          ) : (
            <div className="max-w-3xl w-full flex flex-col gap-6">
              {/* Quiz Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-20 z-10 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm p-2 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg font-mono font-bold text-blue-600 dark:text-blue-400">
                    Q{currentIdx + 1}
                    <span className="text-slate-400 mx-2">/</span>
                    {filteredQuestions.length}
                  </div>
                  <span className="hidden md:inline-block px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wide">
                    {filteredQuestions[currentIdx].theme}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {isExamMode && (
                    <div className={`flex items-center gap-2 font-mono text-lg font-bold px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${timeLeft < 300 ? 'text-red-500 animate-pulse border-red-200' : 'text-slate-700 dark:text-slate-200'}`}>
                      <Clock className="w-5 h-5" />
                      {formatTime(timeLeft)}
                    </div>
                  )}
                  <button
                    onClick={() => { if (window.confirm('Quit exam? Progress will be lost.')) setView('home') }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Quit Exam"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Progress */}
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / filteredQuestions.length) * 100}%` }}
                  ></div>
                </div>

                <div className="p-6 md:p-8">
                  <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white leading-relaxed mb-8">
                    {filteredQuestions[currentIdx].question}
                  </h2>

                  <div className="grid gap-3">
                    {filteredQuestions[currentIdx].options.map((option, i) => {
                      const q = filteredQuestions[currentIdx];
                      const isAnswered = userAnswers[currentIdx] !== undefined;
                      let statusStyles = "border-slate-200 dark:border-slate-700 hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-700/50";
                      let icon = null;

                      if (isAnswered) {
                        const isCorrect = i === q.answer;
                        const isSelected = userAnswers[currentIdx] === i;

                        if (isSelected) {
                          statusStyles = isCorrect
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500"
                            : "border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-500";
                          icon = isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />;
                        } else if (isCorrect && !isExamMode) {
                          statusStyles = "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10";
                        } else {
                          statusStyles = "opacity-50 pointer-events-none grayscale";
                        }
                      }

                      return (
                        <button
                          key={i}
                          disabled={isAnswered}
                          onClick={() => handleAnswer(i)}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left w-full ${statusStyles}`}
                        >
                          <div className="flex items-center gap-4">
                            <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm ${userAnswers[currentIdx] === i
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                              }`}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">{option}</span>
                          </div>
                          {icon}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* AI Explanation Section */}
                {!isExamMode && userAnswers[currentIdx] !== undefined && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-t border-slate-100 dark:border-slate-700">
                    {!explanation && !isExplaining && (
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleExplain(filteredQuestions[currentIdx].question, filteredQuestions[currentIdx].options, filteredQuestions[currentIdx].answer)}
                          className="flex-1 flex items-center justify-center gap-2 text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 px-6 py-3 rounded-xl font-bold transition-all"
                        >
                          <Brain className="w-5 h-5" />
                          Why is this correct? (Ask AI)
                        </button>
                        <button
                          onClick={() => setShowApiKeyModal(true)}
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
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-purple-100 dark:border-purple-900/50 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                        <h3 className="flex items-center gap-2 font-bold text-purple-800 dark:text-purple-300 mb-3">
                          <Brain className="w-5 h-5" />
                          AI Explanation
                        </h3>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {explanation}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Bar */}
              <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => {
                    setCurrentIdx(currentIdx - 1);
                    setExplanation('');
                    setExplainError('');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                <div className="text-sm font-medium text-slate-400 hidden sm:block">
                  Use Arrow Keys ◀ ▶
                </div>

                {currentIdx === filteredQuestions.length - 1 ? (
                  <button
                    disabled={userAnswers[currentIdx] === undefined}
                    onClick={handleFinish}
                    className="bg-emerald-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:shadow-none"
                  >
                    Finish Exam
                  </button>
                ) : (
                  <button
                    disabled={userAnswers[currentIdx] === undefined}
                    onClick={() => {
                      setCurrentIdx(currentIdx + 1);
                      setExplanation('');
                      setExplainError('');
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:shadow-none"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Quick Nav Grid */}
              <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-20 gap-2 p-4">
                {filteredQuestions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentIdx(i);
                      setExplanation('');
                      setExplainError('');
                    }}
                    className={`aspect-square flex items-center justify-center text-xs rounded-md transition-all ${currentIdx === i
                      ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-300 ring-offset-2 dark:ring-offset-slate-900'
                      : userAnswers[i] !== undefined
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : ( // Results View
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ring-4 ring-offset-4 ring-offset-white dark:ring-offset-slate-800 ${passed ? 'bg-emerald-100 dark:bg-emerald-900/30 ring-emerald-500' : 'bg-red-100 dark:bg-red-900/30 ring-red-500'}`}>
              <Trophy className={`w-12 h-12 ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>

            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">
              {passed ? 'Outstanding Job!' : 'Keep Pushing!'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {passed
                ? "You have demonstrated excellent knowledge in this domain. You are ready for the next challenge."
                : "Don't give up. Review your answers, use the practice mode, and try again."}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Score</span>
                <span className="text-4xl font-black text-slate-800 dark:text-white">{score} <span className="text-lg text-slate-400 font-medium">/ {filteredQuestions.length}</span></span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Accuracy</span>
                <span className={`text-4xl font-black ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {percentage}%
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setView('home')}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Back to Dashboard
              </button>
              <div className="text-xs text-slate-400 mt-4">
                Result ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} • {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div >
      )}

      {/* Re-use existing API Key Modal Logic but style it for dark mode support */}
      {
        showApiKeyModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">AI Tutor Settings</h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Provider</label>
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
                  <button
                    onClick={() => setAiProvider('groq')}
                    className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${aiProvider === 'groq'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                  >
                    Groq (Fast)
                  </button>
                  <button
                    onClick={() => setAiProvider('gemini')}
                    className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${aiProvider === 'gemini'
                      ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                  >
                    Gemini (Smart)
                  </button>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm flex justify-between items-center">
                <span>
                  {aiProvider === 'groq'
                    ? "Enter your Groq API Key (starts with gsk_)."
                    : "Enter your Google Gemini API Key."}
                </span>
                <a
                  href={aiProvider === 'groq' ? "https://console.groq.com/keys" : "https://aistudio.google.com/app/apikey"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Get Your Key Here &rarr;
                </a>
              </p>

              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder={aiProvider === 'groq' ? "gsk_..." : "Gemini Key..."}
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm"
                autoFocus
              />

              <div className="flex justify-between items-center mt-2">
                <button
                  onClick={async () => {
                    setCheckingModels(true);
                    setAvailableModels([]);
                    try {
                      const key = tempApiKey || (aiProvider === 'gemini' ? localStorage.getItem('gemini_api_key') : localStorage.getItem('groq_api_key'));
                      let models;
                      if (aiProvider === 'gemini') {
                        models = await getGeminiModels(key);
                        setAvailableModels(models.map(m => m.name.replace('models/', '')));
                      } else {
                        models = await getGroqModels(key);
                        setAvailableModels(models.map(m => m.id));
                      }
                    } catch (err) {
                      alert("Error fetching models: " + err.message);
                    } finally {
                      setCheckingModels(false);
                    }
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 underline"
                >
                  {checkingModels ? "Fetching..." : "List Available Models"}
                </button>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowApiKeyModal(false)}
                    className="px-4 py-2 text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!tempApiKey.trim()}
                    onClick={() => {
                      const keyName = aiProvider === 'gemini' ? 'gemini_api_key' : 'groq_api_key';
                      localStorage.setItem(keyName, tempApiKey.trim());
                      localStorage.setItem('preferred_ai_provider', aiProvider);
                      setShowApiKeyModal(false);
                      setTempApiKey('');
                      alert(`${aiProvider === 'groq' ? 'Groq' : 'Gemini'} Key saved!`);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Save Key
                  </button>
                </div>
              </div>

              {availableModels.length > 0 && (
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 max-h-32 overflow-y-auto text-xs font-mono text-slate-600 dark:text-slate-300">
                  <strong>Available for your key:</strong>
                  <ul className="list-disc pl-4 mt-1">
                    {availableModels.map(m => <li key={m}>{m}</li>)}
                  </ul>
                </div>
              )}

              <div className="mt-4 border-t border-slate-100 dark:border-slate-700 pt-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Model</label>
                <select
                  value={aiProvider === 'gemini' ? geminiModel : groqModel}
                  onChange={(e) => {
                    if (aiProvider === 'gemini') {
                      setGeminiModel(e.target.value);
                      localStorage.setItem('gemini_model', e.target.value);
                    } else {
                      setGroqModel(e.target.value);
                      localStorage.setItem('groq_model', e.target.value);
                    }
                  }}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {aiProvider === 'gemini' ? (
                    <>
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                      <option value="gemini-3-pro-preview">Gemini 3 Pro Preview</option>
                      <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Experimental)</option>
                    </>
                  ) : (
                    <>
                      <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Versatile)</option>
                      <option value="llama-3.1-70b-versatile">Llama 3.1 70B</option>
                      <option value="llama3-70b-8192">Llama 3 70B</option>
                      <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

export default function App() {
  return (
    <QuestionProvider>
      <ExamApp />
    </QuestionProvider>
  );
}