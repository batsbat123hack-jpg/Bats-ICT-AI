import React, { useState } from 'react';
import {
  X,
  Palette,
  History,
  Trash2,
  Download,
  ShieldCheck,
  Check,
  Sliders,
  User,
  Info,
} from 'lucide-react';
import { AppSettings, UserProfile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  user: UserProfile | null;
  onClearHistory: () => void;
  onExportHistory: () => void;
  onOpenSignIn: () => void;
  conversationCount: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  user,
  onClearHistory,
  onExportHistory,
  onOpenSignIn,
  conversationCount,
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'history'>('appearance');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [customColor, setCustomColor] = useState(settings.backgroundColor);

  if (!isOpen) return null;

  const presetBackgrounds = [
    { id: '#000000', name: 'Default Pitch Black', desc: 'True OLED 100% black (Default)' },
    { id: '#090a0f', name: 'Midnight Obsidian', desc: 'Subtle deep cosmic navy' },
    { id: '#0f172a', name: 'Slate Abyss', desc: 'Modern dark slate tint' },
    { id: '#120c1d', name: 'Cosmic Violet', desc: 'Dark galactic plum' },
    { id: '#081410', name: 'Emerald Night', desc: 'Deep cyber forest tint' },
    { id: '#18181b', name: 'Deep Zinc', desc: 'Refined neutral charcoal' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Bats AI Settings</h3>
              <p className="text-xs text-zinc-400">Personalize your experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-900 text-zinc-400 hover:text-white transition"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-zinc-800 px-6 bg-zinc-950/40">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`py-3 px-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'appearance'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Theme & Background</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'history'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Chat History & Privacy</span>
          </button>
        </div>

        {/* Tab content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === 'appearance' ? (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2">
                  Application Background Color
                </label>
                <p className="text-zinc-400 mb-3 text-xs">
                  Bats AI defaults to pure black, but you can choose your preferred ambient backdrop:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {presetBackgrounds.map((bg) => {
                    const isSelected = settings.backgroundColor.toLowerCase() === bg.id.toLowerCase();
                    return (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => {
                          onUpdateSettings({ backgroundColor: bg.id });
                          setCustomColor(bg.id);
                        }}
                        className={`p-3 rounded-2xl border text-left flex items-center space-x-3 transition ${
                          isSelected
                            ? 'bg-zinc-900 border-cyan-400 text-white ring-1 ring-cyan-500/30'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-xl border border-zinc-700 shadow-inner shrink-0"
                          style={{ backgroundColor: bg.id }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs text-zinc-100 flex items-center justify-between">
                            <span>{bg.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                          </div>
                          <div className="text-[10px] text-zinc-500 truncate">{bg.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom hex color input */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <span className="font-semibold text-zinc-200 text-xs">Custom Background Color</span>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      onUpdateSettings({ backgroundColor: e.target.value });
                    }}
                    className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                        onUpdateSettings({ backgroundColor: e.target.value });
                      }
                    }}
                    placeholder="#000000"
                    className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-mono text-zinc-200 w-32 focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[11px] text-zinc-500">Pick any custom hex color code</span>
                </div>
              </div>

              {/* Code formatting options */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <span className="font-semibold text-zinc-200 text-xs">Code Display Options</span>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-zinc-200 font-medium">Show Code Line Numbers</div>
                    <div className="text-[11px] text-zinc-500">Display line gutters on generated code blocks</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.codeLineNumbers}
                    onChange={(e) => onUpdateSettings({ codeLineNumbers: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* History & Privacy Tab */
            <div className="space-y-5">
              {/* Account Status Card */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-zinc-200">Account History Status</span>
                  </div>
                  {user ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold">
                      Recording Enabled
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-semibold">
                      Disabled (Guest Mode)
                    </span>
                  )}
                </div>

                {user ? (
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Chat history is being recorded and synced to your signed-in email:
                    <strong className="text-zinc-200 ml-1 font-mono">{user.email}</strong>.
                    You currently have <strong className="text-white">{conversationCount}</strong> saved conversation(s).
                  </p>
                ) : (
                  <div className="space-y-2 pt-1">
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      Per your privacy settings, chat history is <strong className="text-amber-300">only recorded</strong> when signed up with a valid email.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenSignIn();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-medium text-xs shadow-md"
                    >
                      Sign In with Email
                    </button>
                  </div>
                )}
              </div>

              {/* Data actions */}
              {user && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                    <div>
                      <div className="font-semibold text-zinc-200">Export All Chat History</div>
                      <div className="text-[11px] text-zinc-500">Download all conversations as a portable JSON file</div>
                    </div>
                    <button
                      onClick={onExportHistory}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-red-950/20 border border-red-900/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-red-300">Clear All Chat History</div>
                        <div className="text-[11px] text-zinc-400">Permanently delete all stored chats from this device</div>
                      </div>
                      {!showClearConfirm ? (
                        <button
                          onClick={() => setShowClearConfirm(true)}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-red-900/50 hover:bg-red-800 text-red-200 text-xs font-semibold transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clear All</span>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              onClearHistory();
                              setShowClearConfirm(false);
                            }}
                            className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                          >
                            Confirm Delete
                          </button>
                          <button
                            onClick={() => setShowClearConfirm(false)}
                            className="px-2 py-1 rounded-xl bg-zinc-800 text-zinc-400 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
