import React from 'react';
import { ShieldAlert, LogOut } from 'lucide-react';
import BrandLogo from '../common/BrandLogo';

/**
 * Access Denied Screen shown when an authenticated user is not authorized as the RBB Owner.
 * Strictly avoids exposing the designated owner email.
 */
export default function OwnerAccessDeniedScreen({ onSignOut }) {
  return (
    <div className="min-h-screen bg-[#173F35] dark:bg-[#141C19] flex flex-col justify-center items-center p-4 text-[#F7F3EA] transition-colors duration-200">
      <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#202A25] rounded-3xl p-6 sm:p-8 shadow-2xl dark:shadow-[0_20px_50px_rgba(10,16,13,0.55)] border border-[#E5DFD2] dark:border-[#34433A] text-[#292D2B] dark:text-[#F7F3EA] text-center space-y-6">
        <div className="flex justify-center">
          <BrandLogo />
        </div>

        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F7F3EA] dark:bg-[#141C19] text-[#9A7120] dark:text-[#D4A64A] flex items-center justify-center border border-[#D4A64A]/60 shadow-xs dark:shadow-none">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#292D2B] dark:text-[#F7F3EA]">
            Owner Authorization Required
          </h2>
          <p className="text-xs sm:text-sm text-[#73776F] dark:text-[#B6C0B8] leading-relaxed">
            The account currently signed in does not have RBB Owner permissions.
            Access to catalogue data, product modifications, and management tools is strictly restricted to the designated owner.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#D4A64A] hover:bg-[#E9D5A5] dark:hover:bg-[#E7C477] text-[#173F35] dark:text-[#141C19] font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out &amp; Return to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}
