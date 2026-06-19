import { useState, useEffect } from 'react';
import { categoryService } from '../../../shared/lib/services';
import { Search, Plus, Trash2, Edit3, Image as ImageIcon } from 'lucide-react';
import CategoryFormModal from './CategoryFormModal';
import ConfirmationModal from '../../../shared/components/ui/ConfirmationModal';
import toast from 'react-hot-toast';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      toast.error('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCategories();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await categoryService.deleteCategory(deleteId);
      toast.success('Category removed successfully');
      loadCategories();
    } catch (err) {
      toast.error('Failed to delete category');
      console.error(err);
    } finally {
      setDeleteId(null);
    }
  };

  // Search filter
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-[#13132e] border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search categories..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a1a3e] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-sm font-semibold transition-all"
          />
        </div>

        {/* Create action */}
        <button
          onClick={() => {
            setSelectedCategory(null);
            setFormOpen(true);
          }}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white dark:bg-[#13132e] border border-slate-200/60 dark:border-slate-800/80 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : paginatedCategories.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#13132e] border border-slate-200/60 dark:border-slate-800/80 rounded-[2.5rem]">
          <ImageIcon className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">No Categories Found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Try refining your search query or add a brand new category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedCategories.map((cat) => (
            <div 
              key={cat.id} 
              className="bg-white dark:bg-[#13132e] border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col h-full"
            >
              {/* Category Image Cover */}
              <div className="h-40 relative bg-slate-100 dark:bg-[#1a1a3e] overflow-hidden">
                <img 
                  src={cat.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                <h3 className="absolute bottom-4 left-4 text-lg font-black text-white">{cat.name}</h3>
              </div>

              {/* Description & Details */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {cat.description || 'No description available for this category.'}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                  <button
                    onClick={() => {
                      setSelectedCategory(cat);
                      setFormOpen(true);
                    }}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-center"
                    title="Edit Category"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(cat.id)}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-500 hover:text-red-600 flex items-center justify-center"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none font-semibold text-sm transition-all"
          >
            Prev
          </button>
          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none font-semibold text-sm transition-all"
          >
            Next
          </button>
        </div>
      )}

      {/* Category CRUD Modal */}
      {formOpen && (
        <CategoryFormModal
          isOpen={formOpen}
          category={selectedCategory}
          onClose={() => setFormOpen(false)}
          onUpdate={loadCategories}
        />
      )}

      {/* Delete Confirmation Overlay */}
      {deleteId && (
        <ConfirmationModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Category"
          message="Are you sure you want to delete this category? Removing it does not delete products within it, but the category category will disappear from product tags."
        />
      )}
    </div>
  );
}
