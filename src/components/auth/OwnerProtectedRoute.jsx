import React from 'react';
import { useCatalogue } from '../../context/CatalogueContext';
import OwnerLoginScreen from './OwnerLoginScreen';
import { ShieldCheck, Loader2 } from 'lucide-react';

/**
 * Route Guard for Owner-Only Management Views
 * Protects administrative routes (/dashboard, /products/new, etc.)
 * Public catalogue routes (/products, /products/:id, /categories, etc.) do NOT use this guard.
 */
export default function OwnerProtectedRoute({ children }) {
  const { authStatus, isSupabaseMode, refreshAuthStatus } = useCatalogue();

  if (isSupabaseMode && authStatus?.isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] dark:bg-[#202A25] border border-[#D4A64A]/50 text-[#173F35] dark:text-[#D4A64A] flex items-center justify-center shadow-xs dark:shadow-none">
            <ShieldCheck className="w-6 h-6 animate-pulse text-[#D4A64A]" />
          </div>
          <Loader2 className="w-5 h-5 text-[#173F35] dark:text-[#D4A64A] animate-spin" />
          <p className="text-xs font-semibold text-[#73776F] dark:text-[#B6C0B8]">Verifying owner credentials...</p>
        </div>
      </div>
    );
  }

  if (isSupabaseMode && !authStatus?.isOwner) {
    return <OwnerLoginScreen onLoginSuccess={refreshAuthStatus} />;
  }

  return children;
}
