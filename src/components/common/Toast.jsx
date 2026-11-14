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
      <div className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#173F35] dark:bg-[#203D32] text-[#F7F3EA] shadow-xl dark:shadow-[0_10px_30px_-8px_rgba(8,14,11,0.65)] border border-[#D4A64A]/40 dark:border-[#34433A] max-w-md w-full sm:w-auto">
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#D4A64A] shrink-0" />}
        {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-[#D4A64A] shrink-0" />}

        <p className="text-sm font-semibold text-[#F7F3EA] min-w-0 pr-2">
          {toast.message}
        </p>

        <button
          type="button"
          onClick={hideToast}
          aria-label="Dismiss toast"
          className="ml-auto p-1 rounded-lg text-[#C5D4CE] dark:text-[#B6C0B8] hover:text-[#E9D5A5] dark:hover:text-[#E7C477] hover:bg-[#1E4F43] dark:hover:bg-[#2A4E40] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
