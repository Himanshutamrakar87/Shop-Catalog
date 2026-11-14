import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CatalogueProvider, useCatalogue } from './context/CatalogueContext';
import AppShell from './components/layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductFormPage from './pages/ProductFormPage';
import CategoriesPage from './pages/CategoriesPage';
import SubCategoriesPage from './pages/SubCategoriesPage';
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
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected error occurred.'
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-lg p-6 text-center space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Something went wrong</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {this.state.errorMessage}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' });
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
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
              <Route path="sub-categories" element={<SubCategoriesPage />} />
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
    </AppErrorBoundary>
  );
}
