import React, { useState, useEffect, useRef } from 'react';
import { Plus, MoreVertical, Edit2, Trash2, Layers } from 'lucide-react';
import { useCatalogue } from '../context/CatalogueContext';
import CategoryModal from '../components/categories/CategoryModal';
import DeleteConfirmDialog from '../components/categories/DeleteConfirmDialog';

/**
 * CategoriesPage Component
 * 
 * Redesigned for Mobile-First Single-Owner Simplicity:
 * - Header: "Categories", Subtitle: "Organize your products"
 * - Primary button: "+ Add Category"
 * - Mobile cards: Name, 2-letter Code, Product count, and compact "•••" overflow menu
 * - Desktop: Clean, lightweight, uncluttered layout
 * - Non-technical modals and friendly delete confirmation
 */
export default function CategoriesPage() {
  const {
    categories,
    getCategoryProductCount,
    deleteCategory,
    authStatus,
  } = useCatalogue();

  const isOwner = Boolean(authStatus?.isOwner);

  // Modal & Dialog state
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'add', // 'add' | 'edit'
    category: null,
  });

  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    category: null,
    productCount: 0,
  });

  // Active overflow menu ID (for the ••• menu popover)
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuContainerRef = useRef(null);

  // Close overflow menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Open Add Category bottom sheet
  const handleOpenAdd = () => {
    setActiveMenuId(null);
    setModalState({
      isOpen: true,
      mode: 'add',
      category: null,
    });
  };

  // Open Edit Category
  const handleOpenEdit = (cat) => {
    setActiveMenuId(null);
    setModalState({
      isOpen: true,
      mode: 'edit',
      category: cat,
    });
  };

  // Initiate Delete
  const handleOpenDelete = (cat) => {
    setActiveMenuId(null);
    const count = getCategoryProductCount(cat);
    setDeleteDialog({
      isOpen: true,
      category: cat,
      productCount: count,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" ref={menuContainerRef}>
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Categories
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize your products
          </p>
        </div>

        {isOwner && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-xs transition-all active:scale-[0.98] self-stretch sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Category</span>
          </button>
        )}
      </div>

      {/* Empty State when no categories exist */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-14 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 shadow-inner">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1.5">No Categories Found</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            All previous categories have been removed. Create your own custom product categories with automatic 2-letter codes.
          </p>
          {isOwner && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-xs transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Your First Category</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 2. Mobile Category Cards (Visible on screens < 768px)                     */}
          {/* ========================================================================= */}
      <div className="md:hidden space-y-3">
        {categories.map((cat) => {
          const productCount = getCategoryProductCount(cat);
          const isMenuOpen = activeMenuId === cat.id;

          return (
            <div
              key={cat.id}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs relative transition-all active:bg-slate-50/50"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Left: Name, Code & Product count */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 truncate">
                      {cat.name}
                    </h2>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                      {cat.code}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {productCount} {productCount === 1 ? 'product' : 'products'}
                  </p>
                </div>

                {/* Right: Overflow Menu Button (•••) - Owner only */}
                {isOwner && (
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(isMenuOpen ? null : cat.id);
                      }}
                      aria-label={`Options for ${cat.name}`}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Overflow Menu Popover */}
                    {isMenuOpen && (
                      <div className="absolute right-0 top-10 w-36 bg-white rounded-xl shadow-xl border border-slate-150 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDelete(cat)}
                          className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. Desktop Clean Table (Visible on screens >= 768px)                      */}
      {/* ========================================================================= */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-150 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Category</th>
              <th className="py-3.5 px-4 w-28">Code</th>
              <th className="py-3.5 px-6 text-right w-36">Products</th>
              {isOwner && <th className="py-3.5 px-6 text-center w-20">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {categories.map((cat) => {
              const productCount = getCategoryProductCount(cat);
              const isMenuOpen = activeMenuId === cat.id;

              return (
                <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="py-4 px-6 font-semibold text-slate-900">
                    {cat.name}
                  </td>
                  <td className="py-4 px-4 font-mono text-xs font-bold text-slate-700">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {cat.code}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-slate-600">
                    {productCount}
                  </td>
                  {isOwner && (
                    <td className="py-4 px-6 text-center relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : cat.id);
                        }}
                        aria-label={`Actions for ${cat.name}`}
                        className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Popover Menu */}
                      {isMenuOpen && (
                        <div className="absolute right-6 top-11 w-36 bg-white rounded-xl shadow-xl border border-slate-150 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-left">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(cat)}
                            className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  )}

      {/* ========================================================================= */}
      {/* 4. Add / Edit Category Bottom Sheet Modal                                 */}
      {/* ========================================================================= */}
      <CategoryModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        category={modalState.category}
        onClose={() => setModalState({ isOpen: false, mode: 'add', category: null })}
      />

      {/* ========================================================================= */}
      {/* 5. Delete Confirmation Dialog                                             */}
      {/* ========================================================================= */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        category={deleteDialog.category}
        productCount={deleteDialog.productCount}
        onClose={() => setDeleteDialog({ isOpen: false, category: null, productCount: 0 })}
        onConfirmDelete={(id) => deleteCategory(id)}
      />
    </div>
  );
}
