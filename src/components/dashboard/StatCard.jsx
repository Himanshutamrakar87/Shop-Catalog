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
  badgeColor = 'bg-slate-100 text-slate-700',
  iconColor = 'text-blue-600 bg-blue-50',
  borderColor = 'border-slate-200'
}) {
  const content = (
    <div className={`p-4 sm:p-5 bg-white rounded-xl border ${borderColor} shadow-xs hover:shadow-md transition-all active:scale-[0.99] flex flex-col justify-between h-full group`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconColor}`}>
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {title}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5 block">
              {value}
            </span>
          </div>
        </div>

        {to && (
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        )}
      </div>

      {badgeText && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
            {badgeText}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
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
