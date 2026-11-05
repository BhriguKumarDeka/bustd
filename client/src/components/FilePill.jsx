import React from 'react';
import { FileText, Image as ImageIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * FilePill: Minimalist, tactile file tag inspired by reference UI (Image 1)
 * [PDF brief.pdf ✕] [● cloud.png ✕]
 */
export default function FilePill({
  name,
  type = 'image',
  onRemove,
  size,
  className = '',
}) {
  const isPdf = name?.toLowerCase().endsWith('.pdf') || type === 'pdf';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
      className={`file-pill ${className}`}
    >
      <div className="flex items-center gap-1.5 shrink-0">
        {isPdf ? (
          <span className="w-5 h-5 rounded bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center text-[10px] font-bold font-mono">
            PDF
          </span>
        ) : (
          <span className="w-5 h-5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <ImageIcon className="w-3 h-3" />
          </span>
        )}
      </div>

      <span className="truncate max-w-[130px] sm:max-w-[180px] text-slate-900 dark:text-slate-100 font-medium">
        {name}
      </span>

      {size && (
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
          {size}
        </span>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors ml-0.5"
          title="Remove file"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </motion.div>
  );
}
