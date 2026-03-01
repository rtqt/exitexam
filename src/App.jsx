import React, { useState, useEffect } from 'react';
import { QuestionProvider, useQuestions } from './context/QuestionContext';
import { AlertProvider, useAlert } from './context/AlertContext';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import { explainQuestionGemini } from './services/gemini';
import { explainQuestionGroq } from './services/groq';
import { AnimatePresence } from 'framer-motion';

// Views
import HomeView from './components/views/HomeView';
import QuizView from './components/views/QuizView';
import ResultsView from './components/views/ResultsView';

// Hooks & UI Components
import useExamState from './hooks/useExamState';
import useExamTimer from './hooks/useExamTimer';
import FinishExamModal from './components/ui/FinishExamModal';
import AISettingsModal from './components/ui/AISettingsModal';

function ExamApp() {
  const { questions } = useQuestions();
  const { showAlert, showConfirm } = useAlert();
  const [view, setView] = useState('home'); // home, quiz, results, admin
  const [showFinishModal, setShowFinishModal] = useState(false);

  const {
    currentIdx,
    setCurrentIdx,
    userAnswers,
    setUserAnswers,
    flagged,
    setFlagged,
    isExamMode,
    setIsExamMode,
    examCompleted,
    setExamCompleted,
    selectedThemes,
    setSelectedThemes,
    filteredQuestions,
    themes,
    toggleFlag,
    handleAnswer,
    toggleTheme,
    resetExamState
  } = useExamState(questions);

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
  const [aiProvider, setAiProvider] = useState(localStorage.getItem('preferred_ai_provider') || 'groq');
  const [geminiModel, setGeminiModel] = useState(localStorage.getItem('gemini_model') || 'gemini-2.5-flash');
  const [groqModel, setGroqModel] = useState(localStorage.getItem('groq_model') || 'llama-3.3-70b-versatile');

  const confirmFinish = () => {
    if (!isExamMode) {
      localStorage.removeItem('practiceState');
      localStorage.removeItem('exit-exam-flagged');
      setFlagged({});
    }
    setExamCompleted(true);
    setShowFinishModal(false);
    setView('results');
  };

  const handleFinish = () => {
    if (!isExamMode) {
      confirmFinish();
      return;
    }
    setShowFinishModal(true);
  };

  const { timeLeft, setTimeLeft, formatTime } = useExamTimer({
    isExamMode,
    view,
    onFinish: handleFinish
  });

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

  const handleStart = async (mode) => {
    if (mode === 'practice') {
      const savedStateStr = localStorage.getItem('practiceState');
      if (savedStateStr) {
        try {
          const savedState = JSON.parse(savedStateStr);
          const confirmed = await showConfirm('Resume previous practice session?');
          if (confirmed) {
            setIsExamMode(false);
            setCurrentIdx(savedState.currentIdx || 0);
            const savedAnswers = savedState.userAnswers || {};
            if (savedAnswers && Object.keys(savedAnswers).length > 0) {
              const migrated = {};
              Object.keys(savedAnswers).forEach(k => {
                const idx = Number(k);
                if (!Number.isNaN(idx) && questions[idx]) {
                  migrated[questions[idx].id] = savedAnswers[k];
                }
              });
              setUserAnswers(Object.keys(migrated).length ? migrated : savedAnswers);
            } else {
              setUserAnswers({});
            }
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
      localStorage.removeItem('practiceState');
      localStorage.removeItem('exit-exam-flagged');
    }

    resetExamState(mode);
    setTimeLeft(180 * 60);
    setView('quiz');
    setExplanation('');
    setExplainError('');
  };

  const cancelFinish = () => setShowFinishModal(false);

  const calculateScore = () => {
    let score = 0;
    filteredQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.answer) score++;
    });
    return score;
  };

  const score = calculateScore();
  const percentage = Math.round((score && filteredQuestions.length ? (score / filteredQuestions.length) : 0) * 100);
  const passed = percentage >= 50;

  const handleExplain = async (question, options, answerIdx) => {
    if (isExamMode) {
      showAlert('AI explanations are disabled in exam mode.', 'warning');
      return;
    }
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

  // Main Render Logic
  return (
    <div className="min-h-screen bg-amber-50 dark:bg-stone-950 transition-colors duration-300 font-sans text-stone-900 dark:text-amber-50 selection:bg-amber-400/30 dark:selection:bg-amber-400/30">

      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-300/10 blur-[120px] dark:bg-amber-600/10"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-400/10 blur-[120px] dark:bg-yellow-600/10"></div>
      </div>

      <FinishExamModal
        showFinishModal={showFinishModal}
        cancelFinish={() => setShowFinishModal(false)}
        confirmFinish={confirmFinish}
        flagged={flagged}
        filteredQuestions={filteredQuestions}
        userAnswers={userAnswers}
      />

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
              goAdmin={() => setView('admin')}
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
                  examCompleted={examCompleted}
                  flagged={flagged}
                  onToggleFlag={toggleFlag}
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
                  onQuit={async () => {
                    const confirmed = await showConfirm('Quit exam? Progress will be lost.');
                    if (confirmed) {
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
              questions={filteredQuestions}
              userAnswers={userAnswers}
              flagged={flagged}
              onHome={() => setView('home')}
            />
          )}
        </AnimatePresence>
      </div>

      <AISettingsModal
        showApiKeyModal={showApiKeyModal}
        setShowApiKeyModal={setShowApiKeyModal}
        aiProvider={aiProvider}
        setAiProvider={setAiProvider}
        geminiModel={geminiModel}
        setGeminiModel={setGeminiModel}
        groqModel={groqModel}
        setGroqModel={setGroqModel}
      />
    </div>
  );
}

export default function App() {
  return (
    <AlertProvider>
      <QuestionProvider>
        <ExamApp />
      </QuestionProvider>
    </AlertProvider>
  );
}