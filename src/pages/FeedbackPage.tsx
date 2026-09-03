import React, { useState } from 'react';
import { useTraceStore } from '@/lib/store';
import { Feedback } from '@/types/trace';
import { Search, Upload, Star } from 'lucide-react';
import { FeedbackDetailDrawer } from '@/components/feedback/FeedbackDetailDrawer';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Link } from 'react-router-dom';
import { GooglePlayIcon, AppStoreIcon } from '@/components/ui/store-icons';
import {
  getCustomerDisplayName,
  getSegmentDisplayName,
  formatSourceType,
  formatEvidenceDate,
  getVerifiedAtoms
} from '@/lib/evidence-utils';

const SOURCE_OPTIONS = [
  { value: 'all', label: 'All Sources' },
  { value: 'csv', label: 'CSV' },
  { value: 'xlsx', label: 'Excel (XLSX)' },
  { value: 'json', label: 'JSON' },
  { value: 'paste', label: 'Quick Paste' },
  { value: 'google_play', label: 'Google Play' },
  { value: 'app_store', label: 'App Store' },
  { value: 'zendesk', label: 'Zendesk' },
  { value: 'intercom', label: 'Intercom' },
  { value: 'api', label: 'API' }
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
  { value: 'praise', label: 'Praise' },
  { value: 'question', label: 'Question' }
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
    const verifiedAtoms = getVerifiedAtoms(item);
    const matchesSearch =
      searchQuery === '' ||
      item.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.customerName && item.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      verifiedAtoms.some(a => a.atomText.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSource = selectedSource === 'all' || item.sourceType === selectedSource;
    const matchesSeverity =
      selectedSeverity === 'all' || verifiedAtoms.some(a => a.severity === selectedSeverity);
    const matchesIntent =
      selectedIntent === 'all' || verifiedAtoms.some(a => a.intent === selectedIntent);

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
            className="w-36"
          />

          <CustomSelect
            options={SEVERITY_OPTIONS}
            value={selectedSeverity}
            onChange={setSelectedSeverity}
            className="w-36"
          />

          <CustomSelect
            options={INTENT_OPTIONS}
            value={selectedIntent}
            onChange={setSelectedIntent}
            className="w-36"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl surface-card overflow-hidden">
        {filteredFeedback.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 dark:text-[#525866] space-y-2">
            <p className="font-semibold text-slate-700 dark:text-[#EDEDED]">No feedback matches filter criteria</p>
            <p className="text-[11px]">Adjust your search query or reset filter selections.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#1F232B] bg-slate-50/50 dark:bg-[#15181E] text-[10px] font-mono text-slate-500 dark:text-[#64748B] uppercase">
                  <th className="py-2.5 px-3.5">CUSTOMER / ACCOUNT</th>
                  <th className="py-2.5 px-3.5">SOURCE</th>
                  <th className="py-2.5 px-3.5">VERBATIM CUSTOMER STATEMENT</th>
                  <th className="py-2.5 px-3.5">SEVERITY</th>
                  <th className="py-2.5 px-3.5">SEGMENT</th>
                  <th className="py-2.5 px-3.5 text-right">DATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1F232B]">
                {filteredFeedback.map(item => {
                  const verifiedAtoms = getVerifiedAtoms(item);
                  const primaryAtom = verifiedAtoms[0];
                  const severity = primaryAtom?.severity || 'medium';

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedFeedback(item)}
                      className="hover:bg-slate-50 dark:hover:bg-[#181B22] transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-[#EDEDED] whitespace-nowrap">
                        {getCustomerDisplayName(item.customerName)}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-[11px] uppercase text-slate-500 dark:text-[#64748B] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {item.sourceType === 'google_play' && <GooglePlayIcon className="w-3.5 h-3.5 shrink-0" />}
                          {item.sourceType === 'app_store' && <AppStoreIcon className="w-3.5 h-3.5 rounded-xs shrink-0" />}
                          <span>{formatSourceType(item.sourceType)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 font-normal text-slate-800 dark:text-[#C9CDD8] max-w-md truncate">
                        <div className="flex items-center gap-2 truncate">
                          {item.rating !== undefined && (
                            <span className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200/60 dark:border-amber-900/40">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              {item.rating}
                            </span>
                          )}
                          <span className="truncate">"{item.originalText}"</span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {primaryAtom?.intent && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              primaryAtom.intent === 'praise'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/60'
                                : primaryAtom.intent === 'bug_report'
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60'
                                : 'bg-slate-100 dark:bg-[#1C2029] text-slate-700 dark:text-[#8C92A4]'
                            }`}>
                              {primaryAtom.intent.replace('_', ' ')}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            severity === 'critical' || severity === 'high'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400'
                              : severity === 'none'
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-[#1C2029] text-slate-700 dark:text-[#8C92A4]'
                          }`}>
                            {severity}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 dark:text-[#8C92A4] whitespace-nowrap">
                        {getSegmentDisplayName(item.customerSegmentName)}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-[10px] text-slate-400 dark:text-[#525866] text-right whitespace-nowrap">
                        {formatEvidenceDate(item.sourceCreatedAt, item.importedAt)}
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
