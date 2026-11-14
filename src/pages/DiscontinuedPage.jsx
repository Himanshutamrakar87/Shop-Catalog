import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Archive, PlusCircle } from 'lucide-react';
import { useCatalogue } from '../context/CatalogueContext';
import { isDiscontinuedStatus } from '../data/mockData';
import ProductPreview from '../components/dashboard/ProductPreview';

/**
 * Discontinued Products Page
 * Displays archived catalogue lines no longer in active distribution.
 */
export default function DiscontinuedPage() {
  const { products } = useCatalogue();
  const discontinuedProducts = useMemo(
    () => products.filter((p) => isDiscontinuedStatus(p.status)),
    [products]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-[#173F35] text-[#D4A64A] shadow-2xs">
              <Archive className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-[#173F35] uppercase tracking-wider">
              Catalogue Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292D2B] tracking-tight">
            Discontinued Products
          </h1>
          <p className="text-sm text-[#555B58] mt-1">
            Archived product lines kept for record-keeping and historical reference
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

      {/* Info Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6DFCE] text-[#292D2B] flex items-start gap-3 shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-[#173F35] text-[#D4A64A] flex items-center justify-center shrink-0 shadow-xs">
          <Archive className="w-4.5 h-4.5" />
        </div>
        <div className="text-xs sm:text-sm">
          <p className="font-bold text-[#292D2B]">
            {discontinuedProducts.length === 0
              ? 'No discontinued models in archive'
              : `${discontinuedProducts.length} archived model${discontinuedProducts.length === 1 ? '' : 's'} in storage history`}
          </p>
          <p className="text-[#555B58] mt-0.5">
            {discontinuedProducts.length === 0
              ? 'Products retired from production will be safely archived and listed here.'
              : 'Discontinued items are hidden from active buyer orders but remain fully searchable by product code.'}
          </p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {discontinuedProducts.length > 0 ? (
          discontinuedProducts.map((product) => (
            <ProductPreview key={product.id} product={product} />
          ))
        ) : (
          <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-[#E6DFCE] text-[#555B58] text-sm space-y-2">
            <p className="font-semibold text-[#292D2B]">No archived products found</p>
            <p className="text-xs text-[#6F7571]">Products marked as 'Discontinued' will be archived here for historical reference.</p>
          </div>
        )}
      </div>
    </div>
  );
}
