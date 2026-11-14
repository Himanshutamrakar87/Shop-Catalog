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
      color: 'bg-[#D4A64A] hover:bg-[#E9D5A5] dark:hover:bg-[#E7C477] text-[#173F35] dark:text-[#141C19] border-[#B98B32]/40 shadow-sm dark:shadow-none',
      iconBg: 'bg-[#173F35] dark:bg-[#141C19] text-[#D4A64A] shadow-xs dark:shadow-none',
    },
    {
      title: 'View All Products',
      description: 'Browse complete catalogue, filters & search',
      to: '/products',
      icon: Package,
      primary: false,
      color: 'bg-[#FFFFFF] dark:bg-[#202A25] hover:bg-[#FCF9F2] dark:hover:bg-[#25322C] text-[#292D2B] dark:text-[#F7F3EA] border-[#E5DFD2] dark:border-[#34433A] hover:border-[#E9D5A5] dark:hover:border-[#E7C477]',
      iconBg: 'bg-[#173F35] dark:bg-[#203D32] text-[#D4A64A] shadow-xs dark:shadow-none',
    },
    {
      title: 'Manage Categories',
      description: 'Organize cookware, tableware & storage groups',
      to: '/categories',
      icon: Layers,
      primary: false,
      color: 'bg-[#FFFFFF] dark:bg-[#202A25] hover:bg-[#FCF9F2] dark:hover:bg-[#25322C] text-[#292D2B] dark:text-[#F7F3EA] border-[#E5DFD2] dark:border-[#34433A] hover:border-[#E9D5A5] dark:hover:border-[#E7C477]',
      iconBg: 'bg-[#292D2B] dark:bg-[#141C19] text-[#D4A64A] shadow-xs dark:shadow-none',
    },
    {
      title: 'Manage Brands',
      description: 'Review brand lines, origins & products',
      to: '/brands',
      icon: Award,
      primary: false,
      color: 'bg-[#FFFFFF] dark:bg-[#202A25] hover:bg-[#FCF9F2] dark:hover:bg-[#25322C] text-[#292D2B] dark:text-[#F7F3EA] border-[#E5DFD2] dark:border-[#34433A] hover:border-[#E9D5A5] dark:hover:border-[#E7C477]',
      iconBg: 'bg-[#D4A64A] text-[#173F35] dark:text-[#141C19] shadow-xs dark:shadow-none',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {actions.map((act) => {
        const Icon = act.icon || PlusCircle;
        return (
          <Link
            key={act.title}
            to={act.to}
            className={`group p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] shadow-xs dark:shadow-none hover:shadow-md flex items-center justify-between gap-3 min-h-[78px] ${act.color}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${act.iconBg}`}>
                {Icon && <Icon className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <span className={`text-sm font-bold block truncate ${act.primary ? 'text-[#173F35] dark:text-[#141C19]' : 'text-[#292D2B] dark:text-[#F7F3EA]'}`}>
                  {act.title}
                </span>
                <span className={`text-xs block truncate ${act.primary ? 'text-[#173F35]/85 dark:text-[#141C19]/85 font-medium' : 'text-[#73776F] dark:text-[#B6C0B8]'}`}>
                  {act.description}
                </span>
              </div>
            </div>

            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all group-hover:translate-x-0.5 ${act.primary ? 'bg-[#173F35]/15 text-[#173F35] dark:text-[#141C19]' : 'bg-[#F7F3EA] dark:bg-[#141C19] text-[#73776F] dark:text-[#B6C0B8] group-hover:bg-[#D4A64A] group-hover:text-[#173F35] dark:group-hover:text-[#141C19]'}`}>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
