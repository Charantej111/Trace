import React, { useState, useMemo } from 'react';
import {
  Inbox,
  Flame,
  Search,
  Clock,
  ChevronRight,
  Filter,
  X
} from 'lucide-react';
import { useTraceStore } from '@/lib/store';
import { Feedback } from '@/types/trace';
import { FeedbackDetailDrawer } from '@/components/feedback/FeedbackDetailDrawer';
import { CustomSelect } from '@/components/ui/CustomSelect';
import {
  isVerifiedAtom,
  getVerifiedAtoms,
  getCustomerDisplayName,
  getSegmentDisplayName,
  formatSourceType,
  formatEvidenceDate
} from '@/lib/evidence-utils';

export function InboxPage() {
  const { feedbackList, isProcessing, activeStage } = useTraceStore();
  const [filterTab, setFilterTab] = useState<'all' | 'critical' | 'unreviewed' | 'emerging'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  // Compact dynamic filters
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedIntent, setSelectedIntent] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Dynamic distinct lists extracted from real data
  const availableSources = useMemo(() => {
    const set = new Set<string>();
    feedbackList.forEach(f => {
      if (f.sourceType) set.add(f.sourceType);
    });
    return Array.from(set);
  }, [feedbackList]);

  const availableSegments = useMemo(() => {
    const set = new Set<string>();
    feedbackList.forEach(f => {
      if (f.customerSegmentName?.trim()) {
        set.add(f.customerSegmentName.trim());
      }
    });
    return Array.from(set);
  }, [feedbackList]);

  // Tab counts dynamically calculated from real persisted records
  const criticalCount = useMemo(
    () => feedbackList.filter(f => getVerifiedAtoms(f).some(a => a.severity === 'critical')).length,
    [feedbackList]
  );

  const lowRatingCount = useMemo(
    () => feedbackList.filter(f => f.rating !== undefined && f.rating !== null && f.rating <= 2).length,
    [feedbackList]
  );

  const emergingCount = useMemo(
    () =>
      feedbackList.filter(f =>
        getVerifiedAtoms(f).some(
          a =>
            a.atomText.toLowerCase().includes('crash') ||
            a.atomText.toLowerCase().includes('latency') ||
            a.severity === 'critical'
        )
      ).length,
    [feedbackList]
  );

  const hasActiveSecondaryFilters =
    selectedSource !== 'all' ||
    selectedIntent !== 'all' ||
    selectedSeverity !== 'all' ||
    selectedSegment !== 'all' ||
    selectedStatus !== 'all';

  const handleClearFilters = () => {
    setSelectedSource('all');
    setSelectedIntent('all');
    setSelectedSeverity('all');
    setSelectedSegment('all');
    setSelectedStatus('all');
    setSearchQuery('');
  };

  const filteredItems = useMemo(() => {
    return feedbackList.filter(item => {
      const verifiedAtoms = getVerifiedAtoms(item);

      // 1. Primary Filter Tabs
      if (filterTab === 'critical') {
        if (!verifiedAtoms.some(a => a.severity === 'critical')) return false;
      } else if (filterTab === 'emerging') {
        if (
          !verifiedAtoms.some(
            a =>
              a.atomText.toLowerCase().includes('crash') ||
              a.atomText.toLowerCase().includes('latency') ||
              a.severity === 'critical'
          )
        ) {
          return false;
        }
      } else if (filterTab === 'unreviewed') {
        if (!item.rating || item.rating > 2) return false;
      }

      // 2. Secondary Dropdown Filters
      if (selectedSource !== 'all' && item.sourceType !== selectedSource) {
        return false;
      }

      if (selectedIntent !== 'all') {
        if (!verifiedAtoms.some(a => a.intent === selectedIntent)) {
          return false;
        }
      }

      if (selectedSeverity !== 'all') {
        if (!verifiedAtoms.some(a => a.severity === selectedSeverity)) {
          return false;
        }
      }

      if (selectedSegment !== 'all') {
        const seg = item.customerSegmentName?.trim() || 'Unassigned';
        if (seg !== selectedSegment) return false;
      }

      if (selectedStatus !== 'all') {
        const stat = item.status || 'valid';
        if (stat !== selectedStatus) return false;
      }

      // 3. Search Query across real persisted data & verified atoms only
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesOriginal = item.originalText.toLowerCase().includes(q);
        const matchesCustomer = item.customerName?.toLowerCase().includes(q);
        const matchesExtId = item.externalId?.toLowerCase().includes(q);
        const matchesSegment = item.customerSegmentName?.toLowerCase().includes(q);
        const matchesSource = item.sourceType?.toLowerCase().includes(q);
        const matchesVerifiedAtoms = verifiedAtoms.some(
          a =>
            a.atomText.toLowerCase().includes(q) ||
            a.intent.toLowerCase().includes(q) ||
            a.severity.toLowerCase().includes(q)
        );
        const matchesMetadata = item.normalizedMetadata
          ? JSON.stringify(item.normalizedMetadata).toLowerCase().includes(q)
          : false;

        if (
          !matchesOriginal &&
          !matchesCustomer &&
          !matchesExtId &&
          !matchesSegment &&
          !matchesSource &&
          !matchesVerifiedAtoms &&
          !matchesMetadata
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    feedbackList,
    filterTab,
    selectedSource,
    selectedIntent,
    selectedSeverity,
    selectedSegment,
    selectedStatus,
    searchQuery
  ]);

  return (
    <div className="space-y-4 text-slate-900 dark:text-[#EDEDED]">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1F232B] pb-3.5">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-[#EDEDED] flex items-center gap-2">
            <span>Feedback Ingestion Queue & Evidence Triage</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#8C92A4] mt-0.5 font-mono">
            Immutable customer evidence feed with verified atom clause extractions and metadata.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#121418] border border-slate-200 dark:border-[#1F232B] text-xs font-semibold">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filterTab === 'all'
                ? 'bg-white dark:bg-[#181B22] text-slate-900 dark:text-[#EDEDED] shadow-2xs font-bold'
                : 'text-slate-600 dark:text-[#8C92A4] hover:text-slate-900 dark:hover:text-[#EDEDED]'
            }`}
          >
            All ({feedbackList.length})
          </button>
          <button
            onClick={() => setFilterTab('critical')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filterTab === 'critical'
                ? 'bg-rose-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-[#8C92A4] hover:text-slate-900 dark:hover:text-[#EDEDED]'
            }`}
          >
            Critical ({criticalCount})
          </button>
          <button
            onClick={() => setFilterTab('unreviewed')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filterTab === 'unreviewed'
                ? 'bg-amber-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-[#8C92A4] hover:text-slate-900 dark:hover:text-[#EDEDED]'
            }`}
          >
            Low Ratings (≤2★) ({lowRatingCount})
          </button>
          <button
            onClick={() => setFilterTab('emerging')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
              filterTab === 'emerging'
                ? 'bg-[#2E8B75] text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-[#8C92A4] hover:text-slate-900 dark:hover:text-[#EDEDED]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Spikes ({emergingCount})</span>
          </button>
        </div>
      </div>

      {/* Live Processing Indicator */}
      {isProcessing && (
        <div className="p-3.5 rounded-xl surface-card border border-emerald-500/30 flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              Processing batch... Executing stage:{' '}
              <span className="capitalize">
                {activeStage?.stage.replace(/_/g, ' ') || 'Processing'}
              </span>
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 dark:text-[#8C92A4]">
            {activeStage ? `${activeStage.processedItems}/${activeStage.totalItems} items` : 'Running'}
          </span>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by customer, account name, verbatim statement, external ID, or extracted atom..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-[#121418] border border-slate-200 dark:border-[#1F232B] text-xs text-slate-900 dark:text-[#EDEDED] placeholder:text-slate-400 dark:placeholder:text-[#525866] focus:outline-none focus:border-[#2E8B75] shadow-2xs transition-colors"
        />
      </div>

      {/* Compact Dynamic Filters Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mr-1">
          <Filter className="w-3 h-3" />
          <span>FILTERS:</span>
        </div>

        {/* Source Filter */}
        <CustomSelect
          options={[
            { value: 'all', label: 'All Sources' },
            ...availableSources.map((src) => ({
              value: src,
              label: formatSourceType(src)
            }))
          ]}
          value={selectedSource}
          onChange={setSelectedSource}
          className="min-w-32"
        />

        {/* Intent Filter */}
        <CustomSelect
          options={[
            { value: 'all', label: 'All Intents' },
            { value: 'bug_report', label: 'Bug Report' },
            { value: 'feature_request', label: 'Feature Request' },
            { value: 'complaint', label: 'Complaint' },
            { value: 'praise', label: 'Praise' },
            { value: 'question', label: 'Question' }
          ]}
          value={selectedIntent}
          onChange={setSelectedIntent}
          className="min-w-32"
        />

        {/* Severity Filter */}
        <CustomSelect
          options={[
            { value: 'all', label: 'All Severities' },
            { value: 'critical', label: 'Critical' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' }
          ]}
          value={selectedSeverity}
          onChange={setSelectedSeverity}
          className="min-w-32"
        />

        {/* Segment Filter */}
        <CustomSelect
          options={[
            { value: 'all', label: 'All Segments' },
            ...availableSegments.map((seg) => ({
              value: seg,
              label: seg
            })),
            { value: 'Unassigned', label: 'Unassigned' }
          ]}
          value={selectedSegment}
          onChange={setSelectedSegment}
          className="min-w-32"
        />

        {/* Ingestion Status Filter */}
        <CustomSelect
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'valid', label: 'Valid' },
            { value: 'processed', label: 'Processed' },
            { value: 'pending', label: 'Pending' },
            { value: 'duplicate', label: 'Duplicate' },
            { value: 'invalid', label: 'Invalid' }
          ]}
          value={selectedStatus}
          onChange={setSelectedStatus}
          className="min-w-30"
        />


        {/* Clear Filters Button */}
        {hasActiveSecondaryFilters && (
          <button
            onClick={handleClearFilters}
            className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-[#8C92A4] dark:hover:text-[#EDEDED] hover:bg-slate-100 dark:hover:bg-[#181B22] text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Feed List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center surface-card rounded-xl text-xs text-slate-400 dark:text-[#525866] space-y-2">
            <Inbox className="w-8 h-8 text-slate-400 dark:text-[#525866] mx-auto" />
            <p className="font-semibold text-slate-700 dark:text-[#EDEDED]">
              No statements match selected triage filter
            </p>
            <p className="text-[11px]">Try clearing search filters or importing a new feedback file.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const customerDisplay = getCustomerDisplayName(item.customerName);
            const segmentDisplay = getSegmentDisplayName(item.customerSegmentName);
            const sourceDisplay = formatSourceType(item.sourceType);
            const dateDisplay = formatEvidenceDate(item.sourceCreatedAt, item.importedAt);
            const verifiedAtoms = getVerifiedAtoms(item);
            const initial = customerDisplay.charAt(0).toUpperCase();

            return (
              <div
                key={item.id}
                onClick={() => setSelectedFeedback(item)}
                className="p-4 rounded-xl surface-card surface-card-hover space-y-2 text-xs cursor-pointer"
              >
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-[#1F232B] pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-[#181B22] text-slate-700 dark:text-[#EDEDED] font-bold text-[10px] flex items-center justify-center font-mono shrink-0">
                      {initial}
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-[#EDEDED]">
                      {customerDisplay}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#181B22] text-slate-600 dark:text-[#8C92A4] text-[10px] font-mono">
                      {segmentDisplay}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#181B22] text-[#2E8B75] dark:text-[#10B981] text-[10px] font-bold uppercase font-mono tracking-wider">
                      {sourceDisplay}
                    </span>
                    {item.status && item.status !== 'valid' && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/60">
                        {item.status}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-[#525866] font-mono shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{dateDisplay}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Feedback Verbatim */}
                <p className="text-slate-800 dark:text-[#C9CDD8] text-xs leading-relaxed font-normal">
                  "{item.originalText}"
                </p>

                {/* Atoms Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-[#525866] uppercase font-mono tracking-wider mr-1">
                    VERIFIED ATOMS:
                  </span>
                  {verifiedAtoms.length > 0 ? (
                    verifiedAtoms.map((atom) => (
                      <span
                        key={atom.id}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          atom.intent === 'bug_report'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60'
                            : atom.intent === 'feature_request'
                            ? 'bg-slate-100 dark:bg-[#181B22] text-[#2E8B75] dark:text-[#10B981] border border-slate-200 dark:border-[#232833]'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/60'
                        }`}
                      >
                        {atom.intent.replace('_', ' ')} · {atom.severity}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400 dark:text-[#64748B] italic">
                      No verified atoms
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Slide-out Feedback Detail Drawer */}
      {selectedFeedback && (
        <FeedbackDetailDrawer
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
        />
      )}
    </div>
  );
}
