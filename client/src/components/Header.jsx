import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Sun, Moon, Shield, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import BustdLogo from './BustdLogo';

export default function Header() {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  // Generate lightweight breadcrumb trail instead of repeating page titles
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') {
      return (
        <div className="flex items-center gap-2 text-xs font-medium text-olive-500 dark:text-olive-400">
          <span className="text-palette-dark dark:text-palette-sand font-semibold">Workspace</span>
          <span className="text-olive-400 dark:text-olive-600">/</span>
          <span>Compliance Overview</span>
        </div>
      );
    }
    if (path.startsWith('/inspections/new')) {
      return (
        <div className="flex items-center gap-2 text-xs font-medium text-olive-500 dark:text-olive-400">
          <Link to="/" className="hover:text-palette-dark dark:hover:text-palette-sand transition-colors">Workspace</Link>
          <span className="text-olive-400 dark:text-olive-600">/</span>
          <span className="text-palette-dark dark:text-palette-sand font-semibold">New Inspection</span>
        </div>
      );
    }
    if (path.startsWith('/inspections/')) {
      const id = path.split('/')[2];
      return (
        <div className="flex items-center gap-2 text-xs font-medium text-olive-500 dark:text-olive-400">
          <Link to="/history" className="hover:text-palette-dark dark:hover:text-palette-sand transition-colors">Inspections</Link>
          <span className="text-olive-400 dark:text-olive-600">/</span>
          <span className="font-mono font-semibold text-palette-dark dark:text-palette-sand">{id || 'Detail'}</span>
        </div>
      );
    }
    if (path.startsWith('/history')) {
      return (
        <div className="flex items-center gap-2 text-xs font-medium text-olive-500 dark:text-olive-400">
          <Link to="/" className="hover:text-palette-dark dark:hover:text-palette-sand transition-colors">Workspace</Link>
          <span className="text-olive-400 dark:text-olive-600">/</span>
          <span className="text-palette-dark dark:text-palette-sand font-semibold">Inspection Archive</span>
        </div>
      );
    }
    if (path.startsWith('/products')) {
      return (
        <div className="flex items-center gap-2 text-xs font-medium text-olive-500 dark:text-olive-400">
          <Link to="/" className="hover:text-palette-dark dark:hover:text-palette-sand transition-colors">Master Data</Link>
          <span className="text-olive-400 dark:text-olive-600">/</span>
          <span className="text-palette-dark dark:text-palette-sand font-semibold">SKU Catalog</span>
        </div>
      );
    }
    if (path.startsWith('/rules')) {
      return (
        <div className="flex items-center gap-2 text-xs font-medium text-olive-500 dark:text-olive-400">
          <Link to="/" className="hover:text-palette-dark dark:hover:text-palette-sand transition-colors">Governance</Link>
          <span className="text-olive-400 dark:text-olive-600">/</span>
          <span className="text-palette-dark dark:text-palette-sand font-semibold">Rule Library</span>
        </div>
      );
    }
    return (
      <div className="text-xs font-medium text-palette-dark dark:text-palette-sand">
        BUSTD Metrology
      </div>
    );
  };

  return (
    <header className="h-14 px-5 sm:px-6 bg-white/70 dark:bg-canvas-dark/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Left: Responsive Brand & Non-Duplicated Breadcrumb Trail */}
      <div className="flex items-center gap-3">
        {/* Mobile/Compact Brand Logo */}
        <div className="sm:hidden">
          <BustdLogo collapsed={true} />
        </div>

        {/* Clean Contextual Breadcrumbs */}
        <div className="hidden sm:block">
          {getBreadcrumb()}
        </div>
      </div>

      {/* Right: Quick Controls (Clutterless, engine box removed per requirement) */}
      <div className="flex items-center gap-2.5">
        {/* Subtle Regulatory Compliance Badge */}
        <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.04] text-[11px] font-medium text-olive-600 dark:text-olive-400">
          <span className="w-1.5 h-1.5 rounded-full bg-gradient-bustd animate-pulse" />
          <span>Legal Metrology 2011</span>
        </div>

        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          type="button"
          aria-label="Toggle Theme"
          className="p-2 rounded-lg text-olive-600 dark:text-olive-300 hover:text-palette-dark dark:hover:text-palette-sand hover:bg-black/5 dark:hover:bg-white/5 transition-surface"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-300 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-palette-dark transition-transform hover:-rotate-12" />
          )}
        </button>
      </div>
    </header>
  );
}
