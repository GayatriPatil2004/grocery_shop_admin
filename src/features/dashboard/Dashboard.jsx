import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  productService, 
  categoryService, 
  orderService 
} from '../../shared/lib/services';
import { 
  ShoppingBag, 
  Layers, 
  MessageSquareCode, 
  CalendarCheck2, 
  Phone,
  Eye,
  ArrowRight
} from 'lucide-react';
import OrderDetailModal from '../orders/components/OrderDetailModal';

export default function Dashboard() {
  const [counts, setCounts] = useState({ products: 0, categories: 0, orders: 0, todayOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [prods, cats, ords] = await Promise.all([
        productService.getProducts(),
        categoryService.getCategories(),
        orderService.getOrders()
      ]);

      const todayStr = new Date().toDateString();
      const todayOrds = ords.filter(o => new Date(o.createdAt).toDateString() === todayStr);

      setCounts({
        products: prods.length,
        categories: cats.length,
        orders: ords.length,
        todayOrders: todayOrds.length
      });

      // Show top 5 recent orders
      const sorted = [...ords].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentOrders(sorted.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch dashboard metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDashboardData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200 dark:border-amber-900/30';
      case 'Confirmed':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200 dark:border-blue-900/30';
      case 'Packed':
        return 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400 border-purple-200 dark:border-purple-900/30';
      case 'Delivered':
        return 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 border-orange-200 dark:border-orange-900/30';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border-rose-200 dark:border-rose-900/30';
      default:
        return 'bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400';
    }
  };

  const statCards = [
    { name: 'Total Products', val: counts.products, icon: ShoppingBag, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
    { name: 'Total Categories', val: counts.categories, icon: Layers, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
    { name: 'Total Orders', val: counts.orders, icon: MessageSquareCode, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20' },
    { name: "Today's Orders", val: counts.todayOrders, icon: CalendarCheck2, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20' },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white dark:bg-[#13132e] border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              {loading ? (
                <div className="w-full space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3 animate-pulse"></div>
                  <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3 animate-pulse"></div>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 block">{c.name}</span>
                    <span className="text-3xl font-black text-slate-800 dark:text-white block">{c.val}</span>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${c.color} shadow-inner`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent Orders Grid */}
      <div className="bg-white dark:bg-[#13132e] border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent WhatsApp Orders</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Latest customer transactions via WhatsApp redirections</p>
          </div>
          <Link 
            to="/orders"
            className="flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
          >
            Manage All Orders
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-100 dark:bg-[#1a1a3e] rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquareCode className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No recent orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                  <th className="pb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order ID</th>
                  <th className="pb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer</th>
                  <th className="pb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mobile</th>
                  <th className="pb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date & Time</th>
                  <th className="pb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Status</th>
                  <th className="pb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1a1a3e]/30 transition-all">
                    <td className="py-4 text-sm font-bold text-orange-500">{ord.id}</td>
                    <td className="py-4 text-sm font-bold text-slate-700 dark:text-slate-300">{ord.customerName}</td>
                    <td className="py-4 text-sm text-slate-500 dark:text-slate-400 font-semibold">{ord.mobile}</td>
                    <td className="py-4 text-sm text-slate-400 dark:text-slate-500 font-medium">
                      {new Date(ord.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(ord.status)}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Detail Trigger */}
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {/* WhatsApp Redirection */}
                        <a
                          href={`https://wa.me/${ord.mobile.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-900/30 text-orange-500 hover:text-orange-600 flex items-center justify-center"
                          title="Contact Customer via WhatsApp"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={loadDashboardData}
        />
      )}
    </div>
  );
}
