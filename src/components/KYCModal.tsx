import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const KYCModal: React.FC<KYCModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.kyc.fullName || user?.name || '');
  const [docType, setDocType] = useState<'Aadhaar' | 'PAN' | 'Voter ID'>('Aadhaar');
  const [docNumber, setDocNumber] = useState(user?.kyc.docNumber || '');
  const [state, setState] = useState(user?.kyc.state || 'Delhi');
  const [is18Plus, setIs18Plus] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const states = [
    'Delhi',
    'Maharashtra',
    'Uttar Pradesh',
    'Bihar',
    'West Bengal',
    'Rajasthan',
    'Madhya Pradesh',
    'Karnataka',
    'Gujarat',
    'Punjab',
    'Haryana',
    'Jharkhand',
    'Chhattisgarh',
    'Uttarakhand',
    'Himachal Pradesh',
    'Kerala',
    'Tamil Nadu',
    'Assam (Restricted)',
    'Odisha (Restricted)',
    'Telangana (Restricted)',
    'Andhra Pradesh (Restricted)',
    'Nagaland (Restricted)',
    'Sikkim (Restricted)',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!fullName.trim() || !docNumber.trim()) {
      setError('Please provide full name as on document and valid document ID number');
      return;
    }

    if (!is18Plus) {
      setError('You must confirm that you are at least 18 years of age to play real-money tournaments.');
      return;
    }

    const cleanState = state.replace(' (Restricted)', '').trim();

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/kyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          docType,
          docNumber: docNumber.trim(),
          state: cleanState,
          is18Plus: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit KYC');
      }

      setSuccessMsg('KYC details submitted successfully! Our compliance team will review your submission.');
      await refreshUser();

      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccessMsg(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Submission failed');
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
              <ShieldCheck className="w-5 h-5 text-red-500" />
              KYC & AGE VERIFICATION
            </h3>
            <p className="text-xs text-gray-400">
              Required for fast withdrawals and high-stakes tournaments in India
            </p>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Full Legal Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="As printed on your Aadhaar or PAN card"
                className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['Aadhaar', 'PAN', 'Voter ID'] as const).map(dt => (
                <button
                  key={dt}
                  type="button"
                  onClick={() => setDocType(dt)}
                  className={`py-2 rounded-xl text-xs font-gaming font-bold border transition-all ${
                    docType === dt
                      ? 'bg-red-600/20 border-red-500 text-red-400 glow-red-sm'
                      : 'bg-[#121522] border-gray-800 text-gray-400 hover:bg-[#1a1f33]'
                  }`}
                >
                  {dt}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                {docType} Number <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={docNumber}
                onChange={e => setDocNumber(e.target.value)}
                placeholder={
                  docType === 'Aadhaar'
                    ? '12-digit Aadhaar Number'
                    : docType === 'PAN'
                    ? '10-character PAN (e.g. ABCDE1234F)'
                    : 'Voter ID Number'
                }
                className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                State of Residence <span className="text-red-400">*</span>
              </label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                {states.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-gray-800 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={is18Plus}
                  onChange={e => setIs18Plus(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-red-600 rounded cursor-pointer"
                />
                <span className="text-[11px] text-gray-300 leading-tight">
                  I certify that I am <strong>18 years of age or older</strong> and I am not a resident of any restricted Indian state (Assam, Odisha, Telangana, Andhra Pradesh, Nagaland, Sikkim).
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-2.5 rounded-xl font-gaming font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition-all ${
                submitting
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white glow-red-sm hover:scale-[1.02] active:scale-98'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit KYC for Verification'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
