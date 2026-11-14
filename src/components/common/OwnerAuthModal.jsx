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
      onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141C19]/70 dark:bg-[#141C19]/80 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] dark:bg-[#202A25] rounded-2xl max-w-md w-full shadow-2xl dark:shadow-[0_20px_50px_rgba(10,16,13,0.6)] border border-[#E5DFD2] dark:border-[#34433A] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5DFD2] dark:border-[#34433A] bg-[#F7F3EA] dark:bg-[#1A2420]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] flex items-center justify-center border border-[#D4A64A]/50 shadow-2xs overflow-hidden shrink-0">
              <img
                src="/assets/aistudio/rbblogo_5ff1833f.png"
                alt="RBB Logo"
                className="w-full h-full object-contain p-0.5"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#292D2B] dark:text-[#F7F3EA]">Owner Authentication</h3>
              <p className="text-xs text-[#73776F] dark:text-[#B6C0B8]">Supabase RLS Access Control</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#73776F] dark:text-[#B6C0B8] hover:text-[#292D2B] dark:hover:text-[#F7F3EA] hover:bg-[#E9D5A5]/30 dark:hover:bg-[#34433A] transition-colors cursor-pointer"
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
                ? 'bg-[#EDF5F1] dark:bg-[#173F35]/40 border-[#173F35]/25 dark:border-[#34433A] text-[#173F35] dark:text-[#F7F3EA]'
                : authStatus?.isAuthenticated
                ? 'bg-[#F7F3EA] dark:bg-[#141C19] border-[#D4A64A]/60 text-[#292D2B] dark:text-[#F7F3EA]'
                : 'bg-[#F7F3EA] dark:bg-[#141C19] border-[#E5DFD2] dark:border-[#34433A] text-[#292D2B] dark:text-[#F7F3EA]'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {authStatus?.isAuthenticated && authStatus?.isOwner ? (
                <CheckCircle2 className="w-4 h-4 text-[#173F35] dark:text-[#D4A64A] shrink-0 mt-0.5" />
              ) : authStatus?.isAuthenticated ? (
                <ShieldAlert className="w-4 h-4 text-[#9A7120] dark:text-[#D4A64A] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#73776F] dark:text-[#B6C0B8] shrink-0 mt-0.5" />
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
              <div className="p-3 bg-[#F7F3EA] dark:bg-[#141C19] rounded-xl text-xs text-[#73776F] dark:text-[#B6C0B8] space-y-1.5 border border-[#E5DFD2] dark:border-[#34433A]">
                <div className="flex justify-between">
                  <span className="text-[#73776F] dark:text-[#B6C0B8]">Account Role:</span>
                  <span className="font-semibold text-[#292D2B] dark:text-[#F7F3EA]">Designated Owner</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#73776F] dark:text-[#B6C0B8]">Database Access:</span>
                  <span className="font-semibold text-[#173F35] dark:text-[#E7C477]">Full Access Granted</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#73776F] dark:text-[#B6C0B8]">Storage Bucket:</span>
                  <span className="font-semibold text-[#9A7120] dark:text-[#D4A64A]">product-images</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#E5DFD2] dark:border-[#34433A] hover:border-[#E9D5A5] dark:hover:border-[#E7C477] hover:bg-[#FCF9F2] dark:hover:bg-[#25322C] text-[#292D2B] dark:text-[#F7F3EA] font-semibold text-xs transition-colors cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#73776F] dark:text-[#B6C0B8]" />
                ) : (
                  <LogOut className="w-4 h-4 text-[#73776F] dark:text-[#B6C0B8]" />
                )}
                <span>Sign Out of Owner Account</span>
              </button>
            </div>
          ) : (
            /* Sign in form */
            <div className="space-y-4">
              <form onSubmit={handlePasswordSignIn} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#292D2B] dark:text-[#F7F3EA] mb-1">
                    Owner Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#73776F] dark:text-[#B6C0B8] pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-[#E5DFD2] dark:border-[#34433A] bg-[#F7F3EA] dark:bg-[#141C19] focus:bg-[#FFFFFF] dark:focus:bg-[#202A25] focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/30 focus:border-[#D4A64A] font-medium text-[#292D2B] dark:text-[#F7F3EA] placeholder:text-[#73776F] dark:placeholder:text-[#B6C0B8]/70"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292D2B] dark:text-[#F7F3EA] mb-1">
                    Owner Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#73776F] dark:text-[#B6C0B8] pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-[#E5DFD2] dark:border-[#34433A] bg-[#F7F3EA] dark:bg-[#141C19] focus:bg-[#FFFFFF] dark:focus:bg-[#202A25] focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/30 focus:border-[#D4A64A] font-medium text-[#292D2B] dark:text-[#F7F3EA] placeholder:text-[#73776F] dark:placeholder:text-[#B6C0B8]/70"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#73776F] dark:text-[#B6C0B8] hover:text-[#292D2B] dark:hover:text-[#F7F3EA] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email.trim() || !password.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#D4A64A] hover:bg-[#E9D5A5] dark:hover:bg-[#E7C477] text-[#173F35] dark:text-[#141C19] font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
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
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-200 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500 dark:text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F7F3EA] dark:bg-[#1A2420] border-t border-[#E5DFD2] dark:border-[#34433A] flex items-center justify-between text-[11px] text-[#73776F] dark:text-[#B6C0B8]">
          <span>RLS checks: <code className="font-mono text-[10px] bg-[#E5DFD2]/60 dark:bg-[#141C19] text-[#173F35] dark:text-[#E7C477] px-1.5 py-0.5 rounded">public.is_rbb_owner()</code></span>
          <button
            type="button"
            onClick={onClose}
            className="font-semibold text-[#173F35] dark:text-[#D4A64A] hover:text-[#9A7120] dark:hover:text-[#E7C477] text-xs cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
