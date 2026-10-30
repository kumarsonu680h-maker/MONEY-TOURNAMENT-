import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Transaction, WithdrawalRequest } from '../types/index.ts';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  IndianRupee,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Gift,
  HelpCircle,
  Filter,
} from 'lucide-react';

interface WalletViewProps {
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenKYC: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  onOpenDeposit,
  onOpenWithdraw,
  onOpenKYC,
}) => {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [txFilter, setTxFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, [user?.id]);

  const fetchWalletData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [txRes, wdRes] = await Promise.all([
        fetch('/api/wallet/transactions', { headers: { 'x-user-id': user.id } }),
        fetch('/api/wallet/withdrawals', { headers: { 'x-user-id': user.id } }),
      ]);
      const txData = await txRes.json();
      const wdData = await wdRes.json();

      if (txData.transactions) setTransactions(txData.transactions);
      if (wdData.withdrawals) setWithdrawals(wdData.withdrawals);
    } catch (e) {
      console.error('Error fetching wallet data', e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const depositBal = user.wallet.depositBalance;
  const winningBal = user.wallet.winningBalance;
  const bonusBal = user.wallet.bonusBalance;
  const totalBal = user.wallet.totalBalance;

  // Filter transactions
  const filteredTxs = transactions.filter(t => {
    if (txFilter === 'ALL') return true;
    if (txFilter === 'DEPOSIT') return t.type === 'DEPOSIT';
    if (txFilter === 'WITHDRAWAL') return t.type === 'WITHDRAWAL';
    if (txFilter === 'MATCH') return t.type === 'MATCH_JOIN' || t.type === 'MATCH_REFUND';
    if (txFilter === 'PRIZE') return t.type === 'MATCH_WINNING';
    if (txFilter === 'BONUS') return t.type === 'REFERRAL_BONUS';
    return true;
  });

  const getTxTypeBadge = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return { label: 'Deposit', color: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40' };
      case 'WITHDRAWAL':
        return { label: 'Withdrawal', color: 'text-orange-400 bg-orange-950/40 border-orange-800/40' };
      case 'MATCH_JOIN':
        return { label: 'Match Entry', color: 'text-gray-400 bg-gray-900 border-gray-700' };
      case 'MATCH_WINNING':
        return { label: 'Tournament Prize', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40' };
      case 'MATCH_REFUND':
        return { label: 'Match Refund', color: 'text-amber-400 bg-amber-950/40 border-amber-800/40' };
      case 'REFERRAL_BONUS':
        return { label: 'Referral Bonus', color: 'text-purple-400 bg-purple-950/40 border-purple-800/40' };
      default:
        return { label: type, color: 'text-gray-400 bg-gray-900 border-gray-700' };
    }
  };

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-3 sm:px-6 pt-3">
      {/* Wallet Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#171b2b] via-[#101320] to-[#0a0c14] border border-red-900/40 p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-red-500" /> TOTAL WALLET BALANCE
            </span>
            <h2 className="font-gaming font-bold text-3xl sm:text-4xl text-white tracking-wide mt-1 text-shadow-lg">
              ₹{totalBal.toFixed(2)}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Instant UPI deposits & fast winning withdrawals
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenDeposit}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-gaming font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 glow-red-sm shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Money</span>
            </button>

            <button
              onClick={onOpenWithdraw}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-gaming font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 transition-all hover:scale-105 active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>

        {/* 3-Way Balances Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-gray-800/80">
          {/* Deposit Balance */}
          <div className="p-3 rounded-2xl bg-[#141829] border border-gray-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-semibold uppercase">
                Deposit Balance
              </span>
              <span className="text-[10px] text-gray-500 font-mono">For Entries</span>
            </div>
            <div className="font-gaming font-bold text-lg text-white mt-1">
              ₹{depositBal.toFixed(2)}
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Added via UPI / Gateway to join matches
            </p>
          </div>

          {/* Winning Balance */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-[#12221b] to-[#0e1713] border border-emerald-900/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-400 font-bold uppercase">
                Winning Balance
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-600/30 text-emerald-300 font-bold uppercase">
                100% Payout
              </span>
            </div>
            <div className="font-gaming font-bold text-lg text-emerald-400 mt-1">
              ₹{winningBal.toFixed(2)}
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Tournament prizes & kill bounties won
            </p>
          </div>

          {/* Bonus Balance */}
          <div className="p-3 rounded-2xl bg-[#141829] border border-gray-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-purple-400 font-bold uppercase">
                Bonus Cash
              </span>
              <span className="text-[10px] text-gray-500 font-mono">10% per match</span>
            </div>
            <div className="font-gaming font-bold text-lg text-purple-400 mt-1">
              ₹{bonusBal.toFixed(2)}
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Signup rewards & referral commissions
            </p>
          </div>
        </div>
      </div>

      {/* KYC Alert if not verified */}
      {user.kyc.status !== 'verified' && (
        <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-900/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white font-gaming">
                KYC STATUS: {user.kyc.status.toUpperCase()}
              </h4>
              <p className="text-[11px] text-gray-400">
                Complete 18+ age verification to unlock unlimited instant withdrawals.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenKYC}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-gaming font-bold text-xs shrink-0"
          >
            Submit KYC
          </button>
        </div>
      )}

      {/* Active Withdrawal Requests (if any) */}
      {withdrawals.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="font-gaming font-bold text-sm text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-400" />
            Withdrawal Requests ({withdrawals.length})
          </h3>

          <div className="space-y-1.5">
            {withdrawals.map(wd => (
              <div
                key={wd.id}
                className="p-3 rounded-xl bg-[#121522] border border-gray-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-gaming font-bold text-white text-sm">
                      ₹{wd.amount}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        wd.status === 'TRANSFERRED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : wd.status === 'REJECTED'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                      }`}
                    >
                      {wd.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono block mt-0.5">
                    {wd.payoutMethod === 'UPI' ? `UPI: ${wd.upiId}` : `Bank: ${wd.bankDetails?.accountNumber}`}
                  </span>
                </div>

                <div className="text-right text-[10px] text-gray-400 font-mono">
                  <span>{new Date(wd.requestTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  {wd.payoutUtr && (
                    <span className="block text-emerald-400">Ref: {wd.payoutUtr}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction History Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-gaming font-bold text-base text-white tracking-wider">
            TRANSACTION HISTORY
          </h3>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            {['ALL', 'DEPOSIT', 'WITHDRAWAL', 'MATCH', 'PRIZE', 'BONUS'].map(f => (
              <button
                key={f}
                onClick={() => setTxFilter(f)}
                className={`px-2.5 py-1 rounded-lg font-gaming font-bold transition-all ${
                  txFilter === f
                    ? 'bg-red-600 text-white'
                    : 'bg-[#121522] text-gray-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger List */}
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400">Loading transactions...</div>
        ) : filteredTxs.length === 0 ? (
          <div className="p-8 text-center bg-[#0d0f18] rounded-2xl border border-gray-800 text-xs text-gray-500">
            No transactions found for this filter.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTxs.map(tx => {
              const badge = getTxTypeBadge(tx.type);
              const isCredit =
                tx.type === 'DEPOSIT' ||
                tx.type === 'MATCH_WINNING' ||
                tx.type === 'MATCH_REFUND' ||
                tx.type === 'REFERRAL_BONUS';

              return (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-[#121522] border border-gray-800/80 flex items-center justify-between text-xs hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isCredit
                          ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40'
                          : 'bg-red-950/50 text-red-400 border border-red-800/40'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase font-gaming ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {new Date(tx.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-gray-200 font-medium text-xs mt-0.5">
                        {tx.remarks}
                      </p>
                      {tx.utrNumber && (
                        <span className="text-[10px] text-gray-400 font-mono">
                          UTR: {tx.utrNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-gaming font-bold text-sm sm:text-base ${
                        isCredit ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isCredit ? '+' : '-'}₹{tx.amount}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono block">
                      Bal: ₹{tx.balanceAfter}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
