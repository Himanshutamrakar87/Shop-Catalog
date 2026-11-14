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
      color: 'bg-gradient-to-r from-[#D4A64A] to-[#C29236] hover:from-[#DFB359] hover:to-[#CE9D3E] text-[#173F35] border-[#B98B32]/40 shadow-md shadow-[#173F35]/15 hover:shadow-lg hover:shadow-[#D4A64A]/30',
      iconBg: 'bg-[#173F35] text-[#F4D58D] shadow-xs',
    },
    {
      title: 'View All Products',
      description: 'Browse complete catalogue, filters & search',
      to: '/products',
      icon: Package,
      primary: false,
      color: 'bg-white hover:bg-[#FCF9F2] text-[#292D2B] border-[#E6DFCE] hover:border-[#D4A64A] hover:shadow-[#D4A64A]/15',
      iconBg: 'bg-gradient-to-br from-[#173F35] to-[#1E5245] text-[#F4D58D] shadow-xs',
    },
    {
      title: 'Manage Categories',
      description: 'Organize cookware, tableware & storage groups',
      to: '/categories',
      icon: Layers,
      primary: false,
      color: 'bg-white hover:bg-[#FCF9F2] text-[#292D2B] border-[#E6DFCE] hover:border-[#D4A64A] hover:shadow-[#D4A64A]/15',
      iconBg: 'bg-gradient-to-br from-[#292D2B] to-[#3E4441] text-[#F4D58D] shadow-xs',
    },
    {
      title: 'Manage Brands',
      description: 'Review brand lines, origins & products',
      to: '/brands',
      icon: Award,
      primary: false,
      color: 'bg-white hover:bg-[#FCF9F2] text-[#292D2B] border-[#E6DFCE] hover:border-[#D4A64A] hover:shadow-[#D4A64A]/15',
      iconBg: 'bg-gradient-to-br from-[#D4A64A] to-[#B5862B] text-[#173F35] shadow-xs',
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
            className={`group p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] shadow-xs hover:shadow-md flex items-center justify-between gap-3 min-h-[78px] ${act.color}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${act.iconBg}`}>
                {Icon && <Icon className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <span className={`text-sm font-bold block truncate ${act.primary ? 'text-[#173F35]' : 'text-[#292D2B] group-hover:text-[#173F35]'}`}>
                  {act.title}
                </span>
                <span className={`text-xs block truncate ${act.primary ? 'text-[#173F35]/85 font-medium' : 'text-[#555B58]'}`}>
                  {act.description}
                </span>
              </div>
            </div>

            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all group-hover:translate-x-0.5 ${act.primary ? 'bg-[#173F35]/15 text-[#173F35]' : 'bg-[#F7F3EA] text-[#555B58] group-hover:bg-[#D4A64A] group-hover:text-[#173F35]'}`}>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
