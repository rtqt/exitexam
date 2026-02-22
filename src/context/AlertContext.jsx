import React, { createContext, useContext, useState, useCallback } from 'react';
import AlertModal from '../components/ui/AlertModal';
import ConfirmModal from '../components/ui/ConfirmModal';

const AlertContext = createContext();

export function AlertProvider({ children }) {
    const [alertConfig, setAlertConfig] = useState(null);
    const [confirmConfig, setConfirmConfig] = useState(null);

    const showAlert = useCallback((message, type = 'info') => {
        setAlertConfig({ message, type });
    }, []);

    const hideAlert = useCallback(() => {
        setAlertConfig(null);
    }, []);

    const showConfirm = useCallback((message) => {
        return new Promise((resolve) => {
            setConfirmConfig({
                message,
                onConfirm: () => {
                    setConfirmConfig(null);
                    resolve(true);
                },
                onCancel: () => {
                    setConfirmConfig(null);
                    resolve(false);
                }
            });
        });
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            {alertConfig && (
                <AlertModal
                    message={alertConfig.message}
                    type={alertConfig.type}
                    onClose={hideAlert}
                />
            )}
            {confirmConfig && (
                <ConfirmModal
                    message={confirmConfig.message}
                    onConfirm={confirmConfig.onConfirm}
                    onCancel={confirmConfig.onCancel}
                />
            )}
        </AlertContext.Provider>
    );
}

export function useAlert() {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
}
