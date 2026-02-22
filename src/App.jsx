import React, { useState, useEffect, useMemo } from 'react';
import { QuestionProvider, useQuestions } from './context/QuestionContext';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import { explainQuestionGemini, getGeminiModels } from './services/gemini';
import { explainQuestionGroq, getGroqModels } from './services/groq';
import { AnimatePresence } from 'framer-motion';

// Views
import HomeView from './components/views/HomeView';
import QuizView from './components/views/QuizView';
import ResultsView from './components/views/ResultsView';

function ExamApp() {
  const { questions } = useQuestions();
  const [view, setView] = useState('home'); // home, quiz, results, admin
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(180 * 60); // 3 hours in seconds
  const [isExamMode, setIsExamMode] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState([]);

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

  // Filtered questions based on themes
  const filteredQuestions = useMemo(() => {
    if (selectedThemes.length === 0 || selectedThemes.includes('All')) return questions;
    return questions.filter(q => selectedThemes.includes(q.theme));
  }, [selectedThemes, questions]);

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

  // Practice State Persistence
  useEffect(() => {
    if (view === 'quiz' && !isExamMode) {
      const practiceState = {
        currentIdx,
        userAnswers,
        selectedThemes
      };
      localStorage.setItem('practiceState', JSON.stringify(practiceState));
    }
  }, [currentIdx, userAnswers, selectedThemes, view, isExamMode]);

  const handleStart = (mode) => {
    if (mode === 'practice') {
      const savedStateStr = localStorage.getItem('practiceState');
      if (savedStateStr) {
        try {
          const savedState = JSON.parse(savedStateStr);
          if (window.confirm('Resume previous practice session?')) {
            setIsExamMode(false);
            setCurrentIdx(savedState.currentIdx || 0);
            setUserAnswers(savedState.userAnswers || {});
            if (savedState.selectedThemes) {
              setSelectedThemes(savedState.selectedThemes);
            }
            setTimeLeft(180 * 60);
            setView('quiz');
            setExplanation('');
            setExplainError('');
            return;
          } else {
            localStorage.removeItem('practiceState');
          }
        } catch (e) {
          console.error("Failed to parse practice state", e);
          localStorage.removeItem('practiceState');
        }
      }
    } else {
      // Starting exam mode, clear any practice state just in case
      localStorage.removeItem('practiceState');
    }

    setIsExamMode(mode === 'exam');
    setUserAnswers({});
    setCurrentIdx(0);
    setTimeLeft(180 * 60);
    setView('quiz');
    setExplanation('');
    setExplainError('');
  };

  const handleAnswer = (optionIdx) => {
    setUserAnswers({ ...userAnswers, [currentIdx]: optionIdx });
  };

  const handleFinish = () => {
    if (!isExamMode) {
      localStorage.removeItem('practiceState');
    }
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

  const toggleTheme = (theme) => {
    if (theme === 'All') {
      setSelectedThemes([]);
      return;
    }
    setSelectedThemes(prev => {
      if (prev.includes(theme)) {
        return prev.filter(t => t !== theme);
      }
      return [...prev, theme];
    });
  };

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
        setShowApiKeyModal(true);
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
    <div className="min-h-screen bg-amber-50 dark:bg-stone-950 transition-colors duration-300 font-sans text-stone-900 dark:text-amber-50 selection:bg-amber-400/30 dark:selection:bg-amber-400/30">

      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-300/10 blur-[120px] dark:bg-amber-600/10"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-400/10 blur-[120px] dark:bg-yellow-600/10"></div>
      </div>

      {view !== 'admin' && (
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onAdminClick={() => setView('admin')}
          goHome={() => setView('home')}
        />
      )}

      {/* Main Content Area with AnimatePresence for transitions */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {view === 'admin' ? (
            // AdminDashboard doesn't have animations yet, but wrapped logically
            <AdminDashboard key="admin" onExit={() => setView('home')} />
          ) : view === 'home' ? (
            <HomeView
              key="home"
              onStart={handleStart}
              themes={themes}
              selectedThemes={selectedThemes}
              toggleTheme={toggleTheme}
              questions={questions}
            />
          ) : view === 'quiz' ? (
            <div key="quiz" className="h-[calc(100vh-80px)] overflow-hidden">
              {filteredQuestions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-500 dark:text-slate-400 h-full">
                  <p className="mb-4">No questions found for this category.</p>
                  <button onClick={() => setView('home')} className="text-blue-600 dark:text-blue-400 hover:underline">Go Back Home</button>
                </div>
              ) : (
                <QuizView
                  questions={filteredQuestions}
                  currentIdx={currentIdx}
                  userAnswers={userAnswers}
                  timeLeft={timeLeft}
                  isExamMode={isExamMode}
                  formatTime={formatTime}
                  onJump={(idx) => {
                    setCurrentIdx(idx);
                    setExplanation('');
                    setExplainError('');
                  }}
                  onAnswer={handleAnswer}
                  onNext={() => {
                    setCurrentIdx(currentIdx + 1);
                    setExplanation('');
                    setExplainError('');
                  }}
                  onPrev={() => {
                    setCurrentIdx(currentIdx - 1);
                    setExplanation('');
                    setExplainError('');
                  }}
                  onFinish={handleFinish}
                  onQuit={() => {
                    if (window.confirm('Quit exam? Progress will be lost.')) {
                      localStorage.removeItem('practiceState');
                      setView('home');
                    }
                  }}

                  explanation={explanation}
                  isExplaining={isExplaining}
                  explainError={explainError}
                  onAskAI={handleExplain}
                  onOpenSettings={() => setShowApiKeyModal(true)}
                />
              )}
            </div>
          ) : ( // Results View
            <ResultsView
              key="results"
              score={score}
              total={filteredQuestions.length}
              passed={passed}
              percentage={percentage}
              onHome={() => setView('home')}
            />
          )}
        </AnimatePresence>
      </div>

      {/* API Key Modal - Overlay */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 animate-fadeIn">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">AI Tutor Settings</h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Provider</label>
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setAiProvider('groq')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${aiProvider === 'groq'
                    ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-white shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                    }`}
                >
                  Groq (Fast)
                </button>
                <button
                  onClick={() => setAiProvider('gemini')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${aiProvider === 'gemini'
                    ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-white shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
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
              className="w-full p-3 border border-amber-200 dark:border-stone-700 rounded-xl mb-4 focus:ring-2 focus:ring-amber-400 outline-none bg-amber-50/50 dark:bg-stone-800 text-stone-900 dark:text-white font-mono text-sm"
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
                className="text-xs text-amber-600 dark:text-amber-400 underline hover:text-amber-800 dark:hover:text-amber-300"
              >
                {checkingModels ? "Fetching..." : "List Available Models"}
              </button>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="px-4 py-2 text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
                  className="px-4 py-2 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 shadow-lg shadow-amber-500/20"
                >
                  Save Key
                </button>
              </div>
            </div>

            {availableModels.length > 0 && (
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 max-h-32 overflow-y-auto text-xs font-mono text-slate-600 dark:text-slate-300">
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
                className="w-full p-2.5 rounded-lg border border-amber-200 dark:border-stone-600 bg-amber-50/50 dark:bg-stone-800 text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-400 outline-none"
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
      )}
    </div>
  );
}

export default function App() {
  return (
    <QuestionProvider>
      <ExamApp />
    </QuestionProvider>
  );
}