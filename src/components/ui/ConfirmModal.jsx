import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

export default function ConfirmModal({ message, onConfirm, onCancel }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onCancel();
            if (e.key === 'Enter') onConfirm();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onConfirm, onCancel]);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-sm p-6 border border-stone-200 dark:border-stone-800 flex flex-col items-center text-center relative overflow-hidden"
                >
                    {/* Subtle background glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-400/10 blur-3xl rounded-full pointer-events-none" />

                    <div className="mb-4 bg-slate-50 dark:bg-stone-800 p-4 rounded-full shadow-inner border border-slate-100 dark:border-stone-700 relative z-10">
                        <HelpCircle className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2 relative z-10">
                        Please Confirm
                    </h3>
                    <p className="text-stone-600 dark:text-stone-400 mb-8 w-full break-words relative z-10">
                        {message}
                    </p>
                    <div className="flex w-full gap-3 relative z-10">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3.5 bg-slate-100 dark:bg-stone-800 hover:bg-slate-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold rounded-xl transition-all active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]"
                        >
                            Confirm
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
