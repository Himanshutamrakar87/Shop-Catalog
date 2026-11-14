import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, SlidersHorizontal, ArrowLeft, Search, X, PlusCircle } from 'lucide-react';
import ProductPreview from '../dashboard/ProductPreview';

/**
 * ClassificationCatalogueView Component
 *
 * Shared layout for Categories, Sub-Categories, Brands, and Materials pages:
 * - Shows all classification options at the top as selectable filter options ("All" selected by default)
 * - Displays all products below when "All" is selected
 * - Clicking/selecting any option filters and displays matching products below
 * - Owners can still add new entries directly or toggle "Manage" to edit/delete existing entries
 */
export default function ClassificationCatalogueView({
  title,
  subtitle,
  icon: Icon,
  itemLabelSingular = 'item',
  itemLabelPlural = 'items',
  addLabel = 'Add',
  items = [], // Array of { id, name, code?, count, raw }
  products = [],
  matchesProduct,
  isOwner = false,
  onAdd,
  renderManageView,
  initialSelected = 'all',
}) {
  const [selectedId, setSelectedId] = useState(initialSelected);
  const [searchQuery, setSearchQuery] = useState('');
  const [isManageMode, setIsManageMode] = useState(false);

  // Reset selected option if the currently selected item was deleted
  useEffect(() => {
    if (selectedId !== 'all' && !items.some((item) => item.id === selectedId)) {
      setSelectedId('all');
    }
    if (items.length === 0 && isManageMode) {
      setIsManageMode(false);
    }
  }, [items, selectedId, isManageMode]);

  const selectedItem = useMemo(
    () => (selectedId === 'all' ? null : items.find((i) => i.id === selectedId) || null),
    [items, selectedId]
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return products.filter((prod) => {
      const matchesOption =
        !selectedItem || (typeof matchesProduct === 'function' ? matchesProduct(prod, selectedItem) : true);

      if (!matchesOption) return false;
      if (!q) return true;

      const name = String(prod.productName || prod.name || '').toLowerCase();
      const code = String(prod.productCode || prod.code || '').toLowerCase();
      const cat = String(prod.categoryName || prod.category || '').toLowerCase();
      const subCat = String(prod.subCategory || '').toLowerCase();
      const brand = String(prod.brand || '').toLowerCase();
      const material = String(prod.material || '').toLowerCase();
      const size = String(prod.sizeOrCapacity || prod.sizeCapacity || '').toLowerCase();

      return (
        name.includes(q) ||
        code.includes(q) ||
        cat.includes(q) ||
        subCat.includes(q) ||
        brand.includes(q) ||
        material.includes(q) ||
        size.includes(q)
      );
    });
  }, [products, selectedItem, matchesProduct, searchQuery]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isManageMode
              ? `Edit or remove ${itemLabelPlural} (${items.length} ${items.length === 1 ? itemLabelSingular : itemLabelPlural})`
              : subtitle || `Select a ${itemLabelSingular} above to filter products`}
          </p>
        </div>

        {isOwner && (
          <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
            {items.length > 0 && renderManageView && (
              <button
                type="button"
                onClick={() => setIsManageMode((prev) => !prev)}
                className={`inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  isManageMode
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isManageMode ? (
                  <>
                    <ArrowLeft className="w-4 h-4" />
                    <span>View Products</span>
                  </>
                ) : (
                  <>
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Manage</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onAdd}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{addLabel}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Management View (Owner Only when Manage is toggled) */}
      {isOwner && isManageMode && renderManageView ? (
        <div className="space-y-4">
          {renderManageView()}
        </div>
      ) : (
        <>
          {/* 3. Top Selectable Options Bar + Quick Search */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4 text-blue-600 shrink-0" />}
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Select {itemLabelSingular}
                </span>
              </div>

              {selectedItem && (
                <button
                  type="button"
                  onClick={() => setSelectedId('all')}
                  className="self-start sm:self-auto text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Show all products ({products.length})
                </button>
              )}
            </div>

            {/* Option Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedId('all')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                  selectedId === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>All</span>
                <span
                  className={`px-1.5 py-0.5 text-[11px] font-bold rounded-md tabular-nums ${
                    selectedId === 'all'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {products.length}
                </span>
              </button>

              {items.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.code && (
                      <span
                        className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200/70 text-slate-600'
                        }`}
                      >
                        {item.code}
                      </span>
                    )}
                    <span
                      className={`px-1.5 py-0.5 text-[11px] font-bold rounded-md tabular-nums ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}

              {items.length === 0 && (
                <span className="text-xs text-slate-400 italic px-1">
                  No {itemLabelPlural} added yet
                </span>
              )}
            </div>

            {/* Search within selected option */}
            {products.length > 0 && (
              <div className="relative pt-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    selectedItem
                      ? `Search inside ${selectedItem.name}...`
                      : `Search all products...`
                  }
                  className="w-full h-10 pl-10 pr-9 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors font-medium text-slate-900 placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 4. Products Summary Label */}
          <div className="flex items-center justify-between px-1">
            <p className="text-xs sm:text-sm font-semibold text-slate-600">
              {selectedItem
                ? `Showing ${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'} in "${selectedItem.name}"`
                : `Showing ${filteredProducts.length} of ${products.length} products`}
            </p>
          </div>

          {/* 5. Filtered Products List */}
          <div className="space-y-3">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductPreview key={product.id} product={product} />
              ))
            ) : (
              <div className="p-8 sm:p-14 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Package className="w-7 h-7" />
                </div>

                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {selectedItem
                      ? `No products in "${selectedItem.name}"`
                      : searchQuery.trim()
                      ? 'No matching products found'
                      : 'No products in catalogue yet'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    {selectedItem
                      ? `There are currently no products assigned to this ${itemLabelSingular}.`
                      : searchQuery.trim()
                      ? 'Try a different search term or clear the search box.'
                      : 'Add your first product to start building the catalogue.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  {(selectedItem || searchQuery.trim()) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId('all');
                        setSearchQuery('');
                      }}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <span>Show All Products</span>
                    </button>
                  )}

                  {isOwner && products.length === 0 && (
                    <Link
                      to="/products/new"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Add Product</span>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
