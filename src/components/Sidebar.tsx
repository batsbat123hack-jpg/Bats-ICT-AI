import React, { useState } from 'react';
import {
  Sparkles,
  PenSquare,
  Image as ImageIcon,
  Code2,
  Sliders,
  Search,
  Filter,
  Settings as SettingsIcon,
  X,
  Pin,
  Trash2,
  Edit2,
  FolderLock,
  ChevronRight,
  Library,
  Video,
  Clock,
  Palette,
  PanelLeftClose,
} from 'lucide-react';
import { Conversation, UserProfile, ActiveTab } from '../types';
import { searchConversations } from '../utils/chat-logic';

interface SidebarProps {
  isOpen: boolean;
  onToggleSidebar: () => void;
  onCloseMobile?: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onPinConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  user: UserProfile | null;
  onOpenSignIn: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggleSidebar,
  activeTab,
  onSelectTab,
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onPinConversation,
  onRenameConversation,
  user,
  onOpenSignIn,
  onOpenSettings,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = searchConversations(conversations, searchQuery);

  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="w-64 md:w-72 h-full bg-[#0e0e11] text-zinc-300 flex flex-col shrink-0 border-r border-zinc-800/60 select-none z-30 transition-all duration-200">
      {/* Top Header: Gemini Logo + Search + Sidebar collapse toggle */}
      <div className="h-14 px-4 flex items-center justify-between">
        <button
          onClick={() => {
            onNewChat();
            onSelectTab('chat');
          }}
          className="flex items-center space-x-2.5 text-left group"
        >
          {/* Bats AI insignia */}
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[1.5px] flex items-center justify-center shadow-md">
            <div className="w-full h-full bg-[#0e0e11] rounded-[10px] flex items-center justify-center">
              <span className="text-xs">🦇</span>
            </div>
          </div>
          <span className="font-bold text-base text-zinc-100 tracking-tight group-hover:text-white transition">
            Bats AI
          </span>
        </button>

        <div className="flex items-center space-x-1 text-zinc-400">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-1.5 rounded-lg hover:text-white hover:bg-zinc-800/80 transition"
            title="Search conversations"
            aria-label="Search conversations"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg hover:text-white hover:bg-zinc-800/80 transition"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input when opened */}
      {searchOpen && (
        <div className="px-3 pb-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              autoFocus
              className="w-full bg-zinc-900 border border-zinc-700/60 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Action: New chat */}
      <div className="px-3 pt-1 pb-2">
        <button
          onClick={() => {
            onNewChat();
            onSelectTab('chat');
          }}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800/90 text-zinc-200 hover:text-white text-xs md:text-sm font-medium transition shadow-sm"
        >
          <PenSquare className="w-4 h-4 text-zinc-400" />
          <span>New chat</span>
        </button>
      </div>

      {/* Quick Navigation Items like in reference image */}
      <div className="px-2 space-y-0.5 text-xs">
        <button
          onClick={() => onSelectTab('image')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition ${
            activeTab === 'image'
              ? 'bg-zinc-800/90 text-white font-medium'
              : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-purple-400" />
          <span>Images</span>
        </button>

        <button
          onClick={() => onSelectTab('codex')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition ${
            activeTab === 'codex'
              ? 'bg-zinc-800/90 text-white font-medium'
              : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200'
          }`}
        >
          <Code2 className="w-4 h-4 text-blue-400" />
          <span>Codex</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200 transition"
        >
          <Sliders className="w-4 h-4 text-zinc-400" />
          <span>Customize</span>
        </button>
      </div>

      {/* Section Divider: All History */}
      <div className="mt-3 px-4 pt-3 pb-1 border-t border-zinc-800/50 flex items-center justify-between text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
        <span>All</span>
        <Filter className="w-3.5 h-3.5 text-zinc-500" />
      </div>

      {/* History List or Sign-In Requirement Prompt */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 text-xs">
        {user ? (
          filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const isCurrent = conv.id === currentConversationId && activeTab === 'chat';
              const isEditing = conv.id === editingId;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onSelectTab('chat');
                  }}
                  className={`group relative flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition ${
                    isCurrent
                      ? 'bg-zinc-800 text-white font-medium'
                      : 'text-zinc-400 hover:bg-zinc-900/90 hover:text-zinc-200'
                  }`}
                >
                  {isEditing ? (
                    <form
                      onSubmit={(e) => saveRename(conv.id, e)}
                      className="flex-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                        onBlur={() => setEditingId(null)}
                        className="w-full bg-zinc-950 border border-cyan-500 px-2 py-1 rounded text-xs text-white focus:outline-none"
                      />
                    </form>
                  ) : (
                    <span className="truncate flex-1 pr-2 text-xs">{conv.title}</span>
                  )}

                  {!isEditing && (
                    <div className="hidden group-hover:flex items-center space-x-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPinConversation(conv.id);
                        }}
                        title={conv.pinned ? 'Unpin' : 'Pin'}
                        className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white"
                      >
                        <Pin className={`w-3 h-3 ${conv.pinned ? 'text-cyan-400 fill-cyan-400' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => startRename(conv, e)}
                        title="Rename"
                        className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv.id);
                        }}
                        title="Delete"
                        className="p-1 rounded hover:bg-zinc-700 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-6 px-3 text-center text-zinc-500 text-xs leading-relaxed">
              {searchQuery ? 'No conversations found.' : 'No recent chats. Start a conversation!'}
            </div>
          )
        ) : (
          /* When NOT signed in: Chat history only recorded if person signed up with email */
          <div className="m-2 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-center space-y-2.5">
            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-amber-400">
              <FolderLock className="w-3.5 h-3.5" />
            </div>
            <div className="text-[11px] text-zinc-400 leading-snug">
              Chat history is only recorded when you sign in with your email.
            </div>
            <button
              onClick={onOpenSignIn}
              className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-[11px] font-semibold transition"
            >
              Sign in to record
            </button>
          </div>
        )}
      </div>

      {/* Bottom Profile Footer: User Avatar + Name + Settings Gear */}
      <div className="h-16 px-3 border-t border-zinc-800/80 flex items-center justify-between bg-[#0e0e11]">
        {user ? (
          <div className="flex items-center space-x-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase() || 'B'
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-zinc-200 truncate">{user.name}</span>
              <span className="text-[10px] text-zinc-500 truncate">{user.email}</span>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenSignIn}
            className="flex items-center space-x-2 min-w-0 flex-1 text-left text-zinc-400 hover:text-zinc-200 text-xs"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-medium text-xs">
              ?
            </div>
            <span className="font-medium text-xs">Sign in with Email</span>
          </button>
        )}

        {/* Gear icon on far right */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition"
          title="Settings (Background color & history)"
          aria-label="Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
