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
  Database,
  Camera
} from 'lucide-react';
import { useCatalogue } from '../context/CatalogueContext';
import CategoryModal from '../components/categories/CategoryModal';
import QuickAddModal from '../components/common/QuickAddModal';
import OwnerAuthModal from '../components/common/OwnerAuthModal';
import CameraCaptureModal from '../components/common/CameraCaptureModal';

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

  // Hidden native file input references (gallery & instant mobile camera)
  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);
  const cameraInputRef1 = useRef(null);
  const cameraInputRef2 = useRef(null);

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
  const [cameraModalState, setCameraModalState] = useState({ isOpen: false, slot: 1 });

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

  // Compress / normalize large or camera-captured images to ensure smooth upload (< 5MB JPG/PNG/WEBP)
  const prepareImageFile = async (file) => {
    const allowedDirectTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const isAllowedType = allowedDirectTypes.includes(file.type?.toLowerCase());
    const maxDirectBytes = 3.5 * 1024 * 1024;

    if (isAllowedType && file.size <= maxDirectBytes) {
      return file;
    }

    try {
      const objectUrl = URL.createObjectURL(file);
      const img = await new Promise((resolve, reject) => {
        const imageEl = new Image();
        imageEl.onload = () => resolve(imageEl);
        imageEl.onerror = reject;
        imageEl.src = objectUrl;
      });
      URL.revokeObjectURL(objectUrl);

      const maxDim = 1600;
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.86)
      );

      if (!blob) return file;
      const baseName = (file.name || 'product-photo').replace(/\.[^.]+$/, '');
      return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
    } catch {
      return file;
    }
  };

  // Apply selected or captured image file to slot 1 or 2
  const processImageFile = async (slot, rawFile) => {
    if (!rawFile) return;

    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const looksLikeImageByName = /\.(jpe?g|png|webp|heic|heif)$/i.test(rawFile.name || '');
    if (!validMimes.includes(rawFile.type) && !rawFile.type?.startsWith('image/') && !looksLikeImageByName) {
      setFormErrors((prev) => ({
        ...prev,
        images: 'Please select a supported image file (JPG, PNG, or WEBP).'
      }));
      return;
    }

    const file = await prepareImageFile(rawFile);
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
  };

  // Handle device file / camera input selection for images
  const handleFileChange = async (slot, event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    await processImageFile(slot, file);
  };

  // Open camera immediately (native camera on mobile, live webcam capture modal on desktop)
  const handleOpenCamera = (slot) => {
    const isMobile =
      typeof navigator !== 'undefined' &&
      (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent)));

    if (isMobile) {
      if (slot === 1) {
        cameraInputRef1.current?.click();
      } else {
        cameraInputRef2.current?.click();
      }
    } else {
      setCameraModalState({ isOpen: true, slot });
    }
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
    if (!newCategory?.name) return;
    setSelectedCategoryName(newCategory.name);
    try {
      if (isSupabaseMode) {
        const newCode = await peekProductCodeForCategory(newCategory.code);
        setProductCode(newCode || `RBB-${newCategory.code || 'GN'}-001`);
      } else {
        const newCode = generateProductCodeForCategory(newCategory.code);
        setProductCode(newCode);
      }
    } catch {
      setProductCode(`RBB-${newCategory.code || 'GN'}-001`);
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
      const catCode = targetCat ? targetCat.code : 'GN';

      const imagesList = [image1.preview, image2.preview].filter(Boolean);

      const productPayload = {
        name: name.trim(),
        productName: name.trim(),
        categoryId: targetCat?.id || null,
        categoryName: targetCat?.name || selectedCategoryName || '',
        category: targetCat?.name || selectedCategoryName || '',
        categoryCode: catCode,
        categoryDescription: targetCat?.description || '',
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
        savedProduct = await updateProduct(
          id,
          { ...productPayload, code: productCode, productCode },
          { file1: image1.file, file2: image2.file }
        );
        if (!savedProduct) {
          savedProduct = { id, ...productPayload };
        }
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
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#555B58] hover:text-[#9A7120] transition-colors py-1.5 cursor-pointer"
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
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                authStatus?.isAuthenticated && authStatus?.isOwner
                  ? 'bg-[#EDF5F1] text-[#173F35] border-[#173F35]/25 hover:border-[#D4A64A]'
                  : 'bg-[#FBF5E6] text-[#8E6518] border-[#D4A64A]/60 hover:bg-[#F7EED4]'
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
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#555B58] border border-[#E6DFCE] flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-[#6F7571]" />
              <span>Offline Mode</span>
            </span>
          )}

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#173F35] text-[#F4D58D] border border-[#D4A64A]/40">
            {isEditing ? 'Edit' : 'Add New'}
          </span>
        </div>
      </div>

      {/* Supabase Authentication Alert Banner if not authenticated as Owner */}
      {isSupabaseMode && (!authStatus?.isAuthenticated || !authStatus?.isOwner) && (
        <div className="p-4 rounded-2xl bg-[#FBF5E6] border border-[#D4A64A]/60 text-[#292D2B] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-[#9A7120] shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-[#292D2B]">Owner Authentication Required</p>
              <p className="text-[#555B58] mt-0.5">
                Supabase Row Level Security restricts catalogue modifications to the verified owner.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="shrink-0 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#C29236] hover:from-[#DFB359] hover:to-[#CE9D3E] text-[#173F35] font-bold text-xs shadow-xs transition-all cursor-pointer"
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
      <div className="bg-white rounded-2xl border border-[#E6DFCE] shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="p-5 sm:p-7 border-b border-[#EFE9DA] bg-gradient-to-r from-[#FBF8F1] via-white to-[#F7F3EA]/70">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#292D2B] tracking-tight">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-xs sm:text-sm text-[#555B58] mt-1">
            Complete the details below to list this item in your private RBB catalogue.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-7 space-y-8">
          {/* ========================================================================= */}
          {/* 1. Basic Information                                                      */}
          {/* ========================================================================= */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#EFE9DA] pb-2">
              <h2 className="text-xs font-bold text-[#6F7571] uppercase tracking-wider flex items-center gap-1.5">
                <span>1. Basic Information</span>
              </h2>
              <span className="text-[11px] text-[#6F7571] font-medium">* Required fields</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Product Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-[#292D2B]">
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
                  className={`w-full px-4 py-3 text-sm rounded-xl border bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-2 transition-all font-medium text-[#292D2B] placeholder:text-[#7D827E] ${
                    formErrors.name || (touched.name && !name.trim())
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/30'
                      : 'border-[#E6DFCE] focus:border-[#D4A64A] focus:ring-[#D4A64A]/25'
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
                  <label className="block text-xs font-bold text-[#292D2B]">
                    Product Code
                  </label>
                  <span className="text-[10px] uppercase font-bold text-[#6F7571] flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Auto
                  </span>
                </div>

                <div className="h-11 px-3.5 flex items-center rounded-xl border border-[#D4A64A]/50 bg-[#FBF5E6] text-[#173F35] select-none">
                  <span className="font-mono text-sm font-extrabold tracking-wider text-[#173F35]">
                    {productCode || 'RBB-??-001'}
                  </span>
                </div>
                <p className="text-[11px] text-[#6F7571]">
                  Sequential ID generated from category.
                </p>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 2. Classification                                                         */}
          {/* ========================================================================= */}
          <section className="space-y-4 pt-2">
            <div className="border-b border-[#EFE9DA] pb-2 flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#6F7571] uppercase tracking-wider">
                2. Classification
              </h2>
              <span className="text-[11px] text-[#9A7120] font-semibold">Use + Add New to expand lists</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#292D2B]">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setCategoryModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#173F35] hover:text-[#9A7120] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                </div>

                <select
                  value={selectedCategoryName}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E6DFCE] bg-white font-medium text-[#292D2B] focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/25 focus:border-[#D4A64A] transition-all cursor-pointer"
                >
                  {categories.length === 0 ? (
                    <option value="" disabled>
                      No categories yet — click '+ Add New' above
                    </option>
                  ) : (
                    <>
                      {!selectedCategoryName && (
                        <option value="" disabled>
                          Select a category
                        </option>
                      )}
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name} ({cat.code})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Sub-category */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#292D2B]">
                    Sub-category
                  </label>
                  <button
                    type="button"
                    onClick={() => handleOpenQuickAdd('subcategory')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#173F35] hover:text-[#9A7120] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                </div>

                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E6DFCE] bg-white font-medium text-[#292D2B] focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/25 focus:border-[#D4A64A] transition-all cursor-pointer"
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
                  <label className="block text-xs font-bold text-[#292D2B]">
                    Brand
                  </label>
                  <button
                    type="button"
                    onClick={() => handleOpenQuickAdd('brand')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#173F35] hover:text-[#9A7120] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                </div>

                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E6DFCE] bg-white font-medium text-[#292D2B] focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/25 focus:border-[#D4A64A] transition-all cursor-pointer"
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
                  <label className="block text-xs font-bold text-[#292D2B]">
                    Material
                  </label>
                  <button
                    type="button"
                    onClick={() => handleOpenQuickAdd('material')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#173F35] hover:text-[#9A7120] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                </div>

                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E6DFCE] bg-white font-medium text-[#292D2B] focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/25 focus:border-[#D4A64A] transition-all cursor-pointer"
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
            <div className="border-b border-[#EFE9DA] pb-2">
              <h2 className="text-xs font-bold text-[#6F7571] uppercase tracking-wider">
                3. Product Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Size / Capacity */}
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#292D2B]">
                    Size / Capacity
                  </label>
                  <button
                    type="button"
                    onClick={() => handleOpenQuickAdd('size')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#173F35] hover:text-[#9A7120] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                </div>

                <div className="relative">
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E6DFCE] bg-white font-medium text-[#292D2B] focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/25 focus:border-[#D4A64A] transition-all cursor-pointer"
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
                <label className="block text-xs font-bold text-[#292D2B]">
                  Purchase Price (₹)
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F7571] font-semibold text-sm">
                    ₹
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 1450"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 text-sm rounded-xl border border-[#E6DFCE] bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/25 focus:border-[#D4A64A] transition-all font-medium text-[#292D2B] placeholder:text-[#7D827E]"
                  />
                </div>
              </div>

              {/* Price Unit / दर प्रति इकाई */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#292D2B]">
                    Price Unit (दर इकाई)
                  </label>
                  <span className="text-[11px] font-semibold text-[#9A7120]">
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
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E6DFCE] bg-white font-medium text-[#292D2B] focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/25 focus:border-[#D4A64A] transition-all cursor-pointer"
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
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D4A64A] bg-[#FBF5E6]/70 text-[#292D2B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/30 transition-all font-medium placeholder:text-[#7D827E]"
                    />
                  )}

                  {/* Quick-select chips */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-[#6F7571] font-medium">Quick:</span>
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
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#D4A64A] to-[#C29236] text-[#173F35] shadow-2xs'
                              : 'bg-[#F3EFE4] text-[#555B58] hover:bg-[#FBF5E6] hover:text-[#173F35]'
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
                <label className="block text-xs font-bold text-[#292D2B]">
                  Special Details / Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="Induction compatible, cast riveted handles, traditional kalai coating, packaging instructions..."
                  value={specialDetails}
                  onChange={(e) => setSpecialDetails(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E6DFCE] bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A64A]/25 focus:border-[#D4A64A] transition-all font-medium text-[#292D2B] placeholder:text-[#7D827E]"
                />
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 4. Images (Device Gallery + Instant Camera Capture)                       */}
          {/* ========================================================================= */}
          <section id="product-images-section" className="space-y-4 pt-2">
            <div className="border-b border-[#EFE9DA] pb-2 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-[#6F7571] uppercase tracking-wider">
                  4. Product Images
                </h2>
                <p className="text-xs text-[#555B58] mt-0.5">
                  Upload from gallery or capture directly with camera. Maximum 2 images.
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#FAF7F0] border border-[#E6DFCE] text-[#555B58]">
                Max 2 Images
              </span>
            </div>

            {/* Hidden gallery file inputs */}
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

            {/* Hidden instant camera inputs for mobile devices */}
            <input
              type="file"
              ref={cameraInputRef1}
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileChange(1, e)}
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef2}
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileChange(2, e)}
              className="hidden"
            />

            {/* Inline image validation error */}
            {(formErrors.image1 || formErrors.images) && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formErrors.image1 || formErrors.images}</span>
              </div>
            )}

            {/* Two Upload Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* IMAGE 1 CARD (REQUIRED) */}
              <div className={`rounded-2xl border bg-white overflow-hidden shadow-xs flex flex-col transition-all ${
                formErrors.image1 ? 'border-rose-300 ring-2 ring-rose-500/20' : 'border-[#E6DFCE] hover:border-[#D4A64A]'
              }`}>
                <div className="px-4 py-2.5 bg-[#FAF7F0] border-b border-[#EFE9DA] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#292D2B]">Image 1</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    Required
                  </span>
                </div>

                {image1.preview ? (
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="relative rounded-xl overflow-hidden border border-[#E6DFCE] bg-[#FAF7F0] aspect-4/3 flex items-center justify-center">
                      <img
                        src={image1.preview}
                        alt="Product preview 1"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-[#173F35]/90 text-[#F7F3EA] text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#D4A64A]" />
                        <span>Ready</span>
                      </div>
                    </div>

                    {image1.name && (
                      <p className="text-[11px] text-[#555B58] truncate mt-2 px-1">
                        {image1.name}
                      </p>
                    )}

                    <div className="mt-3 pt-3 border-t border-[#EFE9DA] grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef1.current?.click()}
                        className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl border border-[#E6DFCE] hover:border-[#D4A64A] hover:bg-[#FCF9F2] text-[#292D2B] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#555B58] shrink-0" />
                        <span>Gallery</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenCamera(1)}
                        className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl border border-[#D4A64A]/60 bg-[#FBF5E6] hover:bg-[#F5E8C8] text-[#173F35] text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#173F35] shrink-0" />
                        <span>Camera</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(1)}
                        className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-[#DED6C3] rounded-b-2xl m-3 bg-[#FAF7F0]/60">
                    <div className="w-12 h-12 rounded-xl bg-[#FBF5E6] text-[#9A7120] border border-[#D4A64A]/40 flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-[#292D2B]">
                      Add Image 1 *
                    </span>
                    <span className="text-xs text-[#555B58] mt-1">
                      Upload from gallery or capture with camera
                    </span>
                    <span className="text-[11px] text-[#6F7571] mt-0.5 mb-4">
                      JPG, PNG, WEBP
                    </span>

                    <div className="w-full grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef1.current?.click()}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#E6DFCE] bg-white hover:border-[#D4A64A] hover:bg-[#FCF9F2] text-[#292D2B] text-xs font-bold shadow-2xs transition-all cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-[#555B58] shrink-0" />
                        <span>Gallery</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenCamera(1)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#C29236] hover:from-[#DFB359] hover:to-[#CE9D3E] text-[#173F35] text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <Camera className="w-4 h-4 shrink-0" />
                        <span>Camera</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* IMAGE 2 CARD (OPTIONAL) */}
              <div className="rounded-2xl border border-[#E6DFCE] hover:border-[#D4A64A] bg-white overflow-hidden shadow-xs flex flex-col transition-all">
                <div className="px-4 py-2.5 bg-[#FAF7F0] border-b border-[#EFE9DA] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#292D2B]">Image 2</span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white text-[#555B58] border border-[#E6DFCE]">
                    Optional
                  </span>
                </div>

                {image2.preview ? (
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="relative rounded-xl overflow-hidden border border-[#E6DFCE] bg-[#FAF7F0] aspect-4/3 flex items-center justify-center">
                      <img
                        src={image2.preview}
                        alt="Product preview 2"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-[#173F35]/90 text-[#F7F3EA] text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#D4A64A]" />
                        <span>Ready</span>
                      </div>
                    </div>

                    {image2.name && (
                      <p className="text-[11px] text-[#555B58] truncate mt-2 px-1">
                        {image2.name}
                      </p>
                    )}

                    <div className="mt-3 pt-3 border-t border-[#EFE9DA] grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef2.current?.click()}
                        className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl border border-[#E6DFCE] hover:border-[#D4A64A] hover:bg-[#FCF9F2] text-[#292D2B] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#555B58] shrink-0" />
                        <span>Gallery</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenCamera(2)}
                        className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl border border-[#D4A64A]/60 bg-[#FBF5E6] hover:bg-[#F5E8C8] text-[#173F35] text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#173F35] shrink-0" />
                        <span>Camera</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(2)}
                        className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-[#DED6C3] rounded-b-2xl m-3 bg-[#FAF7F0]/60">
                    <div className="w-12 h-12 rounded-xl bg-white border border-[#E6DFCE] text-[#6F7571] flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-[#292D2B]">
                      Add Image 2
                    </span>
                    <span className="text-xs text-[#555B58] mt-1">
                      Secondary view or packaging photo
                    </span>
                    <span className="text-[11px] text-[#6F7571] mt-0.5 mb-4">
                      Optional
                    </span>

                    <div className="w-full grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef2.current?.click()}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#E6DFCE] bg-white hover:border-[#D4A64A] hover:bg-[#FCF9F2] text-[#292D2B] text-xs font-bold shadow-2xs transition-all cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-[#555B58] shrink-0" />
                        <span>Gallery</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenCamera(2)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#C29236] hover:from-[#DFB359] hover:to-[#CE9D3E] text-[#173F35] text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <Camera className="w-4 h-4 shrink-0" />
                        <span>Camera</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 5. Status                                                                 */}
          {/* ========================================================================= */}
          <section className="space-y-4 pt-2">
            <div className="border-b border-[#EFE9DA] pb-2">
              <h2 className="text-xs font-bold text-[#6F7571] uppercase tracking-wider">
                5. Catalogue Status
              </h2>
            </div>

            {/* Mobile-friendly Segmented Control */}
            <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#FAF7F0] border border-[#E6DFCE]">
              {[
                { id: 'In Stock', label: 'In Stock' },
                { id: 'Out of Stock', label: 'Out of Stock' },
                { id: 'Discontinued', label: 'Discontinued' }
              ].map((opt) => {
                const isSelected = status === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStatus(opt.id)}
                    className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-center cursor-pointer ${
                      isSelected
                        ? 'bg-[#173F35] text-[#F4D58D] shadow-sm border border-[#D4A64A]/40'
                        : 'text-[#555B58] hover:text-[#292D2B] hover:bg-white hover:border-[#D4A64A]/40'
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
          <section className="pt-6 border-t border-[#EFE9DA] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 sticky bottom-0 bg-white/95 backdrop-blur-xs py-3 -mx-5 sm:-mx-7 px-5 sm:px-7 z-20">
            <button
              type="button"
              onClick={() => navigate('/products')}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#E6DFCE] text-[#292D2B] hover:border-[#D4A64A] hover:bg-[#FCF9F2] font-semibold text-sm transition-colors text-center cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#C29236] hover:from-[#DFB359] hover:to-[#CE9D3E] disabled:opacity-50 text-[#173F35] font-bold text-sm shadow-md shadow-[#173F35]/15 transition-all active:scale-[0.99] text-center whitespace-nowrap shrink-0 cursor-pointer"
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

      {/* Live Camera Capture Modal (for desktop / webcam browsers) */}
      <CameraCaptureModal
        isOpen={cameraModalState.isOpen}
        slot={cameraModalState.slot}
        onClose={() => setCameraModalState((prev) => ({ ...prev, isOpen: false }))}
        onCapture={(capturedFile) => processImageFile(cameraModalState.slot, capturedFile)}
        onFallbackToGallery={() => {
          if (cameraModalState.slot === 1) {
            fileInputRef1.current?.click();
          } else {
            fileInputRef2.current?.click();
          }
        }}
      />
    </div>
  );
}
