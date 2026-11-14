import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MoreVertical, Edit2, Trash2, Layers } from 'lucide-react';
import { useCatalogue } from '../context/CatalogueContext';
import CategoryModal from '../components/categories/CategoryModal';
import DeleteConfirmDialog from '../components/categories/DeleteConfirmDialog';
import ClassificationCatalogueView from '../components/catalogue/ClassificationCatalogueView';

/**
 * CategoriesPage Component
 * - Displays all categories at the top as selectable options ("All" selected by default)
 * - Shows all products below, and filters products when a category option is selected
 * - Owners can add new categories or toggle "Manage" mode to edit/delete categories
 */
export default function CategoriesPage() {
  const {
    categories,
    products,
    getCategoryProductCount,
    deleteCategory,
    showToast,
    authStatus,
  } = useCatalogue();

  const isOwner = Boolean(authStatus?.isOwner);

  const classificationItems = useMemo(
    () =>
      categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        code: cat.code,
        count: getCategoryProductCount(cat),
        raw: cat,
      })),
    [categories, products]
  );

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
    <div ref={menuContainerRef}>
      <ClassificationCatalogueView
        title="Categories"
        subtitle={`Select a category above to filter products (${categories.length} ${categories.length === 1 ? 'category' : 'categories'})`}
        icon={Layers}
        itemLabelSingular="category"
        itemLabelPlural="categories"
        addLabel="Add Category"
        items={classificationItems}
        products={products}
        matchesProduct={(prod, item) => {
          const catName = String(prod.categoryName || prod.category || '').trim().toLowerCase();
          const itemName = String(item.name || '').trim().toLowerCase();
          const catCode = String(prod.categoryCode || '').trim().toLowerCase();
          const itemCode = String(item.code || '').trim().toLowerCase();
          return catName === itemName || (Boolean(itemCode) && catCode === itemCode);
        }}
        isOwner={isOwner}
        onAdd={handleOpenAdd}
        renderManageView={() => (
          <>
            {/* Mobile Category Cards (Visible on screens < 768px) */}
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

            {/* Desktop Clean Table (Visible on screens >= 768px) */}
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
      />

      {/* ========================================================================= */}
      {/* 4. Add / Edit Category Bottom Sheet Modal                                 */}
      {/* ========================================================================= */}
      <CategoryModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        category={modalState.category}
        onClose={() => setModalState({ isOpen: false, mode: 'add', category: null })}
        onSuccess={(cat) => {
          if (cat?.name) {
            showToast(
              modalState.mode === 'add'
                ? `Category "${cat.name}" created!`
                : `Category "${cat.name}" updated!`
            );
          }
        }}
      />

      {/* ========================================================================= */}
      {/* 5. Delete Confirmation Dialog                                             */}
      {/* ========================================================================= */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        category={deleteDialog.category}
        productCount={deleteDialog.productCount}
        onClose={() => setDeleteDialog({ isOpen: false, category: null, productCount: 0 })}
        onConfirmDelete={async (id) => {
          const res = await deleteCategory(id);
          if (res?.success) {
            showToast('Category removed.');
          } else if (res?.error) {
            showToast(res.error, 'error');
          }
        }}
      />
    </div>
  );
}
