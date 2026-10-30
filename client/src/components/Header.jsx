import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, Radio, Sparkles } from 'lucide-react';
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
    if (path.startsWith('/inspections/')) return { title: 'Inspection Workspace', subtitle: 'Spatial evidence review & sign-off' };
    if (path.startsWith('/history')) return { title: 'Inspection History', subtitle: 'Audit records & verification archive' };
    if (path.startsWith('/products')) return { title: 'Product Catalog', subtitle: 'Master SKU attributes & dieline specs' };
    if (path.startsWith('/rules')) return { title: 'Rule Library', subtitle: 'Three-pillar statutory & master guidelines' };
    return { title: 'BUSTD', subtitle: 'Packaging compliance verification' };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <header className="h-16 px-6 bg-white/80 dark:bg-canvas-dark/85 backdrop-blur-md border-b border-black/5 dark:border-white/5 flex items-center justify-between sticky top-0 z-20 transition-colors">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-sm sm:text-base font-semibold text-palette-dark dark:text-palette-sand tracking-tight">
            {title}
          </h1>
          <span className="text-olive-300 dark:text-olive-600">•</span>
          <span className="text-xs text-olive-500 dark:text-olive-400 hidden sm:inline">
            {subtitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* OCR Engine Indicator Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-control bg-raised-light dark:bg-raised-dark text-[11px] font-mono text-olive-600 dark:text-olive-300 border border-black/5 dark:border-white/5 shadow-soft-sm">
          <Radio className="w-3 h-3 text-[#84CC16] animate-pulse" />
          <span>Engine: {systemStatus?.ocr?.provider === 'google_cloud_vision' ? 'Google Vision' : 'Spatial Deterministic'}</span>
        </div>

        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-control text-olive-600 dark:text-olive-300 hover:text-palette-dark dark:hover:text-palette-sand hover:bg-black/5 dark:hover:bg-white/5 transition-surface"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <Sun className="w-4 h-4 text-palette-cream" /> : <Moon className="w-4 h-4 text-palette-dark" />}
        </button>
      </div>
    </header>
  );
}
