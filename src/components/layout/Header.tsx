import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, RotateCcw } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { useTraceStore } from '@/lib/store';
import { useToast } from '@/components/ui/toast';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { resetToDemoData } = useTraceStore();
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

  const getPageTitle = () => {
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
    <header className="h-11 border-b border-slate-200 dark:border-[#1A1D24] bg-white dark:bg-[#0C0D10] text-slate-900 dark:text-[#EDEDED] px-6 flex items-center justify-between sticky top-0 z-30 text-xs select-none">
      {/* Left Page Title */}
      <div className="flex items-center">
        <span className="font-bold text-slate-900 dark:text-[#EDEDED] text-xs tracking-tight">
          {getPageTitle()}
        </span>
      </div>

      {/* Right Quick Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleReset}
          title="Reset Demo Data"
          className="p-1.5 rounded-md text-slate-400 dark:text-[#8C92A4] hover:text-slate-700 dark:hover:text-[#EDEDED] hover:bg-slate-100 dark:hover:bg-[#181B22] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={toggleTheme}
          title={mounted ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle Theme'}
          className="p-1.5 rounded-md text-slate-400 dark:text-[#8C92A4] hover:text-slate-700 dark:hover:text-[#EDEDED] hover:bg-slate-100 dark:hover:bg-[#181B22] transition-colors"
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
