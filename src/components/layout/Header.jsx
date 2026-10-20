import React, { useState } from 'react';
import { Menu, Plus, Bell, Search, X, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';

/**
 * Responsive Header
 * - On Mobile: Compact header with hamburger button, compact RBB mark, and "+ Add" action button
 * - On Desktop: Clean bar showing active section title, quick global catalogue search, and quick "Add Product" button
 */
export default function Header({ onOpenMobileMenu, alertCount = 12, onSignOut }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [headerSearch, setHeaderSearch] = useState('');

  // Page title mapping based on current pathname
  const getPageTitle = (path) => {
    if (path === '/' || path === '/dashboard') return 'Dashboard';
    if (path === '/products') return 'All Products';
    if (path === '/products/new') return 'Add New Product';
    if (path.startsWith('/products/') && path.endsWith('/edit')) return 'Edit Product';
    if (path.startsWith('/products/')) return 'Product Details';
    if (path === '/categories') return 'Categories';
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
    navigate(`/products?search=${encodeURIComponent(val)}`);
  };

  const handleClearHeaderSearch = () => {
    setHeaderSearch('');
    navigate('/products');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Mobile Left: Hamburger + Compact Logo */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <button
              type="button"
              onClick={onOpenMobileMenu}
              aria-label="Open navigation menu"
              className="w-10 h-10 -ml-1.5 flex items-center justify-center rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-100 active:bg-slate-200 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <BrandLogo showTagline={false} />
          </div>

          {/* Desktop Left: Current Page Title / Breadcrumb */}
          <div className="hidden lg:flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {currentTitle}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              Private Owner Mode
            </span>
          </div>

          {/* Center / Search bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products..."
                value={headerSearch}
                onChange={handleHeaderSearch}
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/70 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
              {headerSearch && (
                <button
                  type="button"
                  onClick={handleClearHeaderSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Stock Alert Quick Link Icon */}
            <Link
              to="/stock-alert"
              aria-label="View stock alerts"
              className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 active:bg-amber-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {alertCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </Link>

            {/* Add Product Button (Compact on Mobile, Full on Desktop) */}
            <Link
              to="/products/new"
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </Link>

            {/* Owner Logout Action */}
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                title="Sign out of owner session"
                aria-label="Sign out"
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
