import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Tag, ChevronRight, Image as ImageIcon } from 'lucide-react';

/**
 * ProductPreview Component
 * Renders an item in the "Recently Added Products" list.
 * Mobile-first responsive layout (stacks nicely on small screens, cleans up into a row on tablet/desktop).
 */
export default function ProductPreview({ product }) {
  // Format creation date: e.g. "Oct 3, 2026"
  const formattedDate = new Date(product.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Status styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'stock_alert':
      case 'Out of Stock':
        return {
          label: 'Out of Stock',
          classes: 'text-amber-700 dark:text-[#D4A64A] font-semibold'
        };
      case 'discontinued':
      case 'Discontinued':
        return {
          label: 'Discontinued',
          classes: 'text-[#73776F] dark:text-[#B6C0B8] font-semibold'
        };
      case 'active':
      case 'In Stock':
      default:
        return {
          label: 'In Stock',
          classes: 'text-emerald-700 dark:text-emerald-400 font-semibold'
        };
    }
  };

  const statusBadge = getStatusBadge(product.status);
  const displayName = product.name || product.productName || 'Unnamed Product';
  const displayCode = product.code || product.productCode || '';
  const displayCategory = product.categoryName || product.category || '';
  const displayImage1 = product.images?.[0] || product.image1 || '';
  const hasMultipleImages = (product.images && product.images.length > 1) || Boolean(product.image2);

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block p-3.5 sm:p-4 rounded-2xl border border-[#E5DFD2] dark:border-[#34433A] bg-[#FFFFFF] dark:bg-[#202A25] hover:bg-[#FCF9F2] dark:hover:bg-[#25322C] hover:border-[#E9D5A5] dark:hover:border-[#E7C477] shadow-2xs dark:shadow-none hover:shadow-md dark:hover:shadow-[0_6px_16px_-6px_rgba(8,14,11,0.5)] hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-center gap-3.5 sm:gap-4">
        {/* Product Image Thumbnail (kept natural & unaffected by theme changes) */}
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-[#FFFFFF] border border-[#E5DFD2] dark:border-[#34433A] group-hover:border-[#E9D5A5] dark:group-hover:border-[#E7C477] shrink-0 transition-colors">
          {displayImage1 ? (
            <img
              src={displayImage1}
              alt={displayName}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#F7F3EA] dark:bg-[#1A231F] text-[#73776F] dark:text-[#B6C0B8]">
              <ImageIcon className="w-6 h-6" />
            </div>
          )}

          {/* 2-Image Indicator */}
          {hasMultipleImages && (
            <span
              title="2 product images attached"
              className="absolute bottom-1 right-1 bg-[#173F35]/90 dark:bg-[#203D32]/95 text-[#E9D5A5] dark:text-[#E7C477] text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs"
            >
              2
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5 text-xs">
            <span className="font-mono font-bold text-[#173F35] dark:text-[#E7C477]">
              {displayCode}
            </span>
            <span className="text-[#D4A64A]/70" aria-hidden="true">·</span>
            <span className={statusBadge.classes}>
              {statusBadge.label}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-[#292D2B] dark:text-[#F7F3EA] truncate group-hover:text-[#9A7120] dark:group-hover:text-[#E7C477] transition-colors">
            {displayName}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[#73776F] dark:text-[#B6C0B8]">
            <span className="flex items-center gap-1 truncate">
              <Tag className="w-3.5 h-3.5 text-[#D4A64A] shrink-0" />
              <span>{displayCategory}</span>
              {product.material && <span>· {product.material}</span>}
              {product.brand && <span className="hidden sm:inline">· {product.brand}</span>}
            </span>

            <span className="flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-[#73776F] dark:text-[#B6C0B8] shrink-0" />
              <span>{formattedDate}</span>
            </span>

            {Boolean(product.purchasePrice) && (
              <span className="font-bold text-[#292D2B] dark:text-[#F7F3EA] tabular-nums">
                ₹{Number(product.purchasePrice).toLocaleString()}
                <span className="text-[11px] font-medium text-[#73776F] dark:text-[#B6C0B8] ml-0.5">
                  /{product.purchaseUnit || product.purchase_unit || 'pc'}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Arrow Action Indicator */}
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[#73776F] dark:text-[#B6C0B8] group-hover:text-[#173F35] dark:group-hover:text-[#141C19] group-hover:bg-[#E9D5A5] dark:group-hover:bg-[#E7C477] transition-colors shrink-0">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
