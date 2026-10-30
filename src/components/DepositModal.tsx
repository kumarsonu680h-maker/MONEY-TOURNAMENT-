import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  QrCode,
  Check,
  Copy,
  AlertCircle,
  Zap,
  ArrowRight,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, refreshUser } = useAuth();
  const [amount, setAmount] = useState<number>(100);
  const [utrNumber, setUtrNumber] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [upiUrl, setUpiUrl] = useState<string>('');
  const [upiId, setUpiId] = useState('moneytournament.merchant@okaxis');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDepositsPaused, setIsDepositsPaused] = useState(false);

  const quickChips = [50, 100, 200, 500, 1000];

  useEffect(() => {
    if (!isOpen || !user) return;
    generatePaymentPayload(amount);
  }, [isOpen, amount]);

  const generatePaymentPayload = async (amt: number) => {
    try {
      const res = await fetch('/api/wallet/deposit/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({ amount: amt }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsDepositsPaused(!!data.depositsPaused);
        setUpiUrl(data.upiUrl);
        setUpiId(data.upiId);

        // Generate QR Code data URL
        const qrUrl = await QRCode.toDataURL(data.upiUrl, {
          width: 240,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
        setQrDataUrl(qrUrl);
      } else {
        if (data.error && data.error.includes('paused')) {
          setIsDepositsPaused(true);
        }
        setError(data.error);
      }
    } catch (e) {
      console.error('Error generating UPI payload', e);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (isDepositsPaused) {
      setError('Deposits are currently paused by administration. Please check back later.');
      return;
    }

    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length < 8) {
      setError('Please enter a valid 12-digit UPI UTR / Transaction Reference number');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/wallet/deposit/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          amount,
          utrNumber: cleanUtr,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit deposit');
      }

      setSuccessMsg(data.message || 'Deposit submitted! Your request is Pending staff verification.');
      await refreshUser();
      setUtrNumber('');

      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccessMsg(null);
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Error submitting deposit');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
          {/* Header */}
          <div>
            <h3 className="font-gaming font-bold text-lg text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-red-500" />
              ADD MONEY TO WALLET
            </h3>
            <p className="text-xs text-gray-400">
              Pay via any UPI App (GPay, PhonePe, Paytm, BHIM)
            </p>
          </div>

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 block">
              Select or Enter Amount (Min ₹10)
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {quickChips.map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-gaming font-bold transition-all shrink-0 ${
                    amount === val
                      ? 'bg-red-600 text-white glow-red-sm scale-105'
                      : 'bg-[#141724] text-gray-300 hover:bg-[#1a1f33] border border-gray-800'
                  }`}
                >
                  ₹{val}
                </button>
              ))}
            </div>

            <div className="relative mt-2">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold font-gaming">
                ₹
              </span>
              <input
                type="number"
                min={10}
                value={amount}
                onChange={e => setAmount(Math.max(10, Number(e.target.value)))}
                className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl pl-8 pr-3 py-2 text-sm text-white font-bold font-gaming outline-none"
              />
            </div>
          </div>

          {/* Dynamic UPI QR Code Display */}
          <div className="bg-[#121522] border border-gray-800 rounded-2xl p-4 text-center space-y-3">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Scan with any UPI App
            </span>

            <div className="inline-block p-2 bg-white rounded-xl shadow-lg">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="UPI QR Code"
                  className="w-44 h-44 object-contain mx-auto"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-xs text-gray-600">
                  Generating QR...
                </div>
              )}
            </div>

            <div className="text-xs text-gray-400">
              Amount to pay: <strong className="text-white font-gaming text-sm">₹{amount}</strong>
            </div>

            {/* UPI ID Row */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-gray-800 text-xs">
              <span className="text-gray-400 font-mono truncate mr-2">{upiId}</span>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-900/60 text-red-300 font-medium text-[11px] flex items-center gap-1 shrink-0 border border-red-800/40"
              >
                {copiedUpi ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy UPI
                  </>
                )}
              </button>
            </div>

            {/* Mobile Direct UPI link */}
            {upiUrl && (
              <a
                href={upiUrl}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#1c2236] hover:bg-[#252d47] text-cyan-400 border border-cyan-800/40 text-xs font-semibold transition-all hover:scale-[1.01]"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Open directly in UPI App (GPay/PhonePe)</span>
              </a>
            )}
          </div>

          {/* Step 2: Enter UTR to verify */}
          <form onSubmit={handleSubmitDeposit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Enter 12-Digit UPI Reference / UTR Number <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={utrNumber}
                onChange={e => setUtrNumber(e.target.value)}
                placeholder="e.g. 428910481928"
                maxLength={16}
                className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-gray-500 outline-none"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Find this in your payment history after sending money.
              </p>
            </div>

            {/* Verification Security Notice */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#10131f] border border-gray-800 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-gray-200 block">Staff UTR Verification</span>
                <span className="text-[10px] text-gray-400">
                  Every deposit is audited by our finance staff before wallet credit.
                </span>
              </div>
            </div>

            {isDepositsPaused && (
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Deposits are temporarily paused for banking reconciliation.</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || isDepositsPaused}
              className={`w-full py-2.5 rounded-xl font-gaming font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition-all ${
                submitting || isDepositsPaused
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white glow-red-sm hover:scale-[1.02] active:scale-98'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : isDepositsPaused ? 'Deposits Paused' : 'Submit & Add Money'}</span>
            </button>
          </form>

          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-bit encrypted • 100% Secure Payment processing</span>
          </div>
        </div>
      </div>
    </div>
  );
};
