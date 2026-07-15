import React, { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen, Contact, ContactStatus, Activity } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { api, clearSession, getStoredUser } from './api';

const SignIn = lazy(() => import('./components/SignIn'));
const SignUp = lazy(() => import('./components/SignUp'));
const AddContactModal = lazy(() => import('./components/AddContactModal'));
const EditContactModal = lazy(() => import('./components/EditContactModal'));
const ConfirmDeleteModal = lazy(() => import('./components/ConfirmDeleteModal'));
const ContactsDashboard = lazy(() => import('./components/ContactsDashboard'));
const ContactDetails = lazy(() => import('./components/ContactDetails'));
const ActivityLog = lazy(() => import('./components/ActivityLog'));

const getScreenFromPath = (pathname: string): Screen => {
  if (pathname.startsWith('/activity')) return 'ACTIVITY_LOG';
  if (pathname.startsWith('/contacts/')) return 'CONTACT_DETAILS';
  if (pathname.startsWith('/contacts')) return 'CONTACTS_DASHBOARD';
  if (pathname.startsWith('/signup')) return 'SIGN_UP';
  return 'SIGN_IN';
};

const LoadingFallback = () => (
  <div className="min-h-[240px] flex items-center justify-center text-xs font-bold uppercase tracking-wider text-slate-400">
    Loading...
  </div>
);

interface ContactDetailsRouteProps {
  contactsById: Map<string, Contact>;
  selectedContact: Contact | null;
  activities: Activity[];
  onBack: () => void;
  onAddNote: (contactId: string, noteContent: string) => void;
  onEditContact: (contact: Contact) => void;
  onSendEmail: (contactId: string, subject: string, body: string) => Promise<void>;
  onRecordCall: (contactId: string, discussion: string) => Promise<void>;
  onError: (message: string) => void;
}

