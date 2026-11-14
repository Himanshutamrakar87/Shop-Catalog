import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

/**
 * Reusable StatCard Component
 * Displays a key metric with icon, label, count, and optional click navigation.
 */
export default function StatCard({
  title,
  value,
  icon: Icon,
  to,
  badgeText,
  badgeColor = 'text-[#73776F] dark:text-[#B6C0B8]',
  iconColor = 'text-[#F7F3EA] bg-[#173F35] dark:bg-[#203D32]',
  borderColor = 'border-[#E5DFD2] dark:border-[#34433A]',
  surfaceGradient = 'bg-[#FFFFFF] dark:bg-[#202A25]'
}) {
  const content = (
    <div className={`p-4 sm:p-5 ${surfaceGradient} rounded-2xl border ${borderColor} hover:border-[#E9D5A5] dark:hover:border-[#E7C477] shadow-xs dark:shadow-none hover:shadow-md dark:hover:shadow-[0_6px_16px_-6px_rgba(8,14,11,0.5)] hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.99] flex flex-col justify-between h-full group`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${iconColor}`}>
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-[#73776F] dark:text-[#B6C0B8] block truncate">
              {title}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#292D2B] dark:text-[#F7F3EA] tracking-tight mt-0.5 block tabular-nums">
              {value}
            </span>
          </div>
        </div>

        {to && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[#73776F] dark:text-[#B6C0B8] group-hover:text-[#173F35] dark:group-hover:text-[#141C19] group-hover:bg-[#E9D5A5] dark:group-hover:bg-[#E7C477] transition-colors shrink-0">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        )}
      </div>

      {badgeText && (
        <div className="mt-3.5 pt-3 border-t border-[#E5DFD2] dark:border-[#34433A] flex items-center justify-between gap-2">
          <span className={`text-xs font-semibold ${badgeColor}`}>
            {badgeText}
          </span>
          <span className="text-[11px] text-[#73776F] dark:text-[#B6C0B8] group-hover:text-[#9A7120] dark:group-hover:text-[#E7C477] font-semibold transition-colors">
            View details
          </span>
        </div>
      )}
    </div>
  );

  if (to) {
    return <Link to={to} className="block focus:outline-none">{content}</Link>;
  }

  return content;
}
