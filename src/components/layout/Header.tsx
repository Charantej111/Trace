import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Search,
  Sun,
  Moon,
  RotateCcw,
  Bell,
  Upload,
  Sparkles
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { useTraceStore } from '@/lib/store';
import { useToast } from '@/components/ui/toast';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { workspace, resetToDemoData, isDemoMode } = useTraceStore();
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
    if (path.startsWith('/inbox')) return 'Inbox';
    if (path.startsWith('/feedback')) return 'Feedback Explorer';
    if (path.startsWith('/insights')) return 'Insights & Clusters';
    if (path.startsWith('/opportunities')) return 'Opportunities Matrix';
    if (path.startsWith('/decisions')) return 'Decision Memory';
    if (path.startsWith('/roadmap')) return 'Roadmap';
    if (path.startsWith('/sources')) return 'Data Sources';
    if (path.startsWith('/settings/context')) return 'Product Context';
    return 'Workspace';
  };

  return (
    <header className="h-11 border-b border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 px-5 flex items-center justify-between sticky top-0 z-30 text-xs select-none">
      {/* Left Breadcrumb & Status */}
      <div className="flex items-center gap-2.5 text-xs">
        <span className="font-medium text-slate-500 dark:text-slate-400 font-mono">
          {workspace.name}
        </span>
        {isDemoMode ? (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
            DEMO DATA
          </span>
        ) : (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
            LIVE DATA
          </span>
        )}
        <span className="text-slate-300 dark:text-slate-700">/</span>
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {getBreadcrumbTitle()}
        </span>
      </div>

      {/* Center Search Bar Trigger */}
      <div className="flex-1 max-w-sm mx-4">
        <button
          onClick={handleOpenSearch}
          className="w-full flex items-center justify-between px-2.5 py-1 rounded-md border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#334155]/60 text-slate-500 dark:text-slate-400 transition-colors text-xs"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Search feedback, problems, or opportunities...</span>
          </div>

          <kbd className="px-1.5 py-0.2 rounded bg-white dark:bg-[#0F172A] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[#334155] font-mono text-[10px] font-semibold shrink-0">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right User Actions & Primary Action */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleReset}
          title="Reset Demo Data"
          className="p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={toggleTheme}
          title={mounted ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle Theme'}
          className="p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors"
        >
          {mounted && theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-slate-600" />
          )}
        </button>

        <Link
          to="/sources"
          className="px-3 py-1 rounded-md bg-[#2E8B75] hover:bg-[#1F6B58] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Import feedback</span>
        </Link>
      </div>
    </header>
  );
}
