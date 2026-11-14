import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Archive, PlusCircle } from 'lucide-react';
import { useCatalogue } from '../context/CatalogueContext';
import { isDiscontinuedStatus } from '../data/mockData';
import ProductCard from '../components/products/ProductCard';

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
            <span className="p-1.5 rounded-lg bg-[#173F35] dark:bg-[#203D32] text-[#D4A64A]">
              <Archive className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-[#173F35] dark:text-[#D4A64A] uppercase tracking-wider">
              Catalogue Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292D2B] dark:text-[#F7F3EA] tracking-tight">
            Discontinued Products
          </h1>
          <p className="text-sm text-[#73776F] dark:text-[#B6C0B8] mt-1">
            Archived product lines kept for record-keeping and historical reference
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

      {/* Info Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#202A25] border border-[#E5DFD2] dark:border-[#34433A] text-[#292D2B] dark:text-[#F7F3EA] flex items-start gap-3 shadow-xs dark:shadow-none">
        <div className="w-9 h-9 rounded-xl bg-[#173F35] dark:bg-[#203D32] text-[#D4A64A] flex items-center justify-center shrink-0">
          <Archive className="w-4.5 h-4.5" />
        </div>
        <div className="text-xs sm:text-sm">
          <p className="font-bold text-[#292D2B] dark:text-[#F7F3EA]">
            {discontinuedProducts.length === 0
              ? 'No discontinued models in archive'
              : `${discontinuedProducts.length} archived model${discontinuedProducts.length === 1 ? '' : 's'} in storage history`}
          </p>
          <p className="text-[#73776F] dark:text-[#B6C0B8] mt-0.5">
            {discontinuedProducts.length === 0
              ? 'Products retired from production will be safely archived and listed here.'
              : 'Discontinued items are hidden from active buyer orders but remain fully searchable by product code.'}
          </p>
        </div>
      </div>

      {/* Card Grid */}
      <div>
        {discontinuedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {discontinuedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12 text-center bg-[#FFFFFF] dark:bg-[#202A25] rounded-2xl border border-[#E5DFD2] dark:border-[#34433A] text-[#73776F] dark:text-[#B6C0B8] text-sm space-y-2">
            <p className="font-semibold text-[#292D2B] dark:text-[#F7F3EA]">No archived products found</p>
            <p className="text-xs">Products marked as 'Discontinued' will be archived here for historical reference.</p>
          </div>
        )}
      </div>
    </div>
  );
}
