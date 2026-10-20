import React from 'react';
import { ShieldAlert, LogOut } from 'lucide-react';
import BrandLogo from '../common/BrandLogo';

/**
 * Access Denied Screen shown when an authenticated user is not authorized as the RBB Owner.
 * Strictly avoids exposing the designated owner email.
 */
export default function OwnerAccessDeniedScreen({ onSignOut }) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 text-slate-100">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-900 text-center space-y-6">
        <div className="flex justify-center">
          <BrandLogo />
        </div>

        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">
            Owner Authorization Required
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The account currently signed in does not have RBB Owner permissions.
            Access to catalogue data, product modifications, and management tools is strictly restricted to the designated owner.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out &amp; Return to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}
