import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Tag, Layers, Award, Box, IndianRupee, Image as ImageIcon } from 'lucide-react';
import { useCatalogue } from '../context/CatalogueContext';

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
      <div className="p-8 sm:p-14 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <Tag className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Product Not Found
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            The requested product does not exist in the catalogue or has been removed.
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
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
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {isOwner && (
          <Link
            to={`/products/${product.id}/edit`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Product</span>
          </Link>
        )}
      </div>

      {/* Main Product Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header Details */}
        <div className="p-5 sm:p-6 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
              {product.productCode}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
              {product.status.replace('_', ' ')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {product.productName}
          </h1>
        </div>

        {/* Product Images (Max 2 images requirement) */}
        <div className="p-5 sm:p-6 bg-slate-50/50 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Product Images (Max 2)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            {/* Image 1 */}
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-white aspect-4/3 flex items-center justify-center relative shadow-xs">
              {product.image1 ? (
                <img
                  src={product.image1}
                  alt={`${product.productName} primary`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                  <span className="text-xs">Primary Image</span>
                </div>
              )}
              <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded bg-slate-900/80 text-white backdrop-blur-xs">
                Image 1 (Primary)
              </span>
            </div>

            {/* Image 2 */}
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-white aspect-4/3 flex items-center justify-center relative shadow-xs">
              {product.image2 ? (
                <img
                  src={product.image2}
                  alt={`${product.productName} secondary`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                  <span className="text-xs">Secondary Image (Optional)</span>
                </div>
              )}
              <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded bg-slate-900/80 text-white backdrop-blur-xs">
                Image 2
              </span>
            </div>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Category & Sub-Category</span>
            <span className="text-sm font-bold text-slate-900 block">{product.categoryName || product.category || '—'}</span>
            <span className="text-xs text-slate-600 block">{product.subCategory || 'General'}</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Brand</span>
            <span className="text-sm font-bold text-slate-900 block">{product.brand || '—'}</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Material</span>
            <span className="text-sm font-bold text-slate-900 block">{product.material || '—'}</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Size / Capacity</span>
            <span className="text-sm font-bold text-slate-900 block">{product.sizeCapacity || product.sizeOrCapacity || '—'}</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Purchase Price</span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
              <span>₹ {Number(product.purchasePrice || 0).toLocaleString()}</span>
              {(product.purchaseUnit || product.purchase_unit) && (
                <span className="text-xs font-semibold text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
                  / {product.purchaseUnit || product.purchase_unit}
                </span>
              )}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Added On</span>
            <span className="text-sm font-bold text-slate-900 block">
              {new Date(product.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Special Details / Notes */}
        {product.specialDetails && (
          <div className="p-5 sm:p-6 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Special Details & Specifications
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
              {product.specialDetails}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
