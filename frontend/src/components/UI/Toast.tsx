import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />,
          warning: <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />,
          error: <XCircle className="h-5 w-5 text-rose-400 shrink-0" />,
          info: <Info className="h-5 w-5 text-blue-400 shrink-0" />
        };

        const borderStyles = {
          success: 'border-emerald-500/30 bg-slate-900/95 text-emerald-100',
          warning: 'border-amber-500/30 bg-slate-900/95 text-amber-100',
          error: 'border-rose-500/30 bg-slate-900/95 text-rose-100',
          info: 'border-blue-500/30 bg-slate-900/95 text-blue-100'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-slide-in ${borderStyles[toast.type]}`}
          >
            <div className="flex items-center gap-3">
              {icons[toast.type]}
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
