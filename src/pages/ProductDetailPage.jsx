import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Tag, Layers, Award, Box, IndianRupee, Image as ImageIcon } from 'lucide-react';
import { useCatalogue } from '../context/CatalogueContext';
import { isStockAlertStatus, isDiscontinuedStatus } from '../data/mockData';

/**
 * Product Detail Page
 * View full specifications for an individual catalogue product.
 */
export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, authStatus } = useCatalogue();
  const isOwner = Boolean(authStatus?.isOwner);

  // Find product from catalogue store
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="p-8 sm:p-14 text-center bg-white rounded-2xl border border-[#E6DFCE] shadow-xs space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#FBF5E6] border border-[#D4A64A]/40 flex items-center justify-center mx-auto text-[#9A7120]">
          <Tag className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#292D2B]">
            Product Not Found
          </h2>
          <p className="text-sm text-[#555B58] mt-1 max-w-sm mx-auto leading-relaxed">
            The requested product does not exist in the catalogue or has been removed.
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#C29236] hover:from-[#DFB359] hover:to-[#CE9D3E] text-[#173F35] text-xs sm:text-sm font-bold shadow-md shadow-[#173F35]/15 transition-all whitespace-nowrap shrink-0 cursor-pointer"
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
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#555B58] hover:text-[#9A7120] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {isOwner && (
          <Link
            to={`/products/${product.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#C29236] hover:from-[#DFB359] hover:to-[#CE9D3E] text-[#173F35] text-xs sm:text-sm font-bold shadow-sm transition-all whitespace-nowrap shrink-0"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Product</span>
          </Link>
        )}
      </div>

      {/* Main Product Card */}
      <div className="bg-white rounded-2xl border border-[#E6DFCE] shadow-xs overflow-hidden">
        {/* Header Details */}
        <div className="p-5 sm:p-6 border-b border-[#EFE9DA] bg-gradient-to-r from-[#FBF8F1] via-white to-[#F7F3EA]/70">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-white text-[#173F35] border border-[#D4A64A]/50 shadow-2xs">
              {product.productCode}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${
                isStockAlertStatus(product.status)
                  ? 'bg-[#FBF5E6] text-[#8E6518] border-[#D4A64A]/60'
                  : isDiscontinuedStatus(product.status)
                  ? 'bg-[#F3EFE4] text-[#555B58] border-[#DED6C3]'
                  : 'bg-[#EDF5F1] text-[#173F35] border-[#173F35]/25'
              }`}
            >
              {(product.status || 'In Stock').replace('_', ' ')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#292D2B] tracking-tight">
            {product.productName}
          </h1>
        </div>

        {/* Product Images (Max 2 images requirement) */}
        <div className="p-5 sm:p-6 bg-[#FAF7F0]/70 border-b border-[#EFE9DA]">
          <h2 className="text-xs font-bold text-[#6F7571] uppercase tracking-wider mb-3">
            Product Images (Max 2)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            {/* Image 1 */}
            <div className="rounded-xl overflow-hidden border border-[#E6DFCE] bg-white aspect-4/3 flex items-center justify-center relative shadow-xs">
              {product.image1 ? (
                <img
                  src={product.image1}
                  alt={`${product.productName} primary`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-[#7D827E]">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 text-[#C5B99E]" />
                  <span className="text-xs">Primary Image</span>
                </div>
              )}
              <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-[#173F35]/90 text-[#F7F3EA] border border-[#D4A64A]/40 backdrop-blur-xs">
                Image 1 (Primary)
              </span>
            </div>

            {/* Image 2 */}
            <div className="rounded-xl overflow-hidden border border-[#E6DFCE] bg-white aspect-4/3 flex items-center justify-center relative shadow-xs">
              {product.image2 ? (
                <img
                  src={product.image2}
                  alt={`${product.productName} secondary`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-[#7D827E]">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 text-[#C5B99E]" />
                  <span className="text-xs">Secondary Image (Optional)</span>
                </div>
              )}
              <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-[#173F35]/90 text-[#F7F3EA] border border-[#D4A64A]/40 backdrop-blur-xs">
                Image 2
              </span>
            </div>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E6DFCE] hover:border-[#D4A64A] transition-colors">
            <span className="text-xs font-semibold text-[#6F7571] block mb-1">Category & Sub-Category</span>
            <span className="text-sm font-bold text-[#292D2B] block">{product.categoryName || product.category || '—'}</span>
            <span className="text-xs text-[#555B58] block mt-0.5">{product.subCategory || 'General'}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E6DFCE] hover:border-[#D4A64A] transition-colors">
            <span className="text-xs font-semibold text-[#6F7571] block mb-1">Brand</span>
            <span className="text-sm font-bold text-[#292D2B] block">{product.brand || '—'}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E6DFCE] hover:border-[#D4A64A] transition-colors">
            <span className="text-xs font-semibold text-[#6F7571] block mb-1">Material</span>
            <span className="text-sm font-bold text-[#292D2B] block">{product.material || '—'}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E6DFCE] hover:border-[#D4A64A] transition-colors">
            <span className="text-xs font-semibold text-[#6F7571] block mb-1">Size / Capacity</span>
            <span className="text-sm font-bold text-[#292D2B] block">{product.sizeCapacity || product.sizeOrCapacity || '—'}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#EDF5F1] border border-[#173F35]/20 hover:border-[#D4A64A] transition-colors">
            <span className="text-xs font-semibold text-[#173F35] block mb-1">Purchase Price</span>
            <span className="text-base font-extrabold text-[#292D2B] tabular-nums flex items-center gap-1.5 flex-wrap">
              <span>₹ {Number(product.purchasePrice || 0).toLocaleString()}</span>
              {(product.purchaseUnit || product.purchase_unit) && (
                <span className="text-xs font-semibold text-[#555B58]">
                  / {product.purchaseUnit || product.purchase_unit}
                </span>
              )}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E6DFCE] hover:border-[#D4A64A] transition-colors">
            <span className="text-xs font-semibold text-[#6F7571] block mb-1">Added On</span>
            <span className="text-sm font-bold text-[#292D2B] tabular-nums block">
              {new Date(product.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Special Details / Notes */}
        {product.specialDetails && (
          <div className="p-5 sm:p-6 border-t border-[#EFE9DA]">
            <h3 className="text-xs font-bold text-[#6F7571] uppercase tracking-wider mb-2">
              Special Details & Specifications
            </h3>
            <p className="text-sm text-[#292D2B] leading-relaxed bg-[#FAF7F0] p-4 rounded-xl border border-[#E6DFCE]">
              {product.specialDetails}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
