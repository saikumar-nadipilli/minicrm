import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Mail, Phone, Building2, Users, UserCheck, BriefcaseBusiness, Download } from 'lucide-react';
import { Pagination as PaginationData } from '../api';
import { Contact, ContactStatus } from '../types';

interface ContactsDashboardProps {
  contacts: Contact[];
  pagination: PaginationData;
  summary: {
    total: number;
    customers: number;
    leads: number;
    prospects: number;
    companies: number;
  };
  onAddContactClick: () => void;
  onContactSelect: (contact: Contact) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
  onPageChange: (page: number) => void;
  onExportContacts: () => void;
}

const getStatusBadgeClass = (status: ContactStatus) => {
  switch (status) {
    case 'Lead':
      return 'bg-amber-50 text-amber-700 border border-amber-100';
    case 'Prospect':
      return 'bg-sky-50 text-sky-700 border border-sky-100';
    case 'Customer':
    case 'Active' as any:
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    case 'Opportunity':
      return 'bg-yellow-50 text-yellow-600 border border-yellow-100';
    default:
      return 'bg-slate-50 text-slate-600 border border-slate-100';
  }
};

interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  total: number;
}

const DashboardHeader = memo(function DashboardHeader({
  onAddContactClick,
  onExportContacts
}: Pick<ContactsDashboardProps, 'onAddContactClick' | 'onExportContacts'>) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Relationship pipeline</p>
        <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">Contacts</h2>
        <p className="text-sm font-medium text-slate-500 mt-1 max-w-2xl">
          Manage customer conversations, lead status, and account context from one focused workspace.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <button
          onClick={onExportContacts}
          className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <Download size={16} />
          <span>Export CSV</span>
        </button>
        <button
          onClick={onAddContactClick}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Contact</span>
        </button>
      </div>
    </div>
  );
});

const StatsCards = memo(function StatsCards({
  total,
  customers,
  leads,
  prospects,
  companies
}: {
  total: number;
  customers: number;
  leads: number;
  prospects: number;
  companies: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
      <div className="glass-panel rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total</p>
          <Users size={18} className="text-primary" />
        </div>
        <p className="mt-3 text-2xl font-extrabold text-slate-950">{total}</p>
        <p className="text-xs font-semibold text-slate-500">contacts in workspace</p>
      </div>
      <div className="glass-panel rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Customers</p>
          <UserCheck size={18} className="text-emerald-600" />
        </div>
        <p className="mt-3 text-2xl font-extrabold text-slate-950">{customers}</p>
        <p className="text-xs font-semibold text-slate-500">active relationships</p>
      </div>
      <div className="glass-panel rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Leads</p>
          <Users size={18} className="text-amber-600" />
        </div>
        <p className="mt-3 text-2xl font-extrabold text-slate-950">{leads}</p>
        <p className="text-xs font-semibold text-slate-500">new opportunities</p>
      </div>
      <div className="glass-panel rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Prospects</p>
          <BriefcaseBusiness size={18} className="text-sky-600" />
        </div>
        <p className="mt-3 text-2xl font-extrabold text-slate-950">{prospects}</p>
        <p className="text-xs font-semibold text-slate-500">qualified conversations</p>
      </div>
      <div className="glass-panel rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Companies</p>
          <BriefcaseBusiness size={18} className="text-amber-600" />
        </div>
        <p className="mt-3 text-2xl font-extrabold text-slate-950">{companies}</p>
        <p className="text-xs font-semibold text-slate-500">accounts represented</p>
      </div>
    </div>
  );
});

