import React, { useState } from 'react';
import { MessageSquare, X, Plus, AlertCircle } from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { NormalizationEngine, PasteAdapter } from '@/evidence';
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

  const handleIngestPaste = async () => {
    if (parsedStatements.length === 0) {
      addToast({
        type: 'error',
        title: 'Empty Input',
        description: 'Please paste at least one customer comment or feedback statement.'
      });
      return;
    }

    setIsProcessing(true);

    try {
      const parseResult = PasteAdapter.parseInput({
        text: rawInput,
        sourceName: channelName,
        defaultSegment: segment || undefined,
        defaultRating: rating !== '' ? Number(rating) : undefined
      });

      const sourceId = `src-paste-${Date.now()}`;
      const importId = `imp-paste-${Date.now()}`;
      const workspaceId = 'ws-default';

      const mappings = {
        text: 'text',
        createdAt: 'createdAt',
        segment: segment ? 'segment' : null,
        rating: rating !== '' ? 'rating' : null,
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

      await ingestCanonicalBatch(records, {
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
        description: `Successfully created ${validCount} canonical feedback records into durable Trace intelligence.`
      });
    } catch (err: unknown) {
      const error = err as Error;
      setIsProcessing(false);
      addToast({
        type: 'error',
        title: 'Ingestion Error',
        description: error.message || 'Failed to process pasted feedback'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl surface-glass rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden text-xs space-y-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2E8B75]/10 text-[#2E8B75] dark:text-[#10B981] flex items-center justify-center font-bold shadow-2xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#EDEDED]">
                Quick Capture — Paste Customer Statements
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#8C92A4] font-mono mt-0.5">
                Paste raw feedback comments, chat transcripts, or meeting notes directly into Trace.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-[#EDEDED] hover:bg-slate-100 dark:hover:bg-[#1A1E26] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-slate-700 dark:text-[#EDEDED] font-mono text-[11px]">
              VERBATIM CUSTOMER FEEDBACK
            </label>
            {parsedStatements.length > 0 && (
              <span className="text-[10px] font-mono font-bold text-[#2E8B75] dark:text-[#10B981]">
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

        {/* Advanced metadata overrides */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 dark:text-[#525866] font-mono block mb-1">
              SOURCE CHANNEL NAME
            </label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-50 dark:bg-[#13151A] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-slate-900 dark:text-[#EDEDED] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 dark:text-[#525866] font-mono block mb-1">
              CUSTOMER SEGMENT
            </label>
            <CustomSelect
              options={[
                { value: 'Enterprise', label: 'Enterprise' },
                { value: 'Mid-Market', label: 'Mid-Market' },
                { value: 'SMB', label: 'SMB' },
                { value: 'Startup', label: 'Startup' },
                { value: 'Free Tier', label: 'Free Tier' }
              ]}
              value={segment}
              onChange={setSegment}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 dark:text-[#525866] font-mono block mb-1">
              RATING (OPTIONAL)
            </label>
            <CustomSelect
              options={[
                { value: '', label: 'Unspecified' },
                { value: '1', label: '1 Star / Poor' },
                { value: '2', label: '2 Stars' },
                { value: '3', label: '3 Stars / Neutral' },
                { value: '4', label: '4 Stars' },
                { value: '5', label: '5 Stars / Excellent' }
              ]}
              value={String(rating)}
              onChange={(val) => setRating(val ? Number(val) : '')}
              className="w-full"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/[0.08]">
          <span className="text-[10px] text-slate-400 dark:text-[#525866] font-mono">
            Customer identity defaults to "Unknown" (never fabricated)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1A1E26] text-slate-700 dark:text-[#EDEDED] font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleIngestPaste}
              disabled={isProcessing || parsedStatements.length === 0}
              className="px-4 py-1.5 rounded-lg bg-[#2E8B75] hover:bg-[#1F6B58] text-white font-semibold flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Ingesting Statements...</span>
              ) : (
                <>
                  <MessageSquare className="w-3.5 h-3.5" />
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
