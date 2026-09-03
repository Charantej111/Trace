import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Overview';
    if (path.startsWith('/audit')) return 'Audit';
    if (path.startsWith('/inbox')) return 'Inbox';
    if (path.startsWith('/feedback')) return 'Feedback Explorer';
    if (path.startsWith('/insights')) return 'Insights & Clusters';
    if (path.startsWith('/opportunities')) return 'Opportunities Matrix';
    if (path.startsWith('/decisions')) return 'Decision Memory';
    if (path.startsWith('/roadmap')) return 'Roadmap';
    if (path.startsWith('/sources')) return 'Feedback Sources';
    if (path.startsWith('/settings/context')) return 'Product Context & Settings';
    return 'Workspace';
  };

  return (
    <header className="h-12 border-b border-slate-200/90 dark:border-white/8 bg-white/80 dark:bg-[#0E1013]/90 backdrop-blur-xl text-slate-900 dark:text-[#EDEDED] px-6 flex items-center justify-between sticky top-0 z-30 text-xs select-none shadow-2xs">
      {/* Left Page Title */}
      <div className="flex items-center">
        <span className="font-bold text-slate-900 dark:text-[#EDEDED] text-xs tracking-tight">
          {getPageTitle()}
        </span>
      </div>

      {/* Right Quick Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleTheme}
          title={mounted ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle Theme'}
          className="p-1.5 rounded-lg text-slate-400 dark:text-[#8C92A4] hover:text-slate-700 dark:hover:text-[#EDEDED] hover:bg-slate-100 dark:hover:bg-[#1A1E26] transition-colors"
        >
          {mounted && theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-slate-600" />
          )}
        </button>
      </div>
    </header>
  );
}
