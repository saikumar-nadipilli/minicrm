import { Mail, Phone, UserPlus, X } from "lucide-react";
import { createPortal } from "react-dom";
import { Activity } from "../types";

interface ActivityDetailsModalProps {
  activity: Activity;
  onClose: () => void;
}

const getTitle = (type: Activity["type"]) =>
  type
    .replace("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getIcon = (type: Activity["type"]) => {
  if (type === "call_made") return <Phone size={18} />;
  if (type === "contact_added") return <UserPlus size={18} />;
  return <Mail size={18} />;
};

export default function ActivityDetailsModal({
  activity,
  onClose,
}: ActivityDetailsModalProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-2xl overflow-hidden animate-fade-in-up border border-white max-h-[90vh] flex flex-col"
      >
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-surface-soft flex-shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Activity details
            </p>
            <h3 className="text-base font-extrabold text-slate-900">
              {getTitle(activity.type)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white rounded-xl transition-all text-slate-500 hover:text-slate-800"
            aria-label="Close activity details"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-white p-4">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
              {getIcon(activity.type)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-slate-900">
                {activity.targetName}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                {activity.timestamp}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Details
            </span>
            <div className="crm-input min-h-24 px-4 py-2.5 text-sm font-medium text-slate-700 leading-relaxed">
              {activity.noteContent ||
                activity.description ||
                `Activity recorded for ${activity.targetName}.`}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary-hover transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
