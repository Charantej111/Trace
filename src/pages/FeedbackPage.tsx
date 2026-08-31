import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  X,
  Star,
  Zap,
  Target,
  ChevronDown,
  Copy,
  Check,
  Filter
} from 'lucide-react';
import { useTraceStore } from '@/lib/store';
import { Feedback, FeedbackAtom } from '@/types/trace';
import { AtomHighlighter } from '@/components/feedback/AtomHighlighter';
import { useToast } from '@/components/ui/toast';

export function FeedbackPage() {
  const { feedbackList, customerSegments } = useTraceStore();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedSentiment, setSelectedSentiment] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedSegment, setSelectedSegment] = useState('all');

  const [activeFeedback, setActiveFeedback] = useState<Feedback | null>(() => {
    return feedbackList[0] || null;
  });

  const [selectedAtom, setSelectedAtom] = useState<FeedbackAtom | null>(null);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const filteredFeedback = feedbackList.filter((item) => {
    if (selectedSource !== 'all' && item.sourceType !== selectedSource) return false;
    if (selectedSegment !== 'all' && item.customerSegmentName !== selectedSegment) return false;

    if (selectedSentiment !== 'all') {
      const match = item.atoms?.some((a) => a.sentiment === selectedSentiment);
      if (!match) return false;
    }

    if (selectedSeverity !== 'all') {
      const match = item.atoms?.some((a) => a.severity === selectedSeverity);
      if (!match) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = item.originalText.toLowerCase().includes(q);
      const matchCustomer = item.customerName?.toLowerCase().includes(q);
      if (!matchText && !matchCustomer) return false;
    }

    return true;
  });

  const handleCopyQuote = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    addToast({
      type: 'success',
      title: 'Copied to Clipboard',
      description: 'Customer quote statement copied successfully.'
    });
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  return (
    <div className="space-y-4 text-slate-900 dark:text-slate-100">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">Customer Feedback Explorer</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Search and investigate verbatim customer statements and span-level evidence quotes.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono-numbers">
          <span className="text-slate-600 dark:text-slate-400">
            Statements: <strong className="text-slate-900 dark:text-slate-100 font-bold">{feedbackList.length}</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-600 dark:text-slate-400">
            Evidence Quotes: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{feedbackList.reduce((acc, f) => acc + (f.atoms?.length || 0), 0)}</strong>
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 card-shadow flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search statement text, account name, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Source Dropdown */}
        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="all">All Sources</option>
          <option value="csv">CSV Ingestions</option>
          <option value="google_play">Google Play</option>
          <option value="app_store">App Store</option>
          <option value="zendesk">Zendesk</option>
          <option value="intercom">Intercom</option>
          <option value="sales_call">Sales Calls</option>
        </select>

        {/* Sentiment Dropdown */}
        <select
          value={selectedSentiment}
          onChange={(e) => setSelectedSentiment(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="all">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>

        {/* Severity Dropdown */}
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Main 2-Column Split: Statement List + Atom Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 6 Cols: Statement Feed */}
        <div className="lg:col-span-6 space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
            Matching Statements ({filteredFeedback.length})
          </span>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {filteredFeedback.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 card-shadow text-xs text-slate-400">
                No customer statements found matching your criteria.
              </div>
            ) : (
              filteredFeedback.map((fb) => {
                const isSelected = activeFeedback?.id === fb.id;

                return (
                  <div
                    key={fb.id}
                    onClick={() => {
                      setActiveFeedback(fb);
                      setSelectedAtom(null);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 text-xs card-shadow ${
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500/80 ring-1 ring-indigo-500/40'
                        : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {fb.customerName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-mono-numbers">
                          {fb.customerSegmentName}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono-numbers text-slate-400">
                        {new Date(fb.sourceCreatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {fb.originalText}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 font-mono-numbers">
                      <span>Source: {fb.sourceType}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{fb.atoms?.length || 0} atoms extracted</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 6 Cols: Active Statement Deep-Dive & Atom Inspector */}
        <div className="lg:col-span-6 sticky top-20 space-y-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
            Span-Level Atom Breakdown
          </span>

          {activeFeedback ? (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 card-shadow space-y-4 text-xs">
              {/* Header Info */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {activeFeedback.customerName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{activeFeedback.customerSegmentName}</span>
                    <span>·</span>
                    <span>{activeFeedback.sourceType}</span>
                    <span>·</span>
                    <span className="font-mono-numbers">{new Date(activeFeedback.sourceCreatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyQuote(activeFeedback.originalText)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {copiedQuote ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedQuote ? 'Copied' : 'Copy Quote'}</span>
                </button>
              </div>

              {/* Annotated Interactive Text */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Interactive Clause Extraction (Click to inspect)
                </span>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                  <AtomHighlighter
                    originalText={activeFeedback.originalText}
                    atoms={activeFeedback.atoms}
                    selectedAtomId={selectedAtom?.id}
                    onSelectAtom={(atom) => setSelectedAtom(atom)}
                  />
                </div>
              </div>

              {/* Selected Atom Details Inspector */}
              {selectedAtom ? (
                <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/40 pb-2">
                    <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      Atom Analysis
                    </span>
                    <button onClick={() => setSelectedAtom(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono-numbers">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/30">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Intent</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{selectedAtom.intent}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/30">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Severity</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">{selectedAtom.severity}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/30">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Sentiment</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{selectedAtom.sentiment}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/30">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Confidence</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedAtom.confidence}</span>
                    </div>
                  </div>

                  {selectedAtom.underlyingProblemHint && (
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/30 text-[11px]">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Underlying Problem Inferred</span>
                      <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">{selectedAtom.underlyingProblemHint}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-[11px]">
                  Click on any highlighted clause above to inspect intent, sentiment, and underlying problem hints.
                </div>
              )}

              {/* Technical Details Toggle */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTechnicalDetails ? 'rotate-180' : ''}`} />
                  <span>Technical Ingestion Payload</span>
                </button>

                {showTechnicalDetails && (
                  <pre className="mt-2 p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[10px] overflow-x-auto">
                    {JSON.stringify(
                      {
                        id: activeFeedback.id,
                        fingerprint: activeFeedback.fingerprint,
                        device: activeFeedback.deviceInfo,
                        appVersion: activeFeedback.appVersion,
                        importedAt: activeFeedback.importedAt
                      },
                      null,
                      2
                    )}
                  </pre>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 card-shadow text-xs text-slate-400">
              Select a customer statement from the list to inspect.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
