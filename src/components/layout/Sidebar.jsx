import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
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
import ThemeSwitcher from '../common/ThemeSwitcher';

/**
 * Desktop Sidebar Navigation
 * Adapts based on authentication state:
 * - Public Visitors: Catalogue browsing (Products, Categories, Brands, Materials) + Owner Sign In Portal
 * - Verified Owner: Full administrative dashboard, Add Product, Stock Alert, Discontinued, and Sign Out
 */
export default function Sidebar({
  alertCount = 0,
  discontinuedCount = 0,
  counts = {},
  onSignOut,
  authStatus,
}) {
  const isOwner = Boolean(authStatus?.isOwner);
  const productsCount = counts.products ?? 0;
  const categoriesCount = counts.categories ?? 0;
  const subCategoriesCount = counts.subCategories ?? 0;
  const brandsCount = counts.brands ?? 0;
  const materialsCount = counts.materials ?? 0;

  const getNavLinkClass = ({ isActive }) =>
    `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-[#D4A64A] text-[#173F35] dark:text-[#141C19] shadow-sm font-bold'
        : 'text-[#DCE6E2] hover:text-[#E9D5A5] dark:hover:text-[#E7C477] hover:bg-[#1E4F43] dark:hover:bg-[#2A4E40]'
    }`;

  const getSubLinkClass = ({ isActive }) =>
    `group flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-[#D4A64A]/18 text-[#E9D5A5] dark:text-[#E7C477] font-semibold ring-1 ring-[#D4A64A]/45'
        : 'text-[#C9D8D2] dark:text-[#B6C0B8] hover:text-[#E9D5A5] dark:hover:text-[#E7C477] hover:bg-[#1E4F43]/90 dark:hover:bg-[#2A4E40]'
    }`;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#173F35] dark:bg-[#203D32] border-r border-[#E5DFD2]/20 dark:border-[#34433A] h-screen sticky top-0 shrink-0 select-none text-[#F7F3EA] transition-colors duration-200">
      {/* Brand Header */}
      <div className="h-16 shrink-0 flex items-center px-6 border-b border-[#D4A64A]/20 dark:border-[#34433A] bg-[#12332B]/75 dark:bg-[#182E26]/80">
        <BrandLogo inverted />
      </div>

      {/* Navigation Links (scrolls only when cursor hovers over sidebar) */}
      <div className="flex-1 min-h-0 overflow-hidden hover:overflow-y-auto overscroll-contain px-4 py-5 space-y-6">
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
                  <Package className="w-4 h-4 shrink-0 transition-colors" />
                  <span>Public Catalogue</span>
                </>
              )}
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        </div>

        {/* Catalogue Section (Public for everyone) */}
        <div>
          <p className="px-3 text-[11px] font-bold text-[#D4A64A]/85 uppercase tracking-wider mb-2">
            Catalogue
          </p>
          <div className="space-y-1">
            <NavLink to="/products" end className={getSubLinkClass}>
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Package className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D4A64A]' : 'text-[#9AB5AB] dark:text-[#B6C0B8] group-hover:text-[#D4A64A]'}`} />
                    <span>All Products</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-md tabular-nums ${
                      isActive ? 'bg-[#D4A64A] text-[#173F35] dark:text-[#141C19]' : 'bg-[#12332B] dark:bg-[#141C19] text-[#C9D8D2] dark:text-[#B6C0B8] border border-[#D4A64A]/15 dark:border-[#34433A]'
                    }`}
                  >
                    {productsCount}
                  </span>
                </>
              )}
            </NavLink>
          </div>
        </div>

        {/* Classification Section (Publicly browsable) */}
        <div>
          <p className="px-3 text-[11px] font-bold text-[#D4A64A]/85 uppercase tracking-wider mb-2">
            Classification
          </p>
          <div className="space-y-1">
            <NavLink to="/categories" className={getSubLinkClass}>
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Layers className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D4A64A]' : 'text-[#9AB5AB] dark:text-[#B6C0B8] group-hover:text-[#D4A64A]'}`} />
                    <span>Categories</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-md tabular-nums ${
                      isActive ? 'bg-[#D4A64A] text-[#173F35] dark:text-[#141C19]' : 'bg-[#12332B] dark:bg-[#141C19] text-[#C9D8D2] dark:text-[#B6C0B8] border border-[#D4A64A]/15 dark:border-[#34433A]'
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
                    <FolderTree className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D4A64A]' : 'text-[#9AB5AB] dark:text-[#B6C0B8] group-hover:text-[#D4A64A]'}`} />
                    <span>Sub-Categories</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-md tabular-nums ${
                      isActive ? 'bg-[#D4A64A] text-[#173F35] dark:text-[#141C19]' : 'bg-[#12332B] dark:bg-[#141C19] text-[#C9D8D2] dark:text-[#B6C0B8] border border-[#D4A64A]/15 dark:border-[#34433A]'
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
                    <Award className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D4A64A]' : 'text-[#9AB5AB] dark:text-[#B6C0B8] group-hover:text-[#D4A64A]'}`} />
                    <span>Brands</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-md tabular-nums ${
                      isActive ? 'bg-[#D4A64A] text-[#173F35] dark:text-[#141C19]' : 'bg-[#12332B] dark:bg-[#141C19] text-[#C9D8D2] dark:text-[#B6C0B8] border border-[#D4A64A]/15 dark:border-[#34433A]'
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
                    <Box className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D4A64A]' : 'text-[#9AB5AB] dark:text-[#B6C0B8] group-hover:text-[#D4A64A]'}`} />
                    <span>Materials</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-md tabular-nums ${
                      isActive ? 'bg-[#D4A64A] text-[#173F35] dark:text-[#141C19]' : 'bg-[#12332B] dark:bg-[#141C19] text-[#C9D8D2] dark:text-[#B6C0B8] border border-[#D4A64A]/15 dark:border-[#34433A]'
                    }`}
                  >
                    {materialsCount}
                  </span>
                </>
              )}
            </NavLink>
          </div>
        </div>

        {/* Owner-Only Status & Inventory Section */}
        {isOwner ? (
          <div>
            <p className="px-3 text-[11px] font-bold text-[#D4A64A]/85 uppercase tracking-wider mb-2">
              Inventory Status
            </p>
            <div className="space-y-1">
              <NavLink to="/stock-alert" className={getSubLinkClass}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#D4A64A]" />
                  <span>Stock Alert</span>
                </div>
                <span className="px-2 py-0.5 text-xs font-bold rounded-md tabular-nums bg-[#D4A64A] text-[#173F35] dark:text-[#141C19]">
                  {alertCount}
                </span>
              </NavLink>

              <NavLink to="/discontinued" className={getSubLinkClass}>
                <div className="flex items-center gap-3">
                  <Archive className="w-4 h-4 shrink-0 text-[#9AB5AB] dark:text-[#B6C0B8] group-hover:text-[#D4A64A]" />
                  <span>Discontinued</span>
                </div>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md tabular-nums bg-[#12332B] dark:bg-[#141C19] text-[#C9D8D2] dark:text-[#B6C0B8] border border-[#D4A64A]/15 dark:border-[#34433A]">
                  {discontinuedCount}
                </span>
              </NavLink>
            </div>
          </div>
        ) : null}

        {/* Primary Action Button */}
        <div className="pt-2">
          {isOwner ? (
            <NavLink
              to="/products/new"
              className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-xl bg-[#D4A64A] hover:bg-[#E9D5A5] dark:hover:bg-[#E7C477] text-[#173F35] dark:text-[#141C19] font-bold text-sm shadow-sm transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Product</span>
            </NavLink>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#D4A64A] hover:bg-[#E9D5A5] dark:hover:bg-[#E7C477] text-[#173F35] dark:text-[#141C19] font-bold text-xs shadow-sm transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Owner Management Login</span>
            </Link>
          )}
        </div>

        {/* Appearance Theme Switcher */}
        <ThemeSwitcher variant="sidebar" />
      </div>

      {/* Footer Section */}
      <div className="shrink-0 p-4 border-t border-[#D4A64A]/20 dark:border-[#34433A] bg-[#12332B]/90 dark:bg-[#182E26]/90">
        {isOwner ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#D4A64A] text-[#173F35] dark:text-[#141C19] flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs">
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
                className="p-1.5 rounded-lg text-[#B8CBC3] dark:text-[#B6C0B8] hover:text-[#E9D5A5] dark:hover:text-[#E7C477] hover:bg-[#1E4F43] dark:hover:bg-[#2A4E40] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#DCE6E2] dark:text-[#B6C0B8] min-w-0">
              <Shield className="w-4 h-4 text-[#D4A64A] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#F7F3EA] truncate">Public Catalogue</p>
                <p className="text-[11px] text-[#9AB5AB] dark:text-[#B6C0B8] truncate">Browse Mode</p>
              </div>
            </div>
            <Link
              to="/login"
              className="text-xs font-bold text-[#D4A64A] hover:text-[#E9D5A5] dark:hover:text-[#E7C477]"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
