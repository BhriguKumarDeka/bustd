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
        <div className="flex items-center gap-2 text-xs font-medium text-secondary">
          <span className="text-primary font-semibold">Workspace</span>
          <span className="text-muted">/</span>
          <span>Compliance Overview</span>
        </div>
      );
    }
    if (path.startsWith('/inspections/new')) {
      return (
        <div className="flex items-center gap-2 text-xs font-medium text-secondary">
          <Link to="/" className="hover:text-primary transition-colors">Workspace</Link>
          <span className="text-muted">/</span>
          <span className="text-primary font-semibold">New Inspection</span>
        </div>
      );
    }
    if (path.startsWith('/inspections/')) {
      const id = path.split('/')[2];
      return (
        <div className="flex items-center gap-2 text-xs font-medium text-secondary">
          <Link to="/history" className="hover:text-primary transition-colors">Inspections</Link>
          <span className="text-muted">/</span>
          <span className="font-mono font-semibold text-primary">{id || 'Detail'}</span>
        </div>
      );
    }
    if (path.startsWith('/history')) {
      return (
        <div className="flex items-center gap-2 text-xs font-medium text-secondary">
          <Link to="/" className="hover:text-primary transition-colors">Workspace</Link>
          <span className="text-muted">/</span>
          <span className="text-primary font-semibold">Inspection Archive</span>
        </div>
      );
    }
    if (path.startsWith('/products')) {
      return (
        <div className="flex items-center gap-2 text-xs font-medium text-secondary">
          <Link to="/" className="hover:text-primary transition-colors">Master Data</Link>
          <span className="text-muted">/</span>
          <span className="text-primary font-semibold">SKU Catalog</span>
        </div>
      );
    }
    if (path.startsWith('/rules')) {
      return (
        <div className="flex items-center gap-2 text-xs font-medium text-secondary">
          <Link to="/" className="hover:text-primary transition-colors">Governance</Link>
          <span className="text-muted">/</span>
          <span className="text-primary font-semibold">Rule Library</span>
        </div>
      );
    }
    return (
      <div className="text-xs font-medium text-primary">
        BUSTD
      </div>
    );
  };

  return (
    <header className="h-14 px-5 sm:px-6 bg-surface-overlay backdrop-blur-xl border-b border-subtle flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Left: Responsive Brand & Non-Duplicated Breadcrumb Trail */}
      <div className="flex items-center gap-3">
        <div className="sm:hidden">
          <BustdLogo collapsed={true} />
        </div>

        <div className="hidden sm:block">
          {getBreadcrumb()}
        </div>
      </div>

      {/* Right: Theme Switcher Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          type="button"
          aria-label="Toggle Theme"
          className="p-2 rounded-xl text-secondary hover:text-primary hover:bg-surface-interactive transition-colors"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-300 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-neutral-800 transition-transform hover:-rotate-12" />
          )}
        </button>
      </div>
    </header>
  );
}
