import React from 'react';
import {
  Flame,
  Wallet,
  Bell,
  Headphones,
  ShieldCheck,
  PlusCircle,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface HeaderProps {
  onOpenWallet: () => void;
  onOpenNotifications: () => void;
  onOpenSupport: () => void;
  onOpenAuth: () => void;
  onOpenAdminPortal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenWallet,
  onOpenNotifications,
  onOpenSupport,
  onOpenAuth,
  onOpenAdminPortal,
  activeTab,
  setActiveTab,
}) => {
  const { user, isAdmin, adminUser, unreadNotifsCount } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#08090d]/95 backdrop-blur-md border-b border-red-950/40 px-3 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-red-600 via-red-700 to-black p-0.5 glow-red-sm group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-[#0a0c14] rounded-[7px] flex items-center justify-center">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 animate-pulse fill-red-500/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-gaming font-bold text-lg sm:text-xl tracking-wider text-white">
                MONEY <span className="text-red-500 glow-red-text">TOURNAMENT</span>
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-600/20 border border-red-500/30 text-red-400 uppercase tracking-widest hidden xs:inline-block">
                FF INDIA & MAX
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium tracking-tight -mt-0.5 hidden sm:block">
              Daily Esports Cash Tournaments • Instant UPI Payouts
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Dedicated Admin Portal Entry (Secured) */}
          <button
            onClick={onOpenAdminPortal}
            className={`flex items-center gap-1.5 text-[11px] font-gaming font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
              isAdmin
                ? 'bg-red-600/20 border-red-500/50 text-red-400 glow-red-sm hover:bg-red-600/30'
                : 'bg-[#121522] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
            }`}
            title="Admin Portal (Staff Only)"
          >
            {isAdmin ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Admin Panel</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-red-500" />
                <span>Admin</span>
              </>
            )}
          </button>

          {/* Wallet Balance Pill */}
          {user ? (
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#171b29] to-[#121420] border border-red-900/40 hover:border-red-600/60 px-2.5 py-1.5 rounded-lg text-xs font-gaming font-bold text-white transition-all hover:scale-[1.02] shadow-sm"
            >
              <div className="w-6 h-6 rounded bg-red-600/20 flex items-center justify-center text-red-400">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-gray-400 leading-none block">Wallet</span>
                <span className="text-white text-xs sm:text-sm font-bold leading-none tracking-wide text-red-400">
                  ₹{user.wallet.totalBalance.toFixed(0)}
                </span>
              </div>
              <PlusCircle className="w-3.5 h-3.5 text-red-500 ml-0.5 hidden xs:block" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="bg-red-600 hover:bg-red-700 text-white font-gaming font-bold text-xs px-3 py-1.5 rounded-lg shadow-md transition-colors"
            >
              LOGIN
            </button>
          )}

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-[#141724] hover:bg-[#1c2236] text-gray-300 hover:text-white border border-gray-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Customer Support */}
          <button
            onClick={onOpenSupport}
            className="p-2 rounded-lg bg-[#141724] hover:bg-[#1c2236] text-gray-300 hover:text-red-400 border border-gray-800 transition-colors"
            title="Customer Support 24/7"
          >
            <Headphones className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
