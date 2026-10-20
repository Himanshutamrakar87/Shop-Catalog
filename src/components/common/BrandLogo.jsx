import React from 'react';
import { Link } from 'react-router-dom';
import { useCatalogue } from '../../context/CatalogueContext';

export const RBB_LOGO_SRC = '/assets/aistudio/rbblogo_5ff1833f.png';

/**
 * RBB Brand Logo Component
 * 
 * Displays the authentic RBB brand logo across all navigation headers,
 * sidebars, mobile drawers, and authentication views without altering
 * the original design.
 */
export default function BrandLogo({
  collapsed = false,
  showTagline = true,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
  imageOnly = false,
  inverted = false,
  to,
}) {
  const catalogue = useCatalogue ? useCatalogue() : null;
  const isOwner = catalogue?.authStatus?.isOwner;

  const targetLink = to || (isOwner ? '/dashboard' : '/products');

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-xl',
    xl: 'w-16 h-16 rounded-2xl',
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <Link
      to={targetLink}
      className={`group flex items-center gap-3 select-none transition-opacity hover:opacity-95 ${className}`}
      aria-label="Product Catalogue"
    >
      {/* Official Brand Logo Mark */}
      <div className={`relative flex items-center justify-center shrink-0 overflow-hidden bg-white border border-slate-200/90 shadow-xs transition-transform group-hover:scale-[1.02] ${currentSizeClass}`}>
        <img
          src={RBB_LOGO_SRC}
          alt="Catalogue Logo"
          className="w-full h-full object-contain p-0.5"
          loading="eager"
        />
      </div>

      {/* Brand Wordmark & Subtitle */}
      {!collapsed && !imageOnly && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`text-base sm:text-lg font-extrabold tracking-tight ${inverted ? 'text-white' : 'text-slate-900'}`}>
              Catalogue
            </span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
              Manager
            </span>
          </div>
          {showTagline && (
            <span className={`text-[11px] font-medium tracking-tight truncate ${inverted ? 'text-slate-400' : 'text-slate-500'}`}>
              Commercial &amp; Domestic Utensils
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
