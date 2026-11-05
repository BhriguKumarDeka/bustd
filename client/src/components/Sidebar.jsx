import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ScanSearch, 
  History, 
  Package, 
  BookOpenCheck,
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
  Plus
} from 'lucide-react';
import BustdLogo from './BustdLogo';

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const [hoveredItem, setHoveredItem] = useState(null);

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard, section: 'main' },
    { to: '/inspections/new', label: 'New Inspection', icon: ScanSearch, highlight: true, section: 'main' },
    { to: '/history', label: 'Inspection Archive', icon: History, count: 2, section: 'main' },
    { to: '/products', label: 'Product Catalog', icon: Package, section: 'data' },
    { to: '/rules', label: 'Rule Library', icon: BookOpenCheck, section: 'data' },
  ];

  return (
    <aside 
      className={`relative shrink-0 bg-surface-overlay backdrop-blur-xl border-r border-subtle flex flex-col justify-between h-screen sticky top-0 transition-all duration-200 select-none z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Top Header: Responsive Interactive BUSTD Logo & Collapse Toggle */}
        <div className={`p-4 pb-3 flex items-center justify-between border-b border-subtle ${isCollapsed ? 'justify-center' : ''}`}>
          <BustdLogo collapsed={isCollapsed} showTagline={!isCollapsed} />

          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-interactive transition-colors"
              title="Collapse Sidebar"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed expand button */}
        {isCollapsed && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-interactive transition-colors"
              title="Expand Sidebar"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="px-3 pt-3 space-y-4">
          {/* Section: Main Workspace */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="flex items-center justify-between px-3 py-1 text-[10px] font-mono font-semibold tracking-wider uppercase text-muted">
                <span>Inspection Suite</span>
                <NavLink to="/inspections/new" title="New scan">
                  <Plus className="w-3 h-3 hover:text-primary transition-colors" />
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
                      group flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all relative
                      ${isActive 
                        ? 'tactile-active-nav font-semibold' 
                        : 'text-secondary hover:text-primary hover:bg-surface-interactive'
                      }
                      ${isCollapsed ? 'justify-center px-2' : ''}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        {/* Radiant Gradient Tab Indicator */}
                        {isActive && <span className="glowing-indicator" />}

                        <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-105 text-pink-500 dark:text-pink-400' : 'group-hover:scale-105'}`} />

                        {!isCollapsed && (
                          <span className={`truncate flex-1 ${isActive ? 'font-semibold text-primary' : ''}`}>
                            {item.label}
                          </span>
                        )}

                        {!isCollapsed && item.count && (
                          <span className="badge-count shrink-0">
                            {item.count}
                          </span>
                        )}

                        {!isCollapsed && isActive && (
                          <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0 text-muted" />
                        )}
                      </>
                    )}
                  </NavLink>

                  {/* Floating Tooltip in Collapsed Mode */}
                  {isCollapsed && hoveredItem === item.to && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none animate-in fade-in duration-150">
                      <div className="bg-surface-raised text-primary px-3 py-1.5 rounded-xl shadow-soft-lg text-xs font-medium whitespace-nowrap border border-subtle flex items-center gap-2">
                        <span>{item.label}</span>
                        {item.count && (
                          <span className="badge-count text-[10px]">
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

          {/* Section: Master Data & Rules */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-1 text-[10px] font-mono font-semibold tracking-wider uppercase text-muted">
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
                      group flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all relative
                      ${isActive 
                        ? 'tactile-active-nav font-semibold' 
                        : 'text-secondary hover:text-primary hover:bg-surface-interactive'
                      }
                      ${isCollapsed ? 'justify-center px-2' : ''}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <span className="glowing-indicator" />}
                        <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-105 text-pink-500 dark:text-pink-400' : 'group-hover:scale-105'}`} />
                        {!isCollapsed && (
                          <span className={`truncate flex-1 ${isActive ? 'font-semibold text-primary' : ''}`}>
                            {item.label}
                          </span>
                        )}
                        {!isCollapsed && isActive && (
                          <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0 text-muted" />
                        )}
                      </>
                    )}
                  </NavLink>

                  {isCollapsed && hoveredItem === item.to && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none animate-in fade-in duration-150">
                      <div className="bg-surface-raised text-primary px-3 py-1.5 rounded-xl shadow-soft-lg text-xs font-medium whitespace-nowrap border border-subtle">
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

      {/* Bottom Area: Clean Demo User Profile */}
      <div className="p-3 border-t border-subtle">
        <div className={`flex items-center gap-2.5 p-1.5 rounded-xl ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-bustd text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
            QA
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="text-xs font-semibold text-primary truncate leading-tight">
                Senior QA Lead
              </div>
              <div className="text-[10px] text-muted truncate mt-0.5">
                Packaging Inspector
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
