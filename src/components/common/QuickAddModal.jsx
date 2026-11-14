import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

/**
 * QuickAddModal Component
 * Mobile-first bottom sheet dialog to dynamically create brands, materials, sub-categories, or sizes inline.
 */
export default function QuickAddModal({
  isOpen,
  title,
  label,
  placeholder,
  initialValue = '',
  onClose,
  onSubmit,
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      setError('');
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError(`Please enter a valid ${label.toLowerCase()}.`);
      return;
    }
    onSubmit(trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="fixed inset-0 bg-[#141C19]/70 dark:bg-[#141C19]/80 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full sm:max-w-md bg-[#FFFFFF] dark:bg-[#202A25] rounded-t-2xl sm:rounded-2xl shadow-2xl dark:shadow-[0_20px_50px_rgba(10,16,13,0.6)] border border-[#E5DFD2] dark:border-[#34433A] overflow-hidden z-10 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        <div className="sm:hidden w-12 h-1.5 bg-[#E5DFD2] dark:bg-[#34433A] rounded-full mx-auto mt-3" />

        <div className="px-6 pt-4 pb-3 sm:py-5 flex items-center justify-between border-b border-[#E5DFD2] dark:border-[#34433A] bg-[#F7F3EA] dark:bg-[#1A2420]">
          <div>
            <h2 className="text-lg font-bold text-[#292D2B] dark:text-[#F7F3EA] tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-[#73776F] dark:text-[#B6C0B8] mt-0.5">
              Create a new entry and select it immediately.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#73776F] dark:text-[#B6C0B8] hover:text-[#292D2B] dark:hover:text-[#F7F3EA] hover:bg-[#E9D5A5]/30 dark:hover:bg-[#34433A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-200 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#292D2B] dark:text-[#F7F3EA]">
              {label} *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder={placeholder}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-4 py-3 text-sm rounded-xl border border-[#E5DFD2] dark:border-[#34433A] bg-[#F7F3EA] dark:bg-[#141C19] focus:bg-[#FFFFFF] dark:focus:bg-[#202A25] focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/30 focus:border-[#D4A64A] transition-all font-medium text-[#292D2B] dark:text-[#F7F3EA] placeholder:text-[#73776F] dark:placeholder:text-[#B6C0B8]/70"
            />
          </div>

          <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-3 sm:py-2.5 px-5 rounded-xl border border-[#E5DFD2] dark:border-[#34433A] text-[#292D2B] dark:text-[#F7F3EA] hover:border-[#E9D5A5] dark:hover:border-[#E7C477] hover:bg-[#FCF9F2] dark:hover:bg-[#25322C] font-semibold text-sm transition-colors text-center cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="w-full sm:w-auto py-3 sm:py-2.5 px-6 rounded-xl bg-[#D4A64A] hover:bg-[#E9D5A5] dark:hover:bg-[#E7C477] disabled:opacity-50 text-[#173F35] dark:text-[#141C19] font-bold text-sm shadow-sm transition-all text-center inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add & Select</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
