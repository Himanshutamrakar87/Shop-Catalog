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
    <div className="min-h-screen bg-gradient-to-br from-[#0F2D25] via-[#173F35] to-[#0B221C] flex flex-col justify-between items-center text-[#F7F3EA]">
      {/* Devotional Top Greeting Banner */}
      <DevotionalBanner variant="dark" />

      <div className="w-full max-w-md my-auto p-4 sm:p-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-white p-3 rounded-2xl border border-[#D4A64A]/60 ring-4 ring-[#D4A64A]/25 shadow-2xl mb-3 flex items-center justify-center">
            <img
              src="/assets/aistudio/rbblogo_5ff1833f.png"
              alt="Catalogue Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
            />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#F7F3EA] mb-1">
            Product Catalogue
          </h1>
          <p className="text-xs text-[#F4D58D]/90 mb-3">
            Commercial &amp; Domestic Utensils
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A64A]/15 border border-[#D4A64A]/35 text-[#F4D58D] text-xs font-semibold tracking-wide uppercase">
            <Shield className="w-3.5 h-3.5 text-[#D4A64A]" />
            <span>Owner Management Access</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E6DFCE] text-[#292D2B]">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#292D2B]">
              Owner Sign In
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#555B58]">
              Sign in with your authorized owner credentials to manage catalogue inventory.
            </p>
          </div>

          {/* Rate Limit Lockout Notice */}
          {lockoutTimer > 0 && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#FBF5E6] border border-[#D4A64A]/60 text-[#292D2B] text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#9A7120]" />
              <div>
                <span className="font-bold">Login temporarily throttled:</span> Too many failed attempts. Please wait{' '}
                <span className="font-mono font-bold text-[#8E6518]">{lockoutTimer}s</span> before retrying.
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
                className="block text-xs font-bold text-[#292D2B] uppercase tracking-wider mb-1.5"
              >
                Owner Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6F7571]">
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
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-[#E6DFCE] bg-[#FAF7F0] text-[#292D2B] placeholder:text-[#7D827E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/30 focus:border-[#D4A64A] transition-all font-medium disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="owner-password"
                className="block text-xs font-bold text-[#292D2B] uppercase tracking-wider mb-1.5"
              >
                Owner Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6F7571]">
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
                  className="w-full pl-10 pr-11 py-3 text-sm rounded-xl border border-[#E6DFCE] bg-[#FAF7F0] text-[#292D2B] placeholder:text-[#7D827E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/30 focus:border-[#D4A64A] transition-all font-medium disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6F7571] hover:text-[#292D2B] focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim() || lockoutTimer > 0}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#C29236] hover:from-[#DFB359] hover:to-[#CE9D3E] text-[#173F35] font-bold text-sm shadow-lg shadow-[#173F35]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
          <div className="mt-5 pt-4 border-t border-[#EFE9DA] flex flex-col items-center gap-2">
            <span className="text-xs text-[#555B58]">Just visiting?</span>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#173F35] hover:text-[#9A7120] hover:underline transition-colors"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Browse Public Catalogue without Login</span>
            </Link>
          </div>
        </div>

        {/* Security Notice Footer */}
        <div className="mt-6 text-center text-xs text-[#B8CBC3]">
          <p>RBB Single-Owner Protected Management</p>
        </div>
      </div>
    </div>
  );
}
