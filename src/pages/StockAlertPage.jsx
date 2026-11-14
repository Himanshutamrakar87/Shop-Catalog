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
            <span className="p-1.5 rounded-lg bg-[#D4A64A] text-[#173F35] shadow-2xs">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-[#8E6518] uppercase tracking-wider">
              Inventory Attention Required
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292D2B] tracking-tight">
            Stock Alert
          </h1>
          <p className="text-sm text-[#555B58] mt-1">
            Products approaching depletion threshold or requiring re-order verification
          </p>
        </div>

        <Link
          to="/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#C29236] hover:from-[#DFB359] hover:to-[#CE9D3E] text-[#173F35] font-bold text-sm shadow-md shadow-[#173F35]/15 transition-all self-start sm:self-auto whitespace-nowrap shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Alert Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FBF5E6] via-[#FAF3DF] to-[#F7EED4] border border-[#D4A64A]/60 text-[#292D2B] flex items-start gap-3 shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-[#D4A64A] text-[#173F35] flex items-center justify-center shrink-0 shadow-xs">
          <AlertTriangle className="w-4.5 h-4.5" />
        </div>
        <div className="text-xs sm:text-sm">
          <p className="font-bold text-[#292D2B]">
            {alertProducts.length === 0
              ? 'No stock alerts currently active'
              : `${alertProducts.length} product${alertProducts.length === 1 ? '' : 's'} flagged for stock alert across catalogue`}
          </p>
          <p className="text-[#555B58] mt-0.5">
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
          <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-[#E6DFCE] text-[#555B58] text-sm space-y-2">
            <p className="font-semibold text-[#292D2B]">No products needing stock attention</p>
            <p className="text-xs text-[#6F7571]">Items marked as 'Stock Alert' or 'Out of Stock' will be shown in this list.</p>
          </div>
        )}
      </div>
    </div>
  );
}
