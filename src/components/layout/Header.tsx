import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Sun,
  Moon,
  RotateCcw,
  Bell
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { useTraceStore } from '@/lib/store';
import { useToast } from '@/components/ui/toast';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { workspace, resetToDemoData } = useTraceStore();
  const { addToast } = useToast();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReset = () => {
    if (window.confirm('Reset all Trace data back to the clean baseline demonstration state?')) {
      resetToDemoData();
      addToast({
        type: 'info',
        title: 'Demo State Reset',
        description: 'Workspace restored to clean factory demonstration seed.'
      });
    }
  };

  const handleOpenSearch = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  };

  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Overview';
    if (path.startsWith('/inbox')) return 'Feedback Inbox';
    if (path.startsWith('/feedback')) return 'Feedback Explorer';
    if (path.startsWith('/insights')) return 'Problem Clusters';
    if (path.startsWith('/opportunities')) return 'Opportunities Matrix';
    if (path.startsWith('/decisions')) return 'Decision Memory';
    if (path.startsWith('/roadmap')) return 'Roadmap Telemetry';
    if (path.startsWith('/sources')) return 'Data Sources';
    if (path.startsWith('/settings/context')) return 'Strategic Context';
    return 'Workspace';
  };

  return (
    <header className="h-12 border-b border-slate-200/80 dark:border-[#1a1e2b] bg-white/80 dark:bg-[#090b10]/80 backdrop-blur-md text-slate-900 dark:text-slate-100 px-6 flex items-center justify-between sticky top-0 z-30 text-xs select-none">
      {/* Left Breadcrumb */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold text-slate-400 dark:text-slate-500">
          {workspace.name}
        </span>
        <span className="text-slate-300 dark:text-slate-700">/</span>
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {getBreadcrumbTitle()}
        </span>
      </div>

      {/* Center Search Bar Trigger */}
      <div className="flex-1 max-w-md mx-6">
        <button
          onClick={handleOpenSearch}
          className="w-full relative flex items-center justify-between px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1e2333] bg-slate-50 dark:bg-[#0f121a] hover:bg-slate-100 dark:hover:bg-[#151924] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all text-xs shadow-2xs"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Search feedback, problems, or opportunities...</span>
          </div>

          <div className="flex items-center gap-1 shrink-0 font-mono text-[10px]">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#1a2030] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 shadow-2xs font-semibold">
              ⌘K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right User Actions & Controls */}
      <div className="flex items-center gap-1.5">
        {/* Reset Demo Button */}
        <button
          onClick={handleReset}
          title="Reset Demo Data"
          className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#151924] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Dynamic Dark/Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          title={mounted ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle Theme'}
          className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#151924] transition-colors"
        >
          {mounted && theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-slate-600" />
          )}
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-[#1e2333] mx-1"></div>

        {/* Workspace Account Avatar */}
        <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs font-mono">
          {workspace.name.slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
