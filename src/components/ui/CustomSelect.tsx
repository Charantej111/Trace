import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  className = ''
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#121418] hover:bg-slate-50 dark:hover:bg-[#181B22] border border-slate-200 dark:border-[#1F232B] text-xs font-semibold text-slate-800 dark:text-[#EDEDED] transition-colors focus:outline-none shadow-2xs"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#2E8B75] dark:text-[#10B981]' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-full min-w-37.5 surface-glass rounded-lg shadow-xl z-50 py-1 max-h-52 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors ${
                opt.value === value
                  ? 'bg-[#2E8B75]/10 text-[#2E8B75] dark:text-[#10B981] font-bold'
                  : 'text-slate-700 dark:text-[#C9CDD8] hover:bg-slate-100 dark:hover:bg-[#181B22]'
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && <Check className="w-3.5 h-3.5 text-[#2E8B75] dark:text-[#10B981] shrink-0 ml-2" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
