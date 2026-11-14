import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  Archive,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FolderTree,
  Box,
  PlusCircle,
  Loader2,
  Download
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import SectionCard from '../components/dashboard/SectionCard';
import ProductCard from '../components/products/ProductCard';
import { useCatalogue } from '../context/CatalogueContext';
import { exportProductsToCsv } from '../utils/csvExport';

/**
 * Dashboard Page
 * Section 7 & 8 implementation:
 * - Header: "Dashboard", Subtitle: "Overview of your product catalogue"
 * - 4 Summary Cards: Total Products, Stock Alert, Discontinued, Categories
 * - Quick Actions: Add Product, View All Products, Manage Categories, Manage Brands
 * - Products by Category (clean distribution bars)
 * - Products by Material (clean distribution bars)
 * - Recently Added Products list
 */
export default function DashboardPage() {
  // Dynamically compute catalogue metrics from the live CatalogueContext
  const {
    products,
    stats,
    categoryDistribution: categoryBreakdown,
    materialDistribution: materialBreakdown,
    recentProducts,
    isCatalogueLoading,
    showToast
  } = useCatalogue();

  const handleExportCsv = () => {
    if (!products || products.length === 0) {
      showToast('No products available to export yet.', 'error');
      return;
    }
    const { count, filename } = exportProductsToCsv(products, { scope: 'all' });
    showToast(`Exported ${count} ${count === 1 ? 'product' : 'products'} to ${filename}`);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header Section */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#173F35] dark:bg-[#203D32] text-[#F7F3EA] border border-[#D4A64A]/30 dark:border-[#34433A] shadow-sm dark:shadow-none flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors duration-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F7F3EA]">
            Dashboard
          </h1>
          <p className="text-sm text-[#DCE6E2] dark:text-[#B6C0B8] mt-1">
            Overview of your product catalogue &amp; live inventory
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={products.length === 0}
            title={products.length === 0 ? 'No products to export' : 'Download full catalogue backup as CSV'}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#12332B]/75 dark:bg-[#141C19]/75 hover:bg-[#1E4F43] dark:hover:bg-[#2A4E40] text-[#F7F3EA] border border-[#D4A64A]/40 hover:border-[#E9D5A5] dark:hover:border-[#E7C477] disabled:opacity-45 disabled:cursor-not-allowed font-bold text-xs sm:text-sm transition-all active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#D4A64A]" />
            <span>Export CSV</span>
          </button>

          <Link
            to="/products/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A64A] hover:bg-[#E9D5A5] dark:hover:bg-[#E7C477] text-[#173F35] dark:text-[#141C19] font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-[0.98] whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* 2. Summary Metric Cards (2x2 grid on mobile, 4 columns on desktop) */}
      <section aria-label="Catalogue Summary Metrics">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={Package}
            to="/products"
            badgeText="All active items"
            badgeColor="text-[#173F35] dark:text-[#B6C0B8]"
            iconColor="text-[#E9D5A5] dark:text-[#D4A64A] bg-[#173F35] dark:bg-[#203D32]"
            borderColor="border-[#E5DFD2] dark:border-[#34433A]"
            surfaceGradient="bg-[#FFFFFF] dark:bg-[#202A25]"
          />

          <StatCard
            title="Stock Alert"
            value={stats.stockAlert}
            icon={AlertTriangle}
            to="/stock-alert"
            badgeText="Needs attention"
            badgeColor="text-[#9A7120] dark:text-[#D4A64A]"
            iconColor="text-[#173F35] dark:text-[#141C19] bg-[#D4A64A]"
            borderColor="border-[#E5DFD2] dark:border-[#34433A]"
            surfaceGradient="bg-[#FFFFFF] dark:bg-[#202A25]"
          />

          <StatCard
            title="Discontinued"
            value={stats.discontinued}
            icon={Archive}
            to="/discontinued"
            badgeText="Archived lines"
            badgeColor="text-[#73776F] dark:text-[#B6C0B8]"
            iconColor="text-[#F7F3EA] bg-[#292D2B] dark:bg-[#34433A]"
            borderColor="border-[#E5DFD2] dark:border-[#34433A]"
            surfaceGradient="bg-[#FFFFFF] dark:bg-[#202A25]"
          />

          <StatCard
            title="Categories"
            value={stats.categoriesCount}
            icon={Layers}
            to="/categories"
            badgeText="Classification"
            badgeColor="text-[#173F35] dark:text-[#B6C0B8]"
            iconColor="text-[#E9D5A5] dark:text-[#D4A64A] bg-[#173F35] dark:bg-[#203D32]"
            borderColor="border-[#E5DFD2] dark:border-[#34433A]"
            surfaceGradient="bg-[#FFFFFF] dark:bg-[#202A25]"
          />
        </div>
      </section>

      {/* 3. Distribution Sections (Products by Category & Products by Material) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-label="Catalogue Distributions">
        {/* Products by Category */}
        <SectionCard
          title="Products by Category"
          subtitle="Distribution of stock across primary groups"
          viewAllLink="/categories"
          viewAllText="Manage"
        >
          {categoryBreakdown.length === 0 ? (
            <div className="py-8 text-center text-[#73776F] dark:text-[#B6C0B8]">
              <p className="text-xs">No categories created yet.</p>
              <Link to="/categories" className="mt-2 inline-block text-xs font-bold text-[#173F35] dark:text-[#D4A64A] hover:text-[#9A7120] dark:hover:text-[#E7C477]">
                + Add your first category
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {categoryBreakdown.map((cat) => (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-[#292D2B] dark:text-[#F7F3EA] truncate">
                          {cat.name}
                        </span>
                        <span className="text-[11px] text-[#73776F] dark:text-[#B6C0B8] font-normal tabular-nums">
                          ({cat.percentage}%)
                        </span>
                      </div>
                      <span className="font-mono font-bold text-[#292D2B] dark:text-[#F7F3EA] shrink-0 tabular-nums">
                        {cat.count}
                      </span>
                    </div>
                    {/* Clean gradient distribution bar */}
                    <div className="w-full h-2.5 rounded-full bg-[#F7F3EA] dark:bg-[#141C19] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cat.color} transition-all duration-300`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-[#E5DFD2] dark:border-[#34433A] flex items-center justify-between text-xs text-[#73776F] dark:text-[#B6C0B8]">
                <span>Catalogue Categories</span>
                <Link to="/products" className="font-bold text-[#173F35] dark:text-[#D4A64A] hover:text-[#9A7120] dark:hover:text-[#E7C477] transition-colors">
                  Filter by Category &rarr;
                </Link>
              </div>
            </>
          )}
        </SectionCard>

        {/* Products by Material */}
        <SectionCard
          title="Products by Material"
          subtitle="Metal and alloy breakdown in the catalogue"
          viewAllLink="/materials"
          viewAllText="Manage"
        >
          {materialBreakdown.length === 0 ? (
            <div className="py-8 text-center text-[#73776F] dark:text-[#B6C0B8]">
              <p className="text-xs">No materials added yet.</p>
              <Link to="/materials" className="mt-2 inline-block text-xs font-bold text-[#173F35] dark:text-[#D4A64A] hover:text-[#9A7120] dark:hover:text-[#E7C477]">
                + Add your first material
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {materialBreakdown.map((mat) => (
                  <div key={mat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-[#292D2B] dark:text-[#F7F3EA] truncate">
                          {mat.name}
                        </span>
                        <span className="text-[11px] text-[#73776F] dark:text-[#B6C0B8] font-normal tabular-nums">
                          ({mat.percentage}%)
                        </span>
                      </div>
                      <span className="font-mono font-bold text-[#292D2B] dark:text-[#F7F3EA] shrink-0 tabular-nums">
                        {mat.count}
                      </span>
                    </div>
                    {/* Clean gradient distribution bar */}
                    <div className="w-full h-2.5 rounded-full bg-[#F7F3EA] dark:bg-[#141C19] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${mat.color} transition-all duration-300`}
                        style={{ width: `${mat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-[#E5DFD2] dark:border-[#34433A] flex items-center justify-between text-xs text-[#73776F] dark:text-[#B6C0B8]">
                <span>Catalogue Materials</span>
                <Link to="/products" className="font-bold text-[#173F35] dark:text-[#D4A64A] hover:text-[#9A7120] dark:hover:text-[#E7C477] transition-colors">
                  Filter by Material &rarr;
                </Link>
              </div>
            </>
          )}
        </SectionCard>
      </section>

      {/* 5. Recently Added Products */}
      <section aria-label="Recently Added Products">
        <SectionCard
          title="Recently Added Products"
          subtitle="Latest entries in the catalogue with image and status"
          viewAllLink="/products"
          viewAllText="View Full Catalogue"
        >
          <div>
            {recentProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {recentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : isCatalogueLoading ? (
              <div className="py-8 px-4 text-center bg-[#FAF7F0] dark:bg-[#1A2420] rounded-2xl border border-[#E5DFD2] dark:border-[#34433A] space-y-2">
                <Loader2 className="w-7 h-7 text-[#D4A64A] mx-auto animate-spin" />
                <p className="text-sm font-bold text-[#292D2B] dark:text-[#F7F3EA]">Loading catalogue data...</p>
                <p className="text-xs text-[#73776F] dark:text-[#B6C0B8]">Fetching your products and inventory metrics.</p>
              </div>
            ) : (
              <div className="py-8 px-4 text-center bg-[#FAF7F0] dark:bg-[#1A2420] rounded-2xl border border-dashed border-[#D4A64A]/50 space-y-2">
                <Package className="w-8 h-8 text-[#D4A64A] mx-auto" />
                <p className="text-sm font-bold text-[#292D2B] dark:text-[#F7F3EA]">No products added yet</p>
                <p className="text-xs text-[#73776F] dark:text-[#B6C0B8] max-w-xs mx-auto">
                  Your catalogue is clean and ready. Click below to add your first product.
                </p>
                <div className="pt-2">
                  <Link
                    to="/products/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4A64A] hover:bg-[#E9D5A5] dark:hover:bg-[#E7C477] text-[#173F35] dark:text-[#141C19] text-xs font-bold shadow-sm transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add First Product</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-[#E5DFD2] dark:border-[#34433A] text-center">
            {stats.totalProducts > 0 ? (
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 text-sm font-bold text-[#173F35] dark:text-[#D4A64A] hover:text-[#9A7120] dark:hover:text-[#E7C477] py-1 transition-colors"
              >
                <span>Explore all {stats.totalProducts} catalogue products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="text-xs text-[#73776F] dark:text-[#B6C0B8]">
                0 total products in catalogue
              </span>
            )}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
