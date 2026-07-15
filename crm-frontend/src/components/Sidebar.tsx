import React, { memo, useCallback } from 'react';
import { Users, Activity as ActivityIcon, Handshake, LogOut, X } from 'lucide-react';
import { Screen } from '../types';

interface SidebarProps {
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ currentScreen, setScreen, onLogout, isOpen, onClose }: SidebarProps) {
  const handleNav = useCallback((screen: Screen) => {
    setScreen(screen);
    onClose();
  }, [onClose, setScreen]);

  const navClasses = useCallback((active: boolean) =>
    `flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150 ${
      active
        ? 'text-white bg-primary'
        : 'text-slate-600 hover:text-slate-950 hover:bg-white'
    }`, []);

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        id="sidebar-nav"
        className={`fixed left-0 top-0 h-full w-64 max-w-[80%] bg-[#f9fbfa]/95 border-r border-white/70 flex flex-col py-6 z-40 transition-transform duration-300 lg:translate-x-0 backdrop-blur-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white flex-shrink-0">
            <Handshake size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-lg text-slate-950 tracking-tight truncate">mini CRM</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sales Console</p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close menu"
            className="ml-auto lg:hidden p-1.5 -mr-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-grow space-y-1 px-3">
          <button
            onClick={() => handleNav('CONTACTS_DASHBOARD')}
            className={navClasses(
              currentScreen === 'CONTACTS_DASHBOARD' || currentScreen === 'CONTACT_DETAILS'
            )}
          >
            <Users size={18} />
            <span>Contacts</span>
          </button>

          <button
            onClick={() => handleNav('ACTIVITY_LOG')}
            className={navClasses(currentScreen === 'ACTIVITY_LOG')}
          >
            <ActivityIcon size={18} />
            <span>Activity</span>
          </button>
        </nav>

        <div className="mx-3 mt-auto rounded-2xl border border-slate-200 bg-white p-3">
          {/* <div className="px-1 pb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Workspace</p>
            <p className="mt-1 text-sm font-bold text-slate-800">Pipeline ready</p>
          </div> */}
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl font-semibold text-sm transition-all duration-150"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default memo(Sidebar);
