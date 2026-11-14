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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292D2B] dark:text-[#F7F3EA] tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-[#73776F] dark:text-[#B6C0B8] mt-1">
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
                className={`inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isManageMode
                    ? 'bg-[#173F35] dark:bg-[#203D32] text-[#F7F3EA] border-[#173F35] dark:border-[#34433A] shadow-sm'
                    : 'bg-[#FFFFFF] dark:bg-[#202A25] text-[#292D2B] dark:text-[#F7F3EA] border-[#E5DFD2] dark:border-[#34433A] hover:border-[#E9D5A5] dark:hover:border-[#E7C477] hover:bg-[#FCF9F2] dark:hover:bg-[#25322C]'
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
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-[#D4A64A] hover:bg-[#E9D5A5] dark:hover:bg-[#E7C477] text-[#173F35] dark:text-[#141C19] font-bold text-sm shadow-sm transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0"
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
          <div className="bg-[#FFFFFF] dark:bg-[#202A25] p-4 sm:p-5 rounded-2xl border border-[#E5DFD2] dark:border-[#34433A] shadow-xs dark:shadow-none space-y-4 transition-colors duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {Icon && (
                  <span className="w-6 h-6 rounded-lg bg-[#173F35] dark:bg-[#203D32] text-[#D4A64A] flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                )}
                <span className="text-xs font-bold text-[#292D2B] dark:text-[#F7F3EA] uppercase tracking-wider">
                  Select {itemLabelSingular}
                </span>
              </div>

              {selectedItem && (
                <button
                  type="button"
                  onClick={() => setSelectedId('all')}
                  className="self-start sm:self-auto text-xs font-bold text-[#173F35] dark:text-[#D4A64A] hover:text-[#9A7120] dark:hover:text-[#E7C477] cursor-pointer transition-colors"
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
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedId === 'all'
                    ? 'bg-[#173F35] dark:bg-[#203D32] text-[#F7F3EA] border-[#173F35] dark:border-[#34433A] shadow-xs'
                    : 'bg-[#F7F3EA] dark:bg-[#141C19] text-[#292D2B] dark:text-[#F7F3EA] border-[#E5DFD2] dark:border-[#34433A] hover:border-[#E9D5A5] dark:hover:border-[#E7C477] hover:bg-[#FCF9F2] dark:hover:bg-[#25322C]'
                }`}
              >
                <span>All</span>
                <span
                  className={`px-1.5 py-0.5 text-[11px] font-bold rounded-md tabular-nums ${
                    selectedId === 'all'
                      ? 'bg-[#D4A64A] text-[#173F35] dark:text-[#141C19]'
                      : 'bg-[#E5DFD2] dark:bg-[#202A25] text-[#292D2B] dark:text-[#B6C0B8]'
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
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-[#D4A64A] text-[#173F35] dark:text-[#141C19] border-[#D4A64A] font-bold shadow-xs'
                        : 'bg-[#F7F3EA] dark:bg-[#141C19] text-[#292D2B] dark:text-[#F7F3EA] border-[#E5DFD2] dark:border-[#34433A] hover:border-[#E9D5A5] dark:hover:border-[#E7C477] hover:bg-[#FCF9F2] dark:hover:bg-[#25322C]'
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.code && (
                      <span
                        className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-[#173F35]/15 text-[#173F35] dark:text-[#141C19]'
                            : 'bg-[#E5DFD2] dark:bg-[#202A25] text-[#73776F] dark:text-[#B6C0B8]'
                        }`}
                      >
                        {item.code}
                      </span>
                    )}
                    <span
                      className={`px-1.5 py-0.5 text-[11px] font-bold rounded-md tabular-nums ${
                        isSelected
                          ? 'bg-[#173F35] dark:bg-[#141C19] text-[#E9D5A5] dark:text-[#E7C477]'
                          : 'bg-[#E5DFD2] dark:bg-[#202A25] text-[#292D2B] dark:text-[#B6C0B8]'
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}

              {items.length === 0 && (
                <span className="text-xs text-[#73776F] dark:text-[#B6C0B8] italic px-1">
                  No {itemLabelPlural} added yet
                </span>
              )}
            </div>

            {/* Search within selected option */}
            {products.length > 0 && (
              <div className="relative pt-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4A64A] pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    selectedItem
                      ? `Search inside ${selectedItem.name}...`
                      : `Search all products...`
                  }
                  className="w-full h-10 pl-10 pr-9 text-sm rounded-xl border border-[#E5DFD2] dark:border-[#34433A] bg-[#F7F3EA] dark:bg-[#141C19] focus:bg-[#FFFFFF] dark:focus:bg-[#202A25] focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/30 focus:border-[#D4A64A] transition-all font-medium text-[#292D2B] dark:text-[#F7F3EA] placeholder:text-[#73776F] dark:placeholder:text-[#B6C0B8]/70"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[#73776F] dark:text-[#B6C0B8] hover:text-[#173F35] dark:hover:text-[#F7F3EA] hover:bg-[#E9D5A5]/40 dark:hover:bg-[#34433A] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 4. Products Summary Label */}
          <div className="flex items-center justify-between px-1">
            <p className="text-xs sm:text-sm font-semibold text-[#73776F] dark:text-[#B6C0B8]">
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
              <div className="p-8 sm:p-14 text-center bg-[#FFFFFF] dark:bg-[#202A25] rounded-2xl border border-[#E5DFD2] dark:border-[#34433A] shadow-xs dark:shadow-none space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#F7F3EA] dark:bg-[#141C19] border border-[#E5DFD2] dark:border-[#34433A] flex items-center justify-center mx-auto text-[#D4A64A]">
                  <Package className="w-7 h-7" />
                </div>

                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#292D2B] dark:text-[#F7F3EA]">
                    {selectedItem
                      ? `No products in "${selectedItem.name}"`
                      : searchQuery.trim()
                      ? 'No matching products found'
                      : 'No products in catalogue yet'}
                  </h2>
                  <p className="text-sm text-[#73776F] dark:text-[#B6C0B8] mt-1 max-w-sm mx-auto leading-relaxed">
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
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#173F35] dark:bg-[#203D32] hover:bg-[#1E4F43] dark:hover:bg-[#2A4E40] text-[#F7F3EA] text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <span>Show All Products</span>
                    </button>
                  )}

                  {isOwner && products.length === 0 && (
                    <Link
                      to="/products/new"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4A64A] hover:bg-[#E9D5A5] dark:hover:bg-[#E7C477] text-[#173F35] dark:text-[#141C19] text-xs sm:text-sm font-bold shadow-sm transition-all"
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
