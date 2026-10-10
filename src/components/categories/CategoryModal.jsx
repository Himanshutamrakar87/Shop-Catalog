import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Lock } from 'lucide-react';
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

    const existingCodes = categories.map((c) => c.code.toUpperCase());
    if (naiveCode && suggested && naiveCode !== suggested && existingCodes.includes(naiveCode)) {
      setAdjustedCodeNotice(`We adjusted the category code because ${naiveCode} is already in use.`);
    } else {
      setAdjustedCodeNotice('');
    }
  }, [name, mode, categories, suggestCategoryCode]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter a category name.');
      return;
    }

    if (mode === 'add') {
      const newCat = addCategory({
        name: trimmedName,
        code: code,
      });
      if (onSuccess) onSuccess(newCat);
      onClose();
    } else if (mode === 'edit' && category) {
      const result = updateCategory(category.id, {
        name: trimmedName,
      });
      if (result.success) {
        if (onSuccess) onSuccess({ ...category, name: trimmedName });
        onClose();
      } else {
        setError(result.error || 'Failed to update category.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal / Mobile Bottom Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'add' ? 'Add Category' : 'Edit Category'}
        className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        {/* Mobile handle indicator */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3" />

        {/* Header */}
        <div className="px-6 pt-4 pb-3 sm:py-5 flex items-center justify-between border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {mode === 'add' ? 'Add Category' : 'Edit Category'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'add' ? 'Create a category to group your products' : 'Update category name'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
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
            <label className="block text-xs font-bold text-slate-700">
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
              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Category Code Preview (Visually Secondary, Section 2 & 3) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-150">
            <span className="block text-[11px] font-semibold text-slate-500 mb-1">
              Category code
            </span>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-extrabold px-2.5 py-1 rounded bg-white text-slate-900 border border-slate-200 shadow-2xs tracking-wider">
                  {code || '—'}
                </span>
                <span className="text-xs text-slate-500">
                  {mode === 'add' ? 'Automatically generated' : 'Automatically assigned'}
                </span>
              </div>

              {code && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Ready
                </span>
              )}
            </div>

            {/* Subtle adjustment notification (Section 4) */}
            {adjustedCodeNotice && (
              <p className="text-[11px] text-amber-700 mt-2 font-medium">
                {adjustedCodeNotice}
              </p>
            )}
          </div>

          {/* Buttons: Full-width on mobile */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-3 sm:py-2.5 px-5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors text-center"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!name.trim() || !code}
              className="w-full sm:w-auto py-3 sm:py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold text-sm shadow-xs transition-all text-center"
            >
              {mode === 'add' ? 'Create Category' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
