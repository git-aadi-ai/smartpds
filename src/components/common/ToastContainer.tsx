import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-[#702D3B] dark:text-[#E4B34F] shrink-0" />;
        let borderClass = 'border-[#E7E2DF] dark:border-[#293445] bg-white dark:bg-[#151C28]';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
          borderClass = 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#151C28]';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />;
          borderClass = 'border-amber-200 dark:border-amber-800 bg-white dark:bg-[#151C28]';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />;
          borderClass = 'border-rose-200 dark:border-rose-800 bg-white dark:bg-[#151C28]';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all transform translate-y-0 ${borderClass}`}
            role="alert"
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[#344054] dark:text-[#F1F5F9]">{toast.title}</h4>
              <p className="text-xs text-[#707887] dark:text-[#A1AAB9] mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#707887] dark:text-[#A1AAB9] hover:text-[#344054] dark:hover:text-[#F1F5F9] p-1 rounded-md transition-colors shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
