import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  HelpCircle,
  Bell,
  Building2,
  Sun,
  Moon,
  RotateCcw
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { useTraceStore } from '@/lib/store';
import { useToast } from '@/components/ui/toast';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { resetToDemoData } = useTraceStore();
  const { addToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReset = () => {
    if (window.confirm('Reset all Trace data back to the clean demonstration seed state?')) {
      resetToDemoData();
      addToast({
        type: 'info',
        title: 'Demo State Reset',
        description: 'Trace workspace data has been restored to factory baseline.'
      });
    }
  };

  const handleOpenSearch = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  };

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-slate-100 px-6 flex items-center justify-between sticky top-0 z-30 text-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
      {/* Left Workspace Indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-bold cursor-pointer transition-colors">
        <div className="w-4 h-4 rounded bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shrink-0 font-extrabold text-[10px]">
          <Building2 className="w-2.5 h-2.5" />
        </div>
        <span>Acme Cloud Platform</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 ml-1" />
      </div>

      {/* Center Search Bar Trigger */}
      <div className="flex-1 max-w-xl mx-8">
        <button
          onClick={handleOpenSearch}
          className="w-full relative flex items-center text-left px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mr-2.5 shrink-0" />
          <span className="flex-1 truncate">Search feedback, anomalies, opportunities...</span>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-mono-numbers border border-slate-200 dark:border-slate-800 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Actions & User Profile */}
      <div className="flex items-center gap-3">
        {/* Reset Demo Data */}
        <button
          onClick={handleReset}
          title="Reset to Demo State"
          className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Dynamic Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={mounted ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle Theme'}
          className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {mounted && theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        <button title="Help & Documentation" className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Notification Bell */}
        <button title="Notifications" className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center absolute top-1 right-1 ring-2 ring-white dark:ring-slate-900 font-mono-numbers">
            3
          </span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2.5 border-l border-slate-200 dark:border-slate-800 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center text-xs font-bold shadow-xs">
            <span className="text-[11px]">AR</span>
          </div>
          <div className="hidden lg:block text-left leading-tight">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Alex Rivera</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Principal PM</p>
          </div>
        </div>
      </div>
    </header>
  );
}
