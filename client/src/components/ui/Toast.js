'use client';

import { useState, useCallback, createContext, useContext } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const ICONS = {
    success: <CheckCircle size={17} />,
    error:   <AlertCircle size={17} />,
    info:    <Info size={17} />,
  };
  const BORDER_COLORS = {
    success: 'var(--success)',
    error:   'var(--error)',
    info:    'var(--gold)',
  };

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={{
        position: 'fixed', bottom: 24, right: 24,
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8,
        maxWidth: 360, width: 'calc(100vw - 48px)',
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              background: 'var(--navy-card)',
              border: '1px solid var(--navy-border)',
              borderLeft: `4px solid ${BORDER_COLORS[toast.type] || BORDER_COLORS.info}`,
              color: 'var(--text-primary)',
              fontSize: '0.875rem', fontWeight: 500,
              padding: '14px 16px', borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--shadow-lg)',
              animation: 'toastIn 0.3s ease forwards',
            }}
          >
            <span style={{ color: BORDER_COLORS[toast.type], flexShrink: 0, marginTop: 1 }}>
              {ICONS[toast.type]}
            </span>
            <span style={{ flex: 1, lineHeight: 1.5 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, flexShrink: 0 }}
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
