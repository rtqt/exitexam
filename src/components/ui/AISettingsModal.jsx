import React, { useState } from 'react';
import { getGeminiModels } from '../../services/gemini';
import { getGroqModels } from '../../services/groq';
import { useAlert } from '../../context/AlertContext';

export default function AISettingsModal({
    showApiKeyModal,
    setShowApiKeyModal,
    aiProvider,
    setAiProvider,
    geminiModel,
    setGeminiModel,
    groqModel,
    setGroqModel
}) {
    const { showAlert } = useAlert();
    const [tempApiKey, setTempApiKey] = useState('');
    const [availableModels, setAvailableModels] = useState([]);
    const [checkingModels, setCheckingModels] = useState(false);

    if (!showApiKeyModal) return null;

    const handleFetchModels = async () => {
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
            showAlert("Error fetching models: " + err.message, 'error');
        } finally {
            setCheckingModels(false);
        }
    };

    const handleSaveKey = () => {
        const keyName = aiProvider === 'gemini' ? 'gemini_api_key' : 'groq_api_key';
        localStorage.setItem(keyName, tempApiKey.trim());
        localStorage.setItem('preferred_ai_provider', aiProvider);
        setShowApiKeyModal(false);
        setTempApiKey('');
        showAlert(`${aiProvider === 'groq' ? 'Groq' : 'Gemini'} Key saved!`, 'success');
    };

    return (
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
                        onClick={handleFetchModels}
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
                            onClick={handleSaveKey}
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
    );
}
