import React, { useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  Package,
  Layers,
  Award,
  Box,
  AlertTriangle,
  PlusCircle,
  Archive,
  ChevronRight,
  LogOut,
  Lock,
  Shield
} from 'lucide-react';
import BrandLogo from '../common/BrandLogo';

/**
 * Mobile Navigation Drawer
 * Adapts between Public Visitor Mode and Verified Owner Mode
 */
export default function MobileNav({ isOpen, onClose, alertCount = 0, discontinuedCount = 0, onSignOut, authStatus }) {
  const location = useLocation();
  const isOwner = Boolean(authStatus?.isOwner);

  // Close drawer whenever the route changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getNavLinkClass = ({ isActive }) =>
    `flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium transition-colors ${
      isActive
        ? 'bg-slate-900 text-white font-semibold shadow-sm'
        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200'
    }`;

  const getSubLinkClass = ({ isActive }) =>
    `flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600'
        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200'
    }`;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer slide-in panel */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        className="fixed inset-y-0 left-0 w-[84%] max-w-sm bg-white shadow-2xl flex flex-col z-10 transition-transform duration-200 ease-out"
      >
        {/* Header with Logo and Close button */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <BrandLogo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Main Entry */}
          <div>
            <NavLink to={isOwner ? '/dashboard' : '/products'} className={getNavLinkClass}>
              <div className="flex items-center gap-3.5">
                {isOwner ? (
                  <>
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5 text-blue-600" />
                    <span>All Products</span>
                  </>
                )}
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </NavLink>
          </div>

          {/* Quick Action Button */}
          {isOwner ? (
            <NavLink
              to="/products/new"
              className="flex items-center justify-center gap-2.5 w-full py-3.5 px-4 rounded-xl bg-blue-600 active:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add New Product</span>
            </NavLink>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-slate-900 active:bg-slate-800 text-white font-semibold text-sm shadow-sm transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Owner Management Sign In</span>
            </Link>
          )}

          {/* Catalogue */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Catalogue
            </p>
            <div className="space-y-1">
              <NavLink to="/products" end className={getSubLinkClass}>
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-slate-500" />
                  <span>All Products</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </NavLink>
            </div>
          </div>

          {/* Classification Section */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Classification
            </p>
            <div className="space-y-1">
              <NavLink to="/categories" className={getSubLinkClass}>
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-slate-500" />
                  <span>Categories</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </NavLink>

              <NavLink to="/brands" className={getSubLinkClass}>
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-slate-500" />
                  <span>Brands</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </NavLink>

              <NavLink to="/materials" className={getSubLinkClass}>
                <div className="flex items-center gap-3">
                  <Box className="w-5 h-5 text-slate-500" />
                  <span>Materials</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </NavLink>
            </div>
          </div>

          {/* Owner-Only Status Alerts */}
          {isOwner && (
            <div>
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Inventory Alerts &amp; Archive
              </p>
              <div className="space-y-1">
                <NavLink to="/stock-alert" className={getSubLinkClass}>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <span>Stock Alert</span>
                  </div>
                  {alertCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
                      {alertCount}
                    </span>
                  )}
                </NavLink>

                <NavLink to="/discontinued" className={getSubLinkClass}>
                  <div className="flex items-center gap-3">
                    <Archive className="w-5 h-5 text-slate-500" />
                    <span>Discontinued</span>
                  </div>
                  {discontinuedCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-600">
                      {discontinuedCount}
                    </span>
                  )}
                </NavLink>
              </div>
            </div>
          )}
        </div>

        {/* Footer Area */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          {isOwner ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  O
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">Owner Workspace</p>
                  <p className="text-[11px] text-emerald-600 font-medium truncate">Active Session</p>
                </div>
              </div>
              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  title="Sign out of owner session"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium">Public Catalogue</span>
              </div>
              <Link
                to="/login"
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                Owner Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
