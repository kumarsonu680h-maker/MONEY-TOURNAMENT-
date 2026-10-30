import React from 'react';
import { Tournament } from '../types/index.ts';
import {
  Trophy,
  Target,
  Users,
  MapPin,
  Clock,
  KeyRound,
  CheckCircle2,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface MatchCardProps {
  tournament: Tournament;
  onJoinClick: (tournament: Tournament) => void;
  onDetailsClick: (tournament: Tournament) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  tournament,
  onJoinClick,
  onDetailsClick,
}) => {
  const isJoined = (tournament as any).isUserJoined;
  const isFull = tournament.joinedCount >= tournament.maxSlots;
  const isRoomOpen = tournament.status === 'room_open';
  const isLive = tournament.status === 'live';
  const isCompleted = tournament.status === 'completed';

  // Calculate slots percentage
  const slotPercent = Math.min(
    100,
    Math.round((tournament.joinedCount / tournament.maxSlots) * 100)
  );

  const formatSchedule = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffMins = Math.round(diffMs / (1000 * 60));

      if (diffMins > 0 && diffMins <= 60) {
        return `Starts in ${diffMins}m`;
      } else if (diffMins > 60 && diffMins <= 1440) {
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `Starts in ${hours}h ${mins}m`;
      } else if (diffMins <= 0 && tournament.status === 'room_open') {
        return 'Room Open Now';
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return timeStr;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'BR':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
      case 'CS':
        return 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40';
      case 'Lone Wolf':
        return 'text-purple-400 bg-purple-950/40 border-purple-800/40';
      default:
        return 'text-red-400 bg-red-950/40 border-red-800/40';
    }
  };

  return (
    <div
      onClick={() => onDetailsClick(tournament)}
      className={`group relative overflow-hidden rounded-2xl bg-[#0c0e17] border transition-all duration-300 hover:shadow-2xl cursor-pointer ${
        isRoomOpen
          ? 'border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
          : isLive
          ? 'border-red-500/70 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
          : 'border-gray-800 hover:border-red-800/50'
      }`}
    >
      {/* Top Banner Header */}
      <div className="relative h-28 sm:h-32 w-full overflow-hidden">
        <img
          src={tournament.bannerUrl}
          alt={tournament.title}
          className="w-full h-full object-cover filter brightness-[0.45] transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e17] via-[#0c0e17]/60 to-transparent" />

        {/* Badges on Top */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-gaming font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getModeColor(
                tournament.matchType
              )}`}
            >
              {tournament.matchType} • {tournament.mode}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-gray-700 text-gray-300 uppercase">
              {tournament.game}
            </span>
          </div>

          {/* Status Badge */}
          {isRoomOpen ? (
            <span className="flex items-center gap-1 text-[10px] font-gaming font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white animate-pulse shadow-md">
              <KeyRound className="w-3 h-3" />
              ROOM OPEN
            </span>
          ) : isLive ? (
            <span className="flex items-center gap-1 text-[10px] font-gaming font-bold px-2.5 py-0.5 rounded-full bg-red-600 text-white animate-pulse shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              LIVE
            </span>
          ) : isCompleted ? (
            <span className="text-[10px] font-gaming font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700 uppercase">
              COMPLETED
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-gray-700 text-gray-300">
              <Clock className="w-3 h-3 text-red-400" />
              {formatSchedule(tournament.scheduleTime)}
            </span>
          )}
        </div>

        {/* Map and Timing info over banner */}
        <div className="absolute bottom-2 left-2.5 flex items-center gap-2 text-[11px] text-gray-300">
          <span className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded border border-gray-800">
            <MapPin className="w-3 h-3 text-red-400" />
            {tournament.map}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 space-y-3">
        {/* Title */}
        <div>
          <h3 className="font-gaming font-bold text-sm sm:text-base text-white tracking-wide group-hover:text-red-400 transition-colors line-clamp-1">
            {tournament.title}
          </h3>
        </div>

        {/* Economics Row: Prize Pool, Per Kill, Entry */}
        <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-[#131622] border border-gray-800/80">
          <div className="text-center border-r border-gray-800">
            <span className="text-[10px] font-medium text-gray-400 block leading-tight">
              Prize Pool
            </span>
            <span className="font-gaming font-bold text-xs sm:text-sm text-yellow-400 flex items-center justify-center gap-0.5 mt-0.5">
              <Trophy className="w-3 h-3" /> ₹{tournament.prizePool}
            </span>
          </div>

          <div className="text-center border-r border-gray-800">
            <span className="text-[10px] font-medium text-gray-400 block leading-tight">
              Per Kill
            </span>
            <span className="font-gaming font-bold text-xs sm:text-sm text-cyan-400 flex items-center justify-center gap-0.5 mt-0.5">
              <Target className="w-3 h-3" /> ₹{tournament.perKill}
            </span>
          </div>

          <div className="text-center">
            <span className="text-[10px] font-medium text-gray-400 block leading-tight">
              Entry Fee
            </span>
            <span
              className={`font-gaming font-bold text-xs sm:text-sm flex items-center justify-center gap-0.5 mt-0.5 ${
                tournament.entryFee === 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {tournament.entryFee === 0 ? 'FREE' : `₹${tournament.entryFee}`}
            </span>
          </div>
        </div>

        {/* Slots & Registration Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 text-gray-400">
              <Users className="w-3.5 h-3.5 text-gray-500" />
              <span>
                Joined: <strong className="text-white font-gaming">{tournament.joinedCount}</strong> / {tournament.maxSlots}
              </span>
            </span>
            <span className="text-gray-400 font-mono text-[10px]">
              {tournament.maxSlots - tournament.joinedCount > 0
                ? `${tournament.maxSlots - tournament.joinedCount} spots left`
                : 'House Full'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                slotPercent >= 90
                  ? 'bg-red-500 glow-red-sm'
                  : slotPercent >= 60
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${slotPercent}%` }}
            />
          </div>
        </div>

        {/* Action Button Row */}
        <div className="pt-1 flex items-center justify-between gap-2">
          {isJoined ? (
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Registered (Slot #{tournament.participants.find(p => p.userId === (tournament as any).userId)?.slotNo || 1})</span>
            </div>
          ) : (
            <div className="text-[11px] text-gray-500 flex items-center gap-1">
              <span>Fair Play Guaranteed</span>
            </div>
          )}

          <div>
            {isJoined && (isRoomOpen || isLive) ? (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDetailsClick(tournament);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-gaming font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition-all hover:scale-105"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Room ID</span>
              </button>
            ) : isCompleted ? (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDetailsClick(tournament);
                }}
                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-gaming font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-all"
              >
                <span>Results</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : isJoined ? (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDetailsClick(tournament);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#191d2c] hover:bg-[#21263a] text-gray-300 border border-gray-700 font-gaming font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-all"
              >
                <span>Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : isFull ? (
              <button
                disabled
                className="px-3.5 py-1.5 rounded-lg bg-gray-800/80 text-gray-500 font-gaming font-bold text-xs uppercase tracking-wider cursor-not-allowed"
              >
                Full
              </button>
            ) : (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onJoinClick(tournament);
                }}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-gaming font-bold text-xs uppercase tracking-wider glow-red-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Join</span>
                <span className="opacity-90">({tournament.entryFee === 0 ? 'Free' : `₹${tournament.entryFee}`})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
