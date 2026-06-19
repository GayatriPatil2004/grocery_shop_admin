import { AlertTriangle } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  isDestructive = true
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white dark:bg-[#13132e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scale-up z-10">
        <div className="flex gap-4">
          {/* Warning Icon Badge */}
          <div className={`
            w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0
            ${isDestructive 
              ? 'bg-red-50 dark:bg-red-950/30 text-red-500' 
              : 'bg-orange-50 dark:bg-orange-950/30 text-orange-500'}
          `}>
            <AlertTriangle className="w-6 h-6" />
          </div>

          {/* Details */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`
              px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all shadow-md
              ${isDestructive 
                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/10' 
                : 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/10'}
            `}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
