import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlusCircle, Search, X, Package, Loader2, Download, ChevronDown } from 'lucide-react';
import { useCatalogue } from '../context/CatalogueContext';
import { isActiveStatus, isStockAlertStatus, isDiscontinuedStatus } from '../data/mockData';
import { exportProductsToCsv } from '../utils/csvExport';
import ProductCard from '../components/products/ProductCard';

/**
 * ProductsPage Component
 * 
 * Implements real-time, live, case-insensitive product search:
 * - Search Query State (`searchQuery`)
 * - Searches across 7 fields: Name, Code, Category, Sub-category, Brand, Material, Size/Capacity
 * - Real-time filtering on every keystroke without reloading the page
 * - Full-width mobile search bar with search icon and clear '×' button
 * - Derived array filtering (never mutating the original products list)
 * - AND logic combining Search Query + Category Filter + Status Filter
 * - Empty state with "No products found", friendly message, and "Clear Search" button
 */
export default function ProductsPage() {
  const { products, categories, authStatus, isCatalogueLoading, showToast } = useCatalogue();
  const isOwner = Boolean(authStatus?.isOwner);
  const [searchParams, setSearchParams] = useSearchParams();
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);

  // 1. Search Query state
  const initialQuery = searchParams.get('search') || searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // 2. Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Keep state synced if URL parameter changes (e.g. from global header search)
  useEffect(() => {
    const param = searchParams.get('search') || searchParams.get('q') || '';
    if (param !== searchQuery) {
      setSearchQuery(param);
    }
  }, [searchParams]);

  // Close export dropdown on outside click or Escape
  useEffect(() => {
    if (!exportMenuOpen) return;
    const handleOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setExportMenuOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setExportMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [exportMenuOpen]);

  // Update URL param subtly when typing without reloading page
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Keep URL parameter cleanly synced without full reload
    if (value.trim()) {
      setSearchParams({ search: value }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  // Clear search handler
  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSearchParams({}, { replace: true });
  };

  // 3. Derive visible products using pure functional filtering (never mutating original products)
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // Query variations for Indian cookware transliterations (e.g., kadhai <-> kadai)
    const kadaiAlternate = query.includes('kadhai')
      ? query.replace(/kadhai/g, 'kadai')
      : query.includes('kadai')
      ? query.replace(/kadai/g, 'kadhai')
      : null;

    // Alphanumeric version for flexible code searching (e.g., rbb001 matches RBB-CO-001)
    const cleanQuery = query.replace(/[^a-z0-9]/g, '');

    return products.filter((prod) => {
      // Condition A: Category Filter
      const matchesCategory =
        selectedCategory === 'all' ||
        (prod.category && prod.category.toLowerCase() === selectedCategory.toLowerCase()) ||
        (prod.categoryCode && prod.categoryCode.toLowerCase() === selectedCategory.toLowerCase());

      // Condition B: Status Filter
      let matchesStatus = true;
      if (selectedStatus === 'active') {
        matchesStatus = isActiveStatus(prod.status);
      } else if (selectedStatus === 'stock_alert') {
        matchesStatus = isStockAlertStatus(prod.status);
      } else if (selectedStatus === 'discontinued') {
        matchesStatus = isDiscontinuedStatus(prod.status);
      }

      // Condition C: Search Query across 7 required fields
      let matchesSearch = true;
      if (query) {
        const name = (prod.productName || '').toLowerCase();
        const code = (prod.productCode || '').toLowerCase();
        const category = (prod.category || '').toLowerCase();
        const subCategory = (prod.subCategory || '').toLowerCase();
        const brand = (prod.brand || '').toLowerCase();
        const material = (prod.material || '').toLowerCase();
        const sizeOrCapacity = (prod.sizeOrCapacity || '').toLowerCase();

        // Stripped product code (e.g., "rbb-co-001" -> "rbb-001") for RBB-001 query searches
        const strippedCode = code.replace(/-[a-z0-9]+-/, '-');
        const cleanCode = code.replace(/[^a-z0-9]/g, '');

        matchesSearch =
          name.includes(query) ||
          code.includes(query) ||
          category.includes(query) ||
          subCategory.includes(query) ||
          brand.includes(query) ||
          material.includes(query) ||
          sizeOrCapacity.includes(query) ||
          // Flex code matching (e.g. searching "RBB-001" or "001" finds "RBB-CO-001")
          strippedCode.includes(query) ||
          (cleanQuery.length >= 3 && cleanCode.includes(cleanQuery)) ||
          // Transliteration matching (kadhai <-> kadai)
          (kadaiAlternate && (name.includes(kadaiAlternate) || subCategory.includes(kadaiAlternate)));
      }

      // AND Logic: Must satisfy Category AND Status AND Search Query
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  const sortedCategories = useMemo(() => {
    return [...categories]
      .map((cat) => {
        const count = products.filter(
          (p) =>
            (p.category && p.category.toLowerCase() === String(cat.name || '').toLowerCase()) ||
            (p.categoryCode && p.categoryCode.toLowerCase() === String(cat.code || '').toLowerCase())
        ).length;
        return { ...cat, count };
      })
      .sort((a, b) => b.count - a.count || String(a.name || '').localeCompare(String(b.name || '')));
  }, [categories, products]);

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'all' || selectedStatus !== 'all';

  const handleExportCsv = (scope = 'all') => {
    setExportMenuOpen(false);
    const targetList = scope === 'filtered' ? filteredProducts : products;
    if (!targetList || targetList.length === 0) {
      showToast('No products available to export.', 'error');
      return;
    }
    const { count, filename } = exportProductsToCsv(targetList, { scope });
    showToast(`Exported ${count} ${count === 1 ? 'product' : 'products'} to ${filename}`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292D2B] dark:text-[#F7F3EA] tracking-tight">
            All Products
          </h1>
          <p className="text-sm text-[#73776F] dark:text-[#B6C0B8] mt-1">
            {hasActiveFilters
              ? `Showing ${filteredProducts.length} of ${products.length} products`
              : `${products.length} products in catalogue`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto">
          {/* Export CSV Button / Filtered Menu */}
          <div className="relative flex-1 sm:flex-initial" ref={exportMenuRef}>
            {hasActiveFilters ? (
              <>
                <button
                  type="button"
                  onClick={() => setExportMenuOpen((prev) => !prev)}
                  disabled={products.length === 0}
                  aria-expanded={exportMenuOpen}
                  title="Export product catalogue as CSV"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#202A25] hover:bg-[#FCF9F2] dark:hover:bg-[#25322C] text-[#292D2B] dark:text-[#F7F3EA] border border-[#E5DFD2] dark:border-[#34433A] hover:border-[#E9D5A5] dark:hover:border-[#E7C477] disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm shadow-2xs dark:shadow-none transition-all cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-4 h-4 text-[#D4A64A] shrink-0" />
                  <span>Export CSV</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#73776F] dark:text-[#B6C0B8] transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {exportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#FFFFFF] dark:bg-[#202A25] border border-[#E5DFD2] dark:border-[#34433A] shadow-lg dark:shadow-[0_10px_28px_-8px_rgba(10,16,13,0.65)] p-1.5 z-30">
                    <button
                      type="button"
                      onClick={() => handleExportCsv('filtered')}
                      disabled={filteredProducts.length === 0}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#FCF9F2] dark:hover:bg-[#25322C] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-bold text-[#292D2B] dark:text-[#F7F3EA] block">
                        Export Filtered ({filteredProducts.length})
                      </span>
                      <span className="text-[11px] text-[#73776F] dark:text-[#B6C0B8] block mt-0.5">
                        Only items matching current filters
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportCsv('all')}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#FCF9F2] dark:hover:bg-[#25322C] transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-bold text-[#292D2B] dark:text-[#F7F3EA] block">
                        Export Full Catalogue ({products.length})
                      </span>
                      <span className="text-[11px] text-[#73776F] dark:text-[#B6C0B8] block mt-0.5">
                        Complete offline backup CSV
                      </span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleExportCsv('all')}
                disabled={products.length === 0}
                title={products.length === 0 ? 'No products to export' : 'Download full product catalogue as CSV'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#202A25] hover:bg-[#FCF9F2] dark:hover:bg-[#25322C] text-[#292D2B] dark:text-[#F7F3EA] border border-[#E5DFD2] dark:border-[#34433A] hover:border-[#E9D5A5] dark:hover:border-[#E7C477] disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm shadow-2xs dark:shadow-none transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4 text-[#D4A64A] shrink-0" />
                <span>Export CSV</span>
              </button>
            )}
          </div>

          {isOwner && (
            <Link
              to="/products/new"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-[#D4A64A] hover:bg-[#E9D5A5] dark:hover:bg-[#E7C477] text-[#173F35] dark:text-[#141C19] font-bold text-sm shadow-sm transition-all active:scale-[0.98] text-center whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Product</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Mobile-Friendly Search & Filter Panel */}
      <div className="bg-[#FFFFFF] dark:bg-[#202A25] p-4 sm:p-5 rounded-2xl border border-[#E5DFD2] dark:border-[#34433A] shadow-xs dark:shadow-none space-y-3.5 transition-colors duration-200">
        {/* Full-width Search Bar */}
        <div className="relative w-full">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4A64A] pointer-events-none" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
            autoComplete="off"
            spellCheck="false"
            className="w-full h-12 pl-11 pr-10 text-base sm:text-sm rounded-xl border border-[#E5DFD2] dark:border-[#34433A] bg-[#F7F3EA] dark:bg-[#141C19] focus:bg-[#FFFFFF] dark:focus:bg-[#202A25] focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/30 focus:border-[#D4A64A] transition-all font-medium text-[#292D2B] dark:text-[#F7F3EA] placeholder:text-[#73776F] dark:placeholder:text-[#B6C0B8]/70"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchParams({}, { replace: true });
              }}
              aria-label="Clear search input"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-[#73776F] dark:text-[#B6C0B8] hover:text-[#173F35] dark:hover:text-[#F7F3EA] hover:bg-[#E9D5A5]/40 dark:hover:bg-[#34433A] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Row: Category Dropdown + Status Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#73776F] dark:text-[#B6C0B8] shrink-0 hidden sm:inline">
              Category:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs font-semibold rounded-xl border border-[#E5DFD2] dark:border-[#34433A] bg-[#F7F3EA] dark:bg-[#141C19] text-[#292D2B] dark:text-[#F7F3EA] focus:bg-[#FFFFFF] dark:focus:bg-[#202A25] focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/30 focus:border-[#D4A64A] hover:border-[#E9D5A5] dark:hover:border-[#E7C477] transition-all cursor-pointer"
            >
              <option value="all">All Categories ({products.length})</option>
              {sortedCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name} ({cat.count})
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs (Touch-friendly & Scrollable on mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'stock_alert', label: 'Stock Alert' },
              { id: 'discontinued', label: 'Discontinued' },
            ].map((tab) => {
              const isActive = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                    isActive
                      ? 'bg-[#173F35] dark:bg-[#203D32] text-[#F7F3EA] border-[#173F35] dark:border-[#34433A] shadow-2xs'
                      : 'bg-[#F7F3EA] dark:bg-[#141C19] text-[#292D2B] dark:text-[#F7F3EA] border-[#E5DFD2] dark:border-[#34433A] hover:border-[#E9D5A5] dark:hover:border-[#E7C477] hover:bg-[#FCF9F2] dark:hover:bg-[#25322C]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Product Results Card Grid or Empty/Loading States */}
      <div>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : products.length === 0 && isCatalogueLoading ? (
          /* Initial Loading State */
          <div className="p-8 sm:p-14 text-center bg-[#FFFFFF] dark:bg-[#202A25] rounded-2xl border border-[#E5DFD2] dark:border-[#34433A] shadow-xs dark:shadow-none space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F7F3EA] dark:bg-[#141C19] border border-[#D4A64A]/40 flex items-center justify-center mx-auto">
              <Loader2 className="w-6 h-6 animate-spin text-[#D4A64A]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#292D2B] dark:text-[#F7F3EA]">Loading catalogue...</h2>
              <p className="text-xs text-[#73776F] dark:text-[#B6C0B8] mt-1">Fetching latest products from database.</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          /* Empty Catalogue Initial State */
          <div className="p-8 sm:p-14 text-center bg-[#FFFFFF] dark:bg-[#202A25] rounded-2xl border border-[#E5DFD2] dark:border-[#34433A] shadow-xs dark:shadow-none space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#173F35] dark:bg-[#203D32] flex items-center justify-center mx-auto text-[#D4A64A]">
              <Package className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#292D2B] dark:text-[#F7F3EA]">
                No products in catalogue yet
              </h2>
              <p className="text-sm text-[#73776F] dark:text-[#B6C0B8] mt-1 max-w-sm mx-auto leading-relaxed">
                Your inventory is ready for fresh production items. Add your first product to get started.
              </p>
            </div>

            {isOwner && (
              <div>
                <Link
                  to="/products/new"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4A64A] hover:bg-[#E9D5A5] dark:hover:bg-[#E7C477] text-[#173F35] dark:text-[#141C19] text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-[0.98]"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add First Product</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Empty Search / Filter Results State */
          <div className="p-8 sm:p-14 text-center bg-[#FFFFFF] dark:bg-[#202A25] rounded-2xl border border-[#E5DFD2] dark:border-[#34433A] shadow-xs dark:shadow-none space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F7F3EA] dark:bg-[#141C19] border border-[#E5DFD2] dark:border-[#34433A] flex items-center justify-center mx-auto text-[#D4A64A]">
              <Package className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#292D2B] dark:text-[#F7F3EA]">
                No products found
              </h2>
              <p className="text-sm text-[#73776F] dark:text-[#B6C0B8] mt-1 max-w-sm mx-auto leading-relaxed">
                Try a different search term or clear your search.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={handleClearSearch}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4A64A] hover:bg-[#E9D5A5] dark:hover:bg-[#E7C477] text-[#173F35] dark:text-[#141C19] text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Clear Search</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
