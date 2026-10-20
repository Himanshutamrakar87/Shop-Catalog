import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Header from './Header';
import Toast from '../common/Toast';
import OwnerAccessDeniedScreen from '../auth/OwnerAccessDeniedScreen';
import { useCatalogue } from '../../context/CatalogueContext';

/**
 * Main Application Shell
 * - Unauthenticated visitors can freely browse the public catalogue
 * - Verified owner gains administrative privileges
 * - Authenticated non-owner accounts are presented with Access Restricted screen
 */
export default function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { stats, authStatus, isSupabaseMode, signOut } = useCatalogue();

  // If authenticated into Supabase with an unauthorized non-owner email, show access restricted
  if (isSupabaseMode && authStatus?.isAuthenticated && !authStatus?.isOwner) {
    return <OwnerAccessDeniedScreen onSignOut={signOut} />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Desktop Sidebar */}
      <Sidebar 
        alertCount={stats.stockAlert} 
        discontinuedCount={stats.discontinued} 
        onSignOut={signOut}
        authStatus={authStatus}
      />

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        alertCount={stats.stockAlert}
        discontinuedCount={stats.discontinued}
        onSignOut={signOut}
        authStatus={authStatus}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onOpenMobileMenu={() => setMobileMenuOpen(true)} 
          alertCount={stats.stockAlert} 
          onSignOut={signOut}
          authStatus={authStatus}
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
