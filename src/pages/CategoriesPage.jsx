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
                    className="p-4 bg-white rounded-xl border border-[#E6DFCE] hover:border-[#D4A64A] hover:bg-[#FCF9F2] shadow-xs relative transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-[#292D2B] truncate">
                            {cat.name}
                          </h2>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#FBF5E6] border border-[#D4A64A]/50 text-[#173F35] shrink-0">
                            {cat.code}
                          </span>
                        </div>

                        <p className="text-xs text-[#555B58] font-medium mt-1 tabular-nums">
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
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#6F7571] hover:text-[#173F35] hover:bg-[#FBF5E6] transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 top-10 w-36 bg-white rounded-xl shadow-xl border border-[#E6DFCE] py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(cat)}
                                className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-[#292D2B] hover:bg-[#FCF9F2] hover:text-[#9A7120] flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-[#555B58]" />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenDelete(cat)}
                                className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
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
            <div className="hidden md:block bg-white rounded-xl border border-[#E6DFCE] shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EFE9DA] bg-gradient-to-r from-[#FBF8F1] via-[#FAF7F0] to-[#F7F3EA] text-xs font-bold text-[#6F7571] uppercase tracking-wider">
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-4 w-28">Code</th>
                    <th className="py-3.5 px-6 text-right w-36">Products</th>
                    {isOwner && <th className="py-3.5 px-6 text-center w-20">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DA] text-sm">
                  {categories.map((cat) => {
                    const productCount = getCategoryProductCount(cat);
                    const isMenuOpen = activeMenuId === cat.id;

                    return (
                      <tr key={cat.id} className="hover:bg-[#FCF9F2] transition-colors group">
                        <td className="py-4 px-6 font-semibold text-[#292D2B] group-hover:text-[#9A7120] transition-colors">
                          {cat.name}
                        </td>
                        <td className="py-4 px-4 font-mono text-xs font-bold text-[#173F35]">
                          <span className="px-2 py-0.5 rounded bg-[#FBF5E6] border border-[#D4A64A]/50">
                            {cat.code}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-medium text-[#555B58] tabular-nums">
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
                              className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-[#6F7571] hover:text-[#173F35] hover:bg-[#FBF5E6] transition-colors cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {isMenuOpen && (
                              <div className="absolute right-6 top-11 w-36 bg-white rounded-xl shadow-xl border border-[#E6DFCE] py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-left">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(cat)}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#292D2B] hover:bg-[#FCF9F2] hover:text-[#9A7120] flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-[#555B58]" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenDelete(cat)}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
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
