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
  Box
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview of your product catalogue
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Catalogue Active & Synchronized</span>
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
            badgeColor="bg-blue-100 text-blue-800"
            iconColor="text-blue-600 bg-blue-50"
            borderColor="border-slate-200"
          />

          <StatCard
            title="Stock Alert"
            value={stats.stockAlert}
            icon={AlertTriangle}
            to="/stock-alert"
            badgeText="Needs attention"
            badgeColor="bg-amber-100 text-amber-800"
            iconColor="text-amber-600 bg-amber-50"
            borderColor="border-amber-200"
          />

          <StatCard
            title="Discontinued"
            value={stats.discontinued}
            icon={Archive}
            to="/discontinued"
            badgeText="Archived lines"
            badgeColor="bg-slate-100 text-slate-700"
            iconColor="text-slate-600 bg-slate-100"
            borderColor="border-slate-200"
          />

          <StatCard
            title="Categories"
            value={stats.categoriesCount}
            icon={Layers}
            to="/categories"
            badgeText="Classification"
            badgeColor="bg-indigo-100 text-indigo-800"
            iconColor="text-indigo-600 bg-indigo-50"
            borderColor="border-slate-200"
          />
        </div>
      </section>

      {/* 3. Quick Actions Section (Prominent and touch-friendly for mobile phone owner) */}
      <section aria-label="Quick Actions">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Quick Actions
          </h2>
          <span className="text-xs text-slate-400 font-medium">Single-tap access</span>
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
          <div className="space-y-4">
            {categoryBreakdown.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-slate-800 truncate">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      ({cat.percentage}%)
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 shrink-0">
                    {cat.count}
                  </span>
                </div>
                {/* Clean, professional distribution bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cat.color} transition-all duration-300`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Primary Focus: Cookware & Kitchen Storage</span>
            <Link to="/products" className="font-semibold text-blue-600 hover:text-blue-700">
              Filter by Category &rarr;
            </Link>
          </div>
        </SectionCard>

        {/* Products by Material */}
        <SectionCard
          title="Products by Material"
          subtitle="Metal and alloy breakdown in the catalogue"
          viewAllLink="/materials"
          viewAllText="Manage"
        >
          <div className="space-y-4">
            {materialBreakdown.map((mat) => (
              <div key={mat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-slate-800 truncate">
                      {mat.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      ({mat.percentage}%)
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 shrink-0">
                    {mat.count}
                  </span>
                </div>
                {/* Clean, professional distribution bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${mat.color} transition-all duration-300`}
                    style={{ width: `${mat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Core Metals: Aluminium & Stainless Steel</span>
            <Link to="/products" className="font-semibold text-blue-600 hover:text-blue-700">
              Filter by Material &rarr;
            </Link>
          </div>
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
            {recentProducts.map((product) => (
              <ProductPreview key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 active:text-blue-800 py-1"
            >
              <span>Explore all {stats.totalProducts} catalogue products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
