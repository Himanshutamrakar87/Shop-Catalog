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
          classes: 'text-amber-700 font-semibold'
        };
      case 'discontinued':
      case 'Discontinued':
        return {
          label: 'Discontinued',
          classes: 'text-slate-500 font-semibold'
        };
      case 'active':
      case 'In Stock':
      default:
        return {
          label: 'In Stock',
          classes: 'text-emerald-700 font-semibold'
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
      className="group block p-3.5 sm:p-4 rounded-2xl border border-[#E6DFCE] bg-white hover:bg-[#FCF9F2] hover:border-[#D4A64A] hover:shadow-md hover:shadow-[#D4A64A]/15 hover:-translate-y-0.5 transition-all duration-200 active:bg-[#F7F3EA]"
    >
      <div className="flex items-center gap-3.5 sm:gap-4">
        {/* Product Image Thumbnail */}
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-[#F7F3EA] border border-[#E6DFCE] group-hover:border-[#D4A64A]/60 shrink-0 shadow-2xs transition-colors">
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
            <div className="w-full h-full flex items-center justify-center text-[#8B8E8B]">
              <ImageIcon className="w-6 h-6" />
            </div>
          )}

          {/* 2-Image Indicator */}
          {hasMultipleImages && (
            <span
              title="2 product images attached"
              className="absolute bottom-1 right-1 bg-[#173F35]/90 text-[#F4D58D] text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs"
            >
              2
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5 text-xs">
            <span className="font-mono font-bold text-[#173F35]">
              {displayCode}
            </span>
            <span className="text-[#D4A64A]/70" aria-hidden="true">·</span>
            <span className={statusBadge.classes}>
              {statusBadge.label}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-[#292D2B] truncate group-hover:text-[#9A7120] transition-colors">
            {displayName}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[#555B58]">
            <span className="flex items-center gap-1 truncate">
              <Tag className="w-3.5 h-3.5 text-[#9A7120]/75 shrink-0" />
              <span>{displayCategory}</span>
              {product.material && <span className="text-[#6E7470]">· {product.material}</span>}
              {product.brand && <span className="text-[#6E7470] hidden sm:inline">· {product.brand}</span>}
            </span>

            <span className="flex items-center gap-1 shrink-0 text-[#6E7470]">
              <Calendar className="w-3.5 h-3.5 text-[#8B8E8B] shrink-0" />
              <span>{formattedDate}</span>
            </span>

            {Boolean(product.purchasePrice) && (
              <span className="font-bold text-[#292D2B] tabular-nums">
                ₹{Number(product.purchasePrice).toLocaleString()}
                <span className="text-[11px] font-medium text-[#555B58] ml-0.5">
                  /{product.purchaseUnit || product.purchase_unit || 'pc'}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Arrow Action Indicator */}
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[#8B8E8B] group-hover:text-[#173F35] group-hover:bg-[#D4A64A] transition-colors shrink-0">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
