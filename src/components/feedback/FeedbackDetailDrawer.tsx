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
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-md z-50 flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl surface-glass border-l border-slate-200/80 dark:border-[#334155] h-full overflow-y-auto p-6 text-xs space-y-6 text-slate-900 dark:text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-[#334155] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#2E8B75]/10 text-[#2E8B75] dark:text-[#3B9B85] border border-[#2E8B75]/20">
              {feedback.sourceType.toUpperCase()}
            </span>
            <span className="font-mono text-[11px] text-slate-400">ID: {feedback.id}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Verbatim Quote Visual Focus */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            VERBATIM CUSTOMER EVIDENCE
          </span>
          <div className="p-5 rounded-2xl surface-subtle border border-slate-200/80 dark:border-[#334155] shadow-xs">
            {feedback.atoms && feedback.atoms.length > 0 ? (
              <AtomHighlighter originalText={feedback.originalText} atoms={feedback.atoms} />
            ) : (
              <p className="text-sm text-slate-800 dark:text-slate-100 font-medium leading-relaxed italic">
                "{feedback.originalText}"
              </p>
            )}
          </div>
        </div>

        {/* Detected Issues / Atoms */}
        {feedback.atoms && feedback.atoms.length > 0 && (
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              DETECTED CLAUSE ATOMS ({feedback.atoms.length})
            </span>
            <div className="space-y-2.5">
              {feedback.atoms.map((atom) => (
                <div
                  key={atom.id}
                  className="p-4 rounded-xl surface-subtle border border-slate-200/80 dark:border-[#334155] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      atom.severity === 'critical' || atom.severity === 'high'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
                        : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {atom.intent.replace('_', ' ')} · {atom.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Offsets {atom.sourceStart}-{atom.sourceEnd}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">"{atom.atomText}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Provenance Metadata Grid */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            EVIDENCE PROVENANCE & CONTEXT
          </span>

          <div className="grid grid-cols-2 gap-3.5 p-4 rounded-2xl surface-subtle border border-slate-200/80 dark:border-[#334155] text-xs">
            <div>
              <span className="text-slate-400 font-mono text-[10px] block">Customer / Account</span>
              <p className="font-bold text-slate-900 dark:text-slate-100 mt-1">
                {feedback.customerName || 'Anonymous Account'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-mono text-[10px] block">Segment</span>
              <p className="font-bold text-slate-900 dark:text-slate-100 mt-1">
                {feedback.customerSegmentName || 'General SMB'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-mono text-[10px] block">Source Location</span>
              <p className="font-mono text-slate-700 dark:text-slate-300 text-[11px] mt-1">
                {feedback.sourceLocation
                  ? `${feedback.sourceLocation.fileName || 'File'} ${feedback.sourceLocation.rowIndex ? `(Row ${feedback.sourceLocation.rowIndex})` : ''}`
                  : 'Direct Import'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-mono text-[10px] block">Submission Date</span>
              <p className="font-mono text-slate-700 dark:text-slate-300 text-[11px] mt-1">
                {new Date(feedback.sourceCreatedAt || feedback.importedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Raw Payload Accordion */}
        <div className="pt-2">
          <button
            onClick={() => setShowRawPayload(!showRawPayload)}
            className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <Code className="w-4 h-4" />
            <span>{showRawPayload ? 'Hide Raw Payload & Metadata' : 'Inspect Raw Payload & Metadata'}</span>
          </button>

          {showRawPayload && (
            <pre className="p-4 rounded-xl bg-slate-900/90 text-slate-200 font-mono text-[11px] overflow-x-auto mt-2.5 max-h-52 border border-slate-800">
              {JSON.stringify({ rawPayload: feedback.rawPayload, normalizedMetadata: feedback.normalizedMetadata }, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
