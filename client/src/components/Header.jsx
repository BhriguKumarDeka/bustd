import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, Shield, Radio, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSystem } from '../context/SystemContext';

export default function Header() {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { systemStatus } = useSystem();

  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/') return { title: 'Overview', subtitle: 'Action-oriented packaging audit workspace' };
    if (path.startsWith('/inspections/new')) return { title: 'New Inspection', subtitle: 'Multi-step packaging compliance scanner' };
    if (path.startsWith('/inspections/')) return { title: 'Inspection Workspace', subtitle: 'Evidence review & human sign-off' };
    if (path.startsWith('/history')) return { title: 'Inspection History', subtitle: 'Audit records & verification archive' };
    if (path.startsWith('/products')) return { title: 'Product Catalog', subtitle: 'Master SKU attributes & dieline specs' };
    if (path.startsWith('/rules')) return { title: 'Rule Library', subtitle: 'Three-pillar statutory & master guidelines' };
    return { title: 'BUSTD', subtitle: 'Packaging compliance verification' };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <header className="h-16 px-6 bg-white/70 dark:bg-[#101010]/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 flex items-center justify-between sticky top-0 z-10 transition-colors">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-charcoal-900 dark:text-zinc-100 tracking-tight">
            {title}
          </h1>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* OCR Engine Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-control bg-black/5 dark:bg-white/5 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 border border-black/5 dark:border-white/5">
          <Radio className="w-3 h-3 text-red-500 animate-pulse" />
          <span>OCR: {systemStatus?.ocr?.provider === 'google_cloud_vision' ? 'Google Vision' : 'Spatial Deterministic'}</span>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-control text-zinc-600 dark:text-zinc-400 hover:text-charcoal-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-surface"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
