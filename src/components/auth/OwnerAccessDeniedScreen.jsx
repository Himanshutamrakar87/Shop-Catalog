import React from 'react';
import { ShieldAlert, LogOut } from 'lucide-react';
import BrandLogo from '../common/BrandLogo';

/**
 * Access Denied Screen shown when an authenticated user is not authorized as the RBB Owner.
 * Strictly avoids exposing the designated owner email.
 */
export default function OwnerAccessDeniedScreen({ onSignOut }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2D25] via-[#173F35] to-[#0B221C] flex flex-col justify-center items-center p-4 text-[#F7F3EA]">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E6DFCE] text-[#292D2B] text-center space-y-6">
        <div className="flex justify-center">
          <BrandLogo />
        </div>

        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FBF5E6] text-[#9A7120] flex items-center justify-center border border-[#D4A64A]/60 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#292D2B]">
            Owner Authorization Required
          </h2>
          <p className="text-xs sm:text-sm text-[#555B58] leading-relaxed">
            The account currently signed in does not have RBB Owner permissions.
            Access to catalogue data, product modifications, and management tools is strictly restricted to the designated owner.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#C29236] hover:from-[#DFB359] hover:to-[#CE9D3E] text-[#173F35] font-bold text-sm shadow-md shadow-[#173F35]/15 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out &amp; Return to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}
