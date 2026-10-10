import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Box, Plus, MoreVertical, Edit2, Trash2, Package, X, AlertCircle } from 'lucide-react';
import { useCatalogue } from '../context/CatalogueContext';

/**
 * MaterialsPage Component
 * Full Materials Management:
 * - View metal classifications and product materials (Aluminium, Stainless Steel, Brass, Copper, etc.)
 * - Dynamically count how many products use each material
 * - Add a new material
 * - Edit / rename material (updates matching products safely)
 * - Safe delete validation (prevents deleting material if products are assigned)
 * - Mobile-first cards and clean desktop layout with ••• menu
 */
export default function MaterialsPage() {
  const {
    materials,
    getMaterialProductCount,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    showToast,
  } = useCatalogue();

  // Modal states
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'add', // 'add' | 'edit'
    material: null,
  });

  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    material: null,
    productCount: 0,
  });

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
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
    setDescription('');
    setFormError('');
    setModalState({ isOpen: true, mode: 'add', material: null });
  };

  const handleOpenEdit = (mat) => {
    setActiveMenuId(null);
    setName(mat.name);
    setDescription(mat.description || '');
    setFormError('');
    setModalState({ isOpen: true, mode: 'edit', material: mat });
  };

  const handleOpenDelete = (mat) => {
    setActiveMenuId(null);
    const count = getMaterialProductCount(mat);
    setDeleteDialog({
      isOpen: true,
      material: mat,
      productCount: count,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError('Material name is required.');
      return;
    }

    if (modalState.mode === 'add') {
      addMaterial(trimmedName, description.trim());
      showToast(`Material "${trimmedName}" created successfully!`);
    } else if (modalState.mode === 'edit' && modalState.material) {
      updateMaterial(modalState.material.id, {
        name: trimmedName,
        description: description.trim(),
      });
      showToast(`Material "${trimmedName}" updated!`);
    }

    setModalState({ isOpen: false, mode: 'add', material: null });
  };

  const handleConfirmDelete = () => {
    if (!deleteDialog.material) return;
    const res = deleteMaterial(deleteDialog.material.id);
    if (res.success) {
      showToast(`Material "${deleteDialog.material.name}" removed.`);
      setDeleteDialog({ isOpen: false, material: null, productCount: 0 });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" ref={menuContainerRef}>
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Materials
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Metal classifications and compositions ({materials.length} materials)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-xs transition-all active:scale-[0.98] self-stretch sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Material</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. Mobile Material Cards (Screens < 768px)                                */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-3">
        {materials.map((mat) => {
          const productCount = getMaterialProductCount(mat);
          const isMenuOpen = activeMenuId === mat.id;

          return (
            <div
              key={mat.id}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs relative transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 truncate">
                      {mat.name}
                    </h2>
                  </div>

                  {mat.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {mat.description}
                    </p>
                  )}

                  <div className="mt-2 text-xs font-semibold text-blue-600 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    <span>{productCount} {productCount === 1 ? 'product' : 'products'}</span>
                  </div>
                </div>

                {/* Overflow Menu Button (•••) */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(isMenuOpen ? null : mat.id);
                    }}
                    aria-label={`Options for ${mat.name}`}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-10 w-36 bg-white rounded-xl shadow-xl border border-slate-150 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(mat)}
                        className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDelete(mat)}
                        className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. Desktop Clean Table (Screens >= 768px)                                 */}
      {/* ========================================================================= */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-150 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Material Name</th>
              <th className="py-3.5 px-6">Description / Notes</th>
              <th className="py-3.5 px-6 text-right w-36">Products</th>
              <th className="py-3.5 px-6 text-center w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {materials.map((mat) => {
              const productCount = getMaterialProductCount(mat);
              const isMenuOpen = activeMenuId === mat.id;

              return (
                <tr key={mat.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="py-4 px-6 font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <Box className="w-4 h-4" />
                      </div>
                      <span>{mat.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600 text-xs max-w-md">
                    {mat.description || '—'}
                  </td>
                  <td className="py-4 px-6 text-right font-semibold text-slate-700">
                    {productCount}
                  </td>
                  <td className="py-4 px-6 text-center relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(isMenuOpen ? null : mat.id);
                      }}
                      aria-label={`Actions for ${mat.name}`}
                      className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-6 top-11 w-36 bg-white rounded-xl shadow-xl border border-slate-150 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-left">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(mat)}
                          className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(mat)}
                          className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* 4. Add / Edit Material Modal                                              */}
      {/* ========================================================================= */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setModalState({ isOpen: false, mode: 'add', material: null })}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={modalState.mode === 'add' ? 'Add Material' : 'Edit Material'}
            className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
          >
            <div className="sm:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3" />

            <div className="px-6 pt-4 pb-3 sm:py-5 flex items-center justify-between border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {modalState.mode === 'add' ? 'Add Material' : 'Edit Material'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {modalState.mode === 'add' ? 'Define a metal or material specification' : 'Update material information'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalState({ isOpen: false, mode: 'add', material: null })}
                aria-label="Close"
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Material Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Pure Copper, Tri-Ply Steel"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (formError) setFormError('');
                  }}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Description / Metal Grade <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Food-grade 304 stainless steel or heavy virgin aluminium..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: false, mode: 'add', material: null })}
                  className="w-full sm:w-auto py-3 sm:py-2.5 px-5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="w-full sm:w-auto py-3 sm:py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold text-sm shadow-xs transition-all text-center"
                >
                  {modalState.mode === 'add' ? 'Save Material' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. Safe Delete Confirmation Dialog                                        */}
      {/* ========================================================================= */}
      {deleteDialog.isOpen && deleteDialog.material && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDeleteDialog({ isOpen: false, material: null, productCount: 0 })}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={deleteDialog.productCount > 0 ? "Can't delete this material" : `Delete "${deleteDialog.material.name}"`}
            className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 p-6 space-y-4 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
          >
            <div className="sm:hidden w-12 h-1 bg-slate-200 rounded-full mx-auto -mt-2 mb-2" />

            {deleteDialog.productCount > 0 ? (
              <>
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900">
                      Can't delete this material
                    </h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      <strong className="text-slate-900">{deleteDialog.productCount} {deleteDialog.productCount === 1 ? 'product is' : 'products are'}</strong> currently using this material. Reassign those products before deleting the material.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteDialog({ isOpen: false, material: null, productCount: 0 })}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors text-center"
                  >
                    Got it
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900">
                      Delete "{deleteDialog.material.name}"?
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      This material will be removed from your catalogue options.
                    </p>
                  </div>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeleteDialog({ isOpen: false, material: null, productCount: 0 })}
                    className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-sm shadow-xs transition-all text-center"
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
