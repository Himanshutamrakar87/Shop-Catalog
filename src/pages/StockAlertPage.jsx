import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, PlusCircle, ArrowLeft } from 'lucide-react';
import { useCatalogue } from '../context/CatalogueContext';
import { isStockAlertStatus } from '../data/mockData';
import ProductPreview from '../components/dashboard/ProductPreview';

/**
 * Stock Alert Page
 * Highlights products needing stock replenishment or inventory attention.
 */
export default function StockAlertPage() {
  const { products } = useCatalogue();
  const alertProducts = useMemo(
    () => products.filter((p) => isStockAlertStatus(p.status)),
    [products]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-[#D4A64A] text-[#173F35] dark:text-[#141C19]">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-[#8E6518] dark:text-[#D4A64A] uppercase tracking-wider">
              Inventory Attention Required
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292D2B] dark:text-[#F7F3EA] tracking-tight">
            Stock Alert
          </h1>
          <p className="text-sm text-[#73776F] dark:text-[#B6C0B8] mt-1">
            Products approaching depletion threshold or requiring re-order verification
          </p>
        </div>

        <Link
          to="/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A64A] hover:bg-[#E9D5A5] dark:hover:bg-[#E7C477] text-[#173F35] dark:text-[#141C19] font-bold text-sm shadow-sm transition-all self-start sm:self-auto whitespace-nowrap shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Alert Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FBF5E6] dark:bg-[#202A25] border border-[#D4A64A]/50 dark:border-[#D4A64A]/40 text-[#292D2B] dark:text-[#F7F3EA] flex items-start gap-3 shadow-xs dark:shadow-none">
        <div className="w-9 h-9 rounded-xl bg-[#D4A64A] text-[#173F35] dark:text-[#141C19] flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4.5 h-4.5" />
        </div>
        <div className="text-xs sm:text-sm">
          <p className="font-bold text-[#292D2B] dark:text-[#F7F3EA]">
            {alertProducts.length === 0
              ? 'No stock alerts currently active'
              : `${alertProducts.length} product${alertProducts.length === 1 ? '' : 's'} flagged for stock alert across catalogue`}
          </p>
          <p className="text-[#73776F] dark:text-[#B6C0B8] mt-0.5">
            {alertProducts.length === 0
              ? 'All inventory levels are healthy. Products marked with low stock will appear here.'
              : 'Review these items to contact suppliers or mark updated inventory statuses.'}
          </p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {alertProducts.length > 0 ? (
          alertProducts.map((product) => (
            <ProductPreview key={product.id} product={product} />
          ))
        ) : (
          <div className="p-8 sm:p-12 text-center bg-[#FFFFFF] dark:bg-[#202A25] rounded-2xl border border-[#E5DFD2] dark:border-[#34433A] text-[#73776F] dark:text-[#B6C0B8] text-sm space-y-2">
            <p className="font-semibold text-[#292D2B] dark:text-[#F7F3EA]">No products needing stock attention</p>
            <p className="text-xs">Items marked as 'Stock Alert' or 'Out of Stock' will be shown in this list.</p>
          </div>
        )}
      </div>
    </div>
  );
}
