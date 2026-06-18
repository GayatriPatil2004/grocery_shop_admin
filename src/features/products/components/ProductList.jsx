import { useState, useEffect } from 'react';
import { productService, categoryService } from '../../../shared/lib/services';
import { Search, Plus, Trash2, Edit3, EyeOff, ShoppingBag, Eye, ChevronDown } from 'lucide-react';
import ProductFormModal from './ProductFormModal';
import ConfirmationModal from '../../../shared/components/ui/ConfirmationModal';
import toast from 'react-hot-toast';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodData, catData] = await Promise.all([
        productService.getProducts(),
        categoryService.getCategories()
      ]);
      setProducts(prodData);
      setCategories(catData);
    } catch (err) {
      toast.error('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await productService.deleteProduct(deleteId);
      toast.success('Product deleted successfully');
      loadData();
    } catch (err) {
      toast.error('Failed to delete product');
      console.error(err);
    } finally {
      setDeleteId(null);
    }
  };

  const handleStockToggle = async (prod) => {
    const updatedStatus = prod.status === 'In Stock' ? 'Out of Stock' : 'In Stock';
    try {
      await productService.updateProduct(prod.id, { ...prod, status: updatedStatus });
      toast.success(`${prod.name} marked as ${updatedStatus}`);
      loadData();
    } catch (err) {
      toast.error('Failed to update availability');
      console.error(err);
    }
  };

  // Search & Filter
  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategoryFilter || prod.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top Filter and Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-[#13132e] border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
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
              placeholder="Search products..."
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a1a3e] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-sm font-semibold transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="relative w-full sm:w-48">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a1a3e] text-slate-700 dark:text-slate-300 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 transition-all flex items-center justify-between cursor-pointer"
            >
              <span>{selectedCategoryFilter || 'All Categories'}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsDropdownOpen(false)} 
                />
                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#13132e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryFilter('');
                      setCurrentPage(1);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-all ${
                      selectedCategoryFilter === '' 
                        ? 'bg-orange-500 text-white dark:bg-orange-600' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryFilter(cat.name);
                        setCurrentPage(1);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-all ${
                        selectedCategoryFilter === cat.name 
                          ? 'bg-orange-500 text-white dark:bg-orange-600' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Add Product Button */}
        <button
          onClick={() => {
            setSelectedProduct(null);
            setFormOpen(true);
          }}
          className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-80 bg-white dark:bg-[#13132e] border border-slate-200/60 dark:border-slate-800/80 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : paginatedProducts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#13132e] border border-slate-200/60 dark:border-slate-800/80 rounded-[2.5rem]">
          <ShoppingBag className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">No Products Found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">No active products match your search/filter settings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedProducts.map((prod) => (
            <div 
              key={prod.id} 
              className={`
                bg-white dark:bg-[#13132e] border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-full relative
                ${prod.status === 'Out of Stock' ? 'opacity-80' : ''}
              `}
            >
              {/* Image Container with Stock overlay */}
              <div className="h-44 relative bg-slate-100 dark:bg-[#1a1a3e] overflow-hidden">
                <img 
                  src={prod.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'} 
                  alt={prod.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Category tag */}
                <span className="absolute top-3 left-3 bg-white/95 dark:bg-[#0b0b1e]/95 text-slate-800 dark:text-slate-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-slate-200/40 dark:border-slate-800/40">
                  {prod.category}
                </span>

                {/* Out of Stock overlay banner */}
                {prod.status === 'Out of Stock' && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="bg-red-600 text-white font-black text-xs px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-widest">
                      <EyeOff className="w-3.5 h-3.5" />
                      Sold Out
                    </span>
                  </div>
                )}
              </div>

              {/* Info Container */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-1.5 text-left">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{prod.unit}</span>
                  <h4 className="font-bold text-slate-800 dark:text-white line-clamp-2">{prod.name}</h4>
                  
                  {/* Prices */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-base font-black text-orange-500">₹{prod.price}</span>
                    {prod.mrp && Number(prod.mrp) > Number(prod.price) && (
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 line-through">₹{prod.mrp}</span>
                    )}
                  </div>
                </div>

                {/* Action footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/40">
                  {/* Stock Toggle Switch */}
                  <button
                    onClick={() => handleStockToggle(prod)}
                    className={`
                      px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5
                      ${prod.status === 'In Stock' 
                        ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/30' 
                        : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30'}
                    `}
                    title="Toggle Availability"
                  >
                    {prod.status === 'In Stock' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {prod.status === 'In Stock' ? 'Available' : 'Hidden'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedProduct(prod);
                        setFormOpen(true);
                      }}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      title="Edit Product"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(prod.id)}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-500 hover:text-red-600"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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

      {/* Product CRUD Modal */}
      {formOpen && (
        <ProductFormModal
          isOpen={formOpen}
          product={selectedProduct}
          categories={categories}
          onClose={() => setFormOpen(false)}
          onUpdate={loadData}
        />
      )}

      {/* Delete Confirmation Overlay */}
      {deleteId && (
        <ConfirmationModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Product"
          message="Are you sure you want to permanently remove this product from inventory? This action cannot be undone."
        />
      )}
    </div>
  );
}
