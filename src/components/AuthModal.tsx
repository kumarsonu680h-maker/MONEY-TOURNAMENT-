import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  Flame,
  Phone,
  Lock,
  User as UserIcon,
  Gamepad2,
  Gift,
  AlertCircle,
  Crown,
  ShieldCheck,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [ign, setIgn] = useState('');
  const [ffUid, setFfUid] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'login') {
      const res = await login(mobile, password);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Login failed');
      }
    } else {
      const res = await register({
        mobile,
        name,
        ign,
        ffUid,
        password,
        referralCode: referralCode.trim() || undefined,
      });
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Registration failed');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#0c0e18] border border-red-900/40 rounded-2xl shadow-2xl p-5 overflow-y-auto max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-900/80 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          {/* Logo & Header */}
          <div className="text-center space-y-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-black p-0.5 glow-red-sm mx-auto flex items-center justify-center">
              <div className="w-full h-full bg-[#0a0c14] rounded-[10px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-red-500 animate-pulse fill-red-500/20" />
              </div>
            </div>
            <h3 className="font-gaming font-bold text-lg text-white">
              MONEY <span className="text-red-500 glow-red-text">TOURNAMENT</span>
            </h3>
            <p className="text-xs text-gray-400">
              Free Fire India & MAX Esports Platform
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-[#121522] rounded-xl border border-gray-800 text-xs font-gaming font-bold">
            <button
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-red-600 text-white glow-red-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-red-600 text-white glow-red-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              REGISTER
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Sonu Kumar"
                      className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Free Fire In-Game Name (IGN)
                  </label>
                  <div className="relative">
                    <Gamepad2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      required
                      value={ign}
                      onChange={e => setIgn(e.target.value)}
                      placeholder="e.g. 亗 ʀᴅx • ᴋɪʟʟᴇʀ 亗"
                      className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Free Fire Player UID
                  </label>
                  <input
                    type="text"
                    required
                    value={ffUid}
                    onChange={e => setFfUid(e.target.value)}
                    placeholder="e.g. 2849182371"
                    className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                10-Digit Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={mobile}
                  onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl pl-11 pr-3 py-2 text-xs text-white font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Referral Code <span className="text-emerald-400">(Get ₹25 Bonus Cash)</span>
                </label>
                <div className="relative">
                  <Gift className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={e => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="e.g. MT-7788"
                    className="w-full bg-[#121522] border border-gray-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono uppercase outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-gaming font-bold text-xs uppercase tracking-wider glow-red-sm shadow-md transition-all hover:scale-[1.02] active:scale-98"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'LOGIN TO PLAY' : 'REGISTER & GET ₹25 BONUS'}
            </button>
          </form>

          {/* Quick Demo Logins for instant evaluation */}
          <div className="pt-2 border-t border-gray-800">
            <span className="text-[10px] text-gray-500 uppercase font-bold block text-center mb-2">
              Quick 1-Click Player Fill:
            </span>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setMobile('9876543210');
                  setPassword('password123');
                }}
                className="py-1.5 px-3 bg-[#141724] hover:bg-[#1d2236] border border-gray-800 rounded-lg text-xs font-semibold text-gray-300 text-center flex items-center gap-1.5"
              >
                <span>🎮 Demo Player (9876543210)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
