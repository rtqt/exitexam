
import React, { useState } from 'react';
import { useQuestions } from '../context/QuestionContext';
import { Trash2, Plus, Brain, Save, X, Check, Loader2, FileText, Edit, Search, ImageIcon } from 'lucide-react';
import { extractQuestionsFromText, extractQuestionsFromMultimodal } from '../services/gemini';
import { extractTextFromPDF, extractImagesFromPDF } from '../services/pdf';
import { parseQuestionsRegex } from '../services/regexParser';

import { extractQuestionsGroq } from '../services/groq';
import { useAlert } from '../context/AlertContext';

export default function AdminDashboard({ onExit }) {
    const { questions, addQuestion, addQuestions, deleteQuestion, updateQuestion, resetToDefault } = useQuestions();
    const { showAlert, showConfirm } = useAlert();
    const [activeTab, setActiveTab] = useState('add');
    const [provider, setProvider] = useState('gemini');

    // Edit State
    const [editingId, setEditingId] = useState(null);

    // Manual Add/Edit State
    const [newQ, setNewQ] = useState({
        theme: '',
        question: '',
        image: '',
        options: ['', '', '', ''],
        answer: 0
    });

    // Import State
    const [apiKey, setApiKey] = useState('');
    const [importText, setImportText] = useState('');
    const [pdfImages, setPdfImages] = useState([]); // Store converted PDF pages as images
    const [isImporting, setIsImporting] = useState(false);
    const [isParsingPDF, setIsParsingPDF] = useState(false);
    const [importError, setImportError] = useState('');
    const [previewQuestions, setPreviewQuestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // Drag and Drop Handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload({ target: { files: e.dataTransfer.files } });
        }
    };

    // Manual Add/Edit Handler
    const handleManualAdd = (e) => {
        e.preventDefault();
        if (!newQ.question || !newQ.theme) return;

        if (editingId) {
            updateQuestion(editingId, newQ);
            setEditingId(null);
            showAlert('Question updated!', 'success');
        } else {
            addQuestion(newQ);
            showAlert('Question added!', 'success');
        }

        setNewQ({ theme: newQ.theme, question: '', image: '', options: ['', '', '', ''], answer: 0 });
    };

    const handleEditStart = (q) => {
        setNewQ({
            theme: q.theme,
            question: q.question,
            image: q.image || '',
            options: [...q.options],
            answer: q.answer
        });
        setEditingId(q.id);
        setActiveTab('add');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setNewQ({ theme: '', question: '', image: '', options: ['', '', '', ''], answer: 0 });
    };

    // PDF Handler
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setImportError('Please upload a valid PDF file.');
            return;
        }

        setIsParsingPDF(true);
        setImportError('');
        setPdfImages([]); // Reset images

        try {
            // Extract text for reference/fallback
            const text = await extractTextFromPDF(file);
            setImportText(text);

            // Extract images for multimodal AI
            const images = await extractImagesFromPDF(file);
            setPdfImages(images);

        } catch (err) {
            setImportError(err.message);
        } finally {
            setIsParsingPDF(false);
        }
    };

    // AI Extract Handler
    const handleGeminiExtract = async () => {
        if (!apiKey) return;

        // If we have images, use multimodal execution (ONLY for Gemini)
        if (pdfImages.length > 0 && provider === 'gemini') {
            setIsImporting(true);
            setImportError('');
            try {
                const extracted = await extractQuestionsFromMultimodal(apiKey, pdfImages);
                setPreviewQuestions(extracted);
            } catch (err) {
                setImportError(err.message);
            } finally {
                setIsImporting(false);
            }
            return;
        }

        // Fallback to text-based extraction
        if (!importText) return;
        setIsImporting(true);
        setImportError('');
        try {
            let extracted;
            if (provider === 'groq') {
                extracted = await extractQuestionsGroq(apiKey, importText);
            } else {
                extracted = await extractQuestionsFromText(apiKey, importText);
            }
            setPreviewQuestions(extracted);
        } catch (err) {
            setImportError(err.message);
        } finally {
            setIsImporting(false);
        }
    };

    const confirmImport = () => {
        addQuestions(previewQuestions);
        setPreviewQuestions([]);
        setImportText('');
        showAlert(`Successfully imported ${previewQuestions.length} questions!`, 'success');
        setActiveTab('list');
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 p-6 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8 bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
                        <p className="text-gray-500 dark:text-slate-400">Manage exam questions and content</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={async () => {
                            const confirmed = await showConfirm('Reset all questions to default?');
                            if (confirmed) resetToDefault();
                        }} className="text-red-500 hover:text-red-400 underline text-sm">Reset DB</button>
                        <button
                            onClick={onExit}
                            className="bg-slate-800 dark:bg-slate-700 text-white px-6 py-2 rounded-xl font-medium hover:bg-slate-900 dark:hover:bg-slate-600 transition-all"
                        >
                            Exit Admin
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="md:col-span-1 space-y-2">
                        <button
                            onClick={() => setActiveTab('add')}
                            className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'add' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            <Plus className="w-5 h-5" /> Manual Add
                        </button>
                        <button
                            onClick={() => setActiveTab('import')}
                            className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'import' ? 'bg-purple-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            <Brain className="w-5 h-5" /> AI Import
                        </button>
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-all ${activeTab === 'list' ? 'bg-slate-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            <Save className="w-5 h-5" /> Manage Questions
                        </button>

                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl mt-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="font-bold text-gray-700 dark:text-slate-200 mb-2">Stats</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Total Questions: <span className="font-bold text-gray-800 dark:text-white">{questions.length}</span></p>
                            <div className="mt-2 text-xs text-gray-400 space-y-1">
                                {[...new Set(questions.map(q => q.theme))].slice(0, 5).map(t => (
                                    <div key={t} className="flex justify-between">
                                        <span>{t}</span>
                                        <span>{questions.filter(q => q.theme === t).length}</span>
                                    </div>
                                ))}
                                {questions.length > 0 && <div className="text-center pt-1 italic">...and more</div>}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-3">

                        {/* MANUAL ADD / EDIT */}
                        {activeTab === 'add' && (
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                        {editingId ? 'Edit Question' : 'Add New Question'}
                                    </h2>
                                    {editingId && (
                                        <button onClick={cancelEdit} className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline">
                                            Cancel Editing
                                        </button>
                                    )}
                                </div>
                                <form onSubmit={handleManualAdd} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Theme / Subject</label>
                                            <input
                                                required
                                                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={newQ.theme}
                                                onChange={e => setNewQ({ ...newQ, theme: e.target.value })}
                                                placeholder="e.g. Web Programming"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Question Text</label>
                                        <textarea
                                            required
                                            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none h-24"
                                            value={newQ.question}
                                            onChange={e => setNewQ({ ...newQ, question: e.target.value })}
                                            placeholder="Type the question here..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URL (Optional)</label>
                                        <input
                                            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={newQ.image || ''}
                                            onChange={e => setNewQ({ ...newQ, image: e.target.value })}
                                            placeholder="https://example.com/image.png"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {newQ.options.map((opt, i) => (
                                            <div key={i}>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 flex justify-between">
                                                    Option {String.fromCharCode(65 + i)}
                                                    <input
                                                        type="radio"
                                                        name="correctAnswer"
                                                        checked={newQ.answer === i}
                                                        onChange={() => setNewQ({ ...newQ, answer: i })}
                                                        className="accent-blue-600"
                                                    />
                                                </label>
                                                <input
                                                    required
                                                    className={`w-full p-2.5 rounded-lg border outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white ${newQ.answer === i ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-600'}`}
                                                    value={opt}
                                                    onChange={e => {
                                                        const newOpts = [...newQ.options];
                                                        newOpts[i] = e.target.value;
                                                        setNewQ({ ...newQ, options: newOpts });
                                                    }}
                                                    placeholder={`Option ${i + 1}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <button type="submit" className={`w-full text-white font-bold py-3 rounded-xl transition-all mt-4 ${editingId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                        {editingId ? 'Update Question' : 'Add Question to Database'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* GEMINI IMPORT */}
                        {activeTab === 'import' && (
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                                    <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    AI Question Extraction
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Upload a PDF or paste text (lecture notes, paragraphs, etc.) and let AI generate questions for you.</p>

                                {previewQuestions.length === 0 ? (
                                    <div className="space-y-4">
                                        {/* PROVIDER SELECTOR */}
                                        <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg flex items-center justify-center gap-4 mb-4 border border-slate-200 dark:border-slate-700">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="provider"
                                                    value="gemini"
                                                    checked={provider === 'gemini'}
                                                    onChange={() => setProvider('gemini')}
                                                    className="accent-purple-600"
                                                />
                                                <span className={`text-sm font-bold ${provider === 'gemini' ? 'text-purple-700 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'}`}>Google Gemini</span>
                                            </label>
                                            <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-600"></div>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="provider"
                                                    value="groq"
                                                    checked={provider === 'groq'}
                                                    onChange={() => setProvider('groq')}
                                                    className="accent-orange-600"
                                                />
                                                <span className={`text-sm font-bold ${provider === 'groq' ? 'text-orange-700 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400'}`}>Groq (Llama 3)</span>
                                            </label>
                                        </div>

                                        <div>
                                            <div className="flex justify-between">
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                    {provider === 'gemini' ? 'Gemini API Key' : 'Groq API Key'}
                                                </label>
                                                <a
                                                    href={provider === 'gemini' ? "https://aistudio.google.com/app/apikey" : "https://console.groq.com/keys"}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs text-blue-500 underline"
                                                >
                                                    Get Key
                                                </a>
                                            </div>
                                            <input
                                                type="password"
                                                placeholder={provider === 'gemini' ? "Paste AIza..." : "Paste gsk_..."}
                                                className={`w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none font-mono text-sm ${provider === 'gemini' ? 'focus:ring-purple-500' : 'focus:ring-orange-500'
                                                    }`}
                                                value={apiKey}
                                                onChange={e => setApiKey(e.target.value)}
                                            />
                                        </div>

                                        {/* PDF UPLOAD */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Use a Document (PDF)</label>
                                            <div
                                                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all ${isDragging
                                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 bg-slate-50 dark:bg-slate-800/50'
                                                    }`}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                            >
                                                <div className={`p-4 rounded-full mb-3 transition-colors ${isDragging ? 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                                    <FileText className="w-8 h-8" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center mb-1">
                                                    {isDragging ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">or</p>

                                                <label className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-lg cursor-pointer border border-slate-200 dark:border-slate-600 transition-all shadow-sm">
                                                    Browse Files
                                                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={isParsingPDF} />
                                                </label>
                                            </div>

                                            <div className="mt-3 flex items-center justify-center min-h-[24px]">
                                                {isParsingPDF && (
                                                    <span className="text-sm text-purple-600 dark:text-purple-400 font-medium flex items-center gap-2">
                                                        <Loader2 className="animate-spin w-4 h-4" /> Parsing Document...
                                                    </span>
                                                )}
                                                {!isParsingPDF && importText && (
                                                    <span className="text-sm text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                                                        <Check className="w-4 h-4" /> Document Ready
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Content Text (Editable)</label>
                                            <textarea
                                                className={`w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none h-48 font-mono text-sm ${provider === 'gemini' ? 'focus:ring-purple-500' : 'focus:ring-orange-500'
                                                    }`}
                                                placeholder="Paste text directly or upload PDF to auto-fill..."
                                                value={importText}
                                                onChange={e => setImportText(e.target.value)}
                                            />
                                        </div>

                                        {importError && (
                                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800">
                                                {importError}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={handleGeminiExtract}
                                                disabled={isImporting || !apiKey || !importText}
                                                className={`text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${provider === 'gemini' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-600 hover:bg-orange-700'
                                                    }`}
                                            >
                                                {isImporting ? <Loader2 className="animate-spin w-5 h-5" /> : <Brain className="w-5 h-5" />}
                                                {isImporting ? 'Analyzing...' : `Generate with ${provider === 'gemini' ? 'Gemini' : 'Groq'}`}
                                            </button>

                                            <button
                                                onClick={() => {
                                                    if (!importText) return;
                                                    try {
                                                        const result = parseQuestionsRegex(importText);
                                                        setPreviewQuestions(result);
                                                        if (result.length === 0) setImportError("No questions found used standard format (1. Question ... A. Option)");
                                                    } catch (err) {
                                                        setImportError("Regex parsing failed: " + err.message);
                                                    }
                                                }}
                                                disabled={!importText}
                                                className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                <FileText className="w-5 h-5" />
                                                Parse (No AI)
                                            </button>
                                        </div>
                                        <p className="text-xs text-center text-slate-400">
                                            "Parse (No AI)" is free but accurate only for standard formats. You must verify answers manually.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                                            <span className="font-bold text-purple-800 dark:text-purple-300">Generated {previewQuestions.length} Questions</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setPreviewQuestions([])}
                                                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                                                >
                                                    Discard
                                                </button>
                                                <button
                                                    onClick={confirmImport}
                                                    className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-lg shadow-purple-200 dark:shadow-purple-900/50"
                                                >
                                                    Save All
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                            {previewQuestions.map((q, i) => (
                                                <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-900">
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">{q.theme}</span>
                                                        <span className="text-xs font-mono text-slate-400">Preview</span>
                                                    </div>
                                                    <p className="font-medium text-slate-800 dark:text-slate-200 mb-2">{q.question}</p>
                                                    {q.imageDescription && (
                                                        <p className="text-xs italic text-purple-600 dark:text-purple-400 mb-2 bg-purple-50 dark:bg-purple-900/10 p-2 rounded">
                                                            <span className="font-bold">Diagram:</span> {q.imageDescription}
                                                        </p>
                                                    )}

                                                    <ul className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                        {q.options.map((opt, idx) => (
                                                            <li
                                                                key={idx}
                                                                onClick={() => {
                                                                    const updated = [...previewQuestions];
                                                                    updated[i].answer = idx;
                                                                    setPreviewQuestions(updated);
                                                                }}
                                                                className={`px-3 py-2 rounded cursor-pointer transition-all border ${idx === q.answer
                                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-bold border-green-400 dark:border-green-800'
                                                                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                                                                    }`}
                                                            >
                                                                {String.fromCharCode(65 + idx)}. {opt}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* LIST MANAGER */}
                        {activeTab === 'list' && (
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 flex justify-between items-center">
                                    <h2 className="font-bold text-gray-700 dark:text-slate-200">All Questions</h2>
                                    <span className="text-xs text-gray-400">Total: {questions.length}</span>
                                </div>

                                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10">
                                    <div className="relative">
                                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search questions by text or theme..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[600px] overflow-y-auto">
                                    {questions.filter(q =>
                                        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        q.theme.toLowerCase().includes(searchTerm.toLowerCase())
                                    ).slice().reverse().map((q) => (
                                        <div key={q.id} className="p-4 hover:bg-white dark:hover:bg-slate-700/50 transition-colors flex justify-between gap-4 group">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
                                                        {q.theme}
                                                    </span>
                                                </div>
                                                <p className="text-slate-800 dark:text-slate-200 font-medium text-sm line-clamp-2">
                                                    {q.image && <ImageIcon className="w-4 h-4 inline mr-1 text-purple-500" />}
                                                    {q.question}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => handleEditStart(q)}
                                                    className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const confirmed = await showConfirm('Delete this question?');
                                                        if (confirmed) deleteQuestion(q.id);
                                                    }}
                                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
