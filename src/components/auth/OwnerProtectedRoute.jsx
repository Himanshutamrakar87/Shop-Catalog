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
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-600">Verifying owner credentials...</p>
        </div>
      </div>
    );
  }

  if (isSupabaseMode && !authStatus?.isOwner) {
    return <OwnerLoginScreen onLoginSuccess={refreshAuthStatus} />;
  }

  return children;
}
