import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Activity as ActivityIcon,
  ArrowRight,
  Mail,
  Phone,
  RefreshCw,
  UserPlus,
  XCircle,
} from "lucide-react";
import { Activity } from "../types";
import ActivityDetailsModal from "./ActivityDetailsModal";

interface ActivityLogProps {
  activities: Activity[];
  onRefresh: () => void;
}

function ActivityLog({ activities, onRefresh }: ActivityLogProps) {
  const [visibleCount, setVisibleCount] = useState(4);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );

  const visibleActivities = useMemo(
    () => activities.slice(0, visibleCount),
    [activities, visibleCount],
  );

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + 4);
  }, []);

  const getActorAvatar = useCallback(
    (activity: Activity) => (
      <span className="text-[10px] font-bold text-primary">
        {activity.actorInitials ||
          activity.actorName.substring(0, 2).toUpperCase()}
      </span>
    ),
    [],
  );

  return (
    <div className="h-[calc(100vh-8rem)] min-h-0 flex flex-col gap-4 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Team timeline
          </p>
          <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Activity
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Track updates created from your CRM actions.
          </p>
        </div>
        {/* <button
          onClick={onRefresh}
          className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button> */}
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex-1 min-h-0 flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Live Stream
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {activities.length} events
          </span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-6 relative">
          {activities.length === 0 ? (
            <div className="py-14 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                <ActivityIcon size={22} />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                No activity yet
              </h4>
              <p className="text-sm font-medium text-slate-500 mt-1 max-w-sm">
                New actions like adding contacts, editing records, and writing
                notes will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-8 before:content-[''] before:absolute before:left-[26px] before:top-6 before:bottom-6 before:w-[1px] before:bg-slate-100">
              {visibleActivities.map((act) => (
                <div
                  key={act.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedActivity(act)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedActivity(act);
                    }
                  }}
                  className="flex gap-5 relative group cursor-pointer rounded-xl hover:bg-white/70 transition-colors"
                >
                  <div className="z-10 h-10 w-10 rounded-xl bg-surface-soft flex-shrink-0 flex items-center justify-center border-4 border-white overflow-hidden transition-all duration-300 group-hover:scale-110">
                    {getActorAvatar(act)}
                  </div>

                  <div className="flex-grow pt-1">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h4 className="text-sm font-bold text-slate-800">
                        {act.actorName} {act.type.replace("_", " ")}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        {act.timestamp}
                      </span>
                    </div>

                    {act.type === "contact_added" && (
                      <div className="bg-white rounded-xl p-4 flex items-center gap-3.5 mt-2 border border-slate-100 max-w-md">
                        <div className="h-9 w-9 bg-white rounded-full flex items-center justify-center border border-slate-100 text-primary">
                          <UserPlus size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {act.targetName}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                            {act.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {act.type === "status_changed" && (
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] px-2.5 py-0.5 bg-slate-100 text-slate-400 font-bold rounded-full line-through opacity-60 uppercase tracking-wider">
                          {act.statusFrom}
                        </span>
                        <ArrowRight size={14} className="text-slate-400" />
                        <span className="text-[10px] px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 font-bold rounded-full uppercase tracking-wider">
                          {act.statusTo}
                        </span>
                      </div>
                    )}

                    {act.type === "note_added" && (
                      <blockquote className="border-l-4 border-primary bg-slate-50/70 px-4 py-3 rounded-r-xl italic text-xs font-semibold text-slate-500 leading-relaxed mt-2">
                        "{act.noteContent}"
                      </blockquote>
                    )}

                    {act.type === "email_sent" && (
                      <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4 flex items-start gap-3 mt-2 max-w-lg">
                        <Mail
                          size={16}
                          className="text-primary mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {act.targetName}
                          </p>
                          <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                            {act.description ||
                              "Email sent from contact details."}
                          </p>
                        </div>
                      </div>
                    )}

                    {act.type === "call_made" && (
                      <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4 flex items-start gap-3 mt-2 max-w-lg">
                        <Phone
                          size={16}
                          className="text-primary mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {act.targetName}
                          </p>
                          <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                            {act.description ||
                              "Call activity recorded from contact details."}
                          </p>
                        </div>
                      </div>
                    )}

                    {act.type === "meeting_cancelled" && (
                      <div className="bg-red-50/30 border border-red-100 rounded-xl p-4 flex items-start gap-3 mt-2 max-w-lg">
                        <XCircle
                          size={16}
                          className="text-red-500 mt-0.5 flex-shrink-0"
                        />
                        <p className="text-xs font-semibold text-red-700 leading-normal">
                          {act.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {visibleCount < activities.length && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-center flex-shrink-0">
            <button
              onClick={handleLoadMore}
              className="font-bold text-xs uppercase tracking-wider text-primary hover:underline transition-all cursor-pointer"
            >
              Load More Activity
            </button>
          </div>
        )}
      </div>

      {selectedActivity && (
        <ActivityDetailsModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </div>
  );
}

export default memo(ActivityLog);
