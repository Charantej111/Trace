import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquare, Zap, Target, X } from 'lucide-react';
import { useTraceStore } from '@/lib/store';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { feedbackList, painPoints, opportunities } = useTraceStore();

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
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs z-50 flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-xs text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search feedback, problem clusters, opportunities, roadmap..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono-numbers border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {!query && (
            <div className="p-5 text-center text-slate-400 dark:text-slate-500">
              <p className="text-xs">Type a keyword or problem title to search across Trace...</p>
            </div>
          )}

          {/* Feedback Matches */}
          {filteredFeedback.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">Customer Feedback</span>
              {filteredFeedback.map(f => (
                <div
                  key={f.id}
                  onClick={() => handleSelect('/feedback')}
                  className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-2.5 text-slate-800 dark:text-slate-200"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="truncate">{f.originalText}</span>
                </div>
              ))}
            </div>
          )}

          {/* Problem Matches */}
          {filteredProblems.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">Problem Intelligence</span>
              {filteredProblems.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleSelect('/insights')}
                  className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-2.5 text-slate-800 dark:text-slate-200"
                >
                  <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="font-semibold truncate">{p.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* Opportunity Matches */}
          {filteredOpportunities.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">Opportunities</span>
              {filteredOpportunities.map(o => (
                <div
                  key={o.id}
                  onClick={() => handleSelect('/opportunities')}
                  className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-2.5 text-slate-800 dark:text-slate-200"
                >
                  <Target className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="font-semibold truncate">{o.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
