import React, { useState } from 'react';
import { X, UserPlus, LogIn, Lock, User, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload =
      mode === 'login'
        ? { username: username.trim(), password: password.trim() }
        : {
            username: username.trim(),
            password: password.trim(),
            displayName: displayName.trim(),
          };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-[#090f24] border border-[#22305e] p-6 sm:p-8 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-2 border-b border-[#1b254a]">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DebateX Account</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              {mode === 'login' ? 'Sign In to Your Profile' : 'Create New Account'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#060913] border border-[#1b254a] text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Your Display Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#060913] border border-[#1b254a] text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Unique username"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#060913] border border-[#1b254a] text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your secret password"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#060913] border border-[#1b254a] text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#d946ef] to-[#06b6d4] hover:from-[#c026d3] hover:to-[#0891b2] text-white font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {mode === 'login' ? <LogIn className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
              <span>{isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
