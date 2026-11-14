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
        className="fixed inset-0 bg-[#0F2D25]/65 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[#E6DFCE] overflow-hidden z-10 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        <div className="sm:hidden w-12 h-1.5 bg-[#E6DFCE] rounded-full mx-auto mt-3" />

        <div className="px-6 pt-4 pb-3 sm:py-5 flex items-center justify-between border-b border-[#EFE9DA] bg-gradient-to-r from-[#FBF8F1] via-white to-[#F7F3EA]/70">
          <div>
            <h2 className="text-lg font-bold text-[#292D2B] tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-[#555B58] mt-0.5">
              Create a new entry and select it immediately.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#6F7571] hover:text-[#292D2B] hover:bg-[#FBF5E6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#292D2B]">
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
              className="w-full px-4 py-3 text-sm rounded-xl border border-[#E6DFCE] bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/30 focus:border-[#D4A64A] transition-all font-medium text-[#292D2B] placeholder:text-[#7D827E]"
            />
          </div>

          <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-3 sm:py-2.5 px-5 rounded-xl border border-[#E6DFCE] text-[#292D2B] hover:border-[#D4A64A] hover:bg-[#FCF9F2] font-semibold text-sm transition-colors text-center cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="w-full sm:w-auto py-3 sm:py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#C29236] hover:from-[#DFB359] hover:to-[#CE9D3E] disabled:opacity-50 text-[#173F35] font-bold text-sm shadow-md shadow-[#173F35]/15 transition-all text-center inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
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
