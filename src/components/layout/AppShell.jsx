import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Header from './Header';
import Toast from '../common/Toast';
import { useCatalogue } from '../../context/CatalogueContext';

/**
 * Main Application Shell
 * Reusable container containing:
 * - Desktop Sidebar
 * - Mobile Navigation Drawer
 * - Header
 * - Main content area
 * - Global Toast
 */
export default function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { stats } = useCatalogue();

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Desktop Sidebar */}
      <Sidebar 
        alertCount={stats.stockAlert} 
        discontinuedCount={stats.discontinued} 
      />

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        alertCount={stats.stockAlert}
        discontinuedCount={stats.discontinued}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onOpenMobileMenu={() => setMobileMenuOpen(true)} 
          alertCount={stats.stockAlert} 
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
