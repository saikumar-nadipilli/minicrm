import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Mail, Pencil, Phone, Plus, Send, X } from "lucide-react";
import { Activity, Contact } from "../types";
import ActivityDetailsModal from "./ActivityDetailsModal";

interface ContactDetailsProps {
  contact: Contact;
  activities: Activity[];
  onBack: () => void;
  onAddNote: (contactId: string, noteContent: string) => void;
  onEditContact: (contact: Contact) => void;
  onSendEmail: (
    contactId: string,
    subject: string,
    body: string,
  ) => Promise<void>;
  onRecordCall: (contactId: string, discussion: string) => Promise<void>;
}

export default function ContactDetails({
  contact,
  activities,
  onBack,
  onAddNote,
  onEditContact,
  onSendEmail,
  onRecordCall,
}: ContactDetailsProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState(
    `Following up with ${contact.name}`,
  );
  const [emailBody, setEmailBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callDiscussion, setCallDiscussion] = useState("");
  const [isSavingCall, setIsSavingCall] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );

  useEffect(() => {
    setEmailSubject(`Following up with ${contact.name}`);
    setEmailBody("");
    setCallDiscussion("");
  }, [contact.id, contact.name]);

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote(contact.id, newNoteText);
    setNewNoteText("");
    setIsAddingNote(false);
  };

  const handleOpenEmailApp = (subject: string, body: string) => {
    const mailtoUrl = `mailto:${encodeURIComponent(contact.email)}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const handleSendMail = async () => {
    const sentSubject = emailSubject;
    const sentBody = emailBody;

    setIsSendingEmail(true);

    try {
      await onSendEmail(contact.id, sentSubject, sentBody);
      setIsEmailModalOpen(false);
      setEmailSubject(`Following up with ${contact.name}`);
      setEmailBody("");
      handleOpenEmailApp(sentSubject, sentBody);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSubmitCall = async () => {
    if (!callDiscussion.trim()) return;

    setIsSavingCall(true);

    try {
      await onRecordCall(contact.id, callDiscussion.trim());
      setCallDiscussion("");
      setIsCallModalOpen(false);
    } finally {
      setIsSavingCall(false);
    }
  };

  const getActivityIcon = (type: Activity["type"]) => {
    if (type === "call_made") {
      return <Phone size={15} />;
    }

    return <Mail size={15} />;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Back Link */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex items-center text-xs font-bold text-primary hover:underline gap-1 cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Contacts</span>
        </button>
      </div>

      {/* Header Area */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary-container text-white flex items-center justify-center font-bold text-2xl sm:text-3xl overflow-hidden flex-shrink-0">
            {contact.avatarUrl ? (
              <img
                src={contact.avatarUrl}
                alt={contact.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span>
                {contact.avatarInitials ||
                  contact.name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight break-words">
                {contact.name}
              </h2>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Active
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {[contact.designation, contact.company]
                .filter(Boolean)
                .join(" - ") || "No role details added"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 self-start md:self-auto">
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Mail size={15} />
            <span>Email</span>
          </button>
          <button
            onClick={() => setIsCallModalOpen(true)}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer"
            aria-label="Record phone discussion"
          >
            <Phone size={15} />
          </button>
          <button
            onClick={() => onEditContact(contact)}
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Pencil size={15} />
            <span>Edit Contact</span>
          </button>
        </div>
      </div>

      {isEmailModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-sm"
            onClick={() => setIsEmailModalOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg rounded-2xl overflow-hidden animate-fade-in-up border border-white max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-surface-soft flex-shrink-0">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    Compose email
                  </p>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {contact.name}
                  </h3>
                </div>
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="p-1.5 hover:bg-white rounded-xl transition-all text-slate-500 hover:text-slate-800"
                  aria-label="Close email dialog"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMail();
                }}
                className="p-6 space-y-4 overflow-y-auto"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label
                      className="block text-xs font-bold text-slate-500 uppercase tracking-wider"
                      htmlFor="email-to"
                    >
                      Email Address
                    </label>
                    <input
                      id="email-to"
                      type="email"
                      value={contact.email}
                      readOnly
                      className="crm-input px-4 py-2.5 text-sm font-medium text-slate-500"
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label
                      className="block text-xs font-bold text-slate-500 uppercase tracking-wider"
                      htmlFor="email-subject"
                    >
                      Subject
                    </label>
                    <input
                      id="email-subject"
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="crm-input px-4 py-2.5 text-sm font-medium"
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label
                      className="block text-xs font-bold text-slate-500 uppercase tracking-wider"
                      htmlFor="email-body"
                    >
                      Body
                    </label>
                    <textarea
                      id="email-body"
                      rows={4}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Write your message..."
                      className="crm-input px-4 py-2.5 text-sm font-medium resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingEmail}
                    className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary-hover transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Send size={14} />
                    <span>{isSendingEmail ? "Sending..." : "Send Mail"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {isCallModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-sm"
            onClick={() => setIsCallModalOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg rounded-2xl overflow-hidden animate-fade-in-up border border-white max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-surface-soft flex-shrink-0">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    Phone discussion
                  </p>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {contact.name}
                  </h3>
                </div>
                <button
                  onClick={() => setIsCallModalOpen(false)}
                  className="p-1.5 hover:bg-white rounded-xl transition-all text-slate-500 hover:text-slate-800"
                  aria-label="Close phone dialog"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitCall();
                }}
                className="p-6 space-y-4 overflow-y-auto"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label
                      className="block text-xs font-bold text-slate-500 uppercase tracking-wider"
                      htmlFor="phone-number"
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone-number"
                      type="tel"
                      value={contact.phone || "No phone number added"}
                      readOnly
                      className="crm-input px-4 py-2.5 text-sm font-medium text-slate-500"
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label
                      className="block text-xs font-bold text-slate-500 uppercase tracking-wider"
                      htmlFor="call-discussion"
                    >
                      Discussion
                    </label>
                    <textarea
                      id="call-discussion"
                      rows={4}
                      value={callDiscussion}
                      onChange={(e) => setCallDiscussion(e.target.value)}
                      placeholder="Add call discussion details..."
                      className="crm-input px-4 py-2.5 text-sm font-medium resize-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsCallModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingCall || !callDiscussion.trim()}
                    className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary-hover transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Phone size={14} />
                    <span>{isSavingCall ? "Submitting..." : "Submit"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {selectedActivity && (
        <ActivityDetailsModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      )}

      {/* Bento Layout Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Details & Notes */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Contact Information Card */}
          <section className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Contact Information
              </h3>
              {/* <span className="text-slate-400">
                <Info size={18} />
              </span> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Email Address
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {contact.email}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Phone Number
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {contact.phone || "-"}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Company
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {contact.company}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Designation
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {contact.designation || "-"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Created Date
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {contact.createdAt.replace("Created ", "") ||
                      "Oct 24, 2023"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Notes Card */}
          <section className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Internal Notes
              </h3>
              <button
                onClick={() => setIsAddingNote(!isAddingNote)}
                className="text-primary font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer uppercase tracking-wider"
              >
                <Plus size={15} />
                <span>New Note</span>
              </button>
            </div>

            {/* Note writing field */}
            {isAddingNote && (
              <form
                onSubmit={handleSaveNote}
                className="mb-6 p-4 bg-white rounded-xl border border-slate-200 animate-fade-in-up"
              >
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Type internal note details here..."
                  rows={3}
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium resize-none"
                  required
                ></textarea>
                <div className="flex items-center justify-end gap-2.5 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNote(false);
                      setNewNoteText("");
                    }}
                    className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover cursor-pointer"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            )}

            {/* Notes List */}
            <div className="max-h-[260px] overflow-y-auto overscroll-contain pr-2 space-y-4">
              {contact.notes && contact.notes.length > 0 ? (
                contact.notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 bg-white/80 border border-slate-100 rounded-xl hover:bg-white transition-colors"
                  >
                    <p className="text-sm font-medium text-slate-700 italic">
                      "{note.content}"
                    </p>
                    <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-slate-100">
                      <div className="w-5.5 h-5.5 rounded-full bg-blue-50 text-[10px] font-bold text-primary flex items-center justify-center flex-shrink-0">
                        {note.authorInitials || "AV"}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {note.authorName} - {note.createdAt}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 font-medium text-sm">
                  No internal notes found. Click "New Note" above to write one.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Activity Log Timeline */}
        <div className="col-span-12 lg:col-span-4">
          <section className="glass-panel rounded-2xl p-6 h-full lg:max-h-[calc(100vh-10rem)] flex flex-col min-h-0">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex-shrink-0">
              Recent Activity
            </h3>

            {activities.length > 0 ? (
              <div className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-4">
                {activities.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedActivity(activity)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedActivity(activity);
                      }
                    }}
                    className="rounded-xl border border-slate-100 bg-white/80 p-4 cursor-pointer hover:bg-white hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-xl bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                          {activity.type.replace("_", " ")}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500 leading-relaxed">
                          {activity.description ||
                            `Activity recorded for ${activity.targetName}.`}
                        </p>
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 font-medium text-sm">
                No activity has been recorded for this contact yet.
              </div>
            )}

            {/* <button
              onClick={onBack}
              className="w-full mt-10 py-3 border border-slate-200 text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
            >
              Back to Contacts
            </button> */}
          </section>
        </div>
      </div>
    </div>
  );
}
