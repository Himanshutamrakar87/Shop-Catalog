import React from 'react';
import { Link } from 'react-router-dom';

/**
 * RBB Brand Logo Component
 * Modern, minimal, premium identity for RBB Product Catalogue.
 * Uses deep navy primary with a crisp blue accent dot and geometric sans typography.
 */
export default function BrandLogo({ collapsed = false, showTagline = true, className = '' }) {
  return (
    <Link 
      to="/dashboard" 
      className={`group flex items-center gap-3 select-none transition-opacity hover:opacity-95 ${className}`}
      aria-label="RBB Product Catalogue Dashboard"
    >
      {/* Brand Icon Mark */}
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 shadow-sm text-white font-extrabold tracking-wider text-base shrink-0 group-hover:border-blue-600 transition-colors">
        <span className="bg-gradient-to-br from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
          RBB
        </span>
        {/* Blue accent indicator dot */}
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-slate-900" />
      </div>

      {/* Brand Wordmark & Subtitle */}
      {!collapsed && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold tracking-tight text-slate-900">
              RBB
            </span>
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Catalogue
            </span>
          </div>
          {showTagline && (
            <span className="text-[11px] font-medium text-slate-500 tracking-tight truncate">
              Private Management System
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
