import React, { useState, useEffect, createContext, useContext } from 'react';
import { Check, X, Info, AlertCircle } from 'lucide-react';
import { C } from '../../lib/constants';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    setTimeout(() => removeToast(id), duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    info: (message, duration) => addToast(message, 'info', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 'calc(80px + env(safe-area-inset-top))',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      width: '90%',
      maxWidth: 400,
      pointerEvents: 'none'
    }}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsExiting(true), toast.duration - 300);
    return () => clearTimeout(timer);
  }, [toast.duration]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <Check size={18} />;
      case 'error': return <AlertCircle size={18} />;
      case 'warning': return <AlertCircle size={18} />;
      case 'info': return <Info size={18} />;
      default: return <Check size={18} />;
    }
  };

  const getColors = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'rgba(16,185,129,0.15)',
          border: 'rgba(16,185,129,0.3)',
          icon: C.emeraldLight,
        };
      case 'error':
        return {
          bg: 'rgba(239,68,68,0.15)',
          border: 'rgba(239,68,68,0.3)',
          icon: '#ef4444',
        };
      case 'warning':
        return {
          bg: 'rgba(204,163,94,0.15)',
          border: 'rgba(204,163,94,0.3)',
          icon: C.accentLight,
        };
      case 'info':
        return {
          bg: 'rgba(59,130,246,0.15)',
          border: 'rgba(59,130,246,0.3)',
          icon: '#3b82f6',
        };
      default:
        return {
          bg: 'rgba(16,185,129,0.15)',
          border: 'rgba(16,185,129,0.3)',
          icon: C.emeraldLight,
        };
    }
  };

  const colors = getColors();

  return (
    <div
      style={{
        padding: '14px 18px',
        background: colors.bg,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        pointerEvents: 'auto',
        animation: isExiting ? 'slideOut 0.3s ease-out forwards' : 'slideIn 0.3s ease-out',
        transformOrigin: 'top center'
      }}
    >
      <div style={{ color: colors.icon, display: 'flex', alignItems: 'center' }}>
        {getIcon()}
      </div>
      <p style={{
        margin: 0,
        flex: 1,
        fontSize: 14,
        color: C.text,
        fontWeight: 400
      }}>
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'transparent',
          border: 'none',
          color: C.muted,
          cursor: 'pointer',
          padding: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
          transition: 'all 0.2s'
        }}
        onMouseEnter={e => e.target.style.color = C.text}
        onMouseLeave={e => e.target.style.color = C.muted}
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
        }
      `}</style>
    </div>
  );
};
