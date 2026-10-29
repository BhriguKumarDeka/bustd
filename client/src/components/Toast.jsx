import React from 'react';
import { useSystem } from '../context/SystemContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useSystem();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md pointer-events-none">
      {toasts.map(toast => {
        let Icon = Info;
        let borderClass = 'border-charcoal-700/60 dark:border-white/10';
        let bgClass = 'bg-white dark:bg-[#151515]';
        let textClass = 'text-charcoal-800 dark:text-zinc-200';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderClass = 'border-emerald-500/30';
          textClass = 'text-emerald-700 dark:text-emerald-400';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          borderClass = 'border-rose-500/30';
          textClass = 'text-rose-700 dark:text-rose-400';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-amber-500/30';
          textClass = 'text-amber-700 dark:text-amber-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-panel shadow-soft-lg dark:shadow-dark-lg border ${borderClass} ${bgClass} transition-all duration-200 text-sm`}
          >
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${textClass}`} />
            <div className="flex-1 text-xs sm:text-sm text-charcoal-800 dark:text-zinc-200 leading-snug">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
