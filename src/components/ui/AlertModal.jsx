import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

const icons = {
    success: <CheckCircle className="w-8 h-8 text-green-500" />,
    error: <XCircle className="w-8 h-8 text-red-500" />,
    info: <Info className="w-8 h-8 text-blue-500" />,
    warning: <AlertCircle className="w-8 h-8 text-amber-500" />
};

export default function AlertModal({ message, type = 'info', onClose }) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

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
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-400/10 blur-3xl rounded-full pointer-events-none" />

                    <div className="mb-4 bg-slate-50 dark:bg-stone-800 p-4 rounded-full shadow-inner border border-slate-100 dark:border-stone-700 relative z-10">
                        {icons[type] || icons.info}
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2 relative z-10">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </h3>
                    <p className="text-stone-600 dark:text-stone-400 mb-8 w-full break-words relative z-10">
                        {message}
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/25 active:scale-[0.98] relative z-10"
                    >
                        Okay
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
