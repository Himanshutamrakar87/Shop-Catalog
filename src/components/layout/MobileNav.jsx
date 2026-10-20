import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  LogOut
} from 'lucide-react';
import BrandLogo from '../common/BrandLogo';

/**
 * Mobile Navigation Drawer
 * Opens smoothly from the left as an overlay drawer for smartphone viewports.
 * Closes automatically on route navigation or clicking outside.
 */
export default function MobileNav({ isOpen, onClose, alertCount = 12, discontinuedCount = 7, onSignOut }) {
  const location = useLocation();

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
            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Dashboard */}
          <div>
            <NavLink to="/dashboard" className={getNavLinkClass}>
              <div className="flex items-center gap-3.5">
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </NavLink>
          </div>

          {/* Quick Action Add Product on mobile */}
          <NavLink
            to="/products/new"
            className="flex items-center justify-center gap-2.5 w-full py-3.5 px-4 rounded-xl bg-blue-600 active:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add New Product</span>
          </NavLink>

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

          {/* Manage Section */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Manage System
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

          {/* Alerts & Archive */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Alerts & Archive
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
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                    {discontinuedCount}
                  </span>
                )}
              </NavLink>
            </div>
          </div>
        </div>

        {/* Drawer Footer with Sign Out */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">RBB Product Catalogue</span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">Owner Active</span>
          </div>
          {onSignOut && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Sign Out of Owner Account</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
