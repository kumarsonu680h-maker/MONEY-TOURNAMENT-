import React, { useState } from 'react';
import { Tournament } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import confetti from 'canvas-confetti';
import {
  X,
  Flame,
  ShieldCheck,
  AlertTriangle,
  Wallet,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';

interface JoinMatchModalProps {
  tournament: Tournament | null;
  onClose: () => void;
  onSuccess: (joinedMatch: Tournament) => void;
  onOpenDeposit: () => void;
}

export const JoinMatchModal: React.FC<JoinMatchModalProps> = ({
  tournament,
  onClose,
  onSuccess,
  onOpenDeposit,
}) => {
  const { user, refreshUser } = useAuth();
  const [ign, setIgn] = useState(user?.ign || '');
  const [ffUid, setFfUid] = useState(user?.ffUid || '');
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [joinedSuccess, setJoinedSuccess] = useState(false);
  const [assignedSlot, setAssignedSlot] = useState<number | null>(null);

  if (!tournament || !user) return null;

  const entryFee = tournament.entryFee;
  const maxBonus = Math.floor(entryFee * 0.1);
  const bonusUsed = Math.min(user.wallet.bonusBalance, maxBonus);
  const payableAmount = entryFee - bonusUsed;
  const hasSufficientBalance = user.wallet.totalBalance >= entryFee;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!ign.trim() || !ffUid.trim()) {
      setError('Please provide your Free Fire In-Game Name (IGN) and Player UID');
      return;
    }

    if (entryFee > 0 && !hasSufficientBalance) {
      setError(`Insufficient wallet balance. You need ₹${entryFee} to join this tournament.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          ign: ign.trim(),
          ffUid: ffUid.trim(),
          teamName: teamName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to join tournament');
      }

      setAssignedSlot(data.slotNo);
      setJoinedSuccess(true);
      await refreshUser();

      // Launch victory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#f59e0b', '#06b6d4'],
      });

      setTimeout(() => {
        onSuccess(data.match);
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#0c0e18] border border-red-900/40 rounded-2xl shadow-2xl p-5 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-900/80 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {joinedSuccess ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto glow-cyan animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="font-gaming font-bold text-xl text-white">
              REGISTRATION CONFIRMED!
            </h3>
            <p className="text-xs text-gray-300">
              You are assigned to <strong className="text-emerald-400 font-mono text-sm">Slot #{assignedSlot}</strong> for{' '}
              <span className="text-white font-semibold">{tournament.title}</span>.
            </p>
            <p className="text-[11px] text-gray-500">
              Room ID and Password will unlock in this match card 15 minutes before match start.
            </p>
          </div>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-gaming font-bold text-base text-white">
                  JOIN TOURNAMENT
                </h3>
                <p className="text-[10px] text-gray-400 font-medium">
                  {tournament.matchType} • {tournament.mode} • {tournament.map}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-900/60 text-red-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Inputs: IGN and Free Fire UID */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  In-Game Name (IGN) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ign}
                  onChange={e => setIgn(e.target.value)}
                  placeholder="e.g. 亗 ʀᴅx • ᴋɪʟʟᴇʀ 亗"
                  className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Free Fire Player UID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ffUid}
                  onChange={e => setFfUid(e.target.value)}
                  placeholder="e.g. 2849182371"
                  className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-gray-500 outline-none transition-colors"
                />
              </div>

              {tournament.mode !== 'Solo' && (
                <div>
                  <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                    Team Name <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    placeholder="e.g. RDX ESPORTS"
                    className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none transition-colors"
                  />
                </div>
              )}
            </div>

            {/* Financial Deduction Card */}
            <div className="bg-[#10131f] border border-gray-800 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-400">
                <span>Entry Fee:</span>
                <span className="font-gaming font-bold text-white">
                  {entryFee === 0 ? 'FREE' : `₹${entryFee}`}
                </span>
              </div>

              {bonusUsed > 0 && (
                <div className="flex items-center justify-between text-emerald-400 text-[11px]">
                  <span>Bonus Discount (10%):</span>
                  <span>-₹{bonusUsed}</span>
                </div>
              )}

              <div className="border-t border-gray-800 pt-1.5 flex items-center justify-between font-bold">
                <span className="text-gray-300">To Pay from Wallet:</span>
                <span className="text-red-400 font-gaming text-sm">
                  ₹{payableAmount}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-800/60">
                <span className="flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-gray-500" /> Total Balance:
                </span>
                <span className="font-bold text-white">₹{user.wallet.totalBalance}</span>
              </div>
            </div>

            {/* If insufficient balance, show Add Money prompt */}
            {entryFee > 0 && !hasSufficientBalance && (
              <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-900/30 flex items-center justify-between gap-2">
                <div className="text-[11px] text-amber-300">
                  You need ₹{entryFee - user.wallet.totalBalance} more to join.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDeposit();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-gaming font-bold text-xs flex items-center gap-1 shadow-sm shrink-0"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add Money
                </button>
              </div>
            )}

            {/* Fair play compliance banner */}
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>By joining, you agree to Anti-Hack fair play rules. Mobile devices only.</span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || (entryFee > 0 && !hasSufficientBalance)}
                className={`px-5 py-2 rounded-xl font-gaming font-bold text-xs uppercase tracking-wider transition-all ${
                  submitting || (entryFee > 0 && !hasSufficientBalance)
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white glow-red-sm hover:scale-105 active:scale-95'
                }`}
              >
                {submitting ? 'Confirming...' : entryFee === 0 ? 'Join Free' : `Pay ₹${payableAmount} & Join`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
