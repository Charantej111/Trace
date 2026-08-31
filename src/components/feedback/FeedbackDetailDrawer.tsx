import React, { useState } from 'react';
import { Feedback } from '@/types/trace';
import { X, FileText, User, Calendar, Star, ShieldCheck, Tag, Code, ChevronRight } from 'lucide-react';
import { AtomHighlighter } from './AtomHighlighter';

interface FeedbackDetailDrawerProps {
  feedback: Feedback;
  onClose: () => void;
}

export function FeedbackDetailDrawer({ feedback, onClose }: FeedbackDetailDrawerProps) {
  const [showRawPayload, setShowRawPayload] = useState(false);

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-2xs z-50 flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-[#1E293B] border-l border-slate-200 dark:border-[#334155] h-full overflow-y-auto p-5 text-xs space-y-5 text-slate-900 dark:text-slate-100 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-[#334155] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              {feedback.sourceType.toUpperCase()}
            </span>
            <span className="font-mono text-[11px] text-slate-400">ID: {feedback.id}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#334155] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Verbatim Quote Visual Focus */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            VERBATIM CUSTOMER EVIDENCE
          </span>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
            {feedback.atoms && feedback.atoms.length > 0 ? (
              <AtomHighlighter text={feedback.originalText} atoms={feedback.atoms} />
            ) : (
              <p className="text-sm text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
                "{feedback.originalText}"
              </p>
            )}
          </div>
        </div>

        {/* Detected Issues / Atoms */}
        {feedback.atoms && feedback.atoms.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              DETECTED CLAUSE ATOMS ({feedback.atoms.length})
            </span>
            <div className="space-y-2">
              {feedback.atoms.map((atom) => (
                <div
                  key={atom.id}
                  className="p-3 rounded-md bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase ${
                      atom.severity === 'critical' || atom.severity === 'high'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {atom.intent.replace('_', ' ')} · {atom.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Offsets {atom.sourceStart}-{atom.sourceEnd}
                    </span>
                  </div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">"{atom.atomText}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Provenance Metadata Grid */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            EVIDENCE PROVENANCE & CONTEXT
          </span>

          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs">
            <div>
              <span className="text-slate-500 font-mono text-[10px] block">Customer / Account</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                {feedback.customerName || 'Anonymous Account'}
              </p>
            </div>

            <div>
              <span className="text-slate-500 font-mono text-[10px] block">Segment</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                {feedback.customerSegmentName || 'General SMB'}
              </p>
            </div>

            <div>
              <span className="text-slate-500 font-mono text-[10px] block">Source Location</span>
              <p className="font-mono text-slate-700 dark:text-slate-300 text-[11px] mt-0.5">
                {feedback.sourceLocation
                  ? `${feedback.sourceLocation.fileName || 'File'} ${feedback.sourceLocation.rowIndex ? `(Row ${feedback.sourceLocation.rowIndex})` : ''}`
                  : 'Direct Import'}
              </p>
            </div>

            <div>
              <span className="text-slate-500 font-mono text-[10px] block">Submission Date</span>
              <p className="font-mono text-slate-700 dark:text-slate-300 text-[11px] mt-0.5">
                {new Date(feedback.sourceCreatedAt || feedback.importedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Raw Payload Accordion */}
        <div className="pt-2">
          <button
            onClick={() => setShowRawPayload(!showRawPayload)}
            className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showRawPayload ? 'Hide Raw Payload & Metadata' : 'Inspect Raw Payload & Metadata'}</span>
          </button>

          {showRawPayload && (
            <pre className="p-3 rounded-md bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto mt-2 max-h-48">
              {JSON.stringify({ rawPayload: feedback.rawPayload, normalizedMetadata: feedback.normalizedMetadata }, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
