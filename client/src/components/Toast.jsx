import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../context/SystemContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useSystem();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts && toasts.map(toast => {
          let Icon = Info;
          let borderClass = 'border-subtle';
          let bgClass = 'bg-surface-raised';
          let iconClass = 'text-sky-500';

          if (toast.type === 'success') {
            Icon = CheckCircle2;
            borderClass = 'border-emerald-500/30';
            iconClass = 'text-emerald-600 dark:text-emerald-400';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            borderClass = 'border-red-500/30';
            iconClass = 'text-red-600 dark:text-red-400';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            borderClass = 'border-amber-500/30';
            iconClass = 'text-amber-600 dark:text-amber-400';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-soft-lg border ${borderClass} ${bgClass} text-xs`}
            >
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconClass}`} />
              <div className="flex-1 text-primary leading-snug font-medium">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-muted hover:text-primary p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
