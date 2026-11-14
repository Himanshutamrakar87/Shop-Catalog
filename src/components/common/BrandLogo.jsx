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
      <div className={`relative flex items-center justify-center shrink-0 overflow-hidden bg-white border border-[#D4A64A]/60 ring-1 ring-[#D4A64A]/25 shadow-sm transition-transform duration-200 group-hover:scale-[1.03] group-hover:border-[#D4A64A] ${currentSizeClass}`}>
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
            <span className={`text-base sm:text-lg font-extrabold tracking-tight ${inverted ? 'text-[#F7F3EA]' : 'text-[#292D2B] dark:text-[#F7F3EA]'}`}>
              Catalogue
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                inverted
                  ? 'bg-[#D4A64A]/20 text-[#E9D5A5] border-[#D4A64A]/40'
                  : 'bg-[#F7F3EA] dark:bg-[#141C19] text-[#173F35] dark:text-[#D4A64A] border-[#E5DFD2] dark:border-[#34433A]'
              }`}
            >
              Manager
            </span>
          </div>
          {showTagline && (
            <span className={`text-[11px] font-medium tracking-tight truncate ${inverted ? 'text-[#B8CBC3] dark:text-[#B6C0B8]' : 'text-[#73776F] dark:text-[#B6C0B8]'}`}>
              Commercial &amp; Domestic Utensils
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
