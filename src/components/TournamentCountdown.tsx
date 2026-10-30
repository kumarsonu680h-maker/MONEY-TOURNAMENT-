import React, { useState, useEffect } from 'react';
import { Tournament } from '../types/index.ts';
import { Clock, Calendar, AlertTriangle, KeyRound, Radio, CheckCircle2 } from 'lucide-react';

interface TournamentCountdownProps {
  tournament: Tournament;
  compact?: boolean;
}

// Global server time offset in milliseconds (serverTime - clientTime)
let globalServerOffset = 0;
let hasSyncedServerTime = false;

export const syncServerTime = async () => {
  try {
    const start = Date.now();
    const res = await fetch('/api/time');
    if (!res.ok) return;
    const data = await res.json();
    const latency = (Date.now() - start) / 2;
    const serverTimestamp = data.timestamp + latency;
    globalServerOffset = serverTimestamp - Date.now();
    hasSyncedServerTime = true;
  } catch (e) {
    console.warn('Could not sync with server time, using local clock', e);
  }
};

/**
 * Format timestamp into exact Indian Standard Time (IST / Asia/Kolkata)
 * Example: "30 October 2026, 07:30 PM IST"
 */
export const formatExactISTTime = (isoOrStr?: string): string => {
  if (!isoOrStr) return 'Schedule TBA';

  // If already formatted with "IST", return directly
  if (isoOrStr.includes('IST') && isoOrStr.includes(',')) {
    return isoOrStr;
  }

  try {
    const date = new Date(isoOrStr);
    if (isNaN(date.getTime())) return isoOrStr;

    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    const formatted = new Intl.DateTimeFormat('en-IN', options).format(date);
    return `${formatted} IST`;
  } catch {
    return isoOrStr;
  }
};

