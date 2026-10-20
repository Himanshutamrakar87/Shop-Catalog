import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlusCircle, Search, X, Package } from 'lucide-react';
import { useCatalogue } from '../context/CatalogueContext';
import ProductPreview from '../components/dashboard/ProductPreview';

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
  const { products, categories } = useCatalogue();
  const [searchParams, setSearchParams] = useSearchParams();

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
      const matchesStatus =
        selectedStatus === 'all' || prod.status === selectedStatus;

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

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'all' || selectedStatus !== 'all';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            All Products
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {hasActiveFilters
              ? `Showing ${filteredProducts.length} of ${products.length} products`
              : `${products.length} products in catalogue`}
          </p>
        </div>

        <Link
          to="/products/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-xs transition-all active:scale-[0.98] self-stretch sm:self-auto text-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* 2. Mobile-Friendly Search & Filter Panel */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        {/* Full-width Search Bar */}
        <div className="relative w-full">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
            autoComplete="off"
            spellCheck="false"
            className="w-full h-12 pl-11 pr-10 text-base sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors font-medium text-slate-900 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchParams({}, { replace: true });
              }}
              aria-label="Clear search input"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 active:bg-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Row: Category Dropdown + Status Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 shrink-0 hidden sm:inline">
              Category:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
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
                  className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Product Results List or No Results State */}
      <div className="space-y-3">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductPreview key={product.id} product={product} />
          ))
        ) : products.length === 0 ? (
          /* Empty Catalogue Initial State */
          <div className="p-8 sm:p-14 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto text-blue-600">
              <Package className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                No products in catalogue yet
              </h2>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Your inventory is ready for fresh production items. Add your first product to get started.
              </p>
            </div>

            <div>
              <Link
                to="/products/new"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add First Product</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Empty Search / Filter Results State */
          <div className="p-8 sm:p-14 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Package className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                No products found
              </h2>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Try a different search term or clear your search.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={handleClearSearch}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-[0.98]"
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