const ContactDetailsRoute = React.memo(function ContactDetailsRoute({
  contactsById,
  selectedContact,
  activities,
  onBack,
  onAddNote,
  onEditContact,
  onSendEmail,
  onRecordCall,
  onError
}: ContactDetailsRouteProps) {
  const { contactId } = useParams();
  const routeContact = contactId ? contactsById.get(contactId) : undefined;
  const contactQuery = useQuery({
    queryKey: ['contact', contactId],
    queryFn: () => api.getContact(contactId as string),
    enabled: Boolean(contactId && !routeContact && selectedContact?.id !== contactId)
  });
  const contact = selectedContact?.id === contactId ? selectedContact : routeContact || contactQuery.data;
  const contactActivities = useMemo(
    () =>
      contact
        ? activities.filter((activity) =>
            activity.contactId
              ? activity.contactId === contact.id
              : activity.targetName === contact.name
          )
        : [],
    [activities, contact]
  );

  useEffect(() => {
    if (contactQuery.error) {
      onError(contactQuery.error instanceof Error ? contactQuery.error.message : 'Unable to load contact');
    }
  }, [contactQuery.error, onError]);

  if (!contact) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center animate-fade-in-up">
        <p className="text-sm font-bold text-slate-700">Contact not found.</p>
        <button
          onClick={onBack}
          className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all cursor-pointer"
        >
          Back to Contacts
        </button>
      </div>
    );
  }

  return (
    <ContactDetails
      contact={contact}
      activities={contactActivities}
      onBack={onBack}
      onAddNote={onAddNote}
      onEditContact={onEditContact}
      onSendEmail={onSendEmail}
      onRecordCall={onRecordCall}
    />
  );
});

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Authentication & Navigation State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const currentScreen = useMemo(() => getScreenFromPath(location.pathname), [location.pathname]);

  // App Core Data State
  const [contactsPage, setContactsPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [isBooting, setIsBooting] = useState(true);
  const [appError, setAppError] = useState<string | null>(null);

  // Modal Dialogs
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  const [isDeletingContact, setIsDeletingContact] = useState(false);

  // Mobile navigation drawer
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const contactsQuery = useQuery({
    queryKey: ['contacts', contactsPage, searchQuery],
    queryFn: () => api.listContacts({ page: contactsPage, limit: 10, search: searchQuery }),
    enabled: isLoggedIn && currentScreen === 'CONTACTS_DASHBOARD'
  });

  const contactsSummaryQuery = useQuery({
    queryKey: ['contacts-summary'],
    queryFn: () => api.exportContacts(),
    enabled: isLoggedIn,
    staleTime: 30_000
  });

  const activitiesQuery = useQuery({
    queryKey: ['activities'],
    queryFn: () => api.listActivities(),
    enabled: isLoggedIn
  });

  const contacts = contactsQuery.data?.contacts ?? [];
  const contactsSummary = useMemo(() => {
    const allContacts = contactsSummaryQuery.data ?? [];
    const companies = new Set<string>();

    return allContacts.reduce(
      (summary, contact) => {
        if (contact.company.trim()) {
          companies.add(contact.company.trim().toLowerCase());
        }

        summary.total += 1;

        if (contact.status === 'Customer') {
          summary.customers += 1;
        } else if (contact.status === 'Lead') {
          summary.leads += 1;
        } else if (contact.status === 'Prospect') {
          summary.prospects += 1;
        }

        summary.companies = companies.size;
        return summary;
      },
      {
        total: 0,
        customers: 0,
        leads: 0,
        prospects: 0,
        companies: 0
      }
    );
  }, [contactsSummaryQuery.data]);
  const contactsPagination = contactsQuery.data?.pagination ?? {
    page: contactsPage,
    limit: 10,
    total: 0,
    pages: 1
  };
  const activities = activitiesQuery.data ?? [];

  const contactsById = useMemo(
    () => new Map(contacts.map((contact) => [contact.id, contact])),
    [contacts]
  );

  const refreshWorkspaceData = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['contacts'] }),
      queryClient.invalidateQueries({ queryKey: ['contacts-summary'] }),
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    ]);
  }, [queryClient]);

  // Restore backend session through the HTTP-only refresh cookie.
  useEffect(() => {
    const savedUser = getStoredUser();

    if (savedUser?.name) {
      setCurrentUserName(savedUser.name);
      setCurrentUserEmail(savedUser.email);
    }

    const restoreSession = async () => {
      try {
        const user = await api.restoreSession();
        if (!user) {
          clearSession();
          setIsBooting(false);
          return;
        }

        setCurrentUserName(user.name);
        setCurrentUserEmail(user.email);
        setIsLoggedIn(true);
      } catch (err) {
        clearSession();
        setAppError(err instanceof Error ? err.message : 'Session expired. Please sign in again.');
      } finally {
        setIsBooting(false);
      }
    };

    restoreSession();
  }, []);

  const handleSignInSuccess = useCallback(async (email: string, password: string) => {
    const user = await api.login(email, password);
    setCurrentUserName(user.name);
    setCurrentUserEmail(user.email);
    setIsLoggedIn(true);
    setAppError(null);
    setContactsPage(1);
    setSearchQuery('');
    await refreshWorkspaceData();
    navigate('/contacts', { replace: true });
  }, [navigate, refreshWorkspaceData]);

  const handleSignUpSuccess = useCallback(async (name: string, email: string, password: string) => {
    const user = await api.signup(name, email, password);
    setCurrentUserName(user.name);
    setCurrentUserEmail(user.email);
    setIsLoggedIn(true);
    setAppError(null);
    setContactsPage(1);
    setSearchQuery('');
    await refreshWorkspaceData();
    navigate('/contacts', { replace: true });
  }, [navigate, refreshWorkspaceData]);

  const handleLogout = useCallback(async () => {
    await api.logout();
    setIsLoggedIn(false);
    setContactsPage(1);
    setSearchQuery('');
    setSelectedContact(null);
    queryClient.clear();
    navigate('/signin', { replace: true });
  }, [navigate, queryClient]);

  // Contact Operations
  const handleAddContact = useCallback(async (contactData: any) => {
    try {
      const newContact = await api.createContact(contactData);
      setContactsPage(1);
      await refreshWorkspaceData();
      setSelectedContact(newContact);
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Unable to create contact');
    }
  }, [refreshWorkspaceData]);

  const handleDeleteContact = useCallback((id: string) => {
    const contactToDelete = contacts.find((c) => c.id === id);
    if (contactToDelete) {
      setDeletingContact(contactToDelete);
    }
  }, [contacts]);

  const handleCloseDeleteModal = useCallback(() => {
    if (!isDeletingContact) {
      setDeletingContact(null);
    }
  }, [isDeletingContact]);

  const handleConfirmDeleteContact = useCallback(async () => {
    if (!deletingContact) return;

    setIsDeletingContact(true);

    try {
      await api.deleteContact(deletingContact.id);
      await refreshWorkspaceData();

      if (selectedContact?.id === deletingContact.id || location.pathname === `/contacts/${deletingContact.id}`) {
        setSelectedContact(null);
        navigate('/contacts');
      }

      setDeletingContact(null);
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Unable to delete contact');
    } finally {
      setIsDeletingContact(false);
    }
  }, [deletingContact, location.pathname, navigate, refreshWorkspaceData, selectedContact]);

  const handleAddNoteToContact = useCallback(async (contactId: string, noteContent: string) => {
    const targetContact = contacts.find((c) => c.id === contactId);
    if (!targetContact) return;

    try {
      const notes = [noteContent, ...targetContact.notes.map((note) => note.content)].join('\n\n');
      const updatedContact = await api.updateContact(contactId, { notes });
      await Promise.all([
        refreshWorkspaceData(),
        queryClient.invalidateQueries({ queryKey: ['contact', contactId] })
      ]);

      if (selectedContact?.id === contactId) {
        setSelectedContact(updatedContact);
      }
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Unable to save note');
    }
  }, [contacts, queryClient, refreshWorkspaceData, selectedContact]);

  const handleEditContactTrigger = useCallback((contact: Contact) => {
    setEditingContact(contact);
  }, []);

  const handleSendEmail = useCallback(async (contactId: string, subject: string) => {
    try {
      const activity = await api.recordEmailSent(contactId, subject);
      queryClient.setQueryData<Activity[]>(['activities'], (currentActivities = []) => [
        activity,
        ...currentActivities.filter((item) => item.id !== activity.id)
      ]);
      await queryClient.invalidateQueries({ queryKey: ['activities'] });
      setAppError(null);
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Unable to record email activity');
      throw err;
    }
  }, [queryClient]);

  const handleRecordCall = useCallback(async (contactId: string, discussion: string) => {
    try {
      const activity = await api.recordCallMade(contactId, discussion);
      queryClient.setQueryData<Activity[]>(['activities'], (currentActivities = []) => [
        activity,
        ...currentActivities.filter((item) => item.id !== activity.id)
      ]);
      await queryClient.invalidateQueries({ queryKey: ['activities'] });
      setAppError(null);
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Unable to record call activity');
      throw err;
    }
  }, [queryClient]);

  const handleEditContact = useCallback(async (
    contactId: string,
    contactData: Pick<Contact, 'name' | 'phone' | 'company' | 'designation' | 'status'>
  ) => {
    const originalContact = contacts.find((contact) => contact.id === contactId);
    if (!originalContact) return;

    try {
      const updatedContact = await api.updateContact(contactId, contactData);
      await Promise.all([
        refreshWorkspaceData(),
        queryClient.invalidateQueries({ queryKey: ['contact', contactId] })
      ]);

      if (selectedContact?.id === contactId) {
        setSelectedContact(updatedContact);
      }
      setAppError(null);
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Unable to update contact');
      throw err;
    }
  }, [contacts, queryClient, refreshWorkspaceData, selectedContact]);

  const handleRefreshStream = useCallback(() => {
    refreshWorkspaceData().catch((err) => {
      setAppError(err instanceof Error ? err.message : 'Unable to refresh workspace');
    });
  }, [refreshWorkspaceData]);

  const handlePageChange = useCallback((page: number) => {
    setContactsPage(page);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    const nextSearchQuery = query.trim();

    setContactsPage(1);
    setSearchQuery((currentSearchQuery) =>
      currentSearchQuery === nextSearchQuery ? currentSearchQuery : nextSearchQuery
    );
  }, []);

  const handleExportContacts = useCallback(async () => {
    try {
      const allContacts = await api.exportContacts();
      const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Created', 'Updated'];
      const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
      const rows = allContacts.map((contact) => [
        contact.name,
        contact.email,
        contact.phone,
        contact.company,
        contact.status,
        contact.createdAt.replace('Created ', ''),
        contact.lastActivity
      ]);
      const csv = [headers, ...rows].map((row) => row.map((value) => escapeCsv(String(value || ''))).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'contacts.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Unable to export contacts');
    }
  }, []);

  const navigateToScreen = useCallback((screen: Screen) => {
    setSearchQuery('');
    setSelectedContact(null);

    if (screen === 'ACTIVITY_LOG') {
      navigate('/activity');
      return;
    }

    if (screen === 'SIGN_UP') {
      navigate('/signup');
      return;
    }

    if (screen === 'SIGN_IN') {
      navigate('/signin');
      return;
    }

    navigate('/contacts');
  }, [navigate]);

  const handleOpenAddModal = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditingContact(null);
  }, []);

  const handleOpenSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const handleSignUpLinkClick = useCallback(() => {
    navigate('/signup');
  }, [navigate]);

  const handleSignInLinkClick = useCallback(() => {
    navigate('/signin');
  }, [navigate]);

  const handleContactSelect = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    navigate(`/contacts/${contact.id}`);
  }, [navigate]);

  const handleContactBack = useCallback(() => {
    setSelectedContact(null);
    navigate('/contacts');
  }, [navigate]);

  // Rendering conditional routers
  if (isBooting) {
    return (
      <div className="min-h-screen bg-surface-bg flex items-center justify-center text-sm font-bold text-slate-500 uppercase tracking-wider">
        Loading workspace...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isLoggedIn ? '/contacts' : '/signin'} replace />} />
      <Route
        path="/signin"
        element={
          isLoggedIn ? (
            <Navigate to="/contacts" replace />
          ) : (
            <Suspense fallback={<LoadingFallback />}>
              <SignIn
                onSignInSuccess={handleSignInSuccess}
                onSignUpLinkClick={handleSignUpLinkClick}
              />
            </Suspense>
          )
        }
      />
      <Route
        path="/signup"
        element={
          isLoggedIn ? (
            <Navigate to="/contacts" replace />
          ) : (
            <Suspense fallback={<LoadingFallback />}>
              <SignUp
                onSignUpSuccess={handleSignUpSuccess}
                onSignInLinkClick={handleSignInLinkClick}
              />
            </Suspense>
          )
        }
      />
      <Route
        path="/*"
        element={
          !isLoggedIn ? (
            <Navigate to="/signin" replace state={{ from: location }} />
          ) : (
            <div className="min-h-screen bg-surface-bg flex">
              <Sidebar
                currentScreen={currentScreen}
                setScreen={navigateToScreen}
                onLogout={handleLogout}
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
              />

              <div className="flex-1 lg:ml-64 min-w-0 min-h-screen flex flex-col">
                <Header
                  onSearchChange={handleSearchChange}
                  searchResetKey={currentScreen}
                  userName={currentUserName}
                  userEmail={currentUserEmail}
                  onMenuClick={handleOpenSidebar}
                  placeholder={
                    currentScreen === 'ACTIVITY_LOG'
                      ? 'Search activity timeline...'
                      : 'Search for contacts, company or phone...'
                  }
                />

                <main className="pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 pb-8 flex-grow">
                  {appError && (
                    <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 shadow-sm">
                      {appError}
                    </div>
                  )}

                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      <Route
                        path="/contacts"
                        element={
                          <ContactsDashboard
                            contacts={contacts}
                            pagination={contactsPagination}
                            summary={contactsSummary}
                            onAddContactClick={handleOpenAddModal}
                            onEditContact={handleEditContactTrigger}
                            onContactSelect={handleContactSelect}
                            onDeleteContact={handleDeleteContact}
                            onPageChange={handlePageChange}
                            onExportContacts={handleExportContacts}
                          />
                        }
                      />
                      <Route
                        path="/contacts/:contactId"
                        element={
                          <ContactDetailsRoute
                            contactsById={contactsById}
                            selectedContact={selectedContact}
                            activities={activities}
                            onBack={handleContactBack}
                            onAddNote={handleAddNoteToContact}
                            onEditContact={handleEditContactTrigger}
                            onSendEmail={handleSendEmail}
                            onRecordCall={handleRecordCall}
                            onError={setAppError}
                          />
                        }
                      />
                      <Route path="/activity" element={<ActivityLog activities={activities} onRefresh={handleRefreshStream} />} />
                      <Route path="*" element={<Navigate to="/contacts" replace />} />
                    </Routes>
                  </Suspense>
                </main>
              </div>

              <Suspense fallback={null}>
                {isAddModalOpen && (
                  <AddContactModal
                    isOpen={isAddModalOpen}
                    onClose={handleCloseAddModal}
                    onSave={handleAddContact}
                  />
                )}

                {editingContact && (
                  <EditContactModal
                    isOpen={Boolean(editingContact)}
                    contact={editingContact}
                    onClose={handleCloseEditModal}
                    onSave={handleEditContact}
                  />
                )}

                {deletingContact && (
                  <ConfirmDeleteModal
                    isOpen={Boolean(deletingContact)}
                    contact={deletingContact}
                    isDeleting={isDeletingContact}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleConfirmDeleteContact}
                  />
                )}
              </Suspense>
            </div>
          )
        }
      />
    </Routes>
  );
}
