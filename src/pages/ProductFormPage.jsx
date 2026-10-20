import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Upload,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Plus,
  Loader2,
  IndianRupee,
  Layers,
  Sparkles,
  Lock,
  Tag,
  Box,
  ShieldCheck,
  ShieldAlert,
  Cloud,
  Database
} from 'lucide-react';
import { useCatalogue } from '../context/CatalogueContext';
import CategoryModal from '../components/categories/CategoryModal';
import QuickAddModal from '../components/common/QuickAddModal';
import OwnerAuthModal from '../components/common/OwnerAuthModal';

/**
 * Product Form Page
 * Complete mobile-first product creation and editing form.
 * 
 * 6 Main Sections:
 * 1. Basic Information (Product Name, Product Code auto-generated)
 * 2. Classification (Category, Sub-category, Brand, Material with + Add New)
 * 3. Product Details (Size/Capacity with + Add New, Purchase Price ₹, Special Details)
 * 4. Images (Image 1 Required, Image 2 Optional, Device Gallery, Instant Preview, Change/Remove)
 * 5. Status (In Stock, Out of Stock, Discontinued)
 * 6. Actions ([Cancel] [Save Product], Loading feedback, Toast notification)
 */
export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const {
    categories,
    products,
    brands,
    materials,
    subCategories,
    sizes,
    isSupabaseMode,
    authStatus,
    refreshAuthStatus,
    peekProductCodeForCategory,
    generateProductCodeForCategory,
    addCategory,
    addBrand,
    addMaterial,
    addSubCategory,
    addSize,
    addProduct,
    updateProduct,
    showToast
  } = useCatalogue();

  // Hidden native file input references
  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseUnit, setPurchaseUnit] = useState('Piece');
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [customUnit, setCustomUnit] = useState('');
  const [specialDetails, setSpecialDetails] = useState('');
  const [status, setStatus] = useState('In Stock');

  // Auto-generated Product Code
  const [productCode, setProductCode] = useState('');

  // Image Slots State
  const [image1, setImage1] = useState({ file: null, preview: null, name: '' });
  const [image2, setImage2] = useState({ file: null, preview: null, name: '' });

  // Form Submission & Validation States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({ name: false, category: false, image1: false });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Dynamic "+ Add New" Modals States
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [quickAddModal, setQuickAddModal] = useState({
    isOpen: false,
    type: '', // 'subcategory' | 'brand' | 'material' | 'size'
    title: '',
    label: '',
    placeholder: ''
  });

  // Initialize Category and default selections
  useEffect(() => {
    let isMounted = true;
    if (!isEditing && categories.length > 0 && !selectedCategoryName) {
      const firstCat = categories[0];
      setSelectedCategoryName(firstCat.name);
      if (isSupabaseMode) {
        peekProductCodeForCategory(firstCat.code).then((code) => {
          if (isMounted && code) setProductCode(code);
        });
      } else {
        setProductCode(generateProductCodeForCategory(firstCat.code));
      }
    }
    return () => {
      isMounted = false;
    };
  }, [categories, isEditing, selectedCategoryName, isSupabaseMode, peekProductCodeForCategory, generateProductCodeForCategory]);

  // Set default Brand & Material if empty in creation mode
  useEffect(() => {
    if (!isEditing) {
      if (!selectedBrand && brands.length > 0) setSelectedBrand(brands[0].name);
      if (!selectedMaterial && materials.length > 0) setSelectedMaterial(materials[0].name);
      if (!selectedSubCategory && subCategories.length > 0) setSelectedSubCategory(subCategories[0]);
      if (!selectedSize && sizes.length > 0) setSelectedSize(sizes[0]);
    }
  }, [isEditing, brands, materials, subCategories, sizes, selectedBrand, selectedMaterial, selectedSubCategory, selectedSize]);

  // Prepopulate if editing existing product
  useEffect(() => {
    if (isEditing && id) {
      const existing = products.find((p) => p.id === id);
      if (existing) {
        setName(existing.name || existing.productName || '');
        setSelectedCategoryName(existing.categoryName || existing.category || (categories[0]?.name ?? ''));
        setSelectedSubCategory(existing.subCategory || '');
        setSelectedBrand(existing.brand || '');
        setSelectedMaterial(existing.material || '');
        setSelectedSize(existing.sizeCapacity || existing.sizeOrCapacity || '');
        setPurchasePrice(existing.purchasePrice !== undefined && existing.purchasePrice !== null ? String(existing.purchasePrice) : '');
        const existingUnit = existing.purchaseUnit || existing.purchase_unit || 'Piece';
        const standardUnits = ['Piece', 'kg', 'Dozen', 'Gram', 'Set', 'Box', 'Meter', 'Quintal'];
        const isStandard = standardUnits.some((u) => u.toLowerCase() === existingUnit.toLowerCase());
        if (isStandard) {
          setPurchaseUnit(existingUnit);
          setIsCustomUnit(false);
          setCustomUnit('');
        } else {
          setPurchaseUnit('custom');
          setIsCustomUnit(true);
          setCustomUnit(existingUnit);
        }
        setSpecialDetails(existing.specialDetails || '');

        // Normalize status
        if (existing.status === 'stock_alert' || existing.status === 'Out of Stock') {
          setStatus('Out of Stock');
        } else if (existing.status === 'discontinued' || existing.status === 'Discontinued') {
          setStatus('Discontinued');
        } else {
          setStatus('In Stock');
        }

        setProductCode(existing.code || existing.productCode || '');

        const img1 = existing.images?.[0] || existing.image1 || '';
        const img2 = existing.images?.[1] || existing.image2 || '';

        if (img1) setImage1({ file: null, preview: img1, name: 'Current Image 1' });
        if (img2) setImage2({ file: null, preview: img2, name: 'Current Image 2' });
      }
    }
  }, [isEditing, id, products, categories]);

  // Update product code preview when category changes in Add mode
  const handleCategoryChange = async (catName) => {
    setSelectedCategoryName(catName);
    if (!isEditing) {
      const targetCat = categories.find((c) => c.name === catName);
      if (targetCat) {
        if (isSupabaseMode) {
          const preview = await peekProductCodeForCategory(targetCat.code);
          setProductCode(preview || `RBB-${targetCat.code}-...`);
        } else {
          setProductCode(generateProductCodeForCategory(targetCat.code));
        }
      }
    }
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (image1.preview && image1.preview.startsWith('blob:')) {
        URL.revokeObjectURL(image1.preview);
      }
      if (image2.preview && image2.preview.startsWith('blob:')) {
        URL.revokeObjectURL(image2.preview);
      }
    };
  }, [image1.preview, image2.preview]);

  // Handle device file selection for images
  const handleFileChange = (slot, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type) && !file.type.startsWith('image/')) {
      setFormErrors((prev) => ({
        ...prev,
        images: 'Please select a supported image file (JPG, PNG, or WEBP).'
      }));
      return;
    }

    setFormErrors((prev) => ({ ...prev, images: '', image1: '' }));
    const previewUrl = URL.createObjectURL(file);

    if (slot === 1) {
      if (image1.preview && image1.preview.startsWith('blob:')) {
        URL.revokeObjectURL(image1.preview);
      }
      setImage1({ file, preview: previewUrl, name: file.name });
    } else {
      if (image2.preview && image2.preview.startsWith('blob:')) {
        URL.revokeObjectURL(image2.preview);
      }
      setImage2({ file, preview: previewUrl, name: file.name });
    }

    event.target.value = '';
  };

  // Remove image
  const handleRemoveImage = (slot) => {
    if (slot === 1) {
      if (image1.preview && image1.preview.startsWith('blob:')) {
        URL.revokeObjectURL(image1.preview);
      }
      setImage1({ file: null, preview: null, name: '' });
    } else {
      if (image2.preview && image2.preview.startsWith('blob:')) {
        URL.revokeObjectURL(image2.preview);
      }
      setImage2({ file: null, preview: null, name: '' });
    }
  };

  // Inline "+ Add New" Category callback
  const handleCategoryCreated = async (newCategory) => {
    setSelectedCategoryName(newCategory.name);
    if (isSupabaseMode) {
      const newCode = await peekProductCodeForCategory(newCategory.code);
      setProductCode(newCode || `RBB-${newCategory.code}-001`);
    } else {
      const newCode = generateProductCodeForCategory(newCategory.code);
      setProductCode(newCode);
    }
    showToast(`Category "${newCategory.name}" created and selected!`);
  };

  // QuickAdd modal handlers for Subcategory, Brand, Material, Size
  const handleOpenQuickAdd = (type) => {
    switch (type) {
      case 'subcategory':
        setQuickAddModal({
          isOpen: true,
          type,
          title: 'Add Sub-Category',
          label: 'Sub-Category Name',
          placeholder: 'e.g. Deep Frying Kadai, Dabbas'
        });
        break;
      case 'brand':
        setQuickAddModal({
          isOpen: true,
          type,
          title: 'Add New Brand',
          label: 'Brand Name',
          placeholder: 'e.g. Hawkins Contura, Vinod'
        });
        break;
      case 'material':
        setQuickAddModal({
          isOpen: true,
          type,
          title: 'Add New Material',
          label: 'Material Name',
          placeholder: 'e.g. Copper Tri-Ply, Bell Metal'
        });
        break;
      case 'size':
        setQuickAddModal({
          isOpen: true,
          type,
          title: 'Add Size / Capacity',
          label: 'Size / Capacity Specification',
          placeholder: 'e.g. 3.5 Litres (26 cm), 500g'
        });
        break;
      default:
        break;
    }
  };

  const handleQuickAddSubmit = (newVal) => {
    switch (quickAddModal.type) {
      case 'subcategory':
        addSubCategory(newVal);
        setSelectedSubCategory(newVal);
        showToast(`Sub-category "${newVal}" added!`);
        break;
      case 'brand':
        addBrand(newVal);
        setSelectedBrand(newVal);
        showToast(`Brand "${newVal}" added!`);
        break;
      case 'material':
        addMaterial(newVal);
        setSelectedMaterial(newVal);
        showToast(`Material "${newVal}" added!`);
        break;
      case 'size':
        addSize(newVal);
        setSelectedSize(newVal);
        showToast(`Size "${newVal}" added!`);
        break;
      default:
        break;
    }
  };

  // Inline validation check
  const validateForm = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = 'Product name is required.';
    }
    if (!selectedCategoryName) {
      errors.category = 'Please select a category.';
    }
    if (!image1.preview) {
      errors.image1 = 'Image 1 is required. Please choose a photo from your gallery.';
    }
    return errors;
  };

  // Form submit handler with complete Supabase integration & duplicate submission prevention
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submissions

    setTouched({ name: true, category: true, image1: true });
    setSubmitError(null);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      if (errors.name) {
        document.getElementById('product-name-input')?.focus();
      } else if (errors.image1) {
        document.getElementById('product-images-section')?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Check Supabase authentication and owner RLS requirements if in Supabase mode
    if (isSupabaseMode && (!authStatus?.isAuthenticated || !authStatus?.isOwner)) {
      setAuthModalOpen(true);
      setSubmitError(
        'Supabase RLS requires Owner Authentication to save products to the database. Please sign in as the designated owner.'
      );
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const targetCat = categories.find((c) => c.name === selectedCategoryName) || categories[0];
      const catCode = targetCat ? targetCat.code : 'CO';

      const imagesList = [image1.preview, image2.preview].filter(Boolean);

      const productPayload = {
        name: name.trim(),
        productName: name.trim(),
        categoryId: targetCat.id,
        categoryName: targetCat.name,
        category: targetCat.name,
        categoryCode: catCode,
        categoryDescription: targetCat.description || '',
        subCategory: selectedSubCategory.trim(),
        brand: selectedBrand.trim(),
        material: selectedMaterial.trim(),
        sizeCapacity: selectedSize.trim(),
        sizeOrCapacity: selectedSize.trim(),
        purchasePrice: purchasePrice ? Number(purchasePrice) : 0,
        purchaseUnit: (isCustomUnit ? customUnit : purchaseUnit).trim() || 'Piece',
        specialDetails: specialDetails.trim(),
        images: imagesList,
        image1: imagesList[0] || '',
        image2: imagesList[1] || '',
        status: status,
      };

      let savedProduct;
      if (isEditing) {
        updateProduct(id, productPayload);
        savedProduct = { id, ...productPayload };
        showToast('Product updated successfully!');
      } else {
        // In Add Product mode: pass image files for Supabase Storage bucket upload ('product-images')
        // and database-side atomic code generation (get_next_product_code)
        savedProduct = await addProduct(productPayload, {
          file1: image1.file,
          file2: image2.file,
        });

        if (isSupabaseMode) {
          showToast(`Product "${savedProduct.code}" saved to Supabase catalogue!`, 'success');
        } else {
          showToast(`Product "${savedProduct.code}" created successfully!`, 'success');
        }
      }

      setIsSubmitting(false);
      // Navigate to product details page on success
      navigate(`/products/${savedProduct.id}`);
    } catch (err) {
      console.error('[Product Save Error]', err);
      setIsSubmitting(false);
      const errorMsg = err.message || 'Failed to save product to database.';
      setSubmitError(errorMsg);
      showToast(errorMsg, 'error');
      // Scroll to error banner so user immediately sees what went wrong
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isFormValid = name.trim().length > 0 && selectedCategoryName && Boolean(image1.preview);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 active:text-slate-950 transition-colors py-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Active Mode Pill */}
          {isSupabaseMode ? (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border transition-colors ${
                authStatus?.isAuthenticated && authStatus?.isOwner
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>
                {authStatus?.isAuthenticated && authStatus?.isOwner
                  ? 'Supabase Mode (Owner)'
                  : 'Supabase Mode (Sign In)'}
              </span>
            </button>
          ) : (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>Offline Mode</span>
            </span>
          )}

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900 text-white border border-slate-900">
            {isEditing ? 'Edit' : 'Add New'}
          </span>
        </div>
      </div>

      {/* Supabase Authentication Alert Banner if not authenticated as Owner */}
      {isSupabaseMode && (!authStatus?.isAuthenticated || !authStatus?.isOwner) && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-amber-950">Owner Authentication Required</p>
              <p className="text-amber-800 mt-0.5">
                Supabase Row Level Security restricts catalogue modifications to the verified owner.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="shrink-0 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Sign In as Owner
          </button>
        </div>
      )}

      {/* Explicit Failure / Error Alert Banner */}
      {submitError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 shadow-xs flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-rose-950">Product Save Failed</p>
              <p className="text-rose-800 mt-0.5 leading-relaxed">{submitError}</p>
              <p className="text-[11px] text-rose-600 mt-1">
                Notice: The application will not silently fall back to local storage. Your entered form details are preserved below for retry.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            className="text-rose-400 hover:text-rose-700 text-xs font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Form Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="p-5 sm:p-7 border-b border-slate-100 bg-slate-50/40">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete the details below to list this item in your private RBB catalogue.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-7 space-y-8">
          {/* ========================================================================= */}
          {/* 1. Basic Information                                                      */}
          {/* ========================================================================= */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>1. Basic Information</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">* Required fields</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Product Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="product-name-input"
                  type="text"
                  required
                  placeholder="e.g. Tri-Ply Stainless Steel Deep Kadai"
                  value={name}
                  onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (formErrors.name) setFormErrors((p) => ({ ...p, name: '' }));
                  }}
                  className={`w-full px-4 py-3 text-sm rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all font-medium text-slate-900 placeholder:text-slate-400 ${
                    formErrors.name || (touched.name && !name.trim())
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/30'
                      : 'border-slate-200 focus:border-blue-600 focus:ring-blue-500/20'
                  }`}
                />
                {(formErrors.name || (touched.name && !name.trim())) && (
                  <p className="text-xs font-medium text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Please enter a product name.</span>
                  </p>
                )}
              </div>

              {/* Product Code (Read-only, Automated, Section 2) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Product Code
                  </label>
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Auto
                  </span>
                </div>

                <div className="h-11 px-3.5 flex items-center rounded-xl border border-slate-200 bg-slate-100/90 text-slate-800 select-none">
                  <span className="font-mono text-sm font-extrabold tracking-wider text-slate-900">
                    {productCode || 'RBB-??-001'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Sequential ID generated from category.
                </p>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 2. Classification                                                         */}
          {/* ========================================================================= */}
          <section className="space-y-4 pt-2">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                2. Classification
              </h2>
              <span className="text-[11px] text-blue-600 font-medium">Use + Add New to expand lists</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setCategoryModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 active:text-blue-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                </div>

                <select
                  value={selectedCategoryName}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name} ({cat.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-category */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Sub-category
                  </label>
                  <button
                    type="button"
                    onClick={() => handleOpenQuickAdd('subcategory')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 active:text-blue-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                </div>

                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
                >
                  <option value="">Select Sub-category...</option>
                  {subCategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Brand
                  </label>
                  <button
                    type="button"
                    onClick={() => handleOpenQuickAdd('brand')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 active:text-blue-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                </div>

                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
                >
                  <option value="">Select Brand...</option>
                  {brands.map((br) => (
                    <option key={br.id} value={br.name}>
                      {br.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Material */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Material
                  </label>
                  <button
                    type="button"
                    onClick={() => handleOpenQuickAdd('material')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 active:text-blue-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                </div>

                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
                >
                  <option value="">Select Material...</option>
                  {materials.map((mat) => (
                    <option key={mat.id} value={mat.name}>
                      {mat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 3. Product Details                                                        */}
          {/* ========================================================================= */}
          <section className="space-y-4 pt-2">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                3. Product Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Size / Capacity */}
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Size / Capacity
                  </label>
                  <button
                    type="button"
                    onClick={() => handleOpenQuickAdd('size')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 active:text-blue-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                </div>

                <div className="relative">
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
                  >
                    <option value="">Select or create size / capacity...</option>
                    {sizes.map((sz) => (
                      <option key={sz} value={sz}>
                        {sz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Purchase Price (₹) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Purchase Price (₹)
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                    ₹
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 1450"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Price Unit / दर प्रति इकाई */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Price Unit (दर इकाई)
                  </label>
                  <span className="text-[11px] font-semibold text-blue-600">
                    Per {isCustomUnit ? (customUnit || '...') : purchaseUnit}
                  </span>
                </div>

                <div className="space-y-2">
                  <select
                    value={isCustomUnit ? 'custom' : purchaseUnit}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'custom') {
                        setIsCustomUnit(true);
                      } else {
                        setIsCustomUnit(false);
                        setPurchaseUnit(val);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
                  >
                    <option value="Piece">Piece (प्रति पीस / pc)</option>
                    <option value="kg">kg (प्रति किलो / Kilogram)</option>
                    <option value="Dozen">Dozen (प्रति दर्जन / doz)</option>
                    <option value="Gram">Gram (प्रति ग्राम / g)</option>
                    <option value="Set">Set (प्रति सेट)</option>
                    <option value="Box">Box (प्रति बॉक्स / डिब्बा)</option>
                    <option value="Meter">Meter (प्रति मीटर / m)</option>
                    <option value="Quintal">Quintal (प्रति क्विंटल)</option>
                    <option value="custom">+ Other / Custom (खुद टाइप करें)...</option>
                  </select>

                  {/* Custom Unit Input if selected */}
                  {isCustomUnit && (
                    <input
                      type="text"
                      autoFocus
                      placeholder="Type custom unit (e.g. packet, bundle, pair)..."
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-blue-300 bg-blue-50/50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium placeholder:text-slate-400"
                    />
                  )}

                  {/* Quick-select chips */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-slate-400 font-medium">Quick:</span>
                    {['Piece', 'kg', 'Dozen', 'Set'].map((chip) => {
                      const isSelected = !isCustomUnit && purchaseUnit.toLowerCase() === chip.toLowerCase();
                      return (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => {
                            setIsCustomUnit(false);
                            setPurchaseUnit(chip);
                          }}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {chip}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Special Details */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Special Details / Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="Induction compatible, cast riveted handles, traditional kalai coating, packaging instructions..."
                  value={specialDetails}
                  onChange={(e) => setSpecialDetails(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 4. Images (Native File Picker / Gallery, No URLs)                         */}
          {/* ========================================================================= */}
          <section id="product-images-section" className="space-y-4 pt-2">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  4. Product Images
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select photos directly from your device gallery. Maximum 2 images.
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Max 2 Images
              </span>
            </div>

            {/* Hidden file inputs */}
            <input
              type="file"
              ref={fileInputRef1}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={(e) => handleFileChange(1, e)}
              className="hidden"
            />
            <input
              type="file"
              ref={fileInputRef2}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={(e) => handleFileChange(2, e)}
              className="hidden"
            />

            {/* Inline image validation error */}
            {formErrors.image1 && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formErrors.image1}</span>
              </div>
            )}

            {/* Two Upload Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* IMAGE 1 CARD (REQUIRED) */}
              <div className={`rounded-2xl border bg-white overflow-hidden shadow-xs flex flex-col transition-all ${
                formErrors.image1 ? 'border-rose-300 ring-2 ring-rose-500/20' : 'border-slate-200'
              }`}>
                <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Image 1</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    Required
                  </span>
                </div>

                {image1.preview ? (
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-4/3 flex items-center justify-center">
                      <img
                        src={image1.preview}
                        alt="Product preview 1"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Ready</span>
                      </div>
                    </div>

                    {image1.name && (
                      <p className="text-[11px] text-slate-500 truncate mt-2 px-1">
                        {image1.name}
                      </p>
                    )}

                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef1.current?.click()}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors active:bg-slate-100"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Change</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(1)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors active:bg-rose-100"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef1.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && fileInputRef1.current?.click()}
                    className="p-6 flex-1 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50/40 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-b-2xl transition-all group m-3"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center mb-3 transition-colors">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Add Image 1 *
                    </span>
                    <span className="text-xs text-slate-500 mt-1">
                      Choose from device gallery or files
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      JPG, PNG, WEBP
                    </span>
                  </div>
                )}
              </div>

              {/* IMAGE 2 CARD (OPTIONAL) */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col">
                <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Image 2</span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    Optional
                  </span>
                </div>

                {image2.preview ? (
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-4/3 flex items-center justify-center">
                      <img
                        src={image2.preview}
                        alt="Product preview 2"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Ready</span>
                      </div>
                    </div>

                    {image2.name && (
                      <p className="text-[11px] text-slate-500 truncate mt-2 px-1">
                        {image2.name}
                      </p>
                    )}

                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef2.current?.click()}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors active:bg-slate-100"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Change</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(2)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors active:bg-rose-100"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef2.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && fileInputRef2.current?.click()}
                    className="p-6 flex-1 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50/40 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-b-2xl transition-all group m-3"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-slate-500 group-hover:text-blue-600 flex items-center justify-center mb-3 transition-colors">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Add Image 2
                    </span>
                    <span className="text-xs text-slate-500 mt-1">
                      Choose secondary view or packaging
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      Optional
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 5. Status                                                                 */}
          {/* ========================================================================= */}
          <section className="space-y-4 pt-2">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                5. Catalogue Status
              </h2>
            </div>

            {/* Mobile-friendly Segmented Control */}
            <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80">
              {[
                { id: 'In Stock', label: 'In Stock', color: 'text-emerald-700' },
                { id: 'Out of Stock', label: 'Out of Stock', color: 'text-amber-700' },
                { id: 'Discontinued', label: 'Discontinued', color: 'text-slate-600' }
              ].map((opt) => {
                const isSelected = status === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStatus(opt.id)}
                    className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-center ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 6. Form Actions                                                           */}
          {/* ========================================================================= */}
          <section className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 sticky bottom-0 bg-white/95 backdrop-blur-xs py-3 -mx-5 sm:-mx-7 px-5 sm:px-7 z-20">
            <button
              type="button"
              onClick={() => navigate('/products')}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors text-center active:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold text-sm shadow-xs transition-all active:scale-[0.99] text-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Product...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Save Changes' : 'Save Product'}</span>
                </>
              )}
            </button>
          </section>
        </form>
      </div>

      {/* Dynamic Inline Category Modal */}
      <CategoryModal
        isOpen={categoryModalOpen}
        mode="add"
        onClose={() => setCategoryModalOpen(false)}
        onSuccess={handleCategoryCreated}
      />

      {/* Dynamic Inline QuickAdd Modal for Subcategory, Brand, Material, Size */}
      <QuickAddModal
        isOpen={quickAddModal.isOpen}
        title={quickAddModal.title}
        label={quickAddModal.label}
        placeholder={quickAddModal.placeholder}
        onClose={() => setQuickAddModal((p) => ({ ...p, isOpen: false }))}
        onSubmit={handleQuickAddSubmit}
      />

      {/* Supabase Owner Authentication Modal */}
      <OwnerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        authStatus={authStatus}
        onAuthChanged={refreshAuthStatus}
      />
    </div>
  );
}
