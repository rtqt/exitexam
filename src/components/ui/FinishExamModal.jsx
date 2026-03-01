import React from 'react';

export default function FinishExamModal({
    showFinishModal,
    cancelFinish,
    confirmFinish,
    flagged,
    filteredQuestions,
    userAnswers
}) {
    if (!showFinishModal) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <h3 className="text-lg font-bold mb-3">Finish Exam?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">You're about to finish. Review flagged and unanswered questions before submitting.</p>
                <div className="mb-4">
                    <div className="mb-2 font-semibold">Flagged Questions</div>
                    <div className="flex flex-wrap gap-2">
                        {(!flagged || Object.values(flagged).filter(Boolean).length === 0) && <span className="text-sm text-slate-500">None</span>}
                        {Object.entries(flagged || {})
                            .filter(([id, isFlagged]) => isFlagged)
                            .map(([id]) => {
                                // Ensure the question id is compared as a string.
                                const idx = filteredQuestions.findIndex(q => String(q.id) === String(id));
                                return idx >= 0 ? (
                                    <span key={id} className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-md text-sm">Q{idx + 1}</span>
                                ) : null;
                            })}
                    </div>
                </div>

                <div className="mb-6">
                    <div className="mb-2 font-semibold">Unanswered Questions</div>
                    <div className="flex flex-wrap gap-2">
                        {filteredQuestions.map((q, i) => (userAnswers[q.id] === undefined || userAnswers[q.id] === null) ? (
                            <span key={q.id} className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 rounded-md text-sm">Q{i + 1}</span>
                        ) : null)}
                        {filteredQuestions.every(q => userAnswers[q.id] !== undefined && userAnswers[q.id] !== null) && <span className="text-sm text-slate-500">None</span>}
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={cancelFinish} className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Cancel</button>
                    <button onClick={confirmFinish} className="px-4 py-2 rounded-lg bg-amber-500 text-white font-bold">Confirm Finish</button>
                </div>
            </div>
        </div>
    );
}
