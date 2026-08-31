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
  Filter,
  Layers,
  ArrowRight,
  Code,
  Sparkles,
  User,
  Clock,
  ExternalLink
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
      title: 'Quote Copied to Clipboard',
      description: 'Customer statement is formatted and ready to paste into PRDs.'
    });
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  return (
    <div className="space-y-4 text-slate-900 dark:text-slate-100">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-[#1a1e2b] pb-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Feedback Explorer & Clause Extraction
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Investigate verbatim customer voice, span-level atom tokenization, and inferred struggle taxonomy.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono-numbers">
          <span className="text-slate-600 dark:text-slate-400">
            Statements: <strong className="text-slate-900 dark:text-slate-100 font-bold">{feedbackList.length}</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-600 dark:text-slate-400">
            Atoms: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{feedbackList.reduce((acc, f) => acc + (f.atoms?.length || 0), 0)}</strong>
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 rounded-xl surface-card flex flex-wrap items-center gap-2.5 text-xs">
        <div className="relative flex-1 min-w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search statement verbatim, customer account, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-[#1e2333] text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Dynamic Source Dropdown */}
        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-[#1e2333] text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none capitalize"
        >
          <option value="all">All Channels</option>
          {Array.from(new Set(feedbackList.map(f => f.sourceType))).map(src => (
            <option key={src} value={src}>
              {src.replace('_', ' ')}
            </option>
          ))}
        </select>

        {/* Sentiment Dropdown */}
        <select
          value={selectedSentiment}
          onChange={(e) => setSelectedSentiment(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-[#1e2333] text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="all">All Sentiments</option>
          <option value="positive">Positive Sentiment</option>
          <option value="neutral">Neutral Sentiment</option>
          <option value="negative">Negative Sentiment</option>
        </select>

        {/* Severity Dropdown */}
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-[#1e2333] text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical (Churn Risk)</option>
          <option value="high">High Severity</option>
          <option value="medium">Medium Severity</option>
          <option value="low">Low Severity</option>
        </select>
      </div>

      {/* Main Dual-Pane Explorer: Linear Style */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left 6 Cols: Statements Feed */}
        <div className="lg:col-span-6 space-y-2">
          <div className="flex items-center justify-between px-1 text-[11px] font-mono text-slate-400">
            <span>RESULTS ({filteredFeedback.length})</span>
            <span>SORT: RECENCY</span>
          </div>

          <div className="space-y-2 max-h-180 overflow-y-auto pr-1">
            {filteredFeedback.length === 0 ? (
              <div className="p-8 text-center surface-card rounded-2xl text-xs text-slate-400">
                No customer statements found matching your filter criteria.
              </div>
            ) : (
              filteredFeedback.map((fb) => {
                const isSelected = activeFeedback?.id === fb.id;
                const hasCritical = fb.atoms?.some(a => a.severity === 'critical');

                return (
                  <div
                    key={fb.id}
                    onClick={() => {
                      setActiveFeedback(fb);
                      setSelectedAtom(null);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 text-xs surface-card ${
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500/80 ring-1 ring-indigo-500/30'
                        : 'hover:bg-slate-50 dark:hover:bg-[#131620]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-[#1e2333] text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center font-mono">
                          {(fb.customerName || 'A').charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {fb.customerName || 'Anonymous Account'}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 dark:bg-[#171a24] text-slate-600 dark:text-slate-400 font-mono">
                          {fb.customerSegmentName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasCritical && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-500/20"></span>
                        )}
                        <span className="text-[10px] font-mono-numbers text-slate-400">
                          {new Date(fb.sourceCreatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed text-xs">
                      {fb.originalText}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-[#171b26] text-[10px] text-slate-400 font-mono">
                      <span className="uppercase">{fb.sourceType.replace('_', ' ')}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold font-mono-numbers">
                        {fb.atoms?.length || 0} span atoms
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 6 Cols: Statement Inspector & Clause Deck */}
        <div className="lg:col-span-6 sticky top-16 space-y-3">
          <div className="px-1 text-[11px] font-mono text-slate-400">
            <span>INSPECTION DECK</span>
          </div>

          {activeFeedback ? (
            <div className="p-5 rounded-2xl surface-card space-y-4 text-xs">
              {/* Header Info */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-[#1c2230] pb-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {activeFeedback.customerName}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                      {activeFeedback.customerSegmentName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span className="capitalize">{activeFeedback.sourceType.replace('_', ' ')}</span>
                    {activeFeedback.appVersion && (
                      <>
                        <span>·</span>
                        <span>{activeFeedback.appVersion}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>{new Date(activeFeedback.sourceCreatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyQuote(activeFeedback.originalText)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#161a26] text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-[#1f2535] transition-colors border border-slate-200/80 dark:border-[#262f44]"
                >
                  {copiedQuote ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedQuote ? 'Copied' : 'Copy Quote'}</span>
                </button>
              </div>

              {/* Annotated Interactive Text Deck */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block">
                  Interactive Clause Extraction (Click clause to inspect taxonomy)
                </span>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200/80 dark:border-[#1e2333] text-xs">
                  <AtomHighlighter
                    originalText={activeFeedback.originalText}
                    atoms={activeFeedback.atoms}
                    selectedAtomId={selectedAtom?.id}
                    onSelectAtom={(atom) => setSelectedAtom(atom)}
                  />
                </div>
              </div>

              {/* Selected Atom Details Box */}
              {selectedAtom ? (
                <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/40 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/40 pb-2">
                    <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5 text-xs font-mono">
                      <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      Atom Analysis: [{selectedAtom.sourceStart}:{selectedAtom.sourceEnd}]
                    </span>
                    <button onClick={() => setSelectedAtom(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono-numbers">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-[#0f121a] border border-indigo-100 dark:border-indigo-900/30">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Intent</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{selectedAtom.intent}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-[#0f121a] border border-indigo-100 dark:border-indigo-900/30">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Severity</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">{selectedAtom.severity}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-[#0f121a] border border-indigo-100 dark:border-indigo-900/30">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Sentiment</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{selectedAtom.sentiment}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-[#0f121a] border border-indigo-100 dark:border-indigo-900/30">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Confidence</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedAtom.confidence}</span>
                    </div>
                  </div>

                  {selectedAtom.underlyingProblemHint && (
                    <div className="p-2.5 rounded-lg bg-white dark:bg-[#0f121a] border border-indigo-100 dark:border-indigo-900/30 text-[11px]">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Inferred Struggle Hypothesis</span>
                      <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">{selectedAtom.underlyingProblemHint}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-dashed border-slate-200 dark:border-[#22283a] text-center text-slate-400 text-[11px]">
                  Click on any colored clause above to inspect intent taxonomy and severity classification.
                </div>
              )}

              {/* Technical JSON Payload Drawer */}
              <div className="border-t border-slate-100 dark:border-[#171b26] pt-3">
                <button
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-mono"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTechnicalDetails ? 'rotate-180' : ''}`} />
                  <span>Technical Ingestion Payload</span>
                </button>

                {showTechnicalDetails && (
                  <pre className="mt-2 p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[10px] overflow-x-auto border border-slate-800">
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
            <div className="p-8 text-center surface-card rounded-2xl text-xs text-slate-400">
              Select a customer statement from the left list.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
