import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CatalogueProvider } from './context/CatalogueContext';
import AppShell from './components/layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductFormPage from './pages/ProductFormPage';
import CategoriesPage from './pages/CategoriesPage';
import BrandsPage from './pages/BrandsPage';
import MaterialsPage from './pages/MaterialsPage';
import StockAlertPage from './pages/StockAlertPage';
import DiscontinuedPage from './pages/DiscontinuedPage';

/**
 * Root Application Router
 *
 * Configures all routes for the RBB Catalogue Management System:
 * - /dashboard -> Dashboard Overview
 * - /products -> Full catalogue list
 * - /products/new -> Add new product form
 * - /products/:id -> Product detail view
 * - /products/:id/edit -> Edit existing product
 * - /categories -> Category management
 * - /brands -> Brand management
 * - /materials -> Material management
 * - /stock-alert -> Low inventory alerts
 * - /discontinued -> Archived products
 */
export default function App() {
  return (
    <CatalogueProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            {/* Default entry redirects to Dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Catalogue Routes */}
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="products/:id/edit" element={<ProductFormPage />} />

            {/* Management Routes */}
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="brands" element={<BrandsPage />} />
            <Route path="materials" element={<MaterialsPage />} />

            {/* Status Alert Routes */}
            <Route path="stock-alert" element={<StockAlertPage />} />
            <Route path="discontinued" element={<DiscontinuedPage />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CatalogueProvider>
  );
}
