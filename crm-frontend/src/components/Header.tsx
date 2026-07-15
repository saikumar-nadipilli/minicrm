import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { Search, Menu } from "lucide-react";

interface HeaderProps {
  onSearchChange: (query: string) => void;
  searchResetKey: string;
  placeholder?: string;
  userName: string;
  userEmail: string;
  onMenuClick: () => void;
}

function Header({
  onSearchChange,
  searchResetKey,
  placeholder = "Search contacts...",
  userName,
  userEmail,
  onMenuClick,
}: HeaderProps) {
  const [draftSearchQuery, setDraftSearchQuery] = useState("");
  const lastSubmittedSearch = useRef("");

  useEffect(() => {
    setDraftSearchQuery("");
    lastSubmittedSearch.current = "";
    onSearchChange("");
  }, [onSearchChange, searchResetKey]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (draftSearchQuery === lastSubmittedSearch.current) return;

      const nextSearchQuery = draftSearchQuery.trim();

      lastSubmittedSearch.current = nextSearchQuery;
      onSearchChange(nextSearchQuery);
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [draftSearchQuery, onSearchChange]);

  const initials = useMemo(
    () =>
      userName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "U",
    [userName],
  );

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white/80 border-b border-white/70 flex items-center gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 z-20 backdrop-blur-xl">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all flex-shrink-0"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center flex-1 min-w-0 max-w-2xl">
        <div className="relative w-full">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={draftSearchQuery}
            onChange={(e) => setDraftSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200"
            placeholder={placeholder}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-auto flex-shrink-0">
        {/* <button className="hidden sm:inline-flex p-2 text-slate-500 hover:text-slate-900 hover:bg-white rounded-xl transition-all relative">
          <Bell size={19} />
        </button>

        <button className="hidden sm:inline-flex p-2 text-slate-500 hover:text-slate-900 hover:bg-white rounded-xl transition-all">
          <Settings size={19} />
        </button> */}

        <div className="hidden sm:block h-8 w-px bg-slate-200 mx-1"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden lg:block">
            <p className="text-xs font-semibold text-slate-800 truncate max-w-[160px]">
              {userName || "Signed in user"}
            </p>
            <p className="text-[10px] font-medium text-slate-400 truncate max-w-[160px]">
              {userEmail || "Authenticated"}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl border border-white bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}

export default memo(Header);
