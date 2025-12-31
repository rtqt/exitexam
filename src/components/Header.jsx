import React from 'react';
import { Sun, Moon, Shield, BookOpen } from 'lucide-react';

export default function Header({ darkMode, setDarkMode, onAdminClick, goHome }) {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">

                    {/* Logo / Title area */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={goHome}>
                        <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-lg">
                            <BookOpen className="text-white w-5 h-5" />
                        </div>
                        <div className="hidden md:block">
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">
                                Exit Exam
                            </h1>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                Informatics
                            </span>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={() => setDarkMode(prev => !prev)}
                            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {darkMode ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>

                        {/* Admin Link */}
                        <button
                            onClick={onAdminClick}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                        >
                            <Shield className="w-4 h-4" />
                            <span className="hidden sm:inline">Admin</span>
                        </button>

                    </div>
                </div>
            </div>
        </header>
    );
}
