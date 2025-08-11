import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const toast = ({ title, description, variant = 'default' }) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { id, title, description, variant };
        
        setToasts(prev => [...prev, newToast]);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <ToastContainer toasts={toasts} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        // Fallback for when provider is not available
        return {
            toast: ({ title, description, variant }) => {
                if (window.showNotification) {
                    window.showNotification(variant === 'destructive' ? 'error' : variant, title, description);
                } else {
                    console.log(`Toast: ${title} - ${description}`);
                }
            }
        };
    }
    return context;
}

function ToastContainer({ toasts }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`p-4 rounded-lg shadow-lg max-w-sm ${
                        toast.variant === 'destructive' 
                            ? 'bg-red-100 text-red-900 border border-red-200' 
                            : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                >
                    <h4 className="font-semibold">{toast.title}</h4>
                    {toast.description && <p className="text-sm mt-1">{toast.description}</p>}
                </div>
            ))}
        </div>
    );
}