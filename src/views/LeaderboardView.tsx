import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Trophy,
  Crown,
  Medal,
  Target,
  Swords,
  Flame,
  IndianRupee,
} from 'lucide-react';

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  ign: string;
  ffUid: string;
  avatar: string;
  totalEarned: number;
  matchesPlayed: number;
  matchesWon: number;
  totalKills: number;
  winRate: number;
}

export const LeaderboardView: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [filter, setFilter] = useState<'earnings' | 'kills' | 'wins'>('earnings');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [filter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?filter=${filter}`);
      const data = await res.json();
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    } catch (e) {
      console.error('Error fetching leaderboard', e);
    } finally {
      setLoading(false);
    }
  };

  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-3 sm:px-6 pt-3">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-gaming font-bold text-xl sm:text-2xl text-white tracking-wider flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <span>ESPORTS LEADERBOARD</span>
          </h2>
          <p className="text-xs text-gray-400">
            Top Free Fire India & MAX tournament champions and highest earners
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#10131f] rounded-xl border border-gray-800 text-xs font-gaming font-bold">
          <button
            onClick={() => setFilter('earnings')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'earnings'
                ? 'bg-red-600 text-white glow-red-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            💰 Top Earners
          </button>
          <button
            onClick={() => setFilter('kills')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'kills'
                ? 'bg-red-600 text-white glow-red-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🎯 Top Fraggers
          </button>
          <button
            onClick={() => setFilter('wins')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'wins'
                ? 'bg-red-600 text-white glow-red-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🏆 Most Wins
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-gray-400">Loading champions...</div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {top3.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-6 pb-2">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-400/20 p-1 border-2 border-slate-300">
                    <img
                      src={top3[1].avatar}
                      alt={top3[1].ign}
                      className="w-full h-full rounded-full object-cover bg-black"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-300 text-black font-gaming font-bold text-xs flex items-center justify-center shadow">
                    2
                  </div>
                </div>
                <div className="w-full p-2.5 sm:p-3.5 rounded-t-2xl bg-gradient-to-t from-[#141829] to-[#1c223a] border-t border-x border-slate-400/30 text-center space-y-0.5">
                  <span className="font-gaming font-bold text-xs sm:text-sm text-white block truncate">
                    {top3[1].ign}
                  </span>
                  <span className="text-[10px] text-gray-400 block font-mono">
                    UID: {top3[1].ffUid}
                  </span>
                  <span className="font-gaming font-bold text-xs sm:text-sm text-slate-300 block pt-1">
                    {filter === 'kills'
                      ? `${top3[1].totalKills} Kills`
                      : filter === 'wins'
                      ? `${top3[1].matchesWon} Wins`
                      : `₹${top3[1].totalEarned}`}
                  </span>
                </div>
              </div>

              {/* 1st Place (Champion) */}
              <div className="flex flex-col items-center">
                <Crown className="w-7 h-7 text-yellow-400 animate-bounce mb-1 fill-yellow-400/30" />
                <div className="relative mb-2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-yellow-500/20 p-1 border-2 border-yellow-400 glow-gold">
                    <img
                      src={top3[0].avatar}
                      alt={top3[0].ign}
                      className="w-full h-full rounded-full object-cover bg-black"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-black font-gaming font-bold text-xs flex items-center justify-center shadow-lg">
                    1
                  </div>
                </div>
                <div className="w-full p-3 sm:p-4 rounded-t-2xl bg-gradient-to-t from-[#1c180e] via-[#241f12] to-[#2d2514] border-t border-x border-yellow-500/50 text-center space-y-0.5 shadow-xl">
                  <span className="font-gaming font-bold text-xs sm:text-base text-yellow-300 block truncate">
                    {top3[0].ign}
                  </span>
                  <span className="text-[10px] text-yellow-500/80 block font-mono">
                    UID: {top3[0].ffUid}
                  </span>
                  <span className="font-gaming font-bold text-sm sm:text-base text-yellow-400 block pt-1 glow-red-text">
                    {filter === 'kills'
                      ? `${top3[0].totalKills} Kills`
                      : filter === 'wins'
                      ? `${top3[0].matchesWon} Wins`
                      : `₹${top3[0].totalEarned}`}
                  </span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-700/20 p-1 border-2 border-amber-600">
                    <img
                      src={top3[2].avatar}
                      alt={top3[2].ign}
                      className="w-full h-full rounded-full object-cover bg-black"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-600 text-white font-gaming font-bold text-xs flex items-center justify-center shadow">
                    3
                  </div>
                </div>
                <div className="w-full p-2.5 sm:p-3.5 rounded-t-2xl bg-gradient-to-t from-[#141829] to-[#1c1a24] border-t border-x border-amber-700/40 text-center space-y-0.5">
                  <span className="font-gaming font-bold text-xs sm:text-sm text-white block truncate">
                    {top3[2].ign}
                  </span>
                  <span className="text-[10px] text-gray-400 block font-mono">
                    UID: {top3[2].ffUid}
                  </span>
                  <span className="font-gaming font-bold text-xs sm:text-sm text-amber-500 block pt-1">
                    {filter === 'kills'
                      ? `${top3[2].totalKills} Kills`
                      : filter === 'wins'
                      ? `${top3[2].matchesWon} Wins`
                      : `₹${top3[2].totalEarned}`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Ranks 4 to 20 list */}
          <div className="space-y-1.5">
            {others.map(player => {
              const isCurrentUser = player.id === user?.id;
              return (
                <div
                  key={player.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    isCurrentUser
                      ? 'bg-red-950/30 border-red-500/60 shadow-sm'
                      : 'bg-[#121522] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-gaming font-bold text-gray-400 text-sm">
                      #{player.rank}
                    </span>
                    <img
                      src={player.avatar}
                      alt={player.ign}
                      className="w-8 h-8 rounded-full bg-black/40 border border-gray-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white tracking-tight">
                          {player.ign}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-red-600/30 border border-red-500/40 text-red-400 rounded">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">
                        UID: {player.ffUid} • Win Rate: {player.winRate}%
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-gaming font-bold text-emerald-400 text-sm block">
                      {filter === 'kills'
                        ? `${player.totalKills} Kills`
                        : filter === 'wins'
                        ? `${player.matchesWon} Wins`
                        : `₹${player.totalEarned}`}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {player.matchesPlayed} Matches Played
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
