import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { productService } from '../../../shared/lib/services';
import { X, ShoppingBag, Upload, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

function CustomSelect({ value, onChange, options, placeholder = 'Select Option', className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a1a3e] text-slate-800 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 transition-all flex items-center justify-between cursor-pointer"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#13132e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-all ${isActive
                    ? 'bg-orange-500 text-white dark:bg-orange-600'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400'
                  }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProductFormModal({ isOpen, product, categories, onClose, onUpdate }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [unitValue, setUnitValue] = useState('');
  const [unitType, setUnitType] = useState('Kg');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('In Stock');
  const [image, setImage] = useState('');

  // File upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const isEdit = !!product;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isEdit) {
        setName(product.name || '');
        setCategory(product.category || '');
        setPrice(product.price || '');
        setMrp(product.mrp || '');
        if (product.unit) {
          const rawUnit = product.unit.trim();
          const match = rawUnit.match(/^([\d.,/]+)\s*(.*)$/i);
          if (match) {
            setUnitValue(match[1]);
            setUnitType(match[2] || 'Kg');
          } else {
            setUnitValue(rawUnit);
            setUnitType('Kg');
          }
        } else {
          setUnitValue('');
          setUnitType('Kg');
        }
        setDescription(product.description || '');
        setStatus(product.status || 'In Stock');
        setImage(product.image || '');
        setImagePreview(product.image || null);
      } else {
        setName('');
        setCategory(categories[0]?.name || '');
        setPrice('');
        setMrp('');
        setUnitValue('');
        setUnitType('Kg');
        setDescription('');
        setStatus('In Stock');
        setImage('');
        setImagePreview(null);
      }
      setImageFile(null);
    }, 0);
    return () => clearTimeout(timer);
  }, [product, isEdit, categories]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Product name is required');
    if (!category) return toast.error('Please select a category');
    if (!price || Number(price) <= 0) return toast.error('Valid price is required');
    const combinedUnit = `${unitValue.trim()} ${unitType}`.trim();
    if (!combinedUnit) return toast.error('Unit Weight/Size is required');

    setLoading(true);
    const productData = {
      name: name.trim(),
      category,
      price: Number(price),
      mrp: mrp ? Number(mrp) : '',
      unit: combinedUnit,
      description: description.trim(),
      status,
      image
    };

    try {
      if (isEdit) {
        await productService.updateProduct(product.id, productData, imageFile);
        toast.success('Product updated successfully');
      } else {
        await productService.addProduct(productData, imageFile);
        toast.success('Product added successfully');
      }
      onUpdate();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white dark:bg-[#13132e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl animate-scale-up z-10 overflow-y-auto max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/40 mb-6">
          <div className="flex items-center gap-2 text-orange-500">
            <ShoppingBag className="w-5 h-5" />
            <h3 className="text-lg font-black text-slate-800 dark:text-white">
              {isEdit ? 'Modify Product Details' : 'Add New Product'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left Side: General Fields */}
          <div className="space-y-4">
            {/* Product Name */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">Product Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fresh Sugar, Organic Rice"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a1a3e] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-sm font-semibold transition-all"
                required
              />
            </div>

            {/* Category selection */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">Product Category *</label>
              <CustomSelect
                value={category}
                onChange={setCategory}
                options={categories.map(cat => ({ value: cat.name, label: cat.name }))}
                placeholder="Choose category"
              />
            </div>

            {/* Pricing group */}
            <div className="grid grid-cols-2 gap-4">
              {/* Selling Price */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">Price (₹) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="₹50"
                  min="0.1"
                  step="any"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a1a3e] text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-sm font-semibold transition-all"
                  required
                />
              </div>

              {/* MRP */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">MRP (₹)</label>
                <input
                  type="number"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  placeholder="₹55"
                  min="0"
                  step="any"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a1a3e] text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-sm font-semibold transition-all"
                />
              </div>
            </div>

            {/* Unit size */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">Unit Weight/Size *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={unitValue}
                  onChange={(e) => setUnitValue(e.target.value)}
                  placeholder="e.g. 1, 500, 250"
                  className="w-2/3 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a1a3e] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-sm font-semibold transition-all"
                  required
                />
                <CustomSelect
                  value={unitType}
                  onChange={setUnitType}
                  options={[
                    { value: 'Kg', label: 'Kg' },
                    { value: 'g', label: 'g' },
                    { value: 'L', label: 'L' },
                    { value: 'ml', label: 'ml' },
                    { value: 'Pack', label: 'Pack' },
                    { value: 'Piece', label: 'Piece' },
                    { value: 'Dozen', label: 'Dozen' },
                    { value: 'Bunch', label: 'Bunch' },
                  ]}
                  className="w-1/3"
                />
              </div>
            </div>
          </div>

          {/* Right Side: Image Upload & Details */}
          <div className="space-y-4">
            {/* Image Upload box */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">Product Image</label>

              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-4 bg-slate-50/20 dark:bg-[#1a1a3e]/10 relative h-36">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-cover rounded-[1.3rem] opacity-40 dark:opacity-20"
                    />
                    <div className="z-10 flex flex-col items-center gap-2">
                      <img src={imagePreview} alt="Thumbnail" className="w-16 h-16 object-cover rounded-xl shadow-md border border-white dark:border-slate-800" />
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Click to change photo</span>
                    </div>
                  </>
                ) : (
                  <div className="z-10 flex flex-col items-center text-slate-400">
                    <Upload className="w-8 h-8 mb-2 text-slate-300 dark:text-slate-700" />
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Upload Product Image</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">PNG, JPG or WEBP format</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product properties, expiry date, brand notes..."
                rows="4"
                className="w-full px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a1a3e] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-sm font-semibold transition-all resize-none"
              />
            </div>

            {/* Stock status */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">Availability Status</label>
              <CustomSelect
                value={status}
                onChange={setStatus}
                options={[
                  { value: 'In Stock', label: 'In Stock' },
                  { value: 'Out of Stock', label: 'Out of Stock' }
                ]}
              />
            </div>
          </div>

          {/* Actions - Span Full Column */}
          <div className="md:col-span-2 flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800/40 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-600/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {isEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
