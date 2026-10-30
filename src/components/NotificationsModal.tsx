import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { AppNotification } from '../types/index.ts';
import {
  X,
  Bell,
  CheckCheck,
  Trophy,
  Wallet,
  KeyRound,
  Info,
} from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
}) => {
  const { user, setUnreadNotifsCount } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!isOpen || !user) return;
    fetchNotifications();
  }, [isOpen, user?.id]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/user/notifications', {
        headers: { 'x-user-id': user?.id || '' },
      });
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (e) {
      console.error('Error fetching notifications', e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/user/notifications/mark-read', {
        method: 'POST',
        headers: { 'x-user-id': user?.id || '' },
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadNotifsCount(0);
    } catch (e) {
      console.error('Error marking notifications read', e);
    }
  };

  if (!isOpen) return null;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <KeyRound className="w-4 h-4 text-emerald-400" />;
      case 'reward':
        return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 'wallet':
        return <Wallet className="w-4 h-4 text-cyan-400" />;
      default:
        return <Info className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#0c0e18] border border-red-900/40 rounded-2xl shadow-2xl p-5 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-900/80 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-500" />
            <h3 className="font-gaming font-bold text-base text-white">
              NOTIFICATIONS
            </h3>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-400 font-semibold"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 space-y-2 py-3 pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-500">
              No new notifications right now.
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-3 rounded-xl border text-xs transition-colors flex items-start gap-3 ${
                  notif.isRead
                    ? 'bg-[#121522] border-gray-800/80 text-gray-300'
                    : 'bg-[#181d2e] border-red-900/50 text-white shadow-sm'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-black/40 border border-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                  {getNotifIcon(notif.type)}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-gaming font-bold text-xs text-white">
                      {notif.title}
                    </h5>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-snug">
                    {notif.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
