import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function BustdLogo({ collapsed = false, size = 'default', showTagline = false }) {
  const navigate = useNavigate();

  return (
    <motion.button
      type="button"
      onClick={() => navigate('/')}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className="flex items-center gap-2.5 text-left select-none group focus:outline-none"
      title="BUSTD Home • Spot the red flags"
    >
      {/* Brand Icon Mark */}
      <div className="relative shrink-0 flex items-center justify-center">
        <div className="w-9 h-9 rounded-xl bg-palette-dark dark:bg-[#25241E] border border-black/5 dark:border-white/10 shadow-soft-sm flex items-center justify-center relative overflow-hidden transition-all group-hover:border-pink-500/30">
          {/* Radiant Noisy Gradient Dot */}
          <div className="w-4 h-4 rounded-full bg-gradient-bustd shadow-[0_0_10px_rgba(236,72,153,0.6)] group-hover:scale-110 transition-transform flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Typography */}
      {!collapsed && (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-bold tracking-tight text-base text-palette-dark dark:text-palette-sand group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
              bustd
            </span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/5 dark:bg-white/5 text-olive-500 dark:text-olive-400 font-semibold">
              v1.2
            </span>
          </div>
          {showTagline && (
            <span className="text-[11px] text-olive-500 dark:text-olive-400 block mt-0.5 truncate font-normal">
              Spot the red flags.
            </span>
          )}
        </div>
      )}
    </motion.button>
  );
}
