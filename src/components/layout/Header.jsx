import React, { useState, useEffect } from 'react';
import { Menu, Plus, Bell, Search, X, LogOut, Lock } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';
import DevotionalBanner from '../common/DevotionalBanner';

/**
 * Responsive Header
 * - On Mobile: Compact header with hamburger button, compact brand mark, contextual action, and mobile search bar
 * - On Desktop: Clean bar showing active section title, quick global catalogue search, and contextual buttons
 * - Adapts cleanly between Public Catalogue Visitor Mode and Verified Owner Mode
 */
export default function Header({ onOpenMobileMenu, alertCount = 0, onSignOut, authStatus }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [headerSearch, setHeaderSearch] = useState('');
  const isOwner = Boolean(authStatus?.isOwner);

  // Keep header search synced with URL ?search= parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const param = params.get('search') || params.get('q') || '';
    setHeaderSearch((prev) => (prev !== param ? param : prev));
  }, [location.search]);

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

  const handleHeaderSearch = (e) => {
    const val = e.target.value;
    setHeaderSearch(val);
    if (val) {
      navigate(`/products?search=${encodeURIComponent(val)}`, {
        replace: location.pathname === '/products',
      });
    } else {
      navigate('/products', { replace: location.pathname === '/products' });
    }
  };

  const handleClearHeaderSearch = () => {
    setHeaderSearch('');
    navigate('/products', { replace: location.pathname === '/products' });
  };

  return (
    <header className="sticky top-0 z-30 bg-[#173F35]/95 backdrop-blur-md border-b border-[#D4A64A]/30 shadow-[0_4px_20px_-6px_rgba(23,63,53,0.45)]">
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
              className="w-10 h-10 -ml-1.5 flex items-center justify-center rounded-xl text-[#F7F3EA] hover:text-[#D4A64A] hover:bg-[#1E4F43] active:bg-[#113129] transition-colors cursor-pointer"
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
              <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#D4A64A]/15 text-[#F4D58D] border border-[#D4A64A]/35 font-semibold">
                Owner Workspace
              </span>
            ) : (
              <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#1E4F43] text-[#DCE6E2] border border-[#D4A64A]/25 font-semibold">
                Public Catalogue
              </span>
            )}
          </div>

          {/* Center / Search bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#D4A64A]/80 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products..."
                value={headerSearch}
                onChange={handleHeaderSearch}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-[#D4A64A]/30 bg-[#0F2D25]/85 text-[#F7F3EA] placeholder:text-[#9BB3AA] focus:bg-[#0F2D25] focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/35 focus:border-[#D4A64A] transition-all"
              />
              {headerSearch && (
                <button
                  type="button"
                  onClick={handleClearHeaderSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[#C5D4CE] hover:text-[#D4A64A] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isOwner ? (
              <>
                {/* Stock Alert Quick Link Icon */}
                <Link
                  to="/stock-alert"
                  aria-label="View stock alerts"
                  className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-[#F7F3EA] hover:text-[#D4A64A] hover:bg-[#1E4F43] active:bg-[#113129] transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {alertCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#D4A64A] ring-2 ring-[#173F35]" />
                  )}
                </Link>

                {/* Add Product Button */}
                <Link
                  to="/products/new"
                  className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#C29236] hover:from-[#DFB359] hover:to-[#CE9D3E] text-[#173F35] font-bold text-xs sm:text-sm shadow-md shadow-black/20 hover:shadow-lg hover:shadow-[#D4A64A]/25 transition-all active:scale-[0.98] whitespace-nowrap shrink-0"
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
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-[#DCE6E2] hover:text-[#F4D58D] hover:bg-[#1E4F43] active:bg-[#113129] transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : (
              /* Public Visitor: Owner Sign In Portal Button */
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#C29236] hover:from-[#DFB359] hover:to-[#CE9D3E] text-[#173F35] font-bold text-xs sm:text-sm shadow-md shadow-black/20 transition-all whitespace-nowrap shrink-0"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Owner Login</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar (Visible below md breakpoint) */}
        <div className="md:hidden pb-3 pt-0.5">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#D4A64A]/80 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products..."
              value={headerSearch}
              onChange={handleHeaderSearch}
              aria-label="Search products"
              className="w-full pl-9 pr-9 py-2 text-base sm:text-sm rounded-xl border border-[#D4A64A]/30 bg-[#0F2D25]/90 text-[#F7F3EA] placeholder:text-[#9BB3AA] focus:bg-[#0F2D25] focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/35 focus:border-[#D4A64A] transition-all"
            />
            {headerSearch && (
              <button
                type="button"
                onClick={handleClearHeaderSearch}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#C5D4CE] hover:text-[#D4A64A] hover:bg-[#1E4F43]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
