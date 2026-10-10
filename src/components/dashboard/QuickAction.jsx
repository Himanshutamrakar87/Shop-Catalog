import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Package, Layers, Award, ArrowRight } from 'lucide-react';

/**
 * Quick Actions Component
 * Mobile-first touch-friendly action cards for the four primary owner workflows:
 * - Add Product
 * - View All Products
 * - Manage Categories
 * - Manage Brands
 */
export default function QuickActions() {
  const actions = [
    {
      title: 'Add Product',
      description: 'Create new catalogue item with up to 2 images',
      to: '/products/new',
      icon: PlusCircle,
      primary: true,
      color: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
      iconBg: 'bg-blue-500/20 text-white',
    },
    {
      title: 'View All Products',
      description: 'Browse complete catalogue, filters & search',
      to: '/products',
      icon: Package,
      primary: false,
      color: 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200',
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Manage Categories',
      description: 'Organize cookware, tableware & storage groups',
      to: '/categories',
      icon: Layers,
      primary: false,
      color: 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200',
      iconBg: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Manage Brands',
      description: 'Review brand lines, origins & products',
      to: '/brands',
      icon: Award,
      primary: false,
      color: 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200',
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map((act) => {
        const Icon = act.icon || PlusCircle;
        return (
          <Link
            key={act.title}
            to={act.to}
            className={`group p-4 rounded-xl border transition-all active:scale-[0.98] shadow-xs flex items-center justify-between gap-3 min-h-[76px] ${act.color}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${act.iconBg}`}>
                {Icon && <Icon className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <span className={`text-sm font-bold block truncate ${act.primary ? 'text-white' : 'text-slate-900'}`}>
                  {act.title}
                </span>
                <span className={`text-xs block truncate ${act.primary ? 'text-blue-100' : 'text-slate-500'}`}>
                  {act.description}
                </span>
              </div>
            </div>

            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5 ${act.primary ? 'bg-blue-500/30 text-white' : 'bg-slate-100 text-slate-500'}`}>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
