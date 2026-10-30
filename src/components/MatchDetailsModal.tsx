import React, { useState } from 'react';
import { Tournament } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  Trophy,
  Target,
  Users,
  MapPin,
  Clock,
  KeyRound,
  Copy,
  Check,
  ShieldAlert,
  AlertCircle,
  HelpCircle,
  Award,
} from 'lucide-react';

interface MatchDetailsModalProps {
  tournament: Tournament | null;
  onClose: () => void;
  onJoinClick: (tournament: Tournament) => void;
}

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({
  tournament,
  onClose,
  onJoinClick,
}) => {
  const { user } = useAuth();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'rules' | 'participants' | 'results'>('info');

  if (!tournament) return null;

  const isJoined = tournament.participants.some(p => p.userId === user?.id);
  const isStaff = user?.role === 'super_admin' || user?.role === 'tournament_manager';
  const canSeeRoom =
    isStaff ||
    (isJoined &&
      (tournament.status === 'room_open' ||
        tournament.status === 'live' ||
        tournament.status === 'completed'));

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-[#0c0e18] border border-red-900/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header with image */}
        <div className="relative h-36 sm:h-44 w-full shrink-0">
          <img
            src={tournament.bannerUrl}
            alt={tournament.title}
            className="w-full h-full object-cover filter brightness-[0.35]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e18] via-[#0c0e18]/60 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-gray-400 hover:text-white border border-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title and game badges */}
          <div className="absolute bottom-3 left-4 right-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-gaming font-bold px-2 py-0.5 rounded bg-red-600/30 border border-red-500/50 text-red-400 uppercase">
                {tournament.matchType} • {tournament.mode}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                {tournament.game}
              </span>
              <span className="text-[10px] text-gray-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-400" />
                {tournament.map}
              </span>
            </div>
            <h2 className="font-gaming font-bold text-lg sm:text-xl text-white tracking-wide">
              {tournament.title}
            </h2>
          </div>
        </div>

        {/* Navigation Tabs inside modal */}
        <div className="flex items-center border-b border-gray-800 px-4 bg-[#0a0c14] text-xs font-gaming font-semibold">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-red-500 text-red-400 font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Match Info
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'rules'
                ? 'border-red-500 text-red-400 font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Rules & Fair Play
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'participants'
                ? 'border-red-500 text-red-400 font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Participants ({tournament.joinedCount})
          </button>
          {tournament.status === 'completed' && (
            <button
              onClick={() => setActiveTab('results')}
              className={`py-2.5 px-3 border-b-2 transition-colors ${
                activeTab === 'results'
                  ? 'border-red-500 text-red-400 font-bold'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Results
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* ROOM ID / PASSWORD LIVE UNLOCK BOX */}
          {canSeeRoom ? (
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 via-[#0e161f] to-[#0a1215] border border-emerald-500/50 shadow-lg glow-cyan space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-gaming font-bold text-sm text-emerald-300">
                      ROOM CREDENTIALS UNLOCKED
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      Join Custom Room in Free Fire before the match begins
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  Active
                </span>
              </div>

              {tournament.roomId ? (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* Room ID */}
                  <div className="bg-black/50 p-2.5 rounded-lg border border-emerald-900/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-mono block">
                        Room ID
                      </span>
                      <span className="font-mono font-bold text-base text-white tracking-widest">
                        {tournament.roomId}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(tournament.roomId || '', 'room')}
                      className="p-1.5 rounded-md bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-300 transition-colors"
                      title="Copy Room ID"
                    >
                      {copiedField === 'room' ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Room Password */}
                  <div className="bg-black/50 p-2.5 rounded-lg border border-emerald-900/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-mono block">
                        Password
                      </span>
                      <span className="font-mono font-bold text-base text-white tracking-widest">
                        {tournament.roomPassword || 'None'}
                      </span>
                    </div>
                    {tournament.roomPassword && (
                      <button
                        onClick={() => handleCopy(tournament.roomPassword || '', 'pass')}
                        className="p-1.5 rounded-md bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-300 transition-colors"
                        title="Copy Password"
                      >
                        {copiedField === 'pass' ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 text-xs text-amber-400 font-medium bg-amber-950/20 rounded-lg border border-amber-900/30">
                  Room ID is being set up by Match Coordinator. Will appear here in a moment.
                </div>
              )}

              {/* In-game join instructions */}
              <div className="text-[11px] text-gray-300 bg-black/40 p-2.5 rounded-lg border border-gray-800 space-y-1">
                <p className="font-semibold text-gray-200">How to join in Free Fire:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-gray-400 text-[10px]">
                  <li>Open Free Fire India or Free Fire MAX on your mobile device</li>
                  <li>Click on Modes &rarr; select <strong>Custom</strong></li>
                  <li>Search for Room ID: <strong className="text-white">{tournament.roomId}</strong></li>
                  <li>Enter Password: <strong className="text-white">{tournament.roomPassword}</strong></li>
                  <li>Select your assigned slot and wait for host to start!</li>
                </ol>
              </div>
            </div>
          ) : isJoined ? (
            <div className="p-3.5 rounded-xl bg-[#141724] border border-gray-800 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">
                  Room credentials unlock 15 minutes before match start
                </p>
                <p className="text-[11px] text-gray-400">
                  Keep this screen open or check push notifications when the room goes live.
                </p>
              </div>
            </div>
          ) : null}

          {/* TAB: INFO */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Prize Pool Breakdown */}
              <div className="bg-[#10131f] border border-gray-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <h4 className="font-gaming font-bold text-xs uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    Prize Pool Breakdown (Total: ₹{tournament.prizePool})
                  </h4>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Per Kill: ₹{tournament.perKill}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#181c2d] p-2.5 rounded-lg text-center border border-yellow-900/30">
                    <span className="text-[10px] font-bold text-yellow-400 block uppercase">
                      🥇 1st Place
                    </span>
                    <span className="font-gaming font-bold text-sm sm:text-base text-white">
                      ₹{tournament.prizeDistribution.rank1}
                    </span>
                  </div>

                  <div className="bg-[#181c2d] p-2.5 rounded-lg text-center border border-gray-700/40">
                    <span className="text-[10px] font-bold text-gray-300 block uppercase">
                      🥈 2nd Place
                    </span>
                    <span className="font-gaming font-bold text-sm sm:text-base text-white">
                      ₹{tournament.prizeDistribution.rank2}
                    </span>
                  </div>

                  <div className="bg-[#181c2d] p-2.5 rounded-lg text-center border border-amber-900/30">
                    <span className="text-[10px] font-bold text-amber-600 block uppercase">
                      🥉 3rd Place
                    </span>
                    <span className="font-gaming font-bold text-sm sm:text-base text-white">
                      ₹{tournament.prizeDistribution.rank3 || 0}
                    </span>
                  </div>
                </div>

                {tournament.perKill > 0 && (
                  <div className="bg-cyan-950/20 border border-cyan-800/30 p-2 rounded-lg text-center text-xs text-cyan-300 font-medium">
                    ⚡ Kill Bounty: Each kill earns an extra <strong>₹{tournament.perKill}</strong> credited directly to your winning wallet!
                  </div>
                )}
              </div>

              {/* Match Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-[#10131f] border border-gray-800 p-2.5 rounded-xl">
                  <span className="text-[10px] text-gray-500 block">Game Mode</span>
                  <span className="font-semibold text-white mt-0.5 block font-gaming">
                    {tournament.matchType} ({tournament.mode})
                  </span>
                </div>
                <div className="bg-[#10131f] border border-gray-800 p-2.5 rounded-xl">
                  <span className="text-[10px] text-gray-500 block">Map</span>
                  <span className="font-semibold text-white mt-0.5 block font-gaming">
                    {tournament.map}
                  </span>
                </div>
                <div className="bg-[#10131f] border border-gray-800 p-2.5 rounded-xl">
                  <span className="text-[10px] text-gray-500 block">Entry Fee</span>
                  <span className="font-semibold text-red-400 mt-0.5 block font-gaming">
                    {tournament.entryFee === 0 ? 'FREE' : `₹${tournament.entryFee}`}
                  </span>
                </div>
                <div className="bg-[#10131f] border border-gray-800 p-2.5 rounded-xl">
                  <span className="text-[10px] text-gray-500 block">Total Slots</span>
                  <span className="font-semibold text-white mt-0.5 block font-gaming">
                    {tournament.joinedCount} / {tournament.maxSlots}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="bg-[#10131f] border border-gray-800 rounded-xl p-3.5 space-y-2">
                <h4 className="font-gaming font-bold text-xs uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Tournament Official Rules
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-300">
                  {tournament.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-3 space-y-1 text-xs text-red-300">
                <div className="flex items-center gap-1.5 font-bold font-gaming">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  STRICT ANTI-CHEAT & FAIR PLAY PLEDGE
                </div>
                <p className="text-[11px] text-gray-400">
                  Emulators (Bluestacks, LDPlayer), modded APKs, headshot scripts, antennas, or teaming up in Solo matches are strictly banned. Offenders will face immediate hardware/account ban and forfeiture of all wallet balance.
                </p>
              </div>
            </div>
          )}

          {/* TAB: PARTICIPANTS */}
          {activeTab === 'participants' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                <span>Roster ({tournament.participants.length} players joined)</span>
                <span>Max: {tournament.maxSlots}</span>
              </div>

              {tournament.participants.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs">
                  No participants yet. Be the first to claim Slot #1!
                </div>
              ) : (
                <div className="space-y-1.5">
                  {tournament.participants.map(p => (
                    <div
                      key={p.userId}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#121522] border border-gray-800/80 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded bg-black/50 border border-gray-700 flex items-center justify-center font-mono font-bold text-[10px] text-gray-400">
                          #{p.slotNo}
                        </span>
                        <img
                          src={p.avatar}
                          alt={p.ign}
                          className="w-7 h-7 rounded-full bg-black/40 border border-gray-700"
                        />
                        <div>
                          <div className="font-semibold text-white tracking-tight flex items-center gap-1.5">
                            <span>{p.ign}</span>
                            {p.userId === user?.id && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-red-600/30 border border-red-500/40 text-red-400 rounded">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-500 font-mono">
                            UID: {p.ffUid} {p.teamName ? `• ${p.teamName}` : ''}
                          </span>
                        </div>
                      </div>

                      {p.prizeWon !== undefined && p.prizeWon > 0 && (
                        <span className="font-gaming font-bold text-xs text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                          +₹{p.prizeWon}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: RESULTS (FOR COMPLETED MATCHES) */}
          {activeTab === 'results' && (
            <div className="space-y-3">
              <div className="bg-[#10131f] border border-gray-800 rounded-xl p-3.5 space-y-2">
                <h4 className="font-gaming font-bold text-xs uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> Match Leaderboard & Winners
                </h4>

                <div className="space-y-2 pt-1">
                  {tournament.participants
                    .filter(p => p.rank !== undefined)
                    .sort((a, b) => (a.rank || 99) - (b.rank || 99))
                    .map(winner => (
                      <div
                        key={winner.userId}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#141829] border border-gray-800 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center justify-center font-gaming font-bold text-xs">
                            #{winner.rank}
                          </span>
                          <img
                            src={winner.avatar}
                            alt={winner.ign}
                            className="w-7 h-7 rounded-full bg-black/40 border border-gray-700"
                          />
                          <div>
                            <span className="font-semibold text-white block">
                              {winner.ign}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              Kills: {winner.kills || 0}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-gaming font-bold text-emerald-400 block text-sm">
                            ₹{winner.prizeWon || 0}
                          </span>
                          <span className="text-[9px] text-gray-400">Credited to Wallet</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-3.5 border-t border-gray-800 bg-[#0a0c14] flex items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-gray-400 block leading-tight text-[10px]">Entry Fee</span>
            <span
              className={`font-gaming font-bold text-base leading-tight ${
                tournament.entryFee === 0 ? 'text-emerald-400' : 'text-white'
              }`}
            >
              {tournament.entryFee === 0 ? 'FREE' : `₹${tournament.entryFee}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-gaming text-xs font-semibold"
            >
              Close
            </button>

            {!isJoined && tournament.status !== 'completed' && tournament.status !== 'cancelled' && (
              <button
                disabled={tournament.joinedCount >= tournament.maxSlots}
                onClick={() => {
                  onClose();
                  onJoinClick(tournament);
                }}
                className={`px-5 py-2 rounded-xl font-gaming font-bold text-xs uppercase tracking-wider transition-all ${
                  tournament.joinedCount >= tournament.maxSlots
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white glow-red-sm hover:scale-105 active:scale-95'
                }`}
              >
                {tournament.entryFee === 0 ? 'Join Free' : `Join Match (₹${tournament.entryFee})`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
