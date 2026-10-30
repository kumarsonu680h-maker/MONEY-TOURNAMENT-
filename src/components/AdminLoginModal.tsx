import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  ShieldAlert,
  Lock,
  Phone,
  KeyRound,
  X,
  AlertCircle,
  Crown,
  CheckCircle2,
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { adminLogin } = useAuth();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await adminLogin(mobile, password);
    setLoading(false);

    if (res.success) {
      onLoginSuccess();
      onClose();
    } else {
      setError(res.error || 'Admin authentication failed. Access denied.');
    }
  };

  const handleQuickFill = (adminType: 'super' | 'mod') => {
    if (adminType === 'super') {
      setMobile('9999999999');
      setPassword('adminpassword');
    } else {
      setMobile('8888888888');
      setPassword('modpassword');
    }
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#0a0c14] border border-red-600/50 rounded-2xl shadow-2xl p-6 overflow-hidden glow-red">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-900/80 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-black p-0.5 glow-red mx-auto flex items-center justify-center">
              <div className="w-full h-full bg-[#0a0c14] rounded-[14px] flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
              </div>
            </div>
            <h3 className="font-gaming font-bold text-xl text-white tracking-wider">
              STAFF & ADMIN COMMAND CENTER
            </h3>
            <p className="text-[11px] text-gray-400">
              Restricted Area • Role-Based Authentication Required
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-700/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Admin Mobile / Staff ID
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="e.g. 9999999999"
                  className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter staff security password"
                  className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-gaming font-bold text-xs uppercase tracking-wider glow-red-sm shadow-md transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Authenticate & Enter Admin Portal'}</span>
            </button>
          </form>

          {/* Quick Staff Credentials Hint & 1-Click Fill */}
          <div className="p-3 rounded-xl bg-[#121522] border border-gray-800/80 space-y-2">
            <span className="text-[10px] text-gray-400 uppercase font-bold block text-center">
              Authorized Staff Credentials (1-Click Test Access):
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('super')}
                className="p-2 rounded-lg bg-black/60 hover:bg-black/90 border border-yellow-900/40 text-left transition-colors"
              >
                <div className="flex items-center gap-1 font-gaming font-bold text-yellow-400">
                  <Crown className="w-3.5 h-3.5" /> Super Admin
                </div>
                <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                  9999999999
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('mod')}
                className="p-2 rounded-lg bg-black/60 hover:bg-black/90 border border-gray-800 text-left transition-colors"
              >
                <div className="font-gaming font-bold text-gray-300">
                  📋 Coordinator
                </div>
                <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                  8888888888
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
