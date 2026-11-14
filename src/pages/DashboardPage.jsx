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
  PlusCircle
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import SectionCard from '../components/dashboard/SectionCard';
import QuickActions from '../components/dashboard/QuickAction';
import ProductPreview from '../components/dashboard/ProductPreview';
import { useCatalogue } from '../context/CatalogueContext';

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
    stats,
    categoryDistribution: categoryBreakdown,
    materialDistribution: materialBreakdown,
    recentProducts
  } = useCatalogue();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header Section */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#173F35] via-[#153930] to-[#0F2D25] text-[#F7F3EA] border border-[#D4A64A]/35 shadow-lg shadow-[#173F35]/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F7F3EA]">
            Dashboard
          </h1>
          <p className="text-sm text-[#DCE6E2] mt-1">
            Overview of your product catalogue &amp; live inventory
          </p>
        </div>

        <Link
          to="/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#C29236] hover:from-[#DFB359] hover:to-[#CE9D3E] text-[#173F35] font-bold text-xs sm:text-sm shadow-md shadow-black/25 transition-all active:scale-[0.98] self-start sm:self-auto whitespace-nowrap shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
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
            badgeColor="text-[#173F35]"
            iconColor="text-[#F4D58D] bg-gradient-to-br from-[#173F35] to-[#1E5245] shadow-sm shadow-[#173F35]/20"
            borderColor="border-[#E6DFCE]"
            surfaceGradient="bg-white"
          />

          <StatCard
            title="Stock Alert"
            value={stats.stockAlert}
            icon={AlertTriangle}
            to="/stock-alert"
            badgeText="Needs attention"
            badgeColor="text-[#9A7120]"
            iconColor="text-[#173F35] bg-gradient-to-br from-[#D4A64A] to-[#B5862B] shadow-sm shadow-[#D4A64A]/25"
            borderColor="border-[#E6DFCE]"
            surfaceGradient="bg-white"
          />

          <StatCard
            title="Discontinued"
            value={stats.discontinued}
            icon={Archive}
            to="/discontinued"
            badgeText="Archived lines"
            badgeColor="text-[#555B58]"
            iconColor="text-[#F7F3EA] bg-gradient-to-br from-[#292D2B] to-[#3E4441] shadow-sm shadow-black/15"
            borderColor="border-[#E6DFCE]"
            surfaceGradient="bg-white"
          />

          <StatCard
            title="Categories"
            value={stats.categoriesCount}
            icon={Layers}
            to="/categories"
            badgeText="Classification"
            badgeColor="text-[#173F35]"
            iconColor="text-[#F4D58D] bg-gradient-to-br from-[#1B4A3E] to-[#12332B] shadow-sm shadow-[#173F35]/20"
            borderColor="border-[#E6DFCE]"
            surfaceGradient="bg-white"
          />
        </div>
      </section>

      {/* 3. Quick Actions Section (Prominent and touch-friendly for mobile phone owner) */}
      <section aria-label="Quick Actions">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#292D2B] uppercase tracking-wider">
            Quick Actions
          </h2>
          <span className="text-xs text-[#555B58] font-medium">Single-tap access</span>
        </div>
        <QuickActions />
      </section>

      {/* 4. Distribution Sections (Products by Category & Products by Material) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-label="Catalogue Distributions">
        {/* Products by Category */}
        <SectionCard
          title="Products by Category"
          subtitle="Distribution of stock across primary groups"
          viewAllLink="/categories"
          viewAllText="Manage"
        >
          {categoryBreakdown.length === 0 ? (
            <div className="py-8 text-center text-[#555B58]">
              <p className="text-xs">No categories created yet.</p>
              <Link to="/categories" className="mt-2 inline-block text-xs font-bold text-[#173F35] hover:text-[#9A7120]">
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
                        <span className="font-semibold text-[#292D2B] truncate">
                          {cat.name}
                        </span>
                        <span className="text-[11px] text-[#555B58] font-normal tabular-nums">
                          ({cat.percentage}%)
                        </span>
                      </div>
                      <span className="font-mono font-bold text-[#292D2B] shrink-0 tabular-nums">
                        {cat.count}
                      </span>
                    </div>
                    {/* Clean gradient distribution bar */}
                    <div className="w-full h-2.5 rounded-full bg-[#F2ECE0] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cat.color} transition-all duration-300`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-[#EFE9DA] flex items-center justify-between text-xs text-[#555B58]">
                <span>Catalogue Categories</span>
                <Link to="/products" className="font-bold text-[#173F35] hover:text-[#9A7120] transition-colors">
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
            <div className="py-8 text-center text-[#555B58]">
              <p className="text-xs">No materials added yet.</p>
              <Link to="/materials" className="mt-2 inline-block text-xs font-bold text-[#173F35] hover:text-[#9A7120]">
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
                        <span className="font-semibold text-[#292D2B] truncate">
                          {mat.name}
                        </span>
                        <span className="text-[11px] text-[#555B58] font-normal tabular-nums">
                          ({mat.percentage}%)
                        </span>
                      </div>
                      <span className="font-mono font-bold text-[#292D2B] shrink-0 tabular-nums">
                        {mat.count}
                      </span>
                    </div>
                    {/* Clean gradient distribution bar */}
                    <div className="w-full h-2.5 rounded-full bg-[#F2ECE0] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${mat.color} transition-all duration-300`}
                        style={{ width: `${mat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-[#EFE9DA] flex items-center justify-between text-xs text-[#555B58]">
                <span>Catalogue Materials</span>
                <Link to="/products" className="font-bold text-[#173F35] hover:text-[#9A7120] transition-colors">
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
          <div className="space-y-3">
            {recentProducts.length > 0 ? (
              recentProducts.map((product) => (
                <ProductPreview key={product.id} product={product} />
              ))
            ) : (
              <div className="py-8 px-4 text-center bg-[#FAF7F0] rounded-2xl border border-dashed border-[#D4A64A]/50 space-y-2">
                <Package className="w-8 h-8 text-[#D4A64A] mx-auto" />
                <p className="text-sm font-bold text-[#292D2B]">No products added yet</p>
                <p className="text-xs text-[#555B58] max-w-xs mx-auto">
                  Your catalogue is clean and ready. Click below to add your first product.
                </p>
                <div className="pt-2">
                  <Link
                    to="/products/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#C29236] hover:from-[#DFB359] hover:to-[#CE9D3E] text-[#173F35] text-xs font-bold shadow-md shadow-[#173F35]/15 transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add First Product</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-[#EFE9DA] text-center">
            {stats.totalProducts > 0 ? (
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 text-sm font-bold text-[#173F35] hover:text-[#9A7120] py-1 transition-colors"
              >
                <span>Explore all {stats.totalProducts} catalogue products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="text-xs text-[#6E7470]">
                0 total products in catalogue
              </span>
            )}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
