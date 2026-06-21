import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { categoryService } from '../../../shared/lib/services';
import { X, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoryFormModal({ isOpen, category, onClose, onUpdate }) {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const isEdit = !!category;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isEdit) {
        setName(category.name || '');
        setImage(category.image || '');
        setImagePreview(category.image || '');
        setDescription(category.description || '');
      } else {
        setName('');
        setImage('');
        setImageFile(null);
        setImagePreview('');
        setDescription('');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [category, isEdit]);

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
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setLoading(true);
    const categoryData = {
      name: name.trim(),
      image: image.trim(),
      description: description.trim(),
    };

    try {
      if (isEdit) {
        await categoryService.updateCategory(category.id, categoryData, imageFile);
        toast.success('Category updated successfully');
      } else {
        await categoryService.addCategory(categoryData, imageFile);
        toast.success('Category added successfully');
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
      <div className="relative bg-white dark:bg-[#13132e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-scale-up z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/40 mb-6">
          <div className="flex items-center gap-2 text-orange-500">
            <Layers className="w-5 h-5" />
            <h3 className="text-lg font-black text-slate-800 dark:text-white">
              {isEdit ? 'Modify Category' : 'Create New Category'}
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
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Category Name */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">Category Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Groceries, Ice Cream, Beverages"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a1a3e] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-sm font-semibold transition-all"
              required
            />
          </div>

          {/* Category Image Upload */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">Category Image *</label>
            <div className="flex flex-col gap-3">
              {imagePreview && (
                <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="relative">
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                  id="category-image"
                />
                <label 
                  htmlFor="category-image"
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a1a3e] text-slate-400 dark:text-slate-600 hover:border-orange-500 hover:text-orange-500 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm font-bold"
                >
                  <X className="w-4 h-4 rotate-45" /> {imagePreview ? 'Change Image' : 'Upload Image'}
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">Brief Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the type of products in this category..."
              rows="3"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a1a3e] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-sm font-semibold transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800/40 mt-8">
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
              {isEdit ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
