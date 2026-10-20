import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CatalogueProvider, useCatalogue } from './context/CatalogueContext';
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
import OwnerProtectedRoute from './components/auth/OwnerProtectedRoute';
import OwnerLoginScreen from './components/auth/OwnerLoginScreen';

/**
 * Intelligent Entry Redirect:
 * - Public visitors are routed directly to the Public Catalogue (/products)
 * - Verified owners are routed to the Management Dashboard (/dashboard)
 */
function IndexRedirect() {
  const { authStatus, isSupabaseMode } = useCatalogue();
  if (isSupabaseMode && !authStatus?.isOwner) {
    return <Navigate to="/products" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

/**
 * Owner Login Route Component
 */
function LoginRoute() {
  const { authStatus, isSupabaseMode, refreshAuthStatus } = useCatalogue();
  if (isSupabaseMode && authStatus?.isOwner) {
    return <Navigate to="/dashboard" replace />;
  }
  return <OwnerLoginScreen onLoginSuccess={refreshAuthStatus} />;
}

/**
 * Root Application Router
 *
 * Configures all routes:
 * - Public: /products, /products/:id, /categories, /brands, /materials
 * - Owner Protected: /dashboard, /products/new, /products/:id/edit, /stock-alert, /discontinued
 * - Auth: /login
 */
export default function App() {
  return (
    <CatalogueProvider>
      <BrowserRouter>
        <Routes>
          {/* Standalone Owner Login Page */}
          <Route path="/login" element={<LoginRoute />} />

          <Route path="/" element={<AppShell />}>
            {/* Dynamic entry route based on authentication */}
            <Route index element={<IndexRedirect />} />

            {/* Management Dashboard (Owner Only) */}
            <Route
              path="dashboard"
              element={
                <OwnerProtectedRoute>
                  <DashboardPage />
                </OwnerProtectedRoute>
              }
            />

            {/* Public Catalogue (Anyone can browse without login) */}
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />

            {/* Product Creation & Editing (Owner Only) */}
            <Route
              path="products/new"
              element={
                <OwnerProtectedRoute>
                  <ProductFormPage />
                </OwnerProtectedRoute>
              }
            />
            <Route
              path="products/:id/edit"
              element={
                <OwnerProtectedRoute>
                  <ProductFormPage />
                </OwnerProtectedRoute>
              }
            />

            {/* Classification Views (Publicly visible; edits require owner) */}
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="brands" element={<BrandsPage />} />
            <Route path="materials" element={<MaterialsPage />} />

            {/* Internal Inventory Status (Owner Only) */}
            <Route
              path="stock-alert"
              element={
                <OwnerProtectedRoute>
                  <StockAlertPage />
                </OwnerProtectedRoute>
              }
            />
            <Route
              path="discontinued"
              element={
                <OwnerProtectedRoute>
                  <DiscontinuedPage />
                </OwnerProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<IndexRedirect />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CatalogueProvider>
  );
}
