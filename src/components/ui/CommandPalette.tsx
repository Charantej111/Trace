import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquare, Zap, Target, X, ArrowRight, CornerDownLeft, Sparkles, Kanban, History } from 'lucide-react';
import { useTraceStore } from '@/lib/store';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { feedbackList, painPoints, opportunities, roadmapItems, decisions } = useTraceStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const filteredFeedback = query ? feedbackList.filter(f => f.originalText.toLowerCase().includes(query.toLowerCase())).slice(0, 3) : [];
  const filteredProblems = query ? painPoints.filter(p => p.title.toLowerCase().includes(query.toLowerCase())).slice(0, 3) : [];
  const filteredOpportunities = query ? opportunities.filter(o => o.title.toLowerCase().includes(query.toLowerCase())).slice(0, 3) : [];

  const handleSelect = (url: string) => {
    navigate(url);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md z-50 flex items-start justify-center pt-24 p-4 animate-in fade-in duration-100">
      <div className="w-full max-w-xl bg-white dark:bg-[#0d0f15] rounded-2xl border border-slate-200 dark:border-[#1e2333] shadow-2xl overflow-hidden text-xs text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-100">
        {/* Search Header */}
        <div className="p-3.5 border-b border-slate-100 dark:border-[#171b26] flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search feedback verbatim, problem clusters, opportunities, decisions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#161a26] text-slate-500 dark:text-slate-400 font-mono border border-slate-200 dark:border-[#262f44]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-84 overflow-y-auto p-2 space-y-3">
          {!query && (
            <div className="p-4 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider px-2">Quick Navigation</span>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {[
                  { name: 'Executive Overview', path: '/', icon: Sparkles },
                  { name: 'Feedback Explorer', path: '/feedback', icon: MessageSquare },
                  { name: 'Problem Clusters', path: '/insights', icon: Zap },
                  { name: 'Prioritization Matrix', path: '/opportunities', icon: Target },
                  { name: 'Roadmap Telemetry', path: '/roadmap', icon: Kanban },
                  { name: 'Decision Memory', path: '/decisions', icon: History }
                ].map((item) => (
                  <div
                    key={item.name}
                    onClick={() => handleSelect(item.path)}
                    className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#131620] cursor-pointer flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium transition-colors border border-transparent hover:border-slate-200/80 dark:hover:border-[#1e2333]"
                  >
                    <item.icon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Matches */}
          {filteredFeedback.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider px-2">Customer Statements</span>
              {filteredFeedback.map(f => (
                <div
                  key={f.id}
                  onClick={() => handleSelect('/feedback')}
                  className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#131620] cursor-pointer flex items-center justify-between text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{f.originalText}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{f.customerName}</span>
                </div>
              ))}
            </div>
          )}

          {/* Problem Matches */}
          {filteredProblems.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider px-2">Problem Intelligence</span>
              {filteredProblems.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleSelect('/insights')}
                  className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#131620] cursor-pointer flex items-center justify-between text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="font-bold truncate">{p.title}</span>
                  </div>
                  <span className="text-[10px] font-mono-numbers text-slate-400 shrink-0">{p.frequency} mentions</span>
                </div>
              ))}
            </div>
          )}

          {/* Opportunity Matches */}
          {filteredOpportunities.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider px-2">Strategic Opportunities</span>
              {filteredOpportunities.map(o => (
                <div
                  key={o.id}
                  onClick={() => handleSelect('/opportunities')}
                  className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#131620] cursor-pointer flex items-center justify-between text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <Target className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="font-bold truncate">{o.title}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0">Score: {o.overallPriorityScore}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="p-2.5 border-t border-slate-100 dark:border-[#171b26] flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>Trace OmniSearch</span>
        </div>
      </div>
    </div>
  );
}
