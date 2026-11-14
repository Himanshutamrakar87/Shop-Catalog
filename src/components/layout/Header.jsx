import React from 'react';
import { Menu, Plus, Bell, LogOut, Lock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';
import DevotionalBanner from '../common/DevotionalBanner';
import ThemeSwitcher from '../common/ThemeSwitcher';

/**
 * Responsive Header
 * - On Mobile: Compact header with hamburger button, compact brand mark, theme toggle, and contextual action
 * - On Desktop: Clean bar showing active section title, workspace badge, theme toggle, and contextual buttons
 * - Adapts cleanly between Public Catalogue Visitor Mode and Verified Owner Mode
 */
export default function Header({ onOpenMobileMenu, alertCount = 0, onSignOut, authStatus }) {
  const location = useLocation();
  const isOwner = Boolean(authStatus?.isOwner);

  // Page title mapping based on current pathname
  const getPageTitle = (path) => {
    if (path === '/' || path === '/dashboard') return 'Dashboard';
    if (path === '/products') return 'All Products';
    if (path === '/products/new') return 'Add New Product';
    if (path.startsWith('/products/') && path.endsWith('/edit')) return 'Edit Product';
    if (path.startsWith('/products/')) return 'Product Details';
    if (path === '/categories') return 'Categories';
    if (path === '/sub-categories') return 'Sub-Categories';
    if (path === '/brands') return 'Brands';
    if (path === '/materials') return 'Materials';
    if (path === '/stock-alert') return 'Stock Alert';
    if (path === '/discontinued') return 'Discontinued';
    return 'Catalogue';
  };

  const currentTitle = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-30 bg-[#173F35] dark:bg-[#203D32] border-b border-[#E5DFD2]/20 dark:border-[#34433A] shadow-[0_4px_20px_-6px_rgba(23,63,53,0.35)] dark:shadow-[0_4px_16px_-6px_rgba(8,14,11,0.45)] transition-colors duration-200">
      {/* Sacred Sanskrit Greeting Banner above Main Navbar */}
      <DevotionalBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Mobile Left: Hamburger + Compact Logo */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <button
              type="button"
              onClick={onOpenMobileMenu}
              aria-label="Open navigation menu"
              className="w-10 h-10 -ml-1.5 flex items-center justify-center rounded-xl text-[#F7F3EA] hover:text-[#E9D5A5] dark:hover:text-[#E7C477] hover:bg-[#1E4F43] dark:hover:bg-[#2A4E40] transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <BrandLogo showTagline={false} inverted />
          </div>

          {/* Desktop Left: Current Page Title / Breadcrumb */}
          <div className="hidden lg:flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-[#F7F3EA] tracking-tight">
              {currentTitle}
            </h1>
            {isOwner ? (
              <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#D4A64A]/15 text-[#E9D5A5] dark:text-[#E7C477] border border-[#D4A64A]/35 font-semibold">
                Owner Workspace
              </span>
            ) : (
              <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#1E4F43] dark:bg-[#172D24] text-[#DCE6E2] dark:text-[#B6C0B8] border border-[#D4A64A]/25 dark:border-[#34433A] font-semibold">
                Public Catalogue
              </span>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Appearance / Theme Switcher (Direct Light/Dark toggle on click) */}
            <ThemeSwitcher variant="compact" />

            {isOwner ? (
              <>
                {/* Stock Alert Quick Link Icon */}
                <Link
                  to="/stock-alert"
                  aria-label="View stock alerts"
                  className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-[#F7F3EA] hover:text-[#E9D5A5] dark:hover:text-[#E7C477] hover:bg-[#1E4F43] dark:hover:bg-[#2A4E40] transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {alertCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#D4A64A] ring-2 ring-[#173F35] dark:ring-[#203D32]" />
                  )}
                </Link>

                {/* Add Product Button */}
                <Link
                  to="/products/new"
                  className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl bg-[#D4A64A] hover:bg-[#E9D5A5] dark:hover:bg-[#E7C477] text-[#173F35] dark:text-[#141C19] font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-[0.98] whitespace-nowrap shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Product</span>
                  <span className="sm:hidden">Add</span>
                </Link>

                {/* Owner Sign Out */}
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    title="Sign out of owner session"
                    aria-label="Sign out"
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-[#DCE6E2] hover:text-[#E9D5A5] dark:hover:text-[#E7C477] hover:bg-[#1E4F43] dark:hover:bg-[#2A4E40] transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : (
              /* Public Visitor: Owner Sign In Portal Button */
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl bg-[#D4A64A] hover:bg-[#E9D5A5] dark:hover:bg-[#E7C477] text-[#173F35] dark:text-[#141C19] font-bold text-xs sm:text-sm shadow-sm transition-all whitespace-nowrap shrink-0"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Owner Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
