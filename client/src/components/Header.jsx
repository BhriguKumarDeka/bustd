import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
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
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="text-slate-900 dark:text-slate-100 font-semibold">Workspace</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span>Compliance Overview</span>
        </div>
      );
    }
    if (path.startsWith('/inspections/new')) {
      return (
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Workspace</Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">New Inspection</span>
        </div>
      );
    }
    if (path.startsWith('/inspections/')) {
      const id = path.split('/')[2];
      return (
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link to="/history" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Inspections</Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{id || 'Detail'}</span>
        </div>
      );
    }
    if (path.startsWith('/history')) {
      return (
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Workspace</Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">Inspection Archive</span>
        </div>
      );
    }
    if (path.startsWith('/products')) {
      return (
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Master Data</Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">SKU Catalog</span>
        </div>
      );
    }
    if (path.startsWith('/rules')) {
      return (
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Governance</Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">Rule Library</span>
        </div>
      );
    }
    return (
      <div className="text-xs font-medium text-slate-900 dark:text-slate-100">
        BUSTD
      </div>
    );
  };

  return (
    <header className="h-14 px-5 sm:px-6 bg-white/80 dark:bg-canvas-dark/85 backdrop-blur-md border-b border-slate-200/80 dark:border-white/5 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Left: Responsive Brand & Non-Duplicated Breadcrumb Trail */}
      <div className="flex items-center gap-3">
        <div className="sm:hidden">
          <BustdLogo collapsed={true} />
        </div>

        <div className="hidden sm:block">
          {getBreadcrumb()}
        </div>
      </div>

      {/* Right: Theme Switcher Button (Legal metrology tag removed per user instruction) */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          type="button"
          aria-label="Toggle Theme"
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-300 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-slate-800 transition-transform hover:-rotate-12" />
          )}
        </button>
      </div>
    </header>
  );
}
