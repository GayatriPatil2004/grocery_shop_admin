import { useState } from 'react';
import { Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { productService, categoryService } from '../../lib/services';
import categories from '../../../data/categories';
import products from '../../../data/products';

export default function SeedDataButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSeed = async () => {
    if (loading) return;
    setLoading(true);
    setStatus('loading');

    try {
      console.log("Starting data migration...");
      
      // Seed Categories
      for (const cat of categories) {
        await categoryService.addCategory({
          name: cat.name,
          description: cat.description || '',
          image: cat.image || ''
        });
      }

      // Seed Products
      for (const prod of products) {
        await productService.addProduct({
          name: prod.name,
          category: prod.category,
          price: prod.price,
          mrp: prod.mrp || prod.price,
          unit: prod.unit,
          description: prod.description || '',
          status: 'In Stock'
        });
      }

      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSeed}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm ${
        status === 'success' 
          ? 'bg-green-500 text-white' 
          : status === 'error'
          ? 'bg-red-500 text-white'
          : 'bg-white dark:bg-[#161638] text-orange-500 border border-orange-500/20 hover:bg-orange-50 dark:hover:bg-orange-500/10'
      }`}
    >
      {status === 'loading' ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : status === 'success' ? (
        <CheckCircle className="w-4 h-4" />
      ) : status === 'error' ? (
        <AlertCircle className="w-4 h-4" />
      ) : (
        <Database className="w-4 h-4" />
      )}
      <span>{status === 'loading' ? 'Seeding...' : status === 'success' ? 'Seeded!' : status === 'error' ? 'Failed' : 'Seed Data'}</span>
    </button>
  );
}
