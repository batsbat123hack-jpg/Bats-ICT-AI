import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Download,
  Sparkles,
  ChevronDown,
  Globe,
  LogOut,
  ShieldCheck,
  History,
  PanelLeft,
} from 'lucide-react';
import { AIModel, UserProfile } from '../types';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  selectedModel: AIModel;
  models: AIModel[];
  onSelectModel: (model: AIModel) => void;
  useSearch: boolean;
  onToggleSearch: () => void;
  user: UserProfile | null;
  onOpenSignIn: () => void;
  onSignOut: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  selectedModel,
  models,
  onSelectModel,
  useSearch,
  onToggleSearch,
  user,
  onOpenSignIn,
  onSignOut,
  onOpenSettings,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 px-4 flex items-center justify-between select-none z-20">
      {/* Left side: If sidebar is closed, show sidebar toggle button + Gemini logo */}
      <div className="flex items-center space-x-2">
        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            aria-label="Open sidebar"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition"
            title="Expand sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Right side like reference image: Get app, Upgrade, and Profile/Sign-in */}
      <div className="flex items-center space-x-3 ml-auto">
        {/* Real-time search / Get app */}
        <button
          onClick={onToggleSearch}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
            useSearch
              ? 'bg-blue-950/80 text-blue-300 border border-blue-700/60'
              : 'hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
          }`}
          title={useSearch ? 'Real-time Grounding is ON' : 'Turn on Real-time Grounding'}
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">Real-time Search</span>
        </button>

        {/* Upgrade Blue Pill Button from reference image */}
        <button
          onClick={onOpenSettings}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Upgrade</span>
        </button>

        {/* User Account / Google Sign-in */}
        {user ? (
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-zinc-800 hover:ring-zinc-600 transition"
              aria-label="Account settings"
              aria-expanded={profileDropdownOpen}
            >
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase() || 'B'
              )}
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#18191d] border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in duration-100">
                <div className="p-3 border-b border-zinc-800">
                  <div className="font-semibold text-zinc-200">{user.name}</div>
                  <div className="text-[11px] text-zinc-400 truncate">{user.email}</div>
                  <div className="mt-2 text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 inline-flex items-center">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Bats AI History Active
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      onOpenSettings();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-zinc-300 hover:bg-zinc-800 rounded-xl transition text-left"
                  >
                    <History className="w-4 h-4 text-zinc-400" />
                    <span>Manage History & Theme</span>
                  </button>
                  <button
                    onClick={() => {
                      onSignOut();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-red-950/30 rounded-xl transition text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenSignIn}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white text-zinc-950 hover:bg-zinc-100 font-semibold text-xs shadow-md transition active:scale-95"
            aria-label="Sign in with email"
          >
            <span className="text-sm">🦇</span>
            <span>Sign in</span>
          </button>
        )}
      </div>
    </header>
  );
};
