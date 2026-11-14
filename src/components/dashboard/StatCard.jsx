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
  badgeColor = 'text-slate-600',
  iconColor = 'text-[#F7F3EA] bg-gradient-to-br from-[#173F35] to-[#1E5245] shadow-sm shadow-[#173F35]/20',
  borderColor = 'border-[#E6DFCE]',
  surfaceGradient = 'bg-white'
}) {
  const content = (
    <div className={`p-4 sm:p-5 ${surfaceGradient} rounded-2xl border ${borderColor} hover:border-[#D4A64A] shadow-xs hover:shadow-lg hover:shadow-[#D4A64A]/15 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.99] flex flex-col justify-between h-full group`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${iconColor}`}>
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-[#555B58] block truncate">
              {title}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#292D2B] tracking-tight mt-0.5 block tabular-nums">
              {value}
            </span>
          </div>
        </div>

        {to && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8B8E8B] group-hover:text-[#9A7120] group-hover:bg-[#FBF5E6] transition-colors shrink-0">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        )}
      </div>

      {badgeText && (
        <div className="mt-3.5 pt-3 border-t border-[#EFE9DA] flex items-center justify-between gap-2">
          <span className={`text-xs font-semibold ${badgeColor}`}>
            {badgeText}
          </span>
          <span className="text-[11px] text-[#6E7470] group-hover:text-[#9A7120] font-semibold transition-colors">
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
