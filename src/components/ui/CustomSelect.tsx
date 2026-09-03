import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  direction?: 'up' | 'down' | 'auto';
  disabled?: boolean;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  className = '',
  direction = 'auto',
  disabled = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    minWidth: number;
  }>({ top: 0, left: 0, minWidth: 130 });

  const selectedOption = options.find((opt) => opt.value === value);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = Math.min(options.length * 38 + 12, 240);
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let openUp = false;
    if (direction === 'up') {
      openUp = true;
    } else if (direction === 'down') {
      openUp = false;
    } else {
      openUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
    }

    const minWidth = Math.max(rect.width, 130);
    let left = rect.left;
    // Align to right edge if overflowing the window
    if (left + minWidth > window.innerWidth - 12) {
      left = Math.max(12, rect.right - minWidth);
    }
    if (left < 12) left = 12;

    let top = openUp ? rect.top - dropdownHeight - 6 : rect.bottom + 6;
    if (top < 8) top = 8;
    if (top + dropdownHeight > window.innerHeight - 8) {
      top = window.innerHeight - dropdownHeight - 8;
    }

    setCoords({
      top,
      left,
      minWidth
    });
  }, [direction, options.length]);

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleScrollOrResize() {
      updatePosition();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside, true);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, updatePosition]);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) {
            setIsOpen((prev) => !prev);
          }
        }}
        className="w-full h-8.5 flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#121418] hover:bg-slate-50 dark:hover:bg-[#181B22] border border-slate-200 dark:border-[#1F232B] text-xs font-semibold text-slate-800 dark:text-[#EDEDED] transition-colors focus:outline-none shadow-2xs disabled:opacity-50 cursor-pointer"
      >
        <span className="truncate text-left">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#2E8B75] dark:text-[#10B981]' : ''}`} />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            minWidth: `${coords.minWidth}px`,
            zIndex: 99999
          }}
          className="bg-white dark:bg-[#15181F] border border-slate-200 dark:border-[#262B36] rounded-xl shadow-2xl py-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                opt.value === value
                  ? 'bg-[#2E8B75]/10 text-[#2E8B75] dark:text-[#10B981] font-bold'
                  : 'text-slate-700 dark:text-[#C9CDD8] hover:bg-slate-100 dark:hover:bg-[#1F232B]'
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && <Check className="w-3.5 h-3.5 text-[#2E8B75] dark:text-[#10B981] shrink-0 ml-2" />}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
