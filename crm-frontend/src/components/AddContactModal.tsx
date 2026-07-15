import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ContactStatus, Contact } from '../types';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contactData: Omit<Contact, 'id' | 'createdAt' | 'lastActivity' | 'notes'> & { initialNote?: string }) => void;
}

export default function AddContactModal({ isOpen, onClose, onSave }: AddContactModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [status, setStatus] = useState<ContactStatus>('Lead');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: fullName,
      email,
      phone,
      company,
      designation,
      status,
      initialNote: notes
    });
    // Clear state
    setFullName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setDesignation('');
    setStatus('Lead');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-2xl overflow-hidden animate-fade-in-up border border-white max-h-[90vh] flex flex-col"
      >
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-surface-soft flex-shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">New relationship</p>
            <h3 className="text-base font-extrabold text-slate-900">Add contact</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white rounded-xl transition-all text-slate-500 hover:text-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                placeholder="e.g. John Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="crm-input px-4 py-2.5 text-sm font-medium"
              />
            </div>

            <div className="col-span-2 md:col-span-1 space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="crm-input px-4 py-2.5 text-sm font-medium"
              />
            </div>

            <div className="col-span-2 md:col-span-1 space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="crm-input px-4 py-2.5 text-sm font-medium"
              />
            </div>

            <div className="col-span-2 md:col-span-1 space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="company">
                Company
              </label>
              <input
                id="company"
                type="text"
                placeholder="Company Name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="crm-input px-4 py-2.5 text-sm font-medium"
              />
            </div>

            <div className="col-span-2 md:col-span-1 space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="designation">
                Designation
              </label>
              <input
                id="designation"
                type="text"
                placeholder="e.g. Operations Manager"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="crm-input px-4 py-2.5 text-sm font-medium"
              />
            </div>

            <div className="col-span-2 md:col-span-1 space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ContactStatus)}
                className="crm-input px-4 py-2.5 text-sm font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23434655%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_0.75rem_center] bg-no-repeat cursor-pointer"
              >
                <option value="Lead">Lead</option>
                <option value="Prospect">Prospect</option>
                <option value="Customer">Customer</option>
              </select>
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="notes">
                Notes
              </label>
              <textarea
                id="notes"
                placeholder="Add any additional details or background information..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="crm-input px-4 py-2.5 text-sm resize-none font-medium"
              ></textarea>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary-hover transition-all cursor-pointer"
            >
              Save Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
