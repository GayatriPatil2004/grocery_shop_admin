import { useState, useEffect } from 'react';
import { orderService } from '../../../shared/lib/services';
import { Search, Phone, Eye, MessageSquareCode, ChevronDown } from 'lucide-react';
import OrderDetailModal from './OrderDetailModal';
import CustomDatePicker from '../../../shared/components/ui/CustomDatePicker';
import toast from 'react-hot-toast';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders();
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

  // Filters
  const filteredOrders = orders.filter(ord => {
    const matchesSearch = 
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ord.mobile.includes(searchQuery) ||
      ord.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || ord.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter) {
      const ordDate = new Date(ord.createdAt).toDateString();
      const filterDate = new Date(dateFilter).toDateString();
      matchesDate = ordDate === filterDate;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Search and Filters Section */}
      <div className="bg-white dark:bg-[#13132e] border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full xl:max-w-xs">
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
            placeholder="Search Order ID, Name, Mobile..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a1a3e] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-sm font-semibold transition-all"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          {/* Status filter */}
          <div className="relative w-full sm:w-48">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a1a3e] text-slate-700 dark:text-slate-300 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 transition-all flex items-center justify-between cursor-pointer"
            >
              <span>{statusFilter || 'All Statuses'}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsDropdownOpen(false)} 
                />
                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#13132e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden">
                  {['All Statuses', 'Pending', 'Confirmed', 'Packed', 'Delivered', 'Cancelled'].map((status) => {
                    const value = status === 'All Statuses' ? '' : status;
                    const isActive = statusFilter === value;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => {
                          setStatusFilter(value);
                          setCurrentPage(1);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-all ${
                          isActive 
                            ? 'bg-orange-500 text-white dark:bg-orange-600' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400'
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Date Filter */}
          <CustomDatePicker
            value={dateFilter}
            onChange={(dateStr) => {
              setDateFilter(dateStr);
              setCurrentPage(1);
            }}
            placeholder="Select Date"
          />

          {/* Reset button */}
          {(statusFilter || dateFilter || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setDateFilter('');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Orders Table Panel */}
      <div className="bg-white dark:bg-[#13132e] border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-slate-100 dark:bg-[#1a1a3e] rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : paginatedOrders.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquareCode className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">No Orders Logged</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">There are no WhatsApp checkout orders matching your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                  <th className="pb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order ID</th>
                  <th className="pb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer</th>
                  <th className="pb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mobile Number</th>
                  <th className="pb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order Date</th>
                  <th className="pb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total (₹)</th>
                  <th className="pb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Status</th>
                  <th className="pb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
                {paginatedOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1a1a3e]/30 transition-all">
                    <td className="py-4 text-sm font-bold text-orange-500">{ord.id}</td>
                    <td className="py-4 text-sm font-bold text-slate-700 dark:text-slate-300">{ord.customerName}</td>
                    <td className="py-4 text-sm text-slate-500 dark:text-slate-400 font-semibold">{ord.mobile}</td>
                    <td className="py-4 text-sm text-slate-400 dark:text-slate-500 font-medium">
                      {new Date(ord.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="py-4 text-sm font-black text-slate-800 dark:text-white">₹{ord.totalAmount}</td>
                    <td className="py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(ord.status)}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Trigger */}
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {/* WhatsApp Redirection */}
                        <a
                          href={`https://wa.me/${ord.mobile.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-900/30 text-orange-500 hover:text-orange-600 flex items-center justify-center"
                          title="Open WhatsApp chat"
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={loadOrders}
        />
      )}
    </div>
  );
}
