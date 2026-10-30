import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ScanSearch, 
  History, 
  Package, 
  BookOpenCheck,
  Database,
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const { systemStatus } = useSystem();
  const [hoveredItem, setHoveredItem] = useState(null);

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard, section: 'main' },
    { to: '/inspections/new', label: 'New Inspection', icon: ScanSearch, highlight: true, section: 'main' },
    { to: '/history', label: 'Inspection History', icon: History, count: 2, section: 'main' },
    { to: '/products', label: 'Product Catalog', icon: Package, section: 'data' },
    { to: '/rules', label: 'Rule Library', icon: BookOpenCheck, section: 'data' },
  ];

  const isMongo = systemStatus?.storage?.isMongoConnected;

  return (
    <aside 
      className={`relative shrink-0 bg-nav-light dark:bg-nav-dark border-r border-black/5 dark:border-white/5 flex flex-col justify-between h-screen sticky top-0 transition-all duration-200 select-none z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Top Header: Mac Traffic Light Dots & Brand / Collapse Toggle */}
        <div className="p-4 pb-3 flex items-center justify-between border-b border-black/5 dark:border-white/5">

          {/* Toggle Expand / Collapse */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-control text-olive-500 dark:text-olive-300 hover:text-palette-dark dark:hover:text-palette-sand hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title={isCollapsed ? "Expand Sidebar (<<)" : "Collapse Sidebar (>>)"}
          >
            {isCollapsed ? (
              <ChevronsRight className="w-4 h-4" />
            ) : (
              <ChevronsLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Brand Header */}
        <div className={`px-4 pt-3 pb-2 ${isCollapsed ? 'text-center' : ''}`}>
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-20 h-10 rounded-full bg-palette-dark dark:bg-palette-sand text-palette-sand dark:text-palette-dark flex items-center justify-center font-mono font-black text-sm shadow-soft-sm group-hover:scale-[1.03] transition-transform shrink-0">
              BUSTD
            </div>
          </NavLink>
        </div>

        {/* Navigation Sections */}
        <nav className="px-3 pt-3 space-y-4">
          {/* Section: Main Menu */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="flex items-center justify-between px-3 py-1 text-[10px] font-mono font-semibold tracking-wider uppercase text-olive-500 dark:text-olive-400">
                <span>Main Menu</span>
                <NavLink to="/inspections/new" title="Quick scan">
                  <Plus className="w-3 h-3 hover:text-palette-dark dark:hover:text-palette-sand transition-colors" />
                </NavLink>
              </div>
            )}

            {navItems.filter(i => i.section === 'main').map(item => {
              const Icon = item.icon;
              return (
                <div key={item.to} className="relative">
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onMouseEnter={() => setHoveredItem(item.to)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={({ isActive }) => `
                      group flex items-center gap-3 px-3 py-2 rounded-control text-xs font-medium transition-surface relative
                      ${isActive 
                        ? 'tactile-active-nav text-palette-dark dark:text-palette-sand font-semibold' 
                        : 'text-olive-600 dark:text-olive-300 hover:text-palette-dark dark:hover:text-palette-sand hover:bg-black/5 dark:hover:bg-white/5'
                      }
                      ${isCollapsed ? 'justify-center px-2' : ''}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        {/* Glowing Green Tab Indicator from SmartShort snapshot */}
                        {isActive && <span className="glowing-indicator" />}

                        <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} />

                        {!isCollapsed && (
                          <span className="truncate flex-1">{item.label}</span>
                        )}

                        {!isCollapsed && item.count && (
                          <span className="badge-count shrink-0">
                            {item.count}
                          </span>
                        )}

                        {!isCollapsed && isActive && (
                          <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                        )}
                      </>
                    )}
                  </NavLink>

                  {/* Floating Tooltip in Collapsed Mode (from eevo.team snapshot) */}
                  {isCollapsed && hoveredItem === item.to && (
                    <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 z-50 pointer-events-none animate-in fade-in duration-150">
                      <div className="bg-white text-palette-dark px-3 py-1.5 rounded-control shadow-soft-lg text-xs font-medium whitespace-nowrap border border-black/10 flex items-center gap-1.5">
                        <span>{item.label}</span>
                        {item.count && (
                          <span className="px-1.5 py-0.2 rounded-full bg-palette-dark text-palette-sand text-[10px] font-mono">
                            {item.count}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Section: Data & Rules */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-1 text-[10px] font-mono font-semibold tracking-wider uppercase text-olive-500 dark:text-olive-400">
                Governance &amp; Master
              </div>
            )}

            {navItems.filter(i => i.section === 'data').map(item => {
              const Icon = item.icon;
              return (
                <div key={item.to} className="relative">
                  <NavLink
                    to={item.to}
                    onMouseEnter={() => setHoveredItem(item.to)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={({ isActive }) => `
                      group flex items-center gap-3 px-3 py-2 rounded-control text-xs font-medium transition-surface relative
                      ${isActive 
                        ? 'tactile-active-nav text-palette-dark dark:text-palette-sand font-semibold' 
                        : 'text-olive-600 dark:text-olive-300 hover:text-palette-dark dark:hover:text-palette-sand hover:bg-black/5 dark:hover:bg-white/5'
                      }
                      ${isCollapsed ? 'justify-center px-2' : ''}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <span className="glowing-indicator" />}
                        <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                        {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                        {!isCollapsed && isActive && (
                          <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                        )}
                      </>
                    )}
                  </NavLink>

                  {isCollapsed && hoveredItem === item.to && (
                    <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 z-50 pointer-events-none animate-in fade-in duration-150">
                      <div className="bg-white text-palette-dark px-3 py-1.5 rounded-control shadow-soft-lg text-xs font-medium whitespace-nowrap border border-black/10">
                        {item.label}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Bottom Area: Storage Indicator & Demo Profile */}
      <div className="p-3 border-t border-black/5 dark:border-white/5 space-y-2">
        {/* Storage Engine Status */}
        {!isCollapsed ? (
          <div className="p-2.5 rounded-control bg-raised-light dark:bg-raised-dark border border-black/5 dark:border-white/5 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-olive-500 dark:text-olive-400">
              <span className="flex items-center gap-1 font-mono uppercase tracking-wider text-[10px]">
                <Database className="w-3 h-3" />
                Store Mode
              </span>
              <span className={`w-2 h-2 rounded-full ${isMongo ? 'bg-emerald-500' : 'bg-[#E0DDBD]'}`} />
            </div>
            <div className="font-semibold text-palette-dark dark:text-palette-sand truncate">
              {isMongo ? 'MongoDB Cluster' : 'Local File Store'}
            </div>
            <p className="text-[10px] text-olive-500 dark:text-olive-400 leading-tight">
              {isMongo ? 'Mongoose active' : 'server/data/store.json'}
            </p>
          </div>
        ) : (
          <div className="flex justify-center p-2" title={isMongo ? 'MongoDB Connected' : 'Local File Store'}>
            <span className={`w-2.5 h-2.5 rounded-full ${isMongo ? 'bg-emerald-500' : 'bg-[#E0DDBD]'}`} />
          </div>
        )}

        {/* Demo User Pill */}
        <div className={`flex items-center gap-2 p-1.5 rounded-control ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-palette-cream dark:bg-palette-dark text-palette-dark dark:text-palette-cream flex items-center justify-center font-mono font-bold text-[11px] shrink-0 border border-black/5 dark:border-white/10 shadow-sm">
            QA
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="text-xs font-semibold text-palette-dark dark:text-palette-sand truncate leading-tight">
                Senior QA Lead
              </div>
              <div className="text-[10px] text-olive-500 dark:text-olive-400 truncate">
                Capstone Demo Session
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
