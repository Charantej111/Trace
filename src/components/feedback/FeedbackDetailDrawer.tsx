import React, { useState } from 'react';
import { Feedback } from '@/types/trace';
import { X, Code, ExternalLink, Star } from 'lucide-react';
import { AtomHighlighter } from './AtomHighlighter';
import {
  getVerifiedAtoms,
  getCustomerDisplayName,
  getSegmentDisplayName,
  formatSourceType,
  formatEvidenceDate
} from '@/lib/evidence-utils';
import { GooglePlayIcon, AppStoreIcon } from '@/components/ui/store-icons';

interface FeedbackDetailDrawerProps {
  feedback: Feedback;
  onClose: () => void;
}

export function FeedbackDetailDrawer({ feedback, onClose }: FeedbackDetailDrawerProps) {
  const [showRawPayload, setShowRawPayload] = useState(false);
  const verifiedAtoms = getVerifiedAtoms(feedback);

  const rating = feedback.rating ?? (feedback.normalizedMetadata?.rating as number | undefined);
  const appVersion = feedback.appVersion ?? (feedback.normalizedMetadata?.appVersion as string | undefined);
  const country = (feedback.normalizedMetadata?.country as string | undefined);

  const sourceUrl = feedback.sourceLocation?.fileName;
  const isUrl = Boolean(sourceUrl && (sourceUrl.startsWith('http://') || sourceUrl.startsWith('https://')));

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl surface-card border-l border-slate-200 dark:border-white/10 h-full overflow-y-auto p-6 text-xs space-y-6 text-slate-900 dark:text-[#EDEDED] shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200">
              {feedback.sourceType === 'google_play' ? (
                <GooglePlayIcon className="w-3.5 h-3.5 shrink-0" />
              ) : feedback.sourceType === 'app_store' ? (
                <AppStoreIcon className="w-3.5 h-3.5 rounded shrink-0" />
              ) : null}
              <span>{formatSourceType(feedback.sourceType)}</span>
            </div>
            <span className="font-mono text-[11px] text-slate-400 select-all truncate max-w-45">
              ID: {feedback.id}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-[#EDEDED] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Verbatim Quote Visual Focus */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            VERBATIM CUSTOMER EVIDENCE
          </span>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/2">
            {verifiedAtoms.length > 0 ? (
              <AtomHighlighter originalText={feedback.originalText} atoms={verifiedAtoms} />
            ) : (
              <p className="text-sm text-slate-800 dark:text-slate-100 font-medium leading-relaxed italic">
                "{feedback.originalText}"
              </p>
            )}
          </div>
        </div>

        {/* Detected Issues / Atoms */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            VERIFIED ATOMS ({verifiedAtoms.length})
          </span>
          {verifiedAtoms.length > 0 ? (
            <div className="space-y-2">
              {verifiedAtoms.map((atom) => (
                <div
                  key={atom.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/40 dark:bg-white/2 space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        atom.intent === 'praise'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
                          : atom.severity === 'critical' || atom.severity === 'high'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
                          : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                      }`}>
                        {atom.intent.replace('_', ' ')} · {atom.severity}
                      </span>

                      {atom.emotionalState && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 capitalize">
                          {atom.emotionalState}
                        </span>
                      )}

                      {typeof atom.sentimentScore === 'number' && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          atom.sentimentScore >= 0.2
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : atom.sentimentScore <= -0.2
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {atom.sentimentScore > 0 ? `+${atom.sentimentScore.toFixed(2)}` : atom.sentimentScore.toFixed(2)}
                        </span>
                      )}

                      {atom.ratingAlignment && atom.ratingAlignment !== 'unavailable' && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                          atom.ratingAlignment === 'strongly_aligned' || atom.ratingAlignment === 'aligned'
                            ? 'text-slate-500'
                            : atom.ratingAlignment === 'mixed'
                            ? 'text-amber-600 dark:text-amber-400 font-bold'
                            : 'text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10'
                        }`}>
                          {atom.ratingAlignment.replace('_', ' ')}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      [{atom.sourceStart}:{atom.sourceEnd}]
                    </span>
                  </div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    "{atom.atomText}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 text-center font-mono text-xs">
              No verified atoms extracted
            </div>
          )}
        </div>

        {/* Formatted Evidence Provenance & Context */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            EVIDENCE PROVENANCE & CONTEXT
          </span>

          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/2 p-4 text-xs space-y-3.5">
            {/* Row 1: Customer & Segment */}
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <span className="text-slate-400 font-mono text-[10px] block uppercase">Customer / Author</span>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                  {getCustomerDisplayName(feedback.customerName)}
                </p>
              </div>

              <div className="min-w-0">
                <span className="text-slate-400 font-mono text-[10px] block uppercase">Customer Segment</span>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                  {getSegmentDisplayName(feedback.customerSegmentName)}
                </p>
              </div>
            </div>

            {/* Row 2: Date & Status */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200/60 dark:border-white/5">
              <div className="min-w-0">
                <span className="text-slate-400 font-mono text-[10px] block uppercase">Submission Date</span>
                <p className="font-mono text-slate-700 dark:text-slate-300 text-[11px] mt-0.5">
                  {formatEvidenceDate(feedback.sourceCreatedAt, feedback.importedAt)}
                </p>
              </div>

              <div className="min-w-0">
                <span className="text-slate-400 font-mono text-[10px] block uppercase">Ingestion Status</span>
                <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px] mt-0.5 uppercase">
                  {feedback.status || 'valid'}
                </p>
              </div>
            </div>

            {/* Row 3 (Optional): Store Rating & App Version */}
            {(rating !== undefined || appVersion || country) && (
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200/60 dark:border-white/5">
                {rating !== undefined && (
                  <div>
                    <span className="text-slate-400 font-mono text-[10px] block uppercase">Star Rating</span>
                    <span className="inline-flex items-center gap-1 font-bold text-amber-500 text-xs mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {rating} / 5
                    </span>
                  </div>
                )}

                {appVersion && (
                  <div>
                    <span className="text-slate-400 font-mono text-[10px] block uppercase">App Version</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px] mt-0.5 block truncate">
                      {appVersion}
                    </span>
                  </div>
                )}

                {country && (
                  <div>
                    <span className="text-slate-400 font-mono text-[10px] block uppercase">Country</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px] mt-0.5 block uppercase">
                      {country}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Row 4: Source Location / Store URL (Full Width) */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-white/5">
              <span className="text-slate-400 font-mono text-[10px] block uppercase">
                {isUrl ? 'Public Storefront Location' : 'Source Location'}
              </span>
              {isUrl ? (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center gap-1.5 text-teal-600 dark:text-teal-400 hover:underline font-mono text-[11px] break-all group"
                  title={sourceUrl}
                >
                  <span className="break-all">{sourceUrl}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 opacity-70 group-hover:opacity-100" />
                </a>
              ) : (
                <p className="font-mono text-slate-700 dark:text-slate-300 text-[11px] mt-0.5 break-all">
                  {feedback.sourceLocation?.fileName
                    ? `${feedback.sourceLocation.fileName} ${feedback.sourceLocation.rowIndex ? `(Row ${feedback.sourceLocation.rowIndex})` : ''}`
                    : 'Direct Submission'}
                </p>
              )}
            </div>

            {/* Row 5 (Optional): External ID (Full Width) */}
            {feedback.externalId && (
              <div className="pt-3 border-t border-slate-200/60 dark:border-white/5">
                <span className="text-slate-400 font-mono text-[10px] block uppercase">External Store ID</span>
                <p className="font-mono text-slate-700 dark:text-slate-300 text-[11px] mt-0.5 break-all select-all">
                  {feedback.externalId}
                </p>
              </div>
            )}

            {/* Row 6: Deterministic Fingerprint (Full Width) */}
            {feedback.fingerprint && (
              <div className="pt-3 border-t border-slate-200/60 dark:border-white/5">
                <span className="text-slate-400 font-mono text-[10px] block uppercase">Deduplication Fingerprint</span>
                <p className="font-mono text-slate-500 dark:text-slate-400 text-[10px] mt-0.5 break-all select-all">
                  {feedback.fingerprint}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Raw Payload Accordion */}
        <div className="pt-1">
          <button
            onClick={() => setShowRawPayload(!showRawPayload)}
            className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showRawPayload ? 'Hide Raw Store Metadata' : 'Inspect Raw Store Metadata'}</span>
          </button>

          {showRawPayload && (
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto mt-2 max-h-52 border border-slate-800">
              {JSON.stringify({ rawPayload: feedback.rawPayload, normalizedMetadata: feedback.normalizedMetadata }, null, 2)}
            </pre>
          )}
        </div>

      </div>
    </div>
  );
}
