import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useCatalogue } from '../../context/CatalogueContext';

/**
 * Toast Component
 * Lightweight, accessible feedback toast notification.
 */
export default function Toast() {
  const { toast, hideToast } = useCatalogue();

  useEffect(() => {
    if (!toast.isVisible) return;
    const timer = setTimeout(() => {
      hideToast();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.isVisible, hideToast]);

  if (!toast.isVisible) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-5 inset-x-4 sm:inset-x-auto sm:right-6 z-50 flex justify-center pointer-events-none animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-800 max-w-md w-full sm:w-auto">
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
        {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-400 shrink-0" />}

        <p className="text-sm font-semibold text-white min-w-0 pr-2">
          {toast.message}
        </p>

        <button
          type="button"
          onClick={hideToast}
          aria-label="Dismiss toast"
          className="ml-auto p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
