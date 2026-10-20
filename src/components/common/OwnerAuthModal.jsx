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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200/90 shadow-2xs overflow-hidden shrink-0">
              <img
                src="/assets/aistudio/rbblogo_5ff1833f.png"
                alt="RBB Logo"
                className="w-full h-full object-contain p-0.5"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Owner Authentication</h3>
              <p className="text-xs text-slate-500">Supabase RLS Access Control</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
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
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : authStatus?.isAuthenticated
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {authStatus?.isAuthenticated && authStatus?.isOwner ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : authStatus?.isAuthenticated ? (
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
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
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1.5 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Role:</span>
                  <span className="font-semibold text-slate-800">Designated Owner</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Database Access:</span>
                  <span className="font-semibold text-emerald-600">Full Access Granted</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Storage Bucket:</span>
                  <span className="font-semibold text-blue-600">product-images</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                ) : (
                  <LogOut className="w-4 h-4 text-slate-400" />
                )}
                <span>Sign Out of Owner Account</span>
              </button>
            </div>
          ) : (
            /* Sign in form */
            <div className="space-y-4">
              <form onSubmit={handlePasswordSignIn} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Owner Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Owner Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email.trim() || !password.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
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
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>RLS checks: <code className="font-mono text-[10px] bg-slate-200 px-1 py-0.5 rounded">public.is_rbb_owner()</code></span>
          <button
            type="button"
            onClick={onClose}
            className="font-semibold text-slate-700 hover:text-slate-900 text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
