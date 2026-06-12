import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import './Toast.css';

const ToastContext = createContext({ showToast: (_msg) => {} });

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]); // { id, message }

  const showToast = useCallback((message) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast">{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
