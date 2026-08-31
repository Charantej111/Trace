import React from 'react';
import { FeedbackAtom } from '@/types/trace';

interface AtomHighlighterProps {
  originalText: string;
  atoms?: FeedbackAtom[];
  selectedAtomId?: string;
  onSelectAtom?: (atom: FeedbackAtom) => void;
  className?: string;
}

export function AtomHighlighter({
  originalText,
  atoms = [],
  selectedAtomId,
  onSelectAtom,
  className = ''
}: AtomHighlighterProps) {
  if (!atoms || atoms.length === 0) {
    return <p className={`text-slate-800 dark:text-slate-200 leading-relaxed font-normal ${className}`}>{originalText}</p>;
  }

  // Sort atoms by character start offset
  const sortedAtoms = [...atoms].sort((a, b) => a.sourceStart - b.sourceStart);

  const segments: React.ReactNode[] = [];
  let currentPos = 0;

  sortedAtoms.forEach((atom, idx) => {
    // Non-highlighted prefix
    if (atom.sourceStart > currentPos) {
      segments.push(
        <span key={`text-${currentPos}`} className="text-slate-800 dark:text-slate-200">
          {originalText.slice(currentPos, atom.sourceStart)}
        </span>
      );
    }

    const isSelected = selectedAtomId === atom.id;
    let highlightStyle = 'span-tag-complaint';

    if (atom.intent === 'bug_report') {
      highlightStyle = isSelected
        ? 'span-tag-bug font-semibold border-b-2 ring-2 ring-rose-500/50 shadow-xs'
        : 'span-tag-bug hover:opacity-90';
    } else if (atom.intent === 'feature_request') {
      highlightStyle = isSelected
        ? 'span-tag-request font-semibold border-b-2 ring-2 ring-sky-500/50 shadow-xs'
        : 'span-tag-request hover:opacity-90';
    } else if (atom.intent === 'praise') {
      highlightStyle = isSelected
        ? 'span-tag-praise font-semibold border-b-2 ring-2 ring-emerald-500/50 shadow-xs'
        : 'span-tag-praise hover:opacity-90';
    } else if (atom.intent === 'complaint') {
      highlightStyle = isSelected
        ? 'span-tag-complaint font-semibold border-b-2 ring-2 ring-amber-500/50 shadow-xs'
        : 'span-tag-complaint hover:opacity-90';
    }

    const start = Math.min(atom.sourceStart, originalText.length);
    const end = Math.min(atom.sourceEnd, originalText.length);
    const atomSlice = originalText.slice(start, end);

    segments.push(
      <span
        key={`atom-${atom.id}-${idx}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAtom && onSelectAtom(atom);
        }}
        title={`Clause Atom: [${atom.sourceStart}:${atom.sourceEnd}] | Intent: ${atom.intent} | Severity: ${atom.severity}`}
        className={`inline cursor-pointer transition-all duration-150 rounded-xs font-medium select-text ${highlightStyle}`}
      >
        {atomSlice}
      </span>
    );

    currentPos = Math.max(currentPos, atom.sourceEnd);
  });

  // Trailing text
  if (currentPos < originalText.length) {
    segments.push(
      <span key={`text-end`} className="text-slate-800 dark:text-slate-200">
        {originalText.slice(currentPos)}
      </span>
    );
  }

  return (
    <div className={`leading-relaxed whitespace-pre-wrap ${className}`}>
      {segments}
    </div>
  );
}
