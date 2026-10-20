import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Header from './Header';
import Toast from '../common/Toast';
import OwnerLoginScreen from '../auth/OwnerLoginScreen';
import OwnerAccessDeniedScreen from '../auth/OwnerAccessDeniedScreen';
import { useCatalogue } from '../../context/CatalogueContext';

/**
 * Main Application Shell with Owner-Only Authentication Gate
 *
 * When Supabase mode is active:
 * 1. Checks session state without revealing the configured owner email
 * 2. Unauthenticated visitors are presented with the clean Password-based Owner Login screen
 * 3. Authenticated non-owner accounts are presented with Access Restricted screen
 * 4. Verified owners gain full access to catalogue data, forms, and management features
 */
export default function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { stats, authStatus, isSupabaseMode, refreshAuthStatus, signOut } = useCatalogue();

  // In Supabase mode, enforce owner-only access
  if (isSupabaseMode) {
    if (authStatus?.isLoading) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            <p className="text-xs font-medium text-slate-400">Verifying owner session...</p>
          </div>
        </div>
      );
    }

    if (!authStatus?.isAuthenticated) {
      return <OwnerLoginScreen onLoginSuccess={refreshAuthStatus} />;
    }

    if (!authStatus?.isOwner) {
      return <OwnerAccessDeniedScreen onSignOut={signOut} />;
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Desktop Sidebar */}
      <Sidebar 
        alertCount={stats.stockAlert} 
        discontinuedCount={stats.discontinued} 
        onSignOut={signOut}
      />

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        alertCount={stats.stockAlert}
        discontinuedCount={stats.discontinued}
        onSignOut={signOut}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onOpenMobileMenu={() => setMobileMenuOpen(true)} 
          alertCount={stats.stockAlert} 
          onSignOut={signOut}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16">
          <Outlet />
        </main>
      </div>

      {/* Global Toast Feedback */}
      <Toast />
    </div>
  );
}
