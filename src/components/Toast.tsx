import React from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />,
          error: <XCircle className="text-red-500 shrink-0" size={20} />,
          warning: <AlertCircle className="text-amber-500 shrink-0" size={20} />,
          info: <Info className="text-blue-500 shrink-0" size={20} />,
        };

        const borderStyles = {
          success: 'border-emerald-200 bg-white/95 text-slate-800 shadow-emerald-500/10',
          error: 'border-red-200 bg-white/95 text-slate-800 shadow-red-500/10',
          warning: 'border-amber-200 bg-white/95 text-slate-800 shadow-amber-500/10',
          info: 'border-blue-200 bg-white/95 text-slate-800 shadow-blue-500/10',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 ${borderStyles[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-tight">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