const Pagination = memo(function Pagination({
  page,
  pages,
  onPageChange,
  indexOfFirstItem,
  indexOfLastItem,
  total
}: PaginationProps) {
  if (pages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/70">
      <p className="text-xs font-semibold text-slate-500 order-2 sm:order-1">
        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, total)} of {total} contacts
      </p>
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-white transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <ChevronLeft size={14} />
          <span className="hidden xs:inline">Prev</span>
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i + 1)}
              className={`w-7.5 h-7.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                page === i + 1
                  ? 'bg-primary text-white'
                  : 'hover:bg-slate-200 text-slate-500'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button
          disabled={page === pages}
          onClick={() => onPageChange(Math.min(page + 1, pages))}
          className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-white transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <span className="hidden xs:inline">Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
});

function ContactsDashboard({
  contacts,
  pagination,
  summary,
  onAddContactClick,
  onContactSelect,
  onEditContact,
  onDeleteContact,
  onPageChange,
  onExportContacts
}: ContactsDashboardProps) {
  useEffect(() => {
    if (pagination.page > pagination.pages && pagination.pages > 0) {
      onPageChange(pagination.pages);
    }
  }, [onPageChange, pagination.page, pagination.pages]);

  const indexOfFirstItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit;
  const indexOfLastItem = Math.min(indexOfFirstItem + contacts.length, pagination.total);

  const paginationProps: PaginationProps = useMemo(
    () => ({
      page: pagination.page,
      pages: pagination.pages,
      onPageChange,
      indexOfFirstItem,
      indexOfLastItem,
      total: pagination.total
    }),
    [indexOfFirstItem, indexOfLastItem, onPageChange, pagination.limit, pagination.page, pagination.pages, pagination.total]
  );

  const renderAvatar = useCallback((contact: Contact, size = 'w-10 h-10') => (
    <div
      className={`${size} rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center bg-surface-soft flex-shrink-0`}
    >
      {contact.avatarUrl ? (
        <img
          src={contact.avatarUrl}
          alt={contact.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="text-xs font-bold text-primary">
          {contact.avatarInitials || contact.name.charAt(0)}
        </span>
      )}
    </div>
  ), []);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <DashboardHeader onAddContactClick={onAddContactClick} onExportContacts={onExportContacts} />
      <StatsCards
        total={summary.total}
        customers={summary.customers}
        leads={summary.leads}
        prospects={summary.prospects}
        companies={summary.companies}
      />

      <div className="hidden md:block glass-panel rounded-2xl overflow-hidden">
        <div className="max-h-[560px] overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4.5">Name</th>
                <th className="px-6 py-4.5">Email</th>
                <th className="px-6 py-4.5">Phone</th>
                <th className="px-6 py-4.5">Company</th>
                <th className="px-6 py-4.5">Status</th>
                <th className="px-6 py-4.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contacts.length > 0 ? (
                contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('.action-btn')) return;
                      onContactSelect(contact);
                    }}
                    className="hover:bg-white/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {renderAvatar(contact)}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors truncate">
                            {contact.name}
                          </p>
                          <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                            {contact.createdAt}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">
                      {contact.email || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">
                      {contact.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">
                      {contact.company || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(
                          contact.status
                        )}`}
                      >
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditContact(contact);
                          }}
                          className="action-btn p-1.5 text-slate-400 hover:text-primary hover:bg-surface-soft rounded-lg transition-colors"
                          title="Edit Contact"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteContact(contact.id);
                          }}
                          className="action-btn p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Contact"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                    No contacts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination {...paginationProps} />
      </div>

      {/* ===== Mobile: Card List ===== */}
      <div className="md:hidden space-y-3">
        {contacts.length > 0 ? (
          contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onContactSelect(contact)}
              className="glass-panel rounded-2xl p-4 active:scale-[0.99] transition-transform cursor-pointer"
            >
              <div className="flex items-start gap-3">
                {renderAvatar(contact, 'w-11 h-11')}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-slate-800 truncate">{contact.name}</p>
                    <span
                      className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(
                        contact.status
                      )}`}
                    >
                      {contact.status}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">{contact.createdAt}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Mail size={13} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">{contact.email || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Phone size={13} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">{contact.phone || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Building2 size={13} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">{contact.company || '-'}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditContact(contact);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors"
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteContact(contact.id);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 border border-red-100 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel rounded-2xl text-center py-12 text-slate-400 font-medium">
            No contacts found.
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="glass-panel rounded-2xl overflow-hidden">
            <Pagination {...paginationProps} />
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ContactsDashboard);
