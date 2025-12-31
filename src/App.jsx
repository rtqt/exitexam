
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
  Loader2
} from 'lucide-react';
import { QuestionProvider, useQuestions } from './context/QuestionContext';
import AdminDashboard from './components/AdminDashboard'; // Assuming we created this
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

  // AI Explanation State
  const [explanation, setExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [explainError, setExplainError] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [aiProvider, setAiProvider] = useState(localStorage.getItem('preferred_ai_provider') || 'groq');
  const [geminiModel, setGeminiModel] = useState(localStorage.getItem('gemini_model') || 'gemini-1.5-flash');
  const [groqModel, setGroqModel] = useState(localStorage.getItem('groq_model') || 'llama-3.3-70b-versatile');
  const [availableModels, setAvailableModels] = useState([]);
  const [checkingModels, setCheckingModels] = useState(false);

  // Filtered questions based on theme
  const filteredQuestions = useMemo(() => {
    if (selectedTheme === 'All') return questions;
    return questions.filter(q => q.theme === selectedTheme);
  }, [selectedTheme, questions]);

  const themes = ['All', ...new Set(questions.map(q => q.theme))];

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

  if (view === 'admin') {
    return <AdminDashboard onExit={() => setView('home')} />;
  }

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200 relative">

          <button
            onClick={() => setView('admin')}
            className="absolute top-4 right-4 text-slate-300 hover:text-slate-600 transition-colors p-2"
            title="Admin Dashboard"
          >
            <Settings className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-600 p-3 rounded-xl">
              <BookOpen className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Model Exit Exam IV</h1>
              <p className="text-slate-500 italic">Admas University • Faculty of Informatics</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
              <h2 className="font-semibold text-blue-800 mb-2">Instructions</h2>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Total Questions: {questions.length} (Dynamic DB)</li>
                <li>• Time Allotted: 3:00 hours (for Exam Mode)</li>
                <li>• Practice Mode: Get instant feedback</li>
                <li>• Exam Mode: Timed, full-set evaluation</li>
              </ul>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Filter by Subject</label>
              <div className="flex flex-wrap gap-2">
                {themes.map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTheme(t)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTheme === t
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={() => handleStart('practice')}
                className="flex flex-col items-center justify-center p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <ListChecks className="w-8 h-8 text-slate-400 group-hover:text-blue-500 mb-2" />
                <span className="font-bold text-slate-700">Practice Mode</span>
                <span className="text-xs text-slate-500">No timer, instant feedback</span>
              </button>
              <button
                onClick={() => handleStart('exam')}
                className="flex flex-col items-center justify-center p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all group"
              >
                <Clock className="w-8 h-8 text-slate-400 group-hover:text-red-500 mb-2" />
                <span className="font-bold text-slate-700">Exam Mode</span>
                <span className="text-xs text-slate-500">3-hour timer, final score</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'quiz') {
    if (filteredQuestions.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center text-slate-500">
          No questions found for this category.
          <button onClick={() => setView('home')} className="ml-4 text-blue-600 underline">Go Back</button>
        </div>
      )
    }

    const q = filteredQuestions[currentIdx];
    const isLast = currentIdx === filteredQuestions.length - 1;
    const isAnswered = userAnswers[currentIdx] !== undefined;

    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center">
        <div className="max-w-3xl w-full flex flex-col gap-4">

          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex justify-between items-center sticky top-4 z-10">
            <div className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-lg">
                {currentIdx + 1} / {filteredQuestions.length}
              </span>
              <span className="hidden md:block text-slate-400 font-medium">{q.theme}</span>
            </div>
            {isExamMode && (
              <div className={`flex items-center gap-2 font-mono text-lg font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
                <Clock className="w-5 h-5" />
                {formatTime(timeLeft)}
              </div>
            )}
            <button
              onClick={() => { if (window.confirm('Quit exam? Progress will be lost.')) setView('home') }}
              className="text-slate-400 hover:text-red-600 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / filteredQuestions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden min-h-[400px] flex flex-col">
            <div className="p-6 md:p-10 flex-grow">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-800 leading-relaxed mb-8">
                {q.question}
              </h2>

              <div className="grid gap-3">
                {q.options.map((option, i) => {
                  let statusStyles = "border-slate-200 hover:border-blue-400 hover:bg-blue-50";
                  let icon = null;

                  if (isAnswered) {
                    const isCorrect = i === q.answer;
                    const isSelected = userAnswers[currentIdx] === i;

                    if (isSelected) {
                      statusStyles = isCorrect
                        ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20"
                        : "border-red-500 bg-red-50 ring-2 ring-red-500/20";
                      icon = isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />;
                    } else if (isCorrect && !isExamMode) {
                      statusStyles = "border-emerald-500 bg-emerald-50/50";
                    } else {
                      statusStyles = "opacity-50 border-slate-200 pointer-events-none";
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={isAnswered}
                      onClick={() => handleAnswer(i)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left group ${statusStyles}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm ${userAnswers[currentIdx] === i ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-200'
                          }`}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="font-medium text-slate-700">{option}</span>
                      </div>
                      {icon}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Explanation Section */}
            {!isExamMode && isAnswered && (
              <div className="mt-6 border-t border-slate-100 pt-6">
                {!explanation && !isExplaining && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExplain(q.question, q.options, q.answer)}
                      className="flex-1 flex items-center justify-center gap-2 text-purple-600 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg font-bold text-sm transition-all"
                    >
                      <Brain className="w-4 h-4" />
                      Why is this correct? (Ask AI)
                    </button>
                    <button
                      onClick={() => setShowApiKeyModal(true)}
                      className="flex items-center justify-center px-3 text-purple-400 bg-purple-50 hover:bg-purple-100 hover:text-purple-600 rounded-lg transition-all"
                      title="AI Settings (Change Model)"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {isExplaining && (
                  <div className="flex items-center gap-2 text-purple-600 animate-pulse font-medium text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing question...
                  </div>
                )}

                {explainError && (
                  <div className="text-red-500 text-sm mt-2">
                    Error: {explainError}
                  </div>
                )}

                {explanation && (
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mt-2">
                    <h3 className="flex items-center gap-2 font-bold text-purple-800 mb-2">
                      <Brain className="w-4 h-4" />
                      Explanation
                    </h3>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {explanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-between gap-4">
            <button
              disabled={currentIdx === 0}
              onClick={() => {
                setCurrentIdx(currentIdx - 1);
                setExplanation(''); // Reset on nav
                setExplainError('');
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            {isLast ? (
              <button
                disabled={!isAnswered}
                onClick={handleFinish}
                className="bg-emerald-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
              >
                Submit Final Exam
              </button>
            ) : (
              <button
                disabled={!isAnswered}
                onClick={() => {
                  setCurrentIdx(currentIdx + 1);
                  setExplanation(''); // Reset on nav
                  setExplainError('');
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Nav */}
        <div className="flex flex-wrap gap-1 justify-center py-4">
          {filteredQuestions.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentIdx(i);
                setExplanation('');
                setExplainError('');
              }}
              className={`w-8 h-8 text-[10px] rounded-md border transition-all ${currentIdx === i ? 'border-blue-600 ring-2 ring-blue-100 font-bold' :
                userAnswers[i] !== undefined ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-white text-slate-400'
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* API Key Modal */}
        {/* API Key Modal */}
        {showApiKeyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">AI Assistant Settings</h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Provider</label>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                  <button
                    onClick={() => setAiProvider('groq')}
                    className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${aiProvider === 'groq' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    Groq (Llama 3)
                  </button>
                  <button
                    onClick={() => setAiProvider('gemini')}
                    className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${aiProvider === 'gemini' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    Google Gemini
                  </button>
                </div>
              </div>

              <p className="text-slate-600 mb-4 text-sm">
                {aiProvider === 'groq'
                  ? "Enter your Groq API Key (starts with gsk_)."
                  : "Enter your Google Gemini API Key."}
              </p>

              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder={aiProvider === 'groq' ? "gsk_..." : "Gemini Key..."}
                className="w-full p-3 border border-slate-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
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
                  className="text-xs text-blue-600 underline"
                >
                  {checkingModels ? "Fetching..." : "List Available Models"}
                </button>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowApiKeyModal(false)}
                    className="px-4 py-2 text-slate-500 font-medium hover:bg-slate-100 rounded-lg transition-colors"
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
                <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-200 max-h-32 overflow-y-auto text-xs font-mono">
                  <strong>Available for your key:</strong>
                  <ul className="list-disc pl-4 mt-1">
                    {availableModels.map(m => <li key={m}>{m}</li>)}
                  </ul>
                </div>
              )}

              {/* Model Selection */}
              <div className="mt-4 border-t border-slate-100 pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Model</label>
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
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {aiProvider === 'gemini' ? (
                    <>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                      <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Experimental)</option>
                      <option value="gemini-exp-1206">Gemini Experimental 1206</option>
                      <option value="gemini-3-preview">Gemini 3 Preview (User)</option>
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

              <p className="text-xs text-slate-400 mt-4 text-center">
                {aiProvider === 'groq'
                  ? <span>Get a key at <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-blue-500 underline">console.groq.com</a></span>
                  : <span>Get a key at <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-purple-500 underline">aistudio.google.com</a></span>
                }
              </p>
            </div>
          </div>
        )
        }
      </div >

    );
  }

  if (view === 'results') {
    const score = calculateScore();
    const percentage = Math.round((score && filteredQuestions.length ? (score / filteredQuestions.length) : 0) * 100);
    const passed = percentage >= 50;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-slate-200">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${passed ? 'bg-emerald-100' : 'bg-red-100'}`}>
            <Trophy className={`w-12 h-12 ${passed ? 'text-emerald-600' : 'text-red-600'}`} />
          </div>

          <h1 className="text-4xl font-black text-slate-800 mb-2">
            {passed ? 'Congratulations!' : 'Keep Studying!'}
          </h1>
          <p className="text-slate-500 mb-8">
            You completed the Model Exit Exam IV module.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <span className="block text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Score</span>
              <span className="text-4xl font-black text-slate-800">{score} / {filteredQuestions.length}</span>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <span className="block text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Grade</span>
              <span className={`text-4xl font-black ${passed ? 'text-emerald-600' : 'text-red-600'}`}>
                {percentage}%
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setView('home')}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Retake Exam
            </button>
            <p className="text-slate-400 text-sm">
              Model Exam IV - Computer Science Department
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default function App() {
  return (
    <QuestionProvider>
      <ExamApp />
    </QuestionProvider>
  );
}