import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Archive, PlusCircle } from 'lucide-react';
import { useCatalogue } from '../context/CatalogueContext';
import ProductPreview from '../components/dashboard/ProductPreview';

/**
 * Discontinued Products Page
 * Displays archived catalogue lines no longer in active distribution.
 */
export default function DiscontinuedPage() {
  const { products } = useCatalogue();
  const discontinuedProducts = useMemo(
    () => products.filter((p) => p.status === 'discontinued'),
    [products]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-slate-100 text-slate-700">
              <Archive className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Catalogue Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Discontinued Products
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Archived product lines kept for record-keeping and historical reference
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

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-start gap-3">
        <Archive className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <p className="font-bold">7 archived models in storage history</p>
          <p className="text-slate-600 mt-0.5">
            Discontinued items are hidden from active buyer orders but remain fully searchable by product code.
          </p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {discontinuedProducts.map((product) => (
          <ProductPreview key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
