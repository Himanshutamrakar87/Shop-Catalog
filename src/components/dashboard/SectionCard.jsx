import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Reusable SectionCard Component
 * Consistent container for dashboard panels, distributions, and product lists.
 */
export default function SectionCard({
  title,
  subtitle,
  viewAllLink,
  viewAllText = 'View All',
  actionButton,
  children,
  className = ''
}) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline px-2 py-1 rounded"
            >
              <span>{viewAllText}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
          {actionButton}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}
