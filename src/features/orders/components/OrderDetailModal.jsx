import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { orderService } from '../../../shared/lib/services';
import { X, Phone, MessageSquareCode, Calendar, MapPin, User, FileText, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

function CustomSelect({ value, onChange, options, disabled, placeholder = 'Select Option', className = '' }) {
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
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1a3e] text-slate-700 dark:text-slate-300 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 transition-all flex items-center justify-between cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-[#13132e] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden max-h-48 overflow-y-auto">
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
                className={`w-full text-left px-3 py-2 text-xs font-semibold transition-all ${
                  isActive
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

export default function OrderDetailModal({ order, onClose, onUpdate }) {
  const [status, setStatus] = useState(order.status || 'Pending');
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    setLoading(true);
    try {
      await orderService.updateOrderStatus(order.id, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      onUpdate();
    } catch (err) {
      toast.error('Failed to update order status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
            <MessageSquareCode className="w-5 h-5" />
            <h3 className="text-lg font-black text-slate-800 dark:text-white">
              Order Details: <span className="text-orange-500 font-extrabold">{order.id}</span>
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Grid content */}
        <div className="space-y-6 text-left">
          {/* Metadata: User, Date, Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-[#1a1a3e]/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/30">
            
            {/* Customer Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Customer Info
              </h4>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800 dark:text-white">{order.customerName}</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{order.mobile}</p>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-start gap-1 mt-2">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 mt-0.5" />
                  <span>{order.address}</span>
                </div>
              </div>
            </div>

            {/* Order Status & Date */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Order Meta
                </h4>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
                </p>
              </div>

              {/* Status Select dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Order Status Status</label>
                <div className="flex gap-2">
                  <CustomSelect
                    value={status}
                    onChange={handleStatusChange}
                    disabled={loading}
                    options={[
                      { value: 'Pending', label: 'Pending' },
                      { value: 'Confirmed', label: 'Confirmed' },
                      { value: 'Packed', label: 'Packed' },
                      { value: 'Delivered', label: 'Delivered' },
                      { value: 'Cancelled', label: 'Cancelled' },
                    ]}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Items Table */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Products Ordered
            </h4>

            <div className="border border-slate-100 dark:border-slate-800/40 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-[#1a1a3e]/20 border-b border-slate-100 dark:border-slate-800/30">
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Price</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Qty</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/20 text-slate-700 dark:text-slate-300">
                  {order.products.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-200">{item.name}</td>
                      <td className="px-4 py-3 text-xs text-center font-medium">₹{item.price}</td>
                      <td className="px-4 py-3 text-xs text-center font-bold">{item.quantity}</td>
                      <td className="px-4 py-3 text-xs text-right font-bold text-slate-800 dark:text-slate-200">₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                  {/* Totals Summary Row */}
                  <tr className="bg-slate-50/20 dark:bg-[#1a1a3e]/10 border-t-2 border-slate-200 dark:border-slate-800">
                    <td colSpan="3" className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 text-right uppercase">Total Amount</td>
                    <td className="px-4 py-4 text-base font-black text-orange-500 text-right">₹{order.totalAmount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800/40 mt-8">
          <a
            href={`https://wa.me/${order.mobile.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/15 transition-all flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Contact Customer
          </a>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
