import React from 'react';
import { AlertCircle, Trash2, X } from 'lucide-react';

/**
 * DeleteConfirmDialog Component
 * Implements Section 6 Delete UX:
 * - If 0 products: Shows Delete "[Name]"? / This category will be removed / Delete + Cancel
 * - If >0 products: Shows Can't delete this category / [count] products are currently using this category... / Got it
 */
export default function DeleteConfirmDialog({
  isOpen,
  onClose,
  category,
  productCount = 0,
  onConfirmDelete,
}) {
  if (!isOpen || !category) return null;

  const hasProducts = productCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Body (Bottom sheet on mobile, centered on desktop) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={hasProducts ? "Can't delete this category" : `Delete "${category.name}"`}
        className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 p-6 space-y-4 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        {/* Mobile handle indicator */}
        <div className="sm:hidden w-12 h-1 bg-slate-200 rounded-full mx-auto -mt-2 mb-2" />

        {hasProducts ? (
          /* Case 1: Category contains products */
          <>
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900">
                  Can't delete this category
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  <strong className="text-slate-900">{productCount} {productCount === 1 ? 'product is' : 'products are'}</strong> currently using this category. Move those products to another category before deleting it.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors text-center"
              >
                Got it
              </button>
            </div>
          </>
        ) : (
          /* Case 2: Category has 0 products */
          <>
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900">
                  Delete "{category.name}"?
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  This category will be removed.
                </p>
              </div>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirmDelete(category.id);
                  onClose();
                }}
                className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-sm shadow-xs transition-all text-center"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
