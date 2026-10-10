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

  // Status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'stock_alert':
      case 'Out of Stock':
        return {
          label: 'Out of Stock',
          classes: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      case 'discontinued':
      case 'Discontinued':
        return {
          label: 'Discontinued',
          classes: 'bg-slate-100 text-slate-700 border-slate-200'
        };
      case 'active':
      case 'In Stock':
      default:
        return {
          label: 'In Stock',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200'
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
      className="group block p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all active:bg-slate-50/80"
    >
      <div className="flex items-center gap-3.5 sm:gap-4">
        {/* Product Image Thumbnail */}
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
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
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <ImageIcon className="w-6 h-6" />
            </div>
          )}

          {/* 2-Image Indicator Badge */}
          {hasMultipleImages && (
            <span 
              title="2 product images attached"
              className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] font-bold px-1 rounded backdrop-blur-xs"
            >
              2📷
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {displayCode}
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge.classes}`}>
              {statusBadge.label}
            </span>
          </div>

          <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
            {displayName}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1 truncate">
              <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{displayCategory}</span>
              {product.material && <span className="text-slate-400">• {product.material}</span>}
            </span>

            <span className="flex items-center gap-1 shrink-0 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{formattedDate}</span>
            </span>
          </div>
        </div>

        {/* Arrow Action Indicator */}
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors shrink-0">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
