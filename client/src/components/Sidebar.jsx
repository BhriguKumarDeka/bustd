import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ScanSearch, 
  History, 
  Package, 
  BookOpenCheck,
  ShieldCheck,
  Flag,
  Database
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';

export default function Sidebar() {
  const { systemStatus } = useSystem();

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/inspections/new', label: 'New Inspection', icon: ScanSearch, highlight: true },
    { to: '/history', label: 'Inspection History', icon: History },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/rules', label: 'Rule Library', icon: BookOpenCheck },
  ];

  const isMongo = systemStatus?.storage?.isMongoConnected;

  return (
    <aside className="w-64 shrink-0 bg-nav-light dark:bg-nav-dark border-r border-black/5 dark:border-white/5 flex flex-col justify-between h-screen sticky top-0 transition-colors select-none z-20">
      <div>
        {/* Brand Header */}
        <div className="p-5 pb-4">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-control bg-charcoal-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-mono font-black text-sm tracking-tighter shadow-soft-sm group-hover:scale-[1.02] transition-transform">
              B
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-charcoal-900 dark:text-white">BUSTD</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                  MVP v0.3
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 tracking-tight font-serif italic">
                Spot the red flags.
              </p>
            </div>
          </NavLink>
        </div>

        {/* Navigation Section */}
        <nav className="px-3 py-2 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-mono font-medium tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
            Inspection Workflow
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-control text-xs font-medium transition-surface
                  ${isActive 
                    ? 'bg-white dark:bg-[#1A1A1A] text-charcoal-900 dark:text-white shadow-soft-sm border border-black/5 dark:border-white/10 font-semibold' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-charcoal-900 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5'
                  }
                  ${item.highlight ? 'text-red-600 dark:text-red-400 font-medium' : ''}
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status & Diagnostics */}
      <div className="p-4 border-t border-black/5 dark:border-white/5 space-y-3">
        {/* Storage Mode Badge */}
        <div className="p-2.5 rounded-control bg-white/70 dark:bg-[#121212] border border-black/5 dark:border-white/5 text-[11px]">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
            <span className="flex items-center gap-1 font-mono uppercase tracking-wider text-[10px]">
              <Database className="w-3 h-3" />
              Storage Engine
            </span>
            <span className={`w-2 h-2 rounded-full ${isMongo ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </div>
          <div className="font-medium text-charcoal-900 dark:text-zinc-200 truncate">
            {isMongo ? 'MongoDB (Connected)' : 'Local File Store (Fallback)'}
          </div>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-tight mt-0.5">
            {isMongo ? 'Mongoose active' : 'Persisting to server/data/store.json'}
          </p>
        </div>

        {/* Demo User Info */}
        <div className="flex items-center gap-2.5 px-1 text-xs">
          <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-mono font-semibold text-[11px] shrink-0">
            QA
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-charcoal-900 dark:text-zinc-200 truncate">
              Senior QA Inspector
            </div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
              Lead Metrologist (Demo)
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
