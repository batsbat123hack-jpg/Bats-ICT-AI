import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (profile: UserProfile) => void;
  suggestedEmail?: string;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onSignIn,
  suggestedEmail = 'batsbat123.hack@gmail.com',
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateEmail = (str: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const calculatedName = name.trim() || email.split('@')[0];
    onSignIn({
      email: email.trim(),
      name: calculatedName,
      signedInAt: Date.now(),
    });
    onClose();
  };

  const handleQuickSignIn = (targetEmail: string, targetName: string) => {
    onSignIn({
      email: targetEmail,
      name: targetName,
      signedInAt: Date.now(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 sm:p-8">
        {/* Close Button & Brand */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md">
              <span className="text-sm">🦇</span>
            </div>
            <span className="font-bold text-white text-base">Sign in to Bats AI</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-zinc-400 text-xs mb-6 leading-relaxed">
          Sign in with your email to activate continuous conversation recording, multi-device history, and personalized models.
        </p>

        {/* 1-Click Fast Account Button */}
        {suggestedEmail && (
          <div className="mb-5">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Detected Account
            </div>
            <button
              onClick={() => handleQuickSignIn(suggestedEmail, 'Bats User')}
              className="w-full p-3 rounded-2xl bg-zinc-900 border border-zinc-700/80 hover:border-cyan-500/60 hover:bg-zinc-850 flex items-center justify-between text-left transition group shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                  {suggestedEmail.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                    Continue as Bats User
                  </div>
                  <div className="text-[11px] text-cyan-400 font-mono truncate">{suggestedEmail}</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
            </button>
          </div>
        )}

        <div className="relative my-3 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <span className="relative bg-zinc-950 px-3 text-[11px] text-zinc-500 uppercase">
            or enter your email
          </span>
        </div>

        {/* Custom Email Form */}
        <form onSubmit={handleCustomSubmit} className="space-y-3 mt-2">
          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="e.g. name@example.com"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1">
              Display Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {error && <p className="text-red-400 text-[11px]">{error}</p>}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 font-semibold text-xs shadow-lg transition mt-2 active:scale-98"
          >
            Sign In & Enable History
          </button>
        </form>

        <div className="mt-5 pt-3 border-t border-zinc-900 flex items-center justify-center space-x-1.5 text-[10px] text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted session • History recorded only after sign-in</span>
        </div>
      </div>
    </div>
  );
};
