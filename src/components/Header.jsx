import React from 'react';
import { Sun, Moon, Shield, GraduationCap, Bot } from 'lucide-react';

export default function Header({ darkMode, setDarkMode, onAdminClick, goHome, onSettingsClick }) {
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const toggleMobile = () => setMobileOpen(prev => !prev);
    const closeMobile = () => setMobileOpen(false);

    return (
        <header className="sticky top-4 z-50 mx-4 rounded-2xl glass-dark glass transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">

                    {/* Logo / Title area */}
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { goHome(); closeMobile(); }}>
                        <div className="bg-gradient-to-tr from-amber-500 to-yellow-600 dark:from-amber-400 dark:to-yellow-500 p-2.5 rounded-xl shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform duration-300">
                            <GraduationCap className="text-white w-5 h-5" />
                        </div>
                        <div className="hidden md:flex flex-col">
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 leading-none">
                                Exit Exam
                            </h1>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                                INFORMATICS
                            </span>
                        </div>
                    </div>

                    {/* Hamburger for mobile */}
                    <button
                        onClick={toggleMobile}
                        className="md:hidden p-2.5 rounded-xl text-slate-500 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:bg-slate-800/50 transition-all active:scale-95"
                        aria-label="Toggle navigation menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            {mobileOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>

                    {/* Right Actions (desktop) */}
                    <div className="hidden md:flex items-center gap-3">

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={() => setDarkMode(prev => !prev)}
                            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:bg-slate-800/50 transition-all active:scale-95"
                            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {darkMode ? (
                                <Sun className="w-5 h-5 text-amber-400" />
                            ) : (
                                <Moon className="w-5 h-5 text-amber-500" />
                            )}
                        </button>

                        {/* Admin Link */}
                        <button
                            onClick={onAdminClick}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-700 dark:text-amber-100 bg-white/50 dark:bg-stone-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-amber-200/60 dark:border-stone-700 rounded-xl transition-all hover:border-amber-400 dark:hover:border-amber-700 active:scale-95"
                        >
                            <Shield className="w-4 h-4 text-amber-500" />
                            <span className="hidden sm:inline">Admin Panel</span>
                        </button>

                        {/* AI Settings Link */}
                        <button
                            onClick={onSettingsClick}
                            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:bg-slate-800/50 transition-all active:scale-95"
                            title="AI Tutor Settings"
                        >
                            <Bot className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                        </button>

                    </div>
                </div>

                {/* Mobile menu panel */}
                {mobileOpen && (
                    <div className="md:hidden mt-2 pb-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col items-start gap-2 px-2">
                            <button
                                onClick={() => { setDarkMode(prev => !prev); closeMobile(); }}
                                className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-500 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:bg-slate-800/50 transition-all active:scale-95"
                            >
                                {darkMode ? (
                                    <Sun className="w-5 h-5 text-amber-400" />
                                ) : (
                                    <Moon className="w-5 h-5 text-amber-500" />
                                )}
                                <span>Toggle {darkMode ? 'Light' : 'Dark'}</span>
                            </button>
                            <button
                                onClick={() => { onAdminClick(); closeMobile(); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-700 dark:text-amber-100 bg-white/50 dark:bg-stone-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-amber-200/60 dark:border-stone-700 rounded-xl transition-all hover:border-amber-400 dark:hover:border-amber-700 active:scale-95"
                            >
                                <Shield className="w-4 h-4 text-amber-500" />
                                <span>Admin Panel</span>
                            </button>
                            <button
                                onClick={() => { onSettingsClick(); closeMobile(); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-700 dark:text-amber-100 bg-white/50 dark:bg-stone-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-amber-200/60 dark:border-stone-700 rounded-xl transition-all hover:border-amber-400 dark:hover:border-amber-700 active:scale-95"
                            >
                                <Bot className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                <span>AI Tutor Settings</span>
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </header>
    );
}
