import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Award, MoreVertical, Edit2, Trash2, MapPin, Package, X, AlertCircle } from 'lucide-react';
import { useCatalogue } from '../context/CatalogueContext';
import ClassificationCatalogueView from '../components/catalogue/ClassificationCatalogueView';

/**
 * BrandsPage Component
 * - Displays all brands at the top as selectable options ("All" selected by default)
 * - Shows all products below, and filters products when a brand option is selected
 * - Owners can add new brands or toggle "Manage" mode to edit/delete brands
 */
export default function BrandsPage() {
  const {
    brands,
    products,
    getBrandProductCount,
    addBrand,
    updateBrand,
    deleteBrand,
    showToast,
    authStatus,
  } = useCatalogue();

  const isOwner = Boolean(authStatus?.isOwner);

  const classificationItems = useMemo(
    () =>
      brands.map((br) => ({
        id: br.id,
        name: br.name,
        count: getBrandProductCount(br),
        raw: br,
      })),
    [brands, products]
  );

  // Modal states
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'add', // 'add' | 'edit'
    brand: null,
  });

  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    brand: null,
    productCount: 0,
  });

  // Form fields
  const [name, setName] = useState('');
  const [origin, setOrigin] = useState('');
  const [formError, setFormError] = useState('');

  // Active overflow menu ID for ••• popover
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

  const handleOpenAdd = () => {
    setActiveMenuId(null);
    setName('');
    setOrigin('');
    setFormError('');
    setModalState({ isOpen: true, mode: 'add', brand: null });
  };

  const handleOpenEdit = (br) => {
    setActiveMenuId(null);
    setName(br.name);
    setOrigin(br.origin || '');
    setFormError('');
    setModalState({ isOpen: true, mode: 'edit', brand: br });
  };

  const handleOpenDelete = (br) => {
    setActiveMenuId(null);
    const count = getBrandProductCount(br);
    setDeleteDialog({
      isOpen: true,
      brand: br,
      productCount: count,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError('Brand name is required.');
      return;
    }

    if (modalState.mode === 'add') {
      addBrand(trimmedName, origin.trim());
      showToast(`Brand "${trimmedName}" created successfully!`);
    } else if (modalState.mode === 'edit' && modalState.brand) {
      updateBrand(modalState.brand.id, {
        name: trimmedName,
        origin: origin.trim(),
      });
      showToast(`Brand "${trimmedName}" updated!`);
    }

    setModalState({ isOpen: false, mode: 'add', brand: null });
  };

  const handleConfirmDelete = () => {
    if (!deleteDialog.brand) return;
    const res = deleteBrand(deleteDialog.brand.id);
    if (res.success) {
      showToast(`Brand "${deleteDialog.brand.name}" removed.`);
      setDeleteDialog({ isOpen: false, brand: null, productCount: 0 });
    }
  };

  return (
    <div ref={menuContainerRef}>
      <ClassificationCatalogueView
        title="Brands"
        subtitle={`Select a brand above to filter products (${brands.length} ${brands.length === 1 ? 'brand' : 'brands'})`}
        icon={Award}
        itemLabelSingular="brand"
        itemLabelPlural="brands"
        addLabel="Add Brand"
        items={classificationItems}
        products={products}
        matchesProduct={(prod, item) =>
          String(prod.brand || '').trim().toLowerCase() === String(item.name || '').trim().toLowerCase()
        }
        isOwner={isOwner}
        onAdd={handleOpenAdd}
        renderManageView={() => (
          <>
            {/* Mobile Brand Cards (Screens < 768px) */}
            <div className="md:hidden space-y-3">
              {brands.map((br) => {
                const productCount = getBrandProductCount(br);
                const isMenuOpen = activeMenuId === br.id;

                return (
                  <div
                    key={br.id}
                    className="p-4 bg-[#FFFFFF] dark:bg-[#202A25] rounded-xl border border-[#E5DFD2] dark:border-[#34433A] hover:border-[#E9D5A5] dark:hover:border-[#E7C477] hover:bg-[#FCF9F2] dark:hover:bg-[#25322C] shadow-xs dark:shadow-none relative transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-[#292D2B] dark:text-[#F7F3EA] truncate">
                            {br.name}
                          </h2>
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 text-xs text-[#73776F] dark:text-[#B6C0B8] font-medium">
                          {br.origin && (
                            <span className="flex items-center gap-1 text-[#73776F] dark:text-[#B6C0B8] truncate">
                              <MapPin className="w-3.5 h-3.5 text-[#73776F] dark:text-[#B6C0B8] shrink-0" />
                              <span>{br.origin}</span>
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 font-semibold text-[#173F35] dark:text-[#E7C477] tabular-nums">
                            <Package className="w-3.5 h-3.5 text-[#D4A64A]" />
                            <span>{productCount} {productCount === 1 ? 'product' : 'products'}</span>
                          </span>
                        </div>
                      </div>

                      {isOwner && (
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : br.id);
                            }}
                            aria-label={`Options for ${br.name}`}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#73776F] dark:text-[#B6C0B8] hover:text-[#173F35] dark:hover:text-[#E7C477] hover:bg-[#E9D5A5]/30 dark:hover:bg-[#34433A] transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 top-10 w-36 bg-[#FFFFFF] dark:bg-[#202A25] rounded-xl shadow-xl dark:shadow-[0_12px_32px_rgba(10,16,13,0.5)] border border-[#E5DFD2] dark:border-[#34433A] py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(br)}
                                className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-[#292D2B] dark:text-[#F7F3EA] hover:bg-[#FCF9F2] dark:hover:bg-[#25322C] hover:text-[#173F35] dark:hover:text-[#E7C477] flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-[#73776F] dark:text-[#B6C0B8]" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDelete(br)}
                                className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
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

            {/* Desktop Clean Table (Screens >= 768px) */}
            <div className="hidden md:block bg-[#FFFFFF] dark:bg-[#202A25] rounded-xl border border-[#E5DFD2] dark:border-[#34433A] shadow-xs dark:shadow-none overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5DFD2] dark:border-[#34433A] bg-[#F7F3EA] dark:bg-[#1A2420] text-xs font-bold text-[#73776F] dark:text-[#B6C0B8] uppercase tracking-wider">
                    <th className="py-3.5 px-6">Brand Name</th>
                    <th className="py-3.5 px-6">Origin / Location</th>
                    <th className="py-3.5 px-6 text-right w-36">Products</th>
                    {isOwner && <th className="py-3.5 px-6 text-center w-20">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD2] dark:divide-[#34433A] text-sm">
                  {brands.map((br) => {
                    const productCount = getBrandProductCount(br);
                    const isMenuOpen = activeMenuId === br.id;

                    return (
                      <tr key={br.id} className="hover:bg-[#FCF9F2] dark:hover:bg-[#25322C] transition-colors group">
                        <td className="py-4 px-6 font-semibold text-[#292D2B] dark:text-[#F7F3EA] group-hover:text-[#173F35] dark:group-hover:text-[#E7C477] transition-colors">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#F7F3EA] dark:bg-[#141C19] border border-[#D4A64A]/40 text-[#9A7120] dark:text-[#D4A64A] flex items-center justify-center shrink-0">
                              <Award className="w-4 h-4" />
                            </div>
                            <span>{br.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-[#73776F] dark:text-[#B6C0B8] text-xs font-medium">
                          {br.origin || '—'}
                        </td>
                        <td className="py-4 px-6 text-right font-semibold text-[#292D2B] dark:text-[#F7F3EA] tabular-nums">
                          {productCount}
                        </td>
                        {isOwner && (
                          <td className="py-4 px-6 text-center relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(isMenuOpen ? null : br.id);
                              }}
                              aria-label={`Actions for ${br.name}`}
                              className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-[#73776F] dark:text-[#B6C0B8] hover:text-[#173F35] dark:hover:text-[#E7C477] hover:bg-[#E9D5A5]/30 dark:hover:bg-[#34433A] transition-colors cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {isMenuOpen && (
                              <div className="absolute right-6 top-11 w-36 bg-[#FFFFFF] dark:bg-[#202A25] rounded-xl shadow-xl dark:shadow-[0_12px_32px_rgba(10,16,13,0.5)] border border-[#E5DFD2] dark:border-[#34433A] py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-left">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(br)}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#292D2B] dark:text-[#F7F3EA] hover:bg-[#FCF9F2] dark:hover:bg-[#25322C] hover:text-[#173F35] dark:hover:text-[#E7C477] flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-[#73776F] dark:text-[#B6C0B8]" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenDelete(br)}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
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
      {/* 4. Add / Edit Brand Modal                                                 */}
      {/* ========================================================================= */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-[#141C19]/70 dark:bg-[#141C19]/80 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setModalState({ isOpen: false, mode: 'add', brand: null })}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={modalState.mode === 'add' ? 'Add Brand' : 'Edit Brand'}
            className="relative w-full sm:max-w-md bg-[#FFFFFF] dark:bg-[#202A25] rounded-t-2xl sm:rounded-2xl shadow-2xl dark:shadow-[0_20px_50px_rgba(10,16,13,0.6)] border border-[#E5DFD2] dark:border-[#34433A] overflow-hidden z-10 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
          >
            <div className="sm:hidden w-12 h-1.5 bg-[#E5DFD2] dark:bg-[#34433A] rounded-full mx-auto mt-3" />

            <div className="px-6 pt-4 pb-3 sm:py-5 flex items-center justify-between border-b border-[#E5DFD2] dark:border-[#34433A] bg-[#F7F3EA] dark:bg-[#1A2420]">
              <div>
                <h2 className="text-lg font-bold text-[#292D2B] dark:text-[#F7F3EA] tracking-tight">
                  {modalState.mode === 'add' ? 'Add Brand' : 'Edit Brand'}
                </h2>
                <p className="text-xs text-[#73776F] dark:text-[#B6C0B8] mt-0.5">
                  {modalState.mode === 'add' ? 'Register a manufacturer or supplier' : 'Update brand information'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalState({ isOpen: false, mode: 'add', brand: null })}
                aria-label="Close"
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#73776F] dark:text-[#B6C0B8] hover:text-[#292D2B] dark:hover:text-[#F7F3EA] hover:bg-[#E9D5A5]/30 dark:hover:bg-[#34433A] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-200 text-xs font-medium">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#292D2B] dark:text-[#F7F3EA]">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Hawkins Contura"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (formError) setFormError('');
                  }}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-[#E5DFD2] dark:border-[#34433A] bg-[#F7F3EA] dark:bg-[#141C19] focus:bg-[#FFFFFF] dark:focus:bg-[#202A25] focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/30 focus:border-[#D4A64A] transition-all font-medium text-[#292D2B] dark:text-[#F7F3EA] placeholder:text-[#73776F] dark:placeholder:text-[#B6C0B8]/70"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#292D2B] dark:text-[#F7F3EA]">
                  Origin / Manufacturing Hub <span className="font-normal text-[#73776F] dark:text-[#B6C0B8]">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, India"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-[#E5DFD2] dark:border-[#34433A] bg-[#F7F3EA] dark:bg-[#141C19] focus:bg-[#FFFFFF] dark:focus:bg-[#202A25] focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/30 focus:border-[#D4A64A] transition-all font-medium text-[#292D2B] dark:text-[#F7F3EA] placeholder:text-[#73776F] dark:placeholder:text-[#B6C0B8]/70"
                />
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: false, mode: 'add', brand: null })}
                  className="w-full sm:w-auto py-3 sm:py-2.5 px-5 rounded-xl border border-[#E5DFD2] dark:border-[#34433A] text-[#292D2B] dark:text-[#F7F3EA] hover:border-[#E9D5A5] dark:hover:border-[#E7C477] hover:bg-[#FCF9F2] dark:hover:bg-[#25322C] font-semibold text-sm transition-colors text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="w-full sm:w-auto py-3 sm:py-2.5 px-6 rounded-xl bg-[#D4A64A] hover:bg-[#E9D5A5] dark:hover:bg-[#E7C477] disabled:opacity-50 text-[#173F35] dark:text-[#141C19] font-bold text-sm shadow-sm transition-all text-center whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {modalState.mode === 'add' ? 'Save Brand' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. Safe Delete Confirmation Dialog                                        */}
      {/* ========================================================================= */}
      {deleteDialog.isOpen && deleteDialog.brand && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-[#141C19]/70 dark:bg-[#141C19]/80 backdrop-blur-xs transition-opacity"
            onClick={() => setDeleteDialog({ isOpen: false, brand: null, productCount: 0 })}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={deleteDialog.productCount > 0 ? "Can't delete this brand" : `Delete "${deleteDialog.brand.name}"`}
            className="relative w-full sm:max-w-sm bg-[#FFFFFF] dark:bg-[#202A25] rounded-t-2xl sm:rounded-2xl shadow-2xl dark:shadow-[0_20px_50px_rgba(10,16,13,0.6)] border border-[#E5DFD2] dark:border-[#34433A] overflow-hidden z-10 p-6 space-y-4 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
          >
            <div className="sm:hidden w-12 h-1 bg-[#E5DFD2] dark:bg-[#34433A] rounded-full mx-auto -mt-2 mb-2" />

            {deleteDialog.productCount > 0 ? (
              <>
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#F7F3EA] dark:bg-[#141C19] text-[#9A7120] dark:text-[#D4A64A] border border-[#D4A64A]/40 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-[#292D2B] dark:text-[#F7F3EA]">
                      Can't delete this brand
                    </h3>
                    <p className="text-sm text-[#73776F] dark:text-[#B6C0B8] mt-2 leading-relaxed">
                      <strong className="text-[#292D2B] dark:text-[#F7F3EA]">{deleteDialog.productCount} {deleteDialog.productCount === 1 ? 'product is' : 'products are'}</strong> currently associated with this brand. Reassign those products before deleting the brand.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteDialog({ isOpen: false, brand: null, productCount: 0 })}
                    className="w-full py-3 px-4 rounded-xl bg-[#D4A64A] hover:bg-[#E9D5A5] dark:hover:bg-[#E7C477] text-[#173F35] dark:text-[#141C19] font-bold text-sm transition-all text-center cursor-pointer"
                  >
                    Got it
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-[#292D2B] dark:text-[#F7F3EA]">
                      Delete "{deleteDialog.brand.name}"?
                    </h3>
                    <p className="text-sm text-[#73776F] dark:text-[#B6C0B8] mt-1">
                      This brand will be removed from your catalogue options.
                    </p>
                  </div>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeleteDialog({ isOpen: false, brand: null, productCount: 0 })}
                    className="py-3 px-4 rounded-xl border border-[#E5DFD2] dark:border-[#34433A] text-[#292D2B] dark:text-[#F7F3EA] hover:border-[#E9D5A5] dark:hover:border-[#E7C477] hover:bg-[#FCF9F2] dark:hover:bg-[#25322C] font-semibold text-sm transition-colors text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-sm shadow-xs transition-all text-center cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
