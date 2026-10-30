import React from 'react';
import {
  Flame,
  Swords,
  Wallet,
  Trophy,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAdminPortal?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onOpenAdminPortal }) => {
  const { isAdmin } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Flame },
    { id: 'matches', label: 'Matches', icon: Swords },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'leaderboard', label: 'Leaders', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: ShieldCheck });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0c14]/95 backdrop-blur-lg border-t border-red-950/40 px-2 py-1.5 pb-2 sm:py-2 shadow-2xl max-w-lg mx-auto sm:max-w-none">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'admin' && onOpenAdminPortal) {
                  onOpenAdminPortal();
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative group select-none ${
                isActive ? 'text-red-500 scale-105' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {/* Active glow pill */}
              {isActive && (
                <div className="absolute -top-1.5 w-6 h-1 bg-red-500 rounded-full glow-red-sm" />
              )}
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-red-600/20 text-red-500'
                    : 'group-hover:bg-gray-800/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span
                className={`text-[10px] font-gaming tracking-wide uppercase transition-colors mt-0.5 ${
                  isActive ? 'font-bold text-red-400 glow-red-text' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
