import React, { createContext, useContext, useState, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastContextType {
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const idRef = useRef(0);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    idRef.current += 1;
    const id = `toast-${idRef.current}`;
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Render Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto p-3.5 rounded-xl surface-glass border border-slate-200 dark:border-white/8 shadow-xl flex items-start gap-2.5 text-xs text-slate-800 dark:text-[#EDEDED] animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#2E8B75] dark:text-[#10B981] shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-[#2E8B75] dark:text-[#10B981] shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 dark:text-[#EDEDED] leading-snug">{toast.title}</p>
              {toast.description && <p className="text-slate-500 dark:text-[#8C92A4] text-[11px] mt-0.5 leading-relaxed">{toast.description}</p>}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 dark:text-[#64748B] hover:text-slate-600 dark:hover:text-[#EDEDED] p-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#1A1E26] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
