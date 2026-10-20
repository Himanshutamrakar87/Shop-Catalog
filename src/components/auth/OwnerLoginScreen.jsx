import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Shield,
  ArrowRight,
  Package
} from 'lucide-react';
import BrandLogo from '../common/BrandLogo';
import DevotionalBanner from '../common/DevotionalBanner';
import { signInOwnerWithPassword, getAuthRateLimitStatus } from '../../lib/supabaseService';

/**
 * Owner Login Screen for RBB Catalogue
 * - Requires real, validated Supabase Auth owner credentials (email & password)
 * - Server-side authorization verified through PostgreSQL is_rbb_owner()
 * - Rate limiting against automated brute force
 * - Clear escape hatch allowing visitors to browse public catalogue
 */
export default function OwnerLoginScreen({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Periodic rate limit status check
  useEffect(() => {
    const checkRateLimit = () => {
      const status = getAuthRateLimitStatus();
      if (status.isLocked) {
        setLockoutTimer(status.remainingSeconds);
      } else {
        setLockoutTimer(0);
      }
    };

    checkRateLimit();
    const interval = setInterval(checkRateLimit, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || isLoading || lockoutTimer > 0) return;

    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await signInOwnerWithPassword(email.trim(), password.trim());
      setSuccessMsg('Owner authentication verified! Accessing management workspace...');
      setEmail('');
      setPassword('');

      if (onLoginSuccess) {
        await onLoginSuccess();
      }

      // Navigate to dashboard upon successful login
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      setErrorMsg(
        err.message || 'Invalid credentials. Please verify your owner email and password.'
      );
      const status = getAuthRateLimitStatus();
      if (status.isLocked) {
        setLockoutTimer(status.remainingSeconds);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between items-center text-slate-100">
      {/* Devotional Top Greeting Banner */}
      <DevotionalBanner variant="dark" />

      <div className="w-full max-w-md my-auto p-4 sm:p-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-white p-3 rounded-2xl border border-white/20 shadow-2xl mb-3 flex items-center justify-center">
            <img
              src="/assets/aistudio/rbblogo_5ff1833f.png"
              alt="Catalogue Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
            />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mb-1">
            Product Catalogue
          </h1>
          <p className="text-xs text-slate-400 mb-3">
            Commercial &amp; Domestic Utensils
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold tracking-wide uppercase">
            <Shield className="w-3.5 h-3.5" />
            <span>Owner Management Access</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-900">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Owner Sign In
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Sign in with your authorized owner credentials to manage catalogue inventory.
            </p>
          </div>

          {/* Rate Limit Lockout Notice */}
          {lockoutTimer > 0 && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <span className="font-bold">Login temporarily throttled:</span> Too many failed attempts. Please wait{' '}
                <span className="font-mono font-bold text-amber-700">{lockoutTimer}s</span> before retrying.
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && lockoutTimer === 0 && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="leading-relaxed font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="leading-relaxed font-medium">{successMsg}</div>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="owner-email"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Owner Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="owner-email"
                  name="email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  placeholder="name@domain.com"
                  value={email}
                  disabled={lockoutTimer > 0}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="owner-password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Owner Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="owner-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  disabled={lockoutTimer > 0}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim() || lockoutTimer > 0}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-md shadow-blue-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Authorization...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Owner</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Visitor Escape Link: Browse Public Catalogue */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col items-center gap-2">
            <span className="text-xs text-slate-500">Just visiting?</span>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Browse Public Catalogue without Login</span>
            </Link>
          </div>
        </div>

        {/* Security Notice Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>RBB Single-Owner Protected Management</p>
        </div>
      </div>
    </div>
  );
}
