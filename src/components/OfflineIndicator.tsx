import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-50 flex items-center gap-2 rounded-xl bg-amber-600/95 border border-amber-400 text-white px-3.5 py-2 text-xs font-semibold shadow-xl backdrop-blur-md animate-bounce">
      <WifiOff className="w-4 h-4 shrink-0 text-white" />
      <span>Offline Mode — Cached esports data and wallet state active.</span>
    </div>
  );
};
