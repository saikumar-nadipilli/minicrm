export type ContactStatus = 'Lead' | 'Prospect' | 'Customer' | 'Opportunity' | 'Inactive';

export interface Note {
  id: string;
  content: string;
  authorName: string;
  authorInitials: string;
  createdAt: string; // E.g., '2 days ago' or date string
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  designation: string;
  status: ContactStatus;
  createdAt: string; // E.g., 'Created 2 days ago'
  lastActivity: string; // E.g., '2 hours ago'
  avatarUrl?: string;
  avatarInitials?: string;
  notes: Note[];
}

export interface Activity {
  id: string;
  type: 'contact_added' | 'status_changed' | 'note_added' | 'meeting_cancelled' | 'call_made' | 'email_received' | 'email_sent';
  actorName: string;
  actorAvatarUrl?: string;
  actorInitials?: string;
  targetName: string;
  contactId?: string;
  timestamp: string; // E.g., '2 mins ago'
  description?: string;
  statusFrom?: ContactStatus;
  statusTo?: ContactStatus;
  noteContent?: string;
}

export type Screen = 'SIGN_IN' | 'SIGN_UP' | 'CONTACTS_DASHBOARD' | 'CONTACT_DETAILS' | 'ACTIVITY_LOG';
