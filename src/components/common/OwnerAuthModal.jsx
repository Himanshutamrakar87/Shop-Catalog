import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Mail,
  LogIn,
  LogOut,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  signInOwnerWithPassword,
  signOutOwner,
  getAuthRateLimitStatus
} from '../../lib/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';

export default function OwnerAuthModal({ isOpen, onClose, authStatus, onAuthChanged }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handlePasswordSignIn = async (e) => {
    e.preventDefault();
    const rateLimit = getAuthRateLimitStatus();
    if (rateLimit.isLocked) {
      setErrorMsg(`Too many failed attempts. Please wait ${rateLimit.remainingSeconds}s before retrying.`);
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your owner email and password.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await signInOwnerWithPassword(email.trim(), password.trim());
      setSuccessMsg('Successfully signed in as RBB Owner!');
      setEmail('');
      setPassword('');
      if (onAuthChanged) await onAuthChanged();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials. Please verify your owner email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await signOutOwner();
      setSuccessMsg('Signed out successfully.');
      if (onAuthChanged) await onAuthChanged();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sign out.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2D25]/65 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#E6DFCE] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#EFE9DA] bg-gradient-to-r from-[#FBF8F1] via-white to-[#F7F3EA]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[#D4A64A]/50 shadow-2xs overflow-hidden shrink-0">
              <img
                src="/assets/aistudio/rbblogo_5ff1833f.png"
                alt="RBB Logo"
                className="w-full h-full object-contain p-0.5"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#292D2B]">Owner Authentication</h3>
              <p className="text-xs text-[#555B58]">Supabase RLS Access Control</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6F7571] hover:text-[#292D2B] hover:bg-[#FBF5E6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Status banner */}
          <div
            className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              authStatus?.isAuthenticated && authStatus?.isOwner
                ? 'bg-[#EDF5F1] border-[#173F35]/25 text-[#173F35]'
                : authStatus?.isAuthenticated
                ? 'bg-[#FBF5E6] border-[#D4A64A]/60 text-[#292D2B]'
                : 'bg-[#FAF7F0] border-[#E6DFCE] text-[#292D2B]'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {authStatus?.isAuthenticated && authStatus?.isOwner ? (
                <CheckCircle2 className="w-4 h-4 text-[#173F35] shrink-0 mt-0.5" />
              ) : authStatus?.isAuthenticated ? (
                <ShieldAlert className="w-4 h-4 text-[#9A7120] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#6F7571] shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">
                  {authStatus?.isAuthenticated && authStatus?.isOwner
                    ? 'Owner Authenticated'
                    : authStatus?.isAuthenticated
                    ? 'Authenticated (Non-Owner)'
                    : 'Owner Login Required'}
                </p>
                <p className="mt-0.5 text-[11px] opacity-90">
                  {authStatus?.isAuthenticated && authStatus?.isOwner
                    ? 'Authenticated with verified RBB Owner permissions.'
                    : authStatus?.isAuthenticated
                    ? 'Your signed-in account is not authorized as the RBB Owner.'
                    : 'Sign in with your designated owner credentials to manage the catalogue.'}
                </p>
              </div>
            </div>
          </div>

          {/* If already authenticated as owner */}
          {authStatus?.isAuthenticated && authStatus?.isOwner ? (
            <div className="space-y-4 pt-1">
              <div className="p-3 bg-[#FAF7F0] rounded-xl text-xs text-[#555B58] space-y-1.5 border border-[#E6DFCE]">
                <div className="flex justify-between">
                  <span className="text-[#6F7571]">Account Role:</span>
                  <span className="font-semibold text-[#292D2B]">Designated Owner</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F7571]">Database Access:</span>
                  <span className="font-semibold text-[#173F35]">Full Access Granted</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F7571]">Storage Bucket:</span>
                  <span className="font-semibold text-[#9A7120]">product-images</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#E6DFCE] hover:border-[#D4A64A] hover:bg-[#FCF9F2] text-[#292D2B] font-semibold text-xs transition-colors cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#6F7571]" />
                ) : (
                  <LogOut className="w-4 h-4 text-[#6F7571]" />
                )}
                <span>Sign Out of Owner Account</span>
              </button>
            </div>
          ) : (
            /* Sign in form */
            <div className="space-y-4">
              <form onSubmit={handlePasswordSignIn} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#292D2B] mb-1">
                    Owner Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6F7571] pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-[#E6DFCE] bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/30 focus:border-[#D4A64A] font-medium text-[#292D2B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292D2B] mb-1">
                    Owner Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6F7571] pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-[#E6DFCE] bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/30 focus:border-[#D4A64A] font-medium text-[#292D2B]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7571] hover:text-[#292D2B] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email.trim() || !password.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#C29236] hover:from-[#DFB359] hover:to-[#CE9D3E] text-[#173F35] font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  <span>Sign In as Owner</span>
                </button>
              </form>
            </div>
          )}

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#FAF7F0] border-t border-[#EFE9DA] flex items-center justify-between text-[11px] text-[#555B58]">
          <span>RLS checks: <code className="font-mono text-[10px] bg-[#EFE9DA] text-[#173F35] px-1.5 py-0.5 rounded">public.is_rbb_owner()</code></span>
          <button
            type="button"
            onClick={onClose}
            className="font-semibold text-[#173F35] hover:text-[#9A7120] text-xs cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
