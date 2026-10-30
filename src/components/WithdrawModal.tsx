import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  IndianRupee,
  Building2,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenKYC: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenKYC,
}) => {
  const { user, refreshUser } = useAuth();
  const [amount, setAmount] = useState<number>(100);
  const [payoutMethod, setPayoutMethod] = useState<'UPI' | 'BANK'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    confirmAccount: '',
    ifsc: '',
    holderName: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const winningBalance = user.wallet.winningBalance;
  const isKycVerified = user.kyc.status === 'verified';

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const numAmount = Number(amount);
    if (!numAmount || numAmount < 50) {
      setError('Minimum withdrawal amount is ₹50');
      return;
    }

    if (numAmount > winningBalance) {
      setError(`Insufficient winning balance. You have ₹${winningBalance} available in Winnings.`);
      return;
    }

    if (payoutMethod === 'UPI') {
      if (!upiId.trim() || !upiId.includes('@')) {
        setError('Please enter a valid UPI ID (e.g. yourname@okhdfcbank or mobile@paytm)');
        return;
      }
    } else {
      if (
        !bankDetails.accountNumber.trim() ||
        !bankDetails.ifsc.trim() ||
        !bankDetails.holderName.trim()
      ) {
        setError('All bank account details are required');
        return;
      }
      if (bankDetails.accountNumber !== bankDetails.confirmAccount) {
        setError('Account numbers do not match');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          amount: numAmount,
          payoutMethod,
          upiId: payoutMethod === 'UPI' ? upiId.trim() : undefined,
          bankDetails:
            payoutMethod === 'BANK'
              ? {
                  accountNumber: bankDetails.accountNumber.trim(),
                  ifsc: bankDetails.ifsc.trim().toUpperCase(),
                  holderName: bankDetails.holderName.trim(),
                }
              : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit withdrawal');
      }

      setSuccessMsg(`Withdrawal of ₹${numAmount} submitted successfully! Transferred within 5-15 minutes.`);
      await refreshUser();

      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccessMsg(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error processing withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#0c0e18] border border-red-900/40 rounded-2xl shadow-2xl p-5 overflow-y-auto max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-900/80 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          <div>
            <h3 className="font-gaming font-bold text-lg text-white flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-emerald-400" />
              WITHDRAW WINNINGS
            </h3>
            <p className="text-xs text-gray-400">
              Direct transfer to your UPI ID or Bank Account
            </p>
          </div>

          {/* Balance card */}
          <div className="bg-[#121522] border border-gray-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-semibold">
                Available Winning Balance
              </span>
              <span className="font-gaming font-bold text-lg sm:text-xl text-emerald-400">
                ₹{winningBalance.toFixed(2)}
              </span>
            </div>
            <span className="text-[10px] bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 px-2 py-0.5 rounded font-mono">
              Withdrawable
            </span>
          </div>

          {/* KYC Status Reminder */}
          {!isKycVerified && (
            <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-900/40 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>KYC is {user.kyc.status}. Complete KYC for higher limits.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenKYC();
                }}
                className="text-[11px] font-bold text-amber-400 hover:underline shrink-0 font-gaming"
              >
                Verify KYC &rarr;
              </button>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleWithdraw} className="space-y-4">
            {/* Amount input */}
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Withdrawal Amount (Min ₹50)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold font-gaming">
                  ₹
                </span>
                <input
                  type="number"
                  min={50}
                  max={winningBalance}
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl pl-8 pr-20 py-2 text-sm text-white font-bold font-gaming outline-none"
                />
                <button
                  type="button"
                  onClick={() => setAmount(winningBalance)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[10px] font-gaming font-bold bg-[#1e2338] hover:bg-[#282f4d] text-emerald-400"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Payout Method Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 block">
                Select Payout Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPayoutMethod('UPI')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-gaming font-bold transition-all ${
                    payoutMethod === 'UPI'
                      ? 'bg-red-600/20 border-red-500 text-red-400 glow-red-sm'
                      : 'bg-[#121522] border-gray-800 text-gray-400 hover:bg-[#1a1f33]'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>UPI ID (Instant)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayoutMethod('BANK')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-gaming font-bold transition-all ${
                    payoutMethod === 'BANK'
                      ? 'bg-red-600/20 border-red-500 text-red-400 glow-red-sm'
                      : 'bg-[#121522] border-gray-800 text-gray-400 hover:bg-[#1a1f33]'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Bank Account</span>
                </button>
              </div>
            </div>

            {/* UPI Details Input */}
            {payoutMethod === 'UPI' ? (
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Your UPI ID (VPA) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@paytm or user@okaxis"
                  className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
                />
              </div>
            ) : (
              <div className="space-y-2.5">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={bankDetails.holderName}
                    onChange={e =>
                      setBankDetails({ ...bankDetails, holderName: e.target.value })
                    }
                    placeholder="As registered in bank"
                    className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Bank Account Number
                  </label>
                  <input
                    type="password"
                    required
                    value={bankDetails.accountNumber}
                    onChange={e =>
                      setBankDetails({ ...bankDetails, accountNumber: e.target.value })
                    }
                    placeholder="Enter account number"
                    className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Confirm Account Number
                  </label>
                  <input
                    type="text"
                    required
                    value={bankDetails.confirmAccount}
                    onChange={e =>
                      setBankDetails({ ...bankDetails, confirmAccount: e.target.value })
                    }
                    placeholder="Re-enter account number"
                    className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    required
                    value={bankDetails.ifsc}
                    onChange={e =>
                      setBankDetails({ ...bankDetails, ifsc: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. HDFC0001234"
                    className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl px-3 py-1.5 text-xs text-white uppercase outline-none"
                  />
                </div>
              </div>
            )}

            {/* Legal Notice */}
            <div className="p-2.5 rounded-lg bg-black/40 border border-gray-800 text-[10px] text-gray-400 space-y-1">
              <p className="font-semibold text-gray-300">Indian Skill Gaming Regulation Compliance:</p>
              <p>• Only net winnings from esports tournaments are eligible for cash payout.</p>
              <p>• TDS deduction applies according to Section 194BA of the Indian Income Tax Act where applicable.</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || winningBalance < 50}
              className={`w-full py-2.5 rounded-xl font-gaming font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition-all ${
                submitting || winningBalance < 50
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-emerald-950 hover:scale-[1.02] active:scale-98'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{submitting ? 'Processing...' : `Withdraw ₹${amount} Now`}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
