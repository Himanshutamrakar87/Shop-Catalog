import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Tag, Layers, Award, Box, IndianRupee, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useCatalogue } from '../context/CatalogueContext';
import { isStockAlertStatus, isDiscontinuedStatus } from '../data/mockData';

/**
 * Product Detail Page
 * View full specifications for an individual catalogue product.
 */
export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, authStatus, isCatalogueLoading } = useCatalogue();
  const isOwner = Boolean(authStatus?.isOwner);

  // Find product from catalogue store
  const product = products.find((p) => p.id === id);

  if (!product && isCatalogueLoading) {
    return (
      <div className="p-8 sm:p-14 text-center bg-[#FFFFFF] dark:bg-[#202A25] rounded-2xl border border-[#E5DFD2] dark:border-[#34433A] shadow-xs dark:shadow-none space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#F7F3EA] dark:bg-[#141C19] border border-[#D4A64A]/40 flex items-center justify-center mx-auto">
          <Loader2 className="w-6 h-6 animate-spin text-[#D4A64A]" />
        </div>
        <h2 className="text-base font-bold text-[#292D2B] dark:text-[#F7F3EA]">Loading product...</h2>
        <p className="text-xs text-[#73776F] dark:text-[#B6C0B8]">Fetching product details from database.</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 sm:p-14 text-center bg-[#FFFFFF] dark:bg-[#202A25] rounded-2xl border border-[#E5DFD2] dark:border-[#34433A] shadow-xs dark:shadow-none space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#F7F3EA] dark:bg-[#141C19] border border-[#E5DFD2] dark:border-[#34433A] flex items-center justify-center mx-auto text-[#D4A64A]">
          <Tag className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#292D2B] dark:text-[#F7F3EA]">
            Product Not Found
          </h2>
          <p className="text-sm text-[#73776F] dark:text-[#B6C0B8] mt-1 max-w-sm mx-auto leading-relaxed">
            The requested product does not exist in the catalogue or has been removed.
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4A64A] hover:bg-[#E9D5A5] dark:hover:bg-[#E7C477] text-[#173F35] dark:text-[#141C19] text-xs sm:text-sm font-bold shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar with Back and Edit Action */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#73776F] dark:text-[#B6C0B8] hover:text-[#173F35] dark:hover:text-[#E7C477] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {isOwner && (
          <Link
            to={`/products/${product.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4A64A] hover:bg-[#E9D5A5] dark:hover:bg-[#E7C477] text-[#173F35] dark:text-[#141C19] text-xs sm:text-sm font-bold shadow-sm transition-all whitespace-nowrap shrink-0"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Product</span>
          </Link>
        )}
      </div>

      {/* Main Product Card */}
      <div className="bg-[#FFFFFF] dark:bg-[#202A25] rounded-2xl border border-[#E5DFD2] dark:border-[#34433A] shadow-xs dark:shadow-none overflow-hidden transition-colors duration-200">
        {/* Header Details */}
        <div className="p-5 sm:p-6 border-b border-[#E5DFD2] dark:border-[#34433A] bg-[#FAF7F0] dark:bg-[#1B241F]">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#FFFFFF] dark:bg-[#141C19] text-[#173F35] dark:text-[#E7C477] border border-[#E5DFD2] dark:border-[#34433A]">
              {product.code || product.productCode}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${
                isStockAlertStatus(product.status)
                  ? 'bg-[#FBF5E6] dark:bg-[#2B2518] text-[#8E6518] dark:text-[#D4A64A] border-[#D4A64A]/50'
                  : isDiscontinuedStatus(product.status)
                  ? 'bg-[#F3EFE4] dark:bg-[#1A2420] text-[#73776F] dark:text-[#B6C0B8] border-[#E5DFD2] dark:border-[#34433A]'
                  : 'bg-[#EDF5F1] dark:bg-[#1B3127] text-[#173F35] dark:text-emerald-300 border-[#173F35]/20 dark:border-emerald-700/40'
              }`}
            >
              {(product.status || 'In Stock').replace('_', ' ')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#292D2B] dark:text-[#F7F3EA] tracking-tight">
            {product.name || product.productName}
          </h1>
        </div>

        {/* Product Images (Max 2 images requirement — kept natural & unaffected by theme changes) */}
        <div className="p-5 sm:p-6 bg-[#F7F3EA]/70 dark:bg-[#141C19]/60 border-b border-[#E5DFD2] dark:border-[#34433A]">
          <h2 className="text-xs font-bold text-[#73776F] dark:text-[#B6C0B8] uppercase tracking-wider mb-3">
            Product Images (Max 2)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            {/* Image 1 */}
            <div className="rounded-xl overflow-hidden border border-[#E5DFD2] dark:border-[#34433A] bg-[#FFFFFF] aspect-4/3 flex items-center justify-center relative shadow-2xs dark:shadow-none">
              {product.images?.[0] || product.image1 ? (
                <img
                  src={product.images?.[0] || product.image1}
                  alt={`${product.name || product.productName} primary`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#FFFFFF] dark:bg-[#1A231F] text-[#73776F] dark:text-[#B6C0B8]">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-60" />
                  <span className="text-xs">Primary Image</span>
                </div>
              )}
              <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-[#173F35]/90 dark:bg-[#203D32]/90 text-[#F7F3EA] border border-[#D4A64A]/40 backdrop-blur-xs">
                Image 1 (Primary)
              </span>
            </div>

            {/* Image 2 */}
            <div className="rounded-xl overflow-hidden border border-[#E5DFD2] dark:border-[#34433A] bg-[#FFFFFF] aspect-4/3 flex items-center justify-center relative shadow-2xs dark:shadow-none">
              {product.images?.[1] || product.image2 ? (
                <img
                  src={product.images?.[1] || product.image2}
                  alt={`${product.name || product.productName} secondary`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#FFFFFF] dark:bg-[#1A231F] text-[#73776F] dark:text-[#B6C0B8]">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-60" />
                  <span className="text-xs">Secondary Image (Optional)</span>
                </div>
              )}
              <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-[#173F35]/90 dark:bg-[#203D32]/90 text-[#F7F3EA] border border-[#D4A64A]/40 backdrop-blur-xs">
                Image 2
              </span>
            </div>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#F7F3EA] dark:bg-[#141C19] border border-[#E5DFD2] dark:border-[#34433A] hover:border-[#E9D5A5] dark:hover:border-[#E7C477] transition-colors">
            <span className="text-xs font-semibold text-[#73776F] dark:text-[#B6C0B8] block mb-1">Category & Sub-Category</span>
            <span className="text-sm font-bold text-[#292D2B] dark:text-[#F7F3EA] block">{product.categoryName || product.category || '—'}</span>
            <span className="text-xs text-[#73776F] dark:text-[#B6C0B8] block mt-0.5">{product.subCategory || 'General'}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F3EA] dark:bg-[#141C19] border border-[#E5DFD2] dark:border-[#34433A] hover:border-[#E9D5A5] dark:hover:border-[#E7C477] transition-colors">
            <span className="text-xs font-semibold text-[#73776F] dark:text-[#B6C0B8] block mb-1">Brand</span>
            <span className="text-sm font-bold text-[#292D2B] dark:text-[#F7F3EA] block">{product.brand || '—'}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F3EA] dark:bg-[#141C19] border border-[#E5DFD2] dark:border-[#34433A] hover:border-[#E9D5A5] dark:hover:border-[#E7C477] transition-colors">
            <span className="text-xs font-semibold text-[#73776F] dark:text-[#B6C0B8] block mb-1">Material</span>
            <span className="text-sm font-bold text-[#292D2B] dark:text-[#F7F3EA] block">{product.material || '—'}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F3EA] dark:bg-[#141C19] border border-[#E5DFD2] dark:border-[#34433A] hover:border-[#E9D5A5] dark:hover:border-[#E7C477] transition-colors">
            <span className="text-xs font-semibold text-[#73776F] dark:text-[#B6C0B8] block mb-1">Size / Capacity</span>
            <span className="text-sm font-bold text-[#292D2B] dark:text-[#F7F3EA] block">{product.sizeCapacity || product.sizeOrCapacity || '—'}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#EDF5F1] dark:bg-[#1B2C24] border border-[#173F35]/20 dark:border-[#34433A] hover:border-[#E9D5A5] dark:hover:border-[#E7C477] transition-colors">
            <span className="text-xs font-semibold text-[#173F35] dark:text-[#D4A64A] block mb-1">Purchase Price</span>
            <span className="text-base font-extrabold text-[#292D2B] dark:text-[#F7F3EA] tabular-nums flex items-center gap-1.5 flex-wrap">
              <span>₹ {Number(product.purchasePrice || 0).toLocaleString()}</span>
              {(product.purchaseUnit || product.purchase_unit) && (
                <span className="text-xs font-semibold text-[#73776F] dark:text-[#B6C0B8]">
                  / {product.purchaseUnit || product.purchase_unit}
                </span>
              )}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F3EA] dark:bg-[#141C19] border border-[#E5DFD2] dark:border-[#34433A] hover:border-[#E9D5A5] dark:hover:border-[#E7C477] transition-colors">
            <span className="text-xs font-semibold text-[#73776F] dark:text-[#B6C0B8] block mb-1">Added On</span>
            <span className="text-sm font-bold text-[#292D2B] dark:text-[#F7F3EA] tabular-nums block">
              {new Date(product.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Special Details / Notes */}
        {product.specialDetails && (
          <div className="p-5 sm:p-6 border-t border-[#E5DFD2] dark:border-[#34433A]">
            <h3 className="text-xs font-bold text-[#73776F] dark:text-[#B6C0B8] uppercase tracking-wider mb-2">
              Special Details &amp; Specifications
            </h3>
            <p className="text-sm text-[#292D2B] dark:text-[#F7F3EA] leading-relaxed bg-[#F7F3EA] dark:bg-[#141C19] p-4 rounded-xl border border-[#E5DFD2] dark:border-[#34433A]">
              {product.specialDetails}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