export const TournamentCountdown: React.FC<TournamentCountdownProps> = ({
  tournament,
  compact = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });

  useEffect(() => {
    if (!hasSyncedServerTime) {
      syncServerTime();
    }

    const calculateTimeLeft = () => {
      const now = Date.now() + globalServerOffset;
      const targetTime = new Date(tournament.scheduledAt || tournament.scheduleTime).getTime();

      if (isNaN(targetTime)) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
        return;
      }

      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: diff });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds, totalMs: diff });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [tournament.scheduledAt, tournament.scheduleTime]);

  const exactIST = formatExactISTTime(tournament.scheduledAt || tournament.scheduleTime);
  const isCancelled = tournament.status === 'cancelled';
  const isCompleted = tournament.status === 'completed';
  const isLive = tournament.status === 'live';
  const isRoomOpen = tournament.status === 'room_open';
  const isStartingSoon = !isRoomOpen && !isLive && !isCompleted && !isCancelled && timeLeft.totalMs > 0 && timeLeft.totalMs <= 15 * 60 * 1000;

  if (isCancelled) {
    return (
      <div className="rounded-xl bg-red-950/50 border border-red-800/80 p-2.5 text-xs text-red-300 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
        <div>
          <span className="font-gaming font-bold text-red-400">MATCH CANCELLED</span>
          <p className="text-[11px] text-gray-300">
            {tournament.cancellationReason || 'Cancelled by tournament staff. Entry fee refunded.'}
          </p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-1">
        {/* Exact Start Time in IST */}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-300">
          <Calendar className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span className="font-semibold text-gray-400">Tournament Starts:</span>
          <span className="text-white font-medium truncate">{exactIST}</span>
        </div>

        {/* Live Countdown Row */}
        {!isCompleted && !isLive && (
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Starts In:</span>
            {timeLeft.totalMs > 0 ? (
              <div className="flex items-center gap-1 font-mono font-bold text-white text-[11px]">
                {timeLeft.days > 0 && (
                  <span className="bg-[#121522] border border-gray-800 px-1.5 py-0.5 rounded text-amber-400">
                    {timeLeft.days}d
                  </span>
                )}
                <span className="bg-[#121522] border border-gray-800 px-1.5 py-0.5 rounded text-cyan-400">
                  {String(timeLeft.hours).padStart(2, '0')}h
                </span>
                <span className="bg-[#121522] border border-gray-800 px-1.5 py-0.5 rounded text-red-400">
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </span>
                <span className="bg-[#121522] border border-gray-800 px-1.5 py-0.5 rounded text-yellow-400">
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            ) : isRoomOpen ? (
              <span className="font-gaming font-bold text-[11px] text-emerald-400 animate-pulse">
                ROOM OPEN NOW
              </span>
            ) : (
              <span className="font-gaming font-bold text-[11px] text-amber-400">
                STARTING SHORTLY
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full detailed display for Match Details Modal or Cards
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#121522] to-[#0a0c14] border border-red-900/40 p-4 space-y-3 shadow-lg glow-red-sm">
      {/* Exact Scheduled Start Time Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              EXACT TOURNAMENT START TIME
            </span>
            <span className="font-gaming font-bold text-sm sm:text-base text-white tracking-wide">
              {exactIST}
            </span>
          </div>
        </div>

        {/* Status Tag */}
        {isRoomOpen ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/30 border border-emerald-500 text-emerald-400 text-xs font-gaming font-bold animate-pulse self-start sm:self-center">
            <KeyRound className="w-3.5 h-3.5" /> ROOM OPEN
          </span>
        ) : isLive ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-gaming font-bold animate-pulse self-start sm:self-center">
            <Radio className="w-3.5 h-3.5" /> LIVE MATCH
          </span>
        ) : isCompleted ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-xs font-semibold self-start sm:self-center">
            <CheckCircle2 className="w-3.5 h-3.5" /> MATCH COMPLETED
          </span>
        ) : isStartingSoon ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500 text-amber-300 text-xs font-gaming font-bold animate-pulse self-start sm:self-center">
            <Clock className="w-3.5 h-3.5" /> STARTING SOON
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-black/60 border border-gray-800 text-gray-400 text-[11px] self-start sm:self-center">
            <Clock className="w-3 h-3 text-red-400" /> UPCOMING
          </span>
        )}
      </div>

      {/* Live Synchronized Countdown Timer */}
      {!isCompleted && !isLive && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-400 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              LIVE SYNCHRONIZED COUNTDOWN
            </span>
            <span className="text-[10px] text-gray-500 font-mono">Server Time Synced (IST)</span>
          </div>

          {timeLeft.totalMs > 0 ? (
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-[#090b12] border border-red-900/40 rounded-xl p-2 glow-red-sm">
                <span className="font-gaming font-extrabold text-xl sm:text-2xl text-amber-400 block font-mono">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Days</span>
              </div>
              <div className="bg-[#090b12] border border-red-900/40 rounded-xl p-2 glow-red-sm">
                <span className="font-gaming font-extrabold text-xl sm:text-2xl text-cyan-400 block font-mono">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Hours</span>
              </div>
              <div className="bg-[#090b12] border border-red-900/40 rounded-xl p-2 glow-red-sm">
                <span className="font-gaming font-extrabold text-xl sm:text-2xl text-red-500 block font-mono">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Minutes</span>
              </div>
              <div className="bg-[#090b12] border border-red-900/40 rounded-xl p-2 glow-red-sm">
                <span className="font-gaming font-extrabold text-xl sm:text-2xl text-yellow-400 block font-mono">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Seconds</span>
              </div>
            </div>
          ) : isRoomOpen ? (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-600/60 text-center">
              <span className="font-gaming font-bold text-sm text-emerald-400 flex items-center justify-center gap-2">
                <KeyRound className="w-4 h-4" /> ROOM ID & PASSWORD RELEASED!
              </span>
              <p className="text-[11px] text-gray-300 mt-0.5">
                Copy credentials and enter Free Fire custom lobby immediately.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/50 text-center text-amber-300 text-xs">
              Tournament schedule reached. Room credentials opening momentarily.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
