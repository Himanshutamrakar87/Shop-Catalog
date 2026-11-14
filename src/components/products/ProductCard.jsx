import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, ArrowRight, Image as ImageIcon, Images } from 'lucide-react';

/**
 * ProductCard Component
 * Compact card-wise product presentation for the All Products catalogue grid.
 * Keeps product photography natural and unaffected by theme changes.
 */
export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'stock_alert':
      case 'Out of Stock':
        return {
          label: 'Out of Stock',
          shortLabel: 'Out',
          dotClass: 'bg-amber-500 dark:bg-[#D4A64A]',
          textClass: 'text-amber-700 dark:text-[#D4A64A]',
        };
      case 'discontinued':
      case 'Discontinued':
        return {
          label: 'Discontinued',
          shortLabel: 'Disc.',
          dotClass: 'bg-[#73776F] dark:bg-[#B6C0B8]',
          textClass: 'text-[#73776F] dark:text-[#B6C0B8]',
        };
      case 'active':
      case 'In Stock':
      default:
        return {
          label: 'In Stock',
          shortLabel: 'In Stock',
          dotClass: 'bg-emerald-600 dark:bg-emerald-400',
          textClass: 'text-emerald-700 dark:text-emerald-400',
        };
    }
  };

  const statusBadge = getStatusBadge(product.status);
  const displayName = product.name || product.productName || 'Unnamed Product';
  const displayCode = product.code || product.productCode || '';
  const displayCategory = product.categoryName || product.category || 'Uncategorized';
  const displaySize = product.sizeCapacity || product.sizeOrCapacity || '';
  const displayImage1 = product.images?.[0] || product.image1 || '';
  const hasMultipleImages = (product.images && product.images.length > 1) || Boolean(product.image2);

  const subMeta = [product.material, product.brand, displaySize].filter(Boolean).join(' · ');

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col rounded-xl border border-[#E5DFD2] dark:border-[#34433A] bg-[#FFFFFF] dark:bg-[#202A25] hover:bg-[#FCF9F2] dark:hover:bg-[#25322C] hover:border-[#E9D5A5] dark:hover:border-[#E7C477] shadow-2xs dark:shadow-none hover:shadow-md dark:hover:shadow-[0_8px_20px_-8px_rgba(8,14,11,0.55)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
    >
      {/* Compact Product Image Area (kept natural & unaffected by theme changes) */}
      <div className="relative h-32 sm:h-36 w-full bg-[#FFFFFF] border-b border-[#E5DFD2] dark:border-[#34433A] overflow-hidden">
        {displayImage1 && !imgError ? (
          <img
            src={displayImage1}
            alt={displayName}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#F7F3EA] dark:bg-[#1A231F] text-[#73776F] dark:text-[#B6C0B8] gap-1">
            <ImageIcon className="w-6 h-6 opacity-65" />
            <span className="text-[10px] font-medium">No Image</span>
          </div>
        )}

        {/* 2-Image Indicator Badge */}
        {hasMultipleImages && (
          <span
            title="2 product images attached"
            className="absolute bottom-2 right-2 inline-flex items-center gap-1 bg-[#173F35]/90 dark:bg-[#203D32]/95 text-[#E9D5A5] dark:text-[#E7C477] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#D4A64A]/35 backdrop-blur-xs"
          >
            <Images className="w-2.5 h-2.5" />
            <span>2</span>
          </span>
        )}
      </div>

      {/* Compact Card Body */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between gap-2">
        <div className="space-y-1">
          {/* Code + Status Row */}
          <div className="flex items-center justify-between gap-1.5 text-[10px] sm:text-[11px]">
            <span className="font-mono font-bold text-[#173F35] dark:text-[#E7C477] truncate">
              {displayCode}
            </span>
            <span
              title={statusBadge.label}
              className={`inline-flex items-center gap-1 shrink-0 font-semibold ${statusBadge.textClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotClass}`} />
              <span className="sm:hidden">{statusBadge.shortLabel}</span>
              <span className="hidden sm:inline">{statusBadge.label}</span>
            </span>
          </div>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-bold text-[#292D2B] dark:text-[#F7F3EA] leading-snug line-clamp-2 group-hover:text-[#9A7120] dark:group-hover:text-[#E7C477] transition-colors">
            {displayName}
          </h3>

          {/* Compact Category & Material Metadata */}
          <div className="space-y-0.5 text-[11px] text-[#73776F] dark:text-[#B6C0B8]">
            <div className="flex items-center gap-1 truncate">
              <Tag className="w-3 h-3 text-[#D4A64A] shrink-0" />
              <span className="truncate font-medium text-[#292D2B]/85 dark:text-[#F7F3EA]/85">
                {displayCategory}
              </span>
            </div>
            {subMeta && (
              <p className="truncate text-[10px] text-[#73776F] dark:text-[#B6C0B8]">
                {subMeta}
              </p>
            )}
          </div>
        </div>

        {/* Compact Card Footer: Price + Arrow */}
        <div className="pt-2 border-t border-[#E5DFD2] dark:border-[#34433A] flex items-center justify-between gap-1.5">
          <div className="min-w-0 truncate">
            {Boolean(product.purchasePrice) ? (
              <span className="text-xs sm:text-sm font-extrabold text-[#292D2B] dark:text-[#F7F3EA] tabular-nums">
                ₹{Number(product.purchasePrice).toLocaleString()}
                <span className="text-[10px] font-medium text-[#73776F] dark:text-[#B6C0B8] ml-0.5">
                  /{product.purchaseUnit || product.purchase_unit || 'pc'}
                </span>
              </span>
            ) : (
              <span className="text-[11px] font-medium text-[#73776F] dark:text-[#B6C0B8]">
                View
              </span>
            )}
          </div>

          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center bg-[#F7F3EA] dark:bg-[#141C19] text-[#173F35] dark:text-[#E7C477] group-hover:bg-[#D4A64A] group-hover:text-[#173F35] dark:group-hover:text-[#141C19] transition-colors shrink-0">
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
