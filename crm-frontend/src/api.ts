import { Activity, Contact, ContactStatus, Note } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const ACCESS_TOKEN_KEY = 'kinetic_access_token';
const USER_KEY = 'kinetic_user';
let accessToken: string | null = null;

type ApiUser = {
  _id: string;
  name: string;
  email: string;
};

type ApiContact = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  designation?: string;
  status: 'Lead' | 'Prospect' | 'Customer';
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type ApiActivity = {
  _id: string;
  type: Activity['type'];
  actorName: string;
  actorInitials?: string;
  targetName: string;
  targetContact?: string;
  description?: string;
  statusFrom?: ContactStatus;
  statusTo?: ContactStatus;
  noteContent?: string;
  createdAt: string;
};

type AuthPayload = {
  user: ApiUser;
  accessToken: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type ContactListResult = {
  contacts: Contact[];
  pagination: Pagination;
};

export type ContactInput = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  designation?: string;
  status?: ContactStatus;
  initialNote?: string;
};

export type ContactUpdateInput = Partial<{
  name: string;
  email: string;
  phone: string;
  company: string;
  designation: string;
  status: ContactStatus;
  notes: string;
}>;

class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const setSession = ({ user, accessToken }: AuthPayload) => {
  setAccessToken(accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const setAccessToken = (token: string | null) => {
  accessToken = token;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const clearSession = () => {
  setAccessToken(null);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = (): ApiUser | null => {
  const user = localStorage.getItem(USER_KEY);
  if (!user) return null;

  try {
    return JSON.parse(user) as ApiUser;
  } catch {
    clearSession();
    return null;
  }
};

const request = async <T>(path: string, options: RequestInit = {}, retry = true): Promise<T> => {
  const headers = new Headers(options.headers);
  const hasBody = options.body !== undefined;

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  if (response.status === 401 && retry && path !== '/auth/refresh') {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(path, options, false);
    }
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiClientError(payload?.message || 'Request failed', response.status);
  }

  return payload as T;
};

const normalizeStatus = (status?: ContactStatus): 'Lead' | 'Prospect' | 'Customer' => {
  if (status === 'Prospect' || status === 'Customer') return status;
  return 'Lead';
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));

const formatActivityTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));

const notesFromText = (notes: string | undefined, updatedAt: string): Note[] =>
  (notes || '')
    .split('\n\n')
    .map((content) => content.trim())
    .filter(Boolean)
    .map((content, index) => ({
      id: `${updatedAt}_${index}`,
      content,
      authorName: getStoredUser()?.name || 'You',
      authorInitials: (getStoredUser()?.name || 'You')
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      createdAt: formatDate(updatedAt)
    }));

export const mapApiContact = (contact: ApiContact): Contact => ({
  id: contact._id,
  name: contact.name,
  email: contact.email || '',
  phone: contact.phone || '',
  company: contact.company || '',
  designation: contact.designation || '',
  status: contact.status,
  createdAt: `Created ${formatDate(contact.createdAt)}`,
  lastActivity: formatDate(contact.updatedAt),
  avatarInitials: contact.name.substring(0, 2).toUpperCase(),
  notes: notesFromText(contact.notes, contact.updatedAt)
});

export const mapApiActivity = (activity: ApiActivity): Activity => ({
  id: activity._id,
  type: activity.type,
  actorName: activity.actorName,
  actorInitials: activity.actorInitials,
  targetName: activity.targetName,
  contactId: activity.targetContact,
  timestamp: formatActivityTime(activity.createdAt),
  description: activity.description,
  statusFrom: activity.statusFrom,
  statusTo: activity.statusTo,
  noteContent: activity.noteContent
});

const buildContactQuery = ({
  page = 1,
  limit = 10,
  search = ''
}: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  if (search.trim()) {
    params.set('search', search.trim());
  }

  return params.toString();
};

export const api = {
  hasSession: () => Boolean(accessToken),

  async signup(name: string, email: string, password: string) {
    const response = await request<{ data: AuthPayload }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    setSession(response.data);
    return response.data.user;
  },

  async login(email: string, password: string) {
    const response = await request<{ data: AuthPayload }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setSession(response.data);
    return response.data.user;
  },

  async me() {
    const response = await request<{ data: { user: ApiUser } }>('/auth/me');
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    return response.data.user;
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' }, false);
    } finally {
      clearSession();
    }
  },

  async restoreSession() {
    const refreshed = await refreshAccessToken(false);
    if (!refreshed) return null;
    return api.me();
  },

  async listContacts({ page = 1, limit = 10, search = '' } = {}): Promise<ContactListResult> {
    const query = buildContactQuery({ page, limit, search });
    const response = await request<{ data: { contacts: ApiContact[]; pagination: Pagination } }>(`/contacts?${query}`);

    return {
      contacts: response.data.contacts.map(mapApiContact),
      pagination: response.data.pagination
    };
  },

  async exportContacts() {
    const firstPage = await api.listContacts({ page: 1, limit: 100 });
    const pages = firstPage.pagination.pages;
    const contacts = [...firstPage.contacts];

    for (let page = 2; page <= pages; page += 1) {
      const result = await api.listContacts({ page, limit: 100 });
      contacts.push(...result.contacts);
    }

    return contacts;
  },

  async getContact(id: string) {
    const response = await request<{ data: { contact: ApiContact } }>(`/contacts/${id}`);
    return mapApiContact(response.data.contact);
  },

  async listActivities() {
    const response = await request<{ data: { activities: ApiActivity[] } }>('/activities?limit=50');
    return response.data.activities.map(mapApiActivity);
  },

  async recordEmailSent(contactId: string, subject: string) {
    const response = await request<{ data: { activity: ApiActivity } }>('/activities/email', {
      method: 'POST',
      body: JSON.stringify({ contactId, subject })
    });

    return mapApiActivity(response.data.activity);
  },

  async recordCallMade(contactId: string, discussion: string) {
    const response = await request<{ data: { activity: ApiActivity } }>('/activities/call', {
      method: 'POST',
      body: JSON.stringify({ contactId, discussion })
    });

    return mapApiActivity(response.data.activity);
  },

  async createContact(contact: ContactInput) {
    const response = await request<{ data: { contact: ApiContact } }>('/contacts', {
      method: 'POST',
      body: JSON.stringify({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        designation: contact.designation,
        status: normalizeStatus(contact.status),
        notes: contact.initialNote
      })
    });

    return mapApiContact(response.data.contact);
  },

  async updateContact(id: string, contact: ContactUpdateInput) {
    const payload = {
      ...contact,
      status: contact.status ? normalizeStatus(contact.status) : undefined
    };

    const response = await request<{ data: { contact: ApiContact } }>(`/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });

    return mapApiContact(response.data.contact);
  },

  async deleteContact(id: string) {
    await request(`/contacts/${id}`, { method: 'DELETE' });
  }
};

const refreshAccessToken = async (clearOnFailure = true) => {
  try {
    const response = await request<{ data: { accessToken: string } }>('/auth/refresh', {
      method: 'POST'
    }, false);
    setAccessToken(response.data.accessToken);
    return true;
  } catch {
    if (clearOnFailure) {
      clearSession();
    } else {
      setAccessToken(null);
    }
    return false;
  }
};
