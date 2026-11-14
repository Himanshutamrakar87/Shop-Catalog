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
    <div className={`bg-white rounded-2xl border border-[#E6DFCE] shadow-xs overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#EFE9DA] bg-gradient-to-r from-[#FBF8F1] via-white to-[#F7F3EA]/70 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#292D2B] tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-[#555B58] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#173F35] hover:text-[#9A7120] hover:underline px-2 py-1 rounded-lg whitespace-nowrap shrink-0 transition-colors"
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
