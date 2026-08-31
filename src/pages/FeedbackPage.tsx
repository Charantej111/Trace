import React, { useState } from 'react';
import { useTraceStore } from '@/lib/store';
import { Feedback } from '@/types/trace';
import { Search, MessageSquare, Upload } from 'lucide-react';
import { FeedbackDetailDrawer } from '@/components/feedback/FeedbackDetailDrawer';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Link } from 'react-router-dom';

const SOURCE_OPTIONS = [
  { value: 'all', label: 'All Sources' },
  { value: 'csv', label: 'CSV' },
  { value: 'xlsx', label: 'Excel (XLSX)' },
  { value: 'json', label: 'JSON' },
  { value: 'paste', label: 'Quick Paste' }
];

const SEVERITY_OPTIONS = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
];

const INTENT_OPTIONS = [
  { value: 'all', label: 'All Intents' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'complaint', label: 'Complaint' },
  { value: 'praise', label: 'Praise' }
];

export function FeedbackPage() {
  const { feedbackList } = useTraceStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedIntent, setSelectedIntent] = useState<string>('all');

  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  // Filtered dataset
  const filteredFeedback = feedbackList.filter(item => {
    const matchesSearch = searchQuery === '' ||
      item.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.customerName && item.customerName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSource = selectedSource === 'all' || item.sourceType === selectedSource;
    const matchesSeverity = selectedSeverity === 'all' || item.atoms?.some(a => a.severity === selectedSeverity);
    const matchesIntent = selectedIntent === 'all' || item.atoms?.some(a => a.intent === selectedIntent);

    return matchesSearch && matchesSource && matchesSeverity && matchesIntent;
  });

  return (
    <div className="space-y-4 text-slate-900 dark:text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1E293B] pb-3.5">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Feedback Explorer</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#334155]">
              {filteredFeedback.length.toLocaleString()} records
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tabular customer evidence explorer with text span highlights and full provenance traceability.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Link
            to="/sources"
            className="px-3 py-1.5 rounded-md bg-[#2E8B75] hover:bg-[#1F6B58] text-white font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import feedback</span>
          </Link>
        </div>
      </div>

      {/* Toolbar & Custom Select Filters */}
      <div className="p-3 rounded-lg surface-card flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-60">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by customer quote or account name..."
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs focus:outline-none focus:border-[#2E8B75]"
          />
        </div>

        {/* Custom Select Filters Row */}
        <div className="flex items-center flex-wrap gap-2">
          <CustomSelect
            options={SOURCE_OPTIONS}
            value={selectedSource}
            onChange={setSelectedSource}
          />

          <CustomSelect
            options={SEVERITY_OPTIONS}
            value={selectedSeverity}
            onChange={setSelectedSeverity}
          />

          <CustomSelect
            options={INTENT_OPTIONS}
            value={selectedIntent}
            onChange={setSelectedIntent}
          />
        </div>
      </div>

      {/* Main Data Table */}
      <div className="rounded-lg surface-card overflow-hidden">
        {filteredFeedback.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 space-y-2">
            <MessageSquare className="w-6 h-6 mx-auto text-slate-400" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No Feedback Records Match Filters</p>
            <p className="text-[11px]">Try clearing search or adjusting active filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#0F172A] text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                  <th className="py-2.5 px-3.5">CUSTOMER / ACCOUNT</th>
                  <th className="py-2.5 px-3.5">SOURCE</th>
                  <th className="py-2.5 px-3.5">VERBATIM CUSTOMER STATEMENT</th>
                  <th className="py-2.5 px-3.5">SEVERITY</th>
                  <th className="py-2.5 px-3.5">SEGMENT</th>
                  <th className="py-2.5 px-3.5 text-right">DATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#334155]">
                {filteredFeedback.map(item => {
                  const primaryAtom = item.atoms?.[0];
                  const severity = primaryAtom?.severity || 'medium';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedFeedback(item)}
                      className="hover:bg-slate-50 dark:hover:bg-[#334155]/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {item.customerName || 'Anonymous Account'}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-[11px] uppercase text-slate-500 whitespace-nowrap">
                        {item.sourceType}
                      </td>
                      <td className="py-3 px-3.5 font-normal text-slate-800 dark:text-slate-200 max-w-md truncate">
                        "{item.originalText}"
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase ${
                          severity === 'critical' || severity === 'high'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                            : 'bg-slate-100 dark:bg-[#0F172A] text-slate-700 dark:text-slate-300'
                        }`}>
                          {severity}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {item.customerSegmentName || 'SMB'}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-[10px] text-slate-400 text-right whitespace-nowrap">
                        {new Date(item.sourceCreatedAt || item.importedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
