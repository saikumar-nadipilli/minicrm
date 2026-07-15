import React, { useEffect, useState } from 'react';
import { Save, UserRound, X } from 'lucide-react';
import { Contact, ContactStatus } from '../types';

type EditableContactFields = {
  name: string;
  phone: string;
  company: string;
  designation: string;
  status: ContactStatus;
};

interface EditContactModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (contactId: string, contactData: EditableContactFields) => Promise<void>;
}

const statusOptions: ContactStatus[] = ['Lead', 'Prospect', 'Customer'];

export default function EditContactModal({ contact, isOpen, onClose, onSave }: EditContactModalProps) {
  const [formData, setFormData] = useState<EditableContactFields>({
    name: '',
    phone: '',
    company: '',
    designation: '',
    status: 'Lead'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!contact) return;

    setFormData({
      name: contact.name,
      phone: contact.phone,
      company: contact.company,
      designation: contact.designation,
      status: statusOptions.includes(contact.status) ? contact.status : 'Lead'
    });
  }, [contact]);

  if (!isOpen || !contact) return null;

  const updateField = <K extends keyof EditableContactFields>(field: K, value: EditableContactFields[K]) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave(contact.id, formData);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden animate-fade-in-up border border-white max-h-[90vh] flex flex-col"
      >
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-surface-soft flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-primary-container text-white flex items-center justify-center flex-shrink-0">
              <UserRound size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Edit relationship</p>
              <h3 className="text-base font-extrabold text-slate-900 truncate">{contact.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white rounded-xl transition-all text-slate-500 hover:text-slate-800"
            aria-label="Close edit contact dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-primary flex items-center justify-center text-lg font-extrabold flex-shrink-0">
              {contact.avatarInitials || contact.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-slate-900 truncate">{formData.name || 'Unnamed contact'}</p>
              <p className="text-xs font-semibold text-slate-500 truncate">
                {[formData.designation, formData.company].filter(Boolean).join(' at ') || 'No role added'}
              </p>
            </div>
            <span className="sm:ml-auto inline-flex w-fit items-center px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {formData.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="edit-name">
                Full Name
              </label>
              <input
                id="edit-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="crm-input px-4 py-2.5 text-sm font-medium"
              />
            </div>

            <div className="col-span-2 md:col-span-1 space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="edit-phone">
                Phone Number
              </label>
              <input
                id="edit-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="crm-input px-4 py-2.5 text-sm font-medium"
              />
            </div>

            <div className="col-span-2 md:col-span-1 space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="edit-company">
                Company
              </label>
              <input
                id="edit-company"
                type="text"
                value={formData.company}
                onChange={(e) => updateField('company', e.target.value)}
                className="crm-input px-4 py-2.5 text-sm font-medium"
              />
            </div>

            <div className="col-span-2 md:col-span-1 space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="edit-designation">
                Designation
              </label>
              <input
                id="edit-designation"
                type="text"
                value={formData.designation}
                onChange={(e) => updateField('designation', e.target.value)}
                className="crm-input px-4 py-2.5 text-sm font-medium"
              />
            </div>

            <div className="col-span-2 md:col-span-1 space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="edit-status">
                Status
              </label>
              <select
                id="edit-status"
                value={formData.status}
                onChange={(e) => updateField('status', e.target.value as ContactStatus)}
                className="crm-input px-4 py-2.5 text-sm font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23434655%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_0.75rem_center] bg-no-repeat cursor-pointer"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary-hover transition-all cursor-pointer disabled:opacity-70 flex items-center gap-2"
            >
              <Save size={14} />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
