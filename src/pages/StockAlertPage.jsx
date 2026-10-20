import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, PlusCircle, ArrowLeft } from 'lucide-react';
import { useCatalogue } from '../context/CatalogueContext';
import ProductPreview from '../components/dashboard/ProductPreview';

/**
 * Stock Alert Page
 * Highlights products needing stock replenishment or inventory attention.
 */
export default function StockAlertPage() {
  const { products } = useCatalogue();
  const alertProducts = useMemo(
    () => products.filter((p) => p.status === 'stock_alert'),
    [products]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-amber-100 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Inventory Attention Required
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Stock Alert
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Products approaching depletion threshold or requiring re-order verification
          </p>
        </div>

        <Link
          to="/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Alert Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <p className="font-bold">
            {alertProducts.length === 0
              ? 'No stock alerts currently active'
              : `${alertProducts.length} product${alertProducts.length === 1 ? '' : 's'} flagged for stock alert across catalogue`}
          </p>
          <p className="text-amber-700 mt-0.5">
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
          <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm space-y-2">
            <p className="font-semibold text-slate-700">No products needing stock attention</p>
            <p className="text-xs text-slate-400">Items marked as 'Stock Alert' or 'Out of Stock' will be shown in this list.</p>
          </div>
        )}
      </div>
    </div>
  );
}
