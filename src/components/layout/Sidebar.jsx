import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
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
 * Desktop Sidebar Navigation
 * Adapts based on authentication state:
 * - Public Visitors: Catalogue browsing (Products, Categories, Brands, Materials) + Owner Sign In Portal
 * - Verified Owner: Full administrative dashboard, Add Product, Stock Alert, Discontinued, and Sign Out
 */
export default function Sidebar({ alertCount = 0, discontinuedCount = 0, onSignOut, authStatus }) {
  const isOwner = Boolean(authStatus?.isOwner);

  const getNavLinkClass = ({ isActive }) =>
    `group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-slate-900 text-white shadow-sm font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const getSubLinkClass = ({ isActive }) =>
    `group flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all ${
      isActive
        ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 min-h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <BrandLogo />
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {/* Core Overview */}
        <div className="space-y-1">
          <NavLink to={isOwner ? '/dashboard' : '/products'} className={getNavLinkClass}>
            <div className="flex items-center gap-3">
              {isOwner ? (
                <>
                  <LayoutDashboard className="w-4 h-4 shrink-0 transition-colors" />
                  <span>Dashboard</span>
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 shrink-0 transition-colors text-blue-600" />
                  <span>Public Catalogue</span>
                </>
              )}
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        </div>

        {/* Catalogue Section (Public for everyone) */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Catalogue
          </p>
          <div className="space-y-1">
            <NavLink to="/products" end className={getSubLinkClass}>
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-blue-600" />
                <span>All Products</span>
              </div>
            </NavLink>
          </div>
        </div>

        {/* Classification Section (Publicly browsable) */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Classification
          </p>
          <div className="space-y-1">
            <NavLink to="/categories" className={getSubLinkClass}>
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-blue-600" />
                <span>Categories</span>
              </div>
            </NavLink>
            <NavLink to="/brands" className={getSubLinkClass}>
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-blue-600" />
                <span>Brands</span>
              </div>
            </NavLink>
            <NavLink to="/materials" className={getSubLinkClass}>
              <div className="flex items-center gap-3">
                <Box className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-blue-600" />
                <span>Materials</span>
              </div>
            </NavLink>
          </div>
        </div>

        {/* Owner-Only Status & Inventory Section */}
        {isOwner ? (
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Inventory Status
            </p>
            <div className="space-y-1">
              <NavLink to="/stock-alert" className={getSubLinkClass}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>Stock Alert</span>
                </div>
                {alertCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                    {alertCount}
                  </span>
                )}
              </NavLink>

              <NavLink to="/discontinued" className={getSubLinkClass}>
                <div className="flex items-center gap-3">
                  <Archive className="w-4 h-4 shrink-0 text-slate-500" />
                  <span>Discontinued</span>
                </div>
                {discontinuedCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                    {discontinuedCount}
                  </span>
                )}
              </NavLink>
            </div>
          </div>
        ) : null}

        {/* Primary Action Button */}
        <div className="pt-2">
          {isOwner ? (
            <NavLink
              to="/products/new"
              className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition-colors active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Product</span>
            </NavLink>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-sm transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Owner Management Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        {isOwner ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500 min-w-0">
              <Shield className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">Public Catalogue</p>
                <p className="text-[11px] text-slate-400 truncate">Browse Mode</p>
              </div>
            </div>
            <Link
              to="/login"
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
