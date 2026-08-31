import React, { useState } from 'react';
import { MessageSquare, X, Sparkles, Plus, AlertCircle } from 'lucide-react';
import { NormalizationEngine, PasteAdapter } from '@/ingestion';
import { useTraceStore } from '@/lib/store';
import { useToast } from '@/components/ui/toast';

interface PasteFeedbackModalProps {
  onClose: () => void;
}

export function PasteFeedbackModal({ onClose }: PasteFeedbackModalProps) {
  const { ingestCanonicalBatch } = useTraceStore();
  const { addToast } = useToast();

  const [rawInput, setRawInput] = useState('');
  const [channelName, setChannelName] = useState('Quick Paste');
  const [segment, setSegment] = useState('SMB');
  const [rating, setRating] = useState<number | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Compute parsed statements count
  const parsedStatements = rawInput
    .split(/(?:\r?\n){2,}|\n(?=[•\-*]\s)|\n(?=\d+[\.\)]\s)/)
    .map(s => s.replace(/^[•\-*]\s*|^\d+[\.\)]\s*/, '').trim())
    .filter(s => s.length >= 3);

  const handleIngestPaste = () => {
    if (parsedStatements.length === 0) {
      addToast({
        type: 'error',
        title: 'Empty Input',
        description: 'Please paste at least one customer comment or feedback statement.'
      });
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const parseResult = PasteAdapter.parseInput({
        text: rawInput,
        sourceName: channelName,
        defaultSegment: segment || undefined,
        defaultRating: rating !== '' ? Number(rating) : undefined
      });

      const sourceId = `src-paste-${Date.now()}`;
      const importId = `imp-paste-${Date.now()}`;
      const workspaceId = 'ws-prod';

      const mappings = {
        text: 'Feedback Text',
        createdAt: 'Created At',
        segment: segment ? 'Segment' : null,
        rating: rating !== '' ? 'Rating' : null,
        customerName: null,
        customerEmail: null,
        externalId: null,
        language: null,
        productArea: null
      };

      const { records, validCount, duplicateCount, invalidCount } = NormalizationEngine.normalizeBatch(
        parseResult.rows,
        mappings,
        {
          workspaceId,
          sourceId,
          importId,
          sourceType: 'paste'
        }
      );

      ingestCanonicalBatch(records, {
        name: channelName,
        type: 'paste',
        importId,
        validCount,
        invalidCount,
        duplicateCount
      });

      setIsProcessing(false);
      onClose();

      addToast({
        type: 'success',
        title: 'Pasted Feedback Ingested',
        description: `Successfully created ${validCount} canonical feedback records from pasted input.`
      });
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-[#0d0f15] rounded-2xl border border-slate-200 dark:border-[#1e2333] shadow-2xl overflow-hidden text-xs space-y-4 p-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#171b26] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-[#1a2030] text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Quick Capture — Paste Customer Statements
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Paste raw feedback comments, chat transcripts, or meeting notes directly into Trace.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-700 dark:text-slate-300 font-mono text-[11px]">
              VERBATIM CUSTOMER FEEDBACK
            </label>
            {parsedStatements.length > 0 && (
              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {parsedStatements.length} statement{parsedStatements.length > 1 ? 's' : ''} detected
              </span>
            )}
          </div>

          <textarea
            rows={6}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={`Paste customer statements here (separated by empty lines or bullets):

The app crashes whenever I upload a large PDF invoice.

Search is extremely slow when filtering by date.

Please add bulk export capability for weekly reports.`}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-[#1e2333] text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors font-mono leading-relaxed resize-none"
          />
        </div>

        {/* Optional Metadata Controls */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          <div>
            <label className="text-[10px] font-bold text-slate-500 font-mono block mb-1">
              SOURCE CHANNEL NAME
            </label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-[#1e2333] text-xs font-semibold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 font-mono block mb-1">
              CUSTOMER SEGMENT
            </label>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-[#1e2333] text-xs font-semibold focus:outline-none"
            >
              <option value="Enterprise">Enterprise</option>
              <option value="Mid-Market">Mid-Market</option>
              <option value="SMB">SMB</option>
              <option value="Startup">Startup</option>
              <option value="Free Tier">Free Tier</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 font-mono block mb-1">
              RATING (OPTIONAL)
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value ? Number(e.target.value) : '')}
              className="w-full p-2 rounded-lg bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-[#1e2333] text-xs font-semibold focus:outline-none"
            >
              <option value="">Unspecified</option>
              <option value="1">1 Star / Poor</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars / Neutral</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars / Excellent</option>
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#171b26]">
          <span className="text-[10px] text-slate-400 font-mono">
            Customer identity defaults to "Unknown" (never fabricated)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#161a26] text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleIngestPaste}
              disabled={isProcessing || parsedStatements.length === 0}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Ingesting Statements...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ingest {parsedStatements.length} Statement{parsedStatements.length > 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
