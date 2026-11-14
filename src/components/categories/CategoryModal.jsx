import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
import { useCatalogue } from '../../context/CatalogueContext';

/**
 * CategoryModal Component
 * Implements clean, non-technical Add and Edit Category bottom-sheet / modal.
 * 
 * UX specifications:
 * - Mobile-first bottom sheet (slides up on mobile, centered dialog on desktop)
 * - Category code is visually secondary and automatically generated/assigned
 * - Friendly collision notification if code had to be adjusted
 * - Read-only code on edit (preserving product code integrity)
 */
export default function CategoryModal({
  isOpen,
  onClose,
  mode = 'add', // 'add' | 'edit'
  category = null,
  onSuccess
}) {
  const { categories, addCategory, updateCategory, suggestCategoryCode } = useCatalogue();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [adjustedCodeNotice, setAdjustedCodeNotice] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && category) {
      setName(category.name || '');
      setCode(category.code || '');
      setAdjustedCodeNotice('');
      setError('');
    } else {
      setName('');
      setCode('');
      setAdjustedCodeNotice('');
      setError('');
    }
    setIsSubmitting(false);
  }, [isOpen, mode, category]);

  // Compute suggested code and collision note in Add mode
  useEffect(() => {
    if (mode !== 'add') return;

    if (!name.trim()) {
      setCode('');
      setAdjustedCodeNotice('');
      return;
    }

    const clean = name.trim().toUpperCase().replace(/[^A-Z\s]/g, '');
    const words = clean.split(/\s+/).filter(Boolean);
    let naiveCode = '';
    if (words.length >= 2) {
      naiveCode = words[0][0] + words[1][0];
    } else if (words.length === 1 && words[0].length >= 2) {
      naiveCode = words[0].slice(0, 2);
    }

    const suggested = suggestCategoryCode(name);
    setCode(suggested);

    const existingCodes = (Array.isArray(categories) ? categories : [])
      .map((c) => (c && typeof c.code === 'string' ? c.code.trim().toUpperCase() : ''))
      .filter(Boolean);

    if (naiveCode && suggested && naiveCode !== suggested && existingCodes.includes(naiveCode)) {
      setAdjustedCodeNotice(`We adjusted the category code because ${naiveCode} is already in use.`);
    } else {
      setAdjustedCodeNotice('');
    }
  }, [name, mode, categories, suggestCategoryCode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter a category name.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'add') {
        const newCat = await addCategory({
          name: trimmedName,
          code: code,
        });
        if (onSuccess && newCat) await onSuccess(newCat);
        onClose();
      } else if (mode === 'edit' && category) {
        const result = await updateCategory(category.id, {
          name: trimmedName,
        });
        if (result?.success) {
          if (onSuccess) await onSuccess({ ...category, name: trimmedName });
          onClose();
        } else {
          setError(result?.error || 'Failed to update category.');
        }
      }
    } catch (err) {
      setError(err?.message || 'Failed to save category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F2D25]/65 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal / Mobile Bottom Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'add' ? 'Add Category' : 'Edit Category'}
        className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[#E6DFCE] overflow-hidden z-10 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        {/* Mobile handle indicator */}
        <div className="sm:hidden w-12 h-1.5 bg-[#E6DFCE] rounded-full mx-auto mt-3" />

        {/* Header */}
        <div className="px-6 pt-4 pb-3 sm:py-5 flex items-center justify-between border-b border-[#EFE9DA] bg-gradient-to-r from-[#FBF8F1] via-white to-[#F7F3EA]/70">
          <div>
            <h2 className="text-lg font-bold text-[#292D2B] tracking-tight">
              {mode === 'add' ? 'Add Category' : 'Edit Category'}
            </h2>
            <p className="text-xs text-[#555B58] mt-0.5">
              {mode === 'add' ? 'Create a category to group your products' : 'Update category name'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Category Name Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#292D2B]">
              Category Name
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Kitchen Storage"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-4 py-3 text-sm rounded-xl border border-[#E6DFCE] bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/30 focus:border-[#D4A64A] transition-all font-medium text-[#292D2B] placeholder:text-[#7D827E]"
            />
          </div>

          {/* Category Code Preview (Visually Secondary, Section 2 & 3) */}
          <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E6DFCE]">
            <span className="block text-[11px] font-semibold text-[#555B58] mb-1">
              Category code
            </span>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-extrabold px-2.5 py-1 rounded bg-white text-[#173F35] border border-[#D4A64A]/50 shadow-2xs tracking-wider">
                  {code || '—'}
                </span>
                <span className="text-xs text-[#555B58]">
                  {mode === 'add' ? 'Automatically generated' : 'Automatically assigned'}
                </span>
              </div>

              {code && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#173F35]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#173F35]" />
                  Ready
                </span>
              )}
            </div>

            {/* Subtle adjustment notification (Section 4) */}
            {adjustedCodeNotice && (
              <p className="text-[11px] text-[#9A7120] mt-2 font-medium">
                {adjustedCodeNotice}
              </p>
            )}
          </div>

          {/* Buttons: Full-width on mobile */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="w-full sm:w-auto py-3 sm:py-2.5 px-5 rounded-xl border border-[#E6DFCE] text-[#292D2B] hover:border-[#D4A64A] hover:bg-[#FCF9F2] disabled:opacity-50 font-semibold text-sm transition-colors text-center cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!name.trim() || !code || isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 sm:py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#C29236] hover:from-[#DFB359] hover:to-[#CE9D3E] disabled:opacity-50 text-[#173F35] font-bold text-sm shadow-md shadow-[#173F35]/15 transition-all text-center whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === 'add' ? 'Creating...' : 'Saving...'}</span>
                </>
              ) : (
                <span>{mode === 'add' ? 'Create Category' : 'Save Changes'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
