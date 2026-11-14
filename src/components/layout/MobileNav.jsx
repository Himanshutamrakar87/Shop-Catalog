import React, { useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  Package,
  Layers,
  FolderTree,
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
export default function MobileNav({
  isOpen,
  onClose,
  alertCount = 0,
  discontinuedCount = 0,
  counts = {},
  onSignOut,
  authStatus,
}) {
  const location = useLocation();
  const isOwner = Boolean(authStatus?.isOwner);
  const productsCount = counts.products ?? 0;
  const categoriesCount = counts.categories ?? 0;
  const subCategoriesCount = counts.subCategories ?? 0;
  const brandsCount = counts.brands ?? 0;
  const materialsCount = counts.materials ?? 0;

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
    `flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-semibold transition-all ${
      isActive
        ? 'bg-gradient-to-r from-[#D4A64A] to-[#C29236] text-[#173F35] font-bold shadow-md shadow-black/20'
        : 'text-[#DCE6E2] hover:text-[#F4D58D] hover:bg-[#1E4F43] active:bg-[#113129]'
    }`;

  const getSubLinkClass = ({ isActive }) =>
    `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-[#D4A64A]/18 text-[#F4D58D] font-semibold ring-1 ring-[#D4A64A]/45'
        : 'text-[#C9D8D2] hover:text-[#F4D58D] hover:bg-[#1E4F43] active:bg-[#113129]'
    }`;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-[#0D211C]/70 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer slide-in panel */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        className="fixed inset-y-0 left-0 w-[84%] max-w-sm bg-gradient-to-b from-[#173F35] via-[#153930] to-[#0F2D25] shadow-2xl flex flex-col z-10 transition-transform duration-200 ease-out border-r border-[#D4A64A]/25 text-[#F7F3EA]"
      >
        {/* Header with Logo and Close button */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#D4A64A]/20 bg-[#12332B]/70">
          <BrandLogo inverted />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-[#DCE6E2] hover:text-[#D4A64A] hover:bg-[#1E4F43] active:scale-95 transition-all cursor-pointer"
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
                    <Package className="w-5 h-5" />
                    <span>All Products</span>
                  </>
                )}
              </div>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </NavLink>
          </div>

          {/* Quick Action Button */}
          {isOwner ? (
            <NavLink
              to="/products/new"
              className="flex items-center justify-center gap-2.5 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#C29236] active:from-[#DFB359] active:to-[#CE9D3E] text-[#173F35] font-bold text-sm shadow-md shadow-black/25 transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add New Product</span>
            </NavLink>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#C29236] active:from-[#DFB359] active:to-[#CE9D3E] text-[#173F35] font-bold text-sm shadow-md transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Owner Management Sign In</span>
            </Link>
          )}

          {/* Catalogue */}
          <div>
            <p className="px-3 text-[11px] font-bold text-[#D4A64A]/80 uppercase tracking-wider mb-2">
              Catalogue
            </p>
            <div className="space-y-1">
              <NavLink to="/products" end className={getSubLinkClass}>
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Package className={`w-5 h-5 ${isActive ? 'text-[#D4A64A]' : 'text-[#9AB5AB]'}`} />
                      <span>All Products</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded-md tabular-nums ${
                        isActive ? 'bg-[#D4A64A] text-[#173F35]' : 'bg-[#0F2D25] text-[#C9D8D2]'
                      }`}
                    >
                      {productsCount}
                    </span>
                  </>
                )}
              </NavLink>
            </div>
          </div>

          {/* Classification Section */}
          <div>
            <p className="px-3 text-[11px] font-bold text-[#D4A64A]/80 uppercase tracking-wider mb-2">
              Classification
            </p>
            <div className="space-y-1">
              <NavLink to="/categories" className={getSubLinkClass}>
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Layers className={`w-5 h-5 ${isActive ? 'text-[#D4A64A]' : 'text-[#9AB5AB]'}`} />
                      <span>Categories</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded-md tabular-nums ${
                        isActive ? 'bg-[#D4A64A] text-[#173F35]' : 'bg-[#0F2D25] text-[#C9D8D2]'
                      }`}
                    >
                      {categoriesCount}
                    </span>
                  </>
                )}
              </NavLink>

              <NavLink to="/sub-categories" className={getSubLinkClass}>
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <FolderTree className={`w-5 h-5 ${isActive ? 'text-[#D4A64A]' : 'text-[#9AB5AB]'}`} />
                      <span>Sub-Categories</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded-md tabular-nums ${
                        isActive ? 'bg-[#D4A64A] text-[#173F35]' : 'bg-[#0F2D25] text-[#C9D8D2]'
                      }`}
                    >
                      {subCategoriesCount}
                    </span>
                  </>
                )}
              </NavLink>

              <NavLink to="/brands" className={getSubLinkClass}>
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Award className={`w-5 h-5 ${isActive ? 'text-[#D4A64A]' : 'text-[#9AB5AB]'}`} />
                      <span>Brands</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded-md tabular-nums ${
                        isActive ? 'bg-[#D4A64A] text-[#173F35]' : 'bg-[#0F2D25] text-[#C9D8D2]'
                      }`}
                    >
                      {brandsCount}
                    </span>
                  </>
                )}
              </NavLink>

              <NavLink to="/materials" className={getSubLinkClass}>
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Box className={`w-5 h-5 ${isActive ? 'text-[#D4A64A]' : 'text-[#9AB5AB]'}`} />
                      <span>Materials</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded-md tabular-nums ${
                        isActive ? 'bg-[#D4A64A] text-[#173F35]' : 'bg-[#0F2D25] text-[#C9D8D2]'
                      }`}
                    >
                      {materialsCount}
                    </span>
                  </>
                )}
              </NavLink>
            </div>
          </div>

          {/* Owner-Only Status Alerts */}
          {isOwner && (
            <div>
              <p className="px-3 text-[11px] font-bold text-[#D4A64A]/80 uppercase tracking-wider mb-2">
                Inventory Alerts &amp; Archive
              </p>
              <div className="space-y-1">
                <NavLink to="/stock-alert" className={getSubLinkClass}>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#D4A64A]" />
                    <span>Stock Alert</span>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-bold rounded-md tabular-nums bg-[#D4A64A] text-[#173F35]">
                    {alertCount}
                  </span>
                </NavLink>

                <NavLink to="/discontinued" className={getSubLinkClass}>
                  <div className="flex items-center gap-3">
                    <Archive className="w-5 h-5 text-[#9AB5AB]" />
                    <span>Discontinued</span>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-bold rounded-md tabular-nums bg-[#0F2D25] text-[#C9D8D2]">
                    {discontinuedCount}
                  </span>
                </NavLink>
              </div>
            </div>
          )}
        </div>

        {/* Footer Area */}
        <div className="p-4 border-t border-[#D4A64A]/20 bg-[#0F2D25]/90">
          {isOwner ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4A64A] to-[#B5862B] text-[#173F35] flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm">
                  O
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#F7F3EA] truncate">Owner Workspace</p>
                  <p className="text-[11px] text-[#D4A64A] font-medium truncate">Active Session</p>
                </div>
              </div>
              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  title="Sign out of owner session"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[#DCE6E2] hover:text-[#F4D58D] hover:bg-[#1E4F43] text-xs font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#DCE6E2]">
                <Shield className="w-4 h-4 text-[#D4A64A]" />
                <span className="text-xs font-medium">Public Catalogue</span>
              </div>
              <Link
                to="/login"
                className="text-xs font-bold text-[#D4A64A] hover:text-[#F4D58D]"
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
