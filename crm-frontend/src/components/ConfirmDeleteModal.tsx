import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Contact } from '../types';

interface ConfirmDeleteModalProps {
  contact: Contact | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({
  contact,
  isOpen,
  isDeleting,
  onClose,
  onConfirm
}: ConfirmDeleteModalProps) {
  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-2xl overflow-hidden animate-fade-in-up border border-white"
      >
        <div className="px-6 py-5 border-b border-red-100 bg-red-50/70 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={21} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Delete contact</p>
              <h3 className="text-base font-extrabold text-slate-950 truncate">{contact.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 hover:bg-white rounded-xl transition-all text-slate-500 hover:text-slate-800 disabled:opacity-60"
            aria-label="Close delete confirmation"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm font-medium text-slate-600 leading-6">
            This will permanently remove <span className="font-bold text-slate-900">{contact.name}</span> from your CRM workspace.
          </p>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition-all cursor-pointer disabled:opacity-70 flex items-center gap-2"
            >
              <Trash2 size={14} />
              <span>{isDeleting ? 'Deleting...' : 'Delete Contact'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
