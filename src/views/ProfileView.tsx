import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  User,
  ShieldCheck,
  Trophy,
  Target,
  Swords,
  IndianRupee,
  Gift,
  Copy,
  Check,
  Edit2,
  Save,
  LogOut,
  Headphones,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Share2,
  Lock,
} from 'lucide-react';

interface ProfileViewProps {
  onOpenKYC: () => void;
  onOpenSupport: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenAdminPortal?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenKYC,
  onOpenSupport,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenAdminPortal,
}) => {
  const { user, updateProfile, logout, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [ign, setIgn] = useState(user?.ign || '');
  const [ffUid, setFfUid] = useState(user?.ffUid || '');
  const [name, setName] = useState(user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '');
  const [copiedRef, setCopiedRef] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const avatars = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=FreeFireWarrior',
    'https://api.dicebear.com/7.x/bottts/svg?seed=ViperGod',
    'https://api.dicebear.com/7.x/bottts/svg?seed=ToxicSniper',
    'https://api.dicebear.com/7.x/bottts/svg?seed=AjjuFan',
    'https://api.dicebear.com/7.x/bottts/svg?seed=CyberNinja',
    'https://api.dicebear.com/7.x/bottts/svg?seed=ShadowHunter',
  ];

  const handleSaveProfile = async () => {
    setSaving(true);
    await updateProfile({
      ign: ign.trim(),
      ffUid: ffUid.trim(),
      name: name.trim(),
      avatar: selectedAvatar,
    });
    setSaving(false);
    setIsEditing(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const shareText = encodeURIComponent(
    `🔥 Join me on MONEY TOURNAMENT - India's #1 Free Fire Esports cash app! Use my referral code ${user.referralCode} to get ₹25 Welcome Bonus cash instantly!`
  );

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-3 sm:px-6 pt-3">
      {/* Player Identity Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#171b29] via-[#101320] to-[#0a0c14] border border-red-900/40 p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Avatar with glow */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-red-600 to-black p-0.5 glow-red-sm">
              <img
                src={selectedAvatar || user.avatar}
                alt={user.ign}
                className="w-full h-full rounded-[14px] object-cover bg-[#0d0f18]"
              />
            </div>
            {user.kyc.status === 'verified' && (
              <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-600 text-white shadow-md" title="KYC Verified">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            )}
          </div>

          {/* User Details */}
          <div className="text-center sm:text-left flex-1 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-gaming font-bold text-xl sm:text-2xl text-white tracking-wide flex items-center justify-center sm:justify-start gap-2">
                  <span>{user.ign}</span>
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  {user.name} • +91 {user.mobile}
                </p>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="self-center sm:self-start px-3 py-1.5 rounded-xl bg-[#1c2236] hover:bg-[#252c45] border border-gray-700 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-red-400" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>
            </div>

            {/* In-Game UID & KYC Badge */}
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
              <div className="px-2.5 py-1 rounded-lg bg-black/50 border border-gray-800 text-xs font-mono text-gray-300">
                <span className="text-gray-500">FF UID:</span>{' '}
                <strong className="text-white">{user.ffUid}</strong>
              </div>

              <div
                onClick={onOpenKYC}
                className={`px-2.5 py-1 rounded-lg border text-xs font-gaming font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                  user.kyc.status === 'verified'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                    : user.kyc.status === 'pending'
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-400'
                    : 'bg-red-950/40 border-red-500/40 text-red-400'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>KYC: {user.kyc.status.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Drawer */}
        {isEditing && (
          <div className="p-4 rounded-2xl bg-[#0e111d] border border-gray-800 space-y-3 pt-3 animate-in fade-in">
            <h4 className="text-xs font-gaming font-bold text-gray-300 uppercase">
              Choose Character Avatar
            </h4>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {avatars.map((av, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-12 h-12 rounded-xl p-0.5 border-2 transition-transform shrink-0 ${
                    selectedAvatar === av
                      ? 'border-red-500 scale-105 glow-red-sm'
                      : 'border-gray-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={av} alt="Avatar option" className="w-full h-full rounded-[9px] bg-black" />
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                  In-Game Name (IGN)
                </label>
                <input
                  type="text"
                  value={ign}
                  onChange={e => setIgn(e.target.value)}
                  className="w-full bg-[#141829] border border-gray-800 focus:border-red-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                  Free Fire Player UID
                </label>
                <input
                  type="text"
                  value={ffUid}
                  onChange={e => setFfUid(e.target.value)}
                  className="w-full bg-[#141829] border border-gray-800 focus:border-red-500 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-gaming font-bold text-xs uppercase flex items-center gap-1.5 glow-red-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Match Statistics Card */}
      <div className="space-y-2">
        <h3 className="font-gaming font-bold text-base text-white tracking-wider">
          CAREER ESPORTS STATISTICS
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-[#121522] border border-gray-800/80 text-center">
            <span className="text-[10px] text-gray-400 block uppercase font-medium">
              Matches Played
            </span>
            <span className="font-gaming font-bold text-xl text-white mt-0.5 block">
              {user.stats.matchesPlayed}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#121522] border border-gray-800/80 text-center">
            <span className="text-[10px] text-gray-400 block uppercase font-medium">
              Matches Won
            </span>
            <span className="font-gaming font-bold text-xl text-yellow-400 mt-0.5 block">
              {user.stats.matchesWon}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#121522] border border-gray-800/80 text-center">
            <span className="text-[10px] text-gray-400 block uppercase font-medium">
              Total Kills
            </span>
            <span className="font-gaming font-bold text-xl text-cyan-400 mt-0.5 block">
              {user.stats.totalKills}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#121522] border border-gray-800/80 text-center">
            <span className="text-[10px] text-gray-400 block uppercase font-medium">
              Total Earnings
            </span>
            <span className="font-gaming font-bold text-xl text-emerald-400 mt-0.5 block">
              ₹{user.stats.totalEarned}
            </span>
          </div>
        </div>
      </div>

      {/* Refer & Earn Promotion */}
      <div className="rounded-2xl bg-gradient-to-br from-[#1a1528] to-[#121522] border border-purple-900/40 p-4 sm:p-5 space-y-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <Gift className="w-5 h-5 text-purple-400" />
          <div>
            <h4 className="font-gaming font-bold text-base text-white">
              REFERRAL MANAGEMENT & BONUS
            </h4>
            <p className="text-xs text-gray-400">
              Share your link with your squad. Get ₹15 bonus on their first paid match!
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/40 p-3 rounded-xl border border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Your Referral Code:</span>
            <span className="font-mono font-bold text-sm text-yellow-400 tracking-wider">
              {user.referralCode}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyCode}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-[#1c2236] hover:bg-[#252c45] text-gray-300 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedRef ? 'Copied' : 'Copy Code'}</span>
            </button>

            <a
              href={`https://api.whatsapp.com/send?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-gaming font-bold text-xs flex items-center justify-center gap-1.5 shadow"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Support, KYC & Admin Access Links */}
      <div className="space-y-2">
        {onOpenAdminPortal && (
          <button
            onClick={onOpenAdminPortal}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-red-950/30 to-[#121522] hover:bg-red-950/40 border border-red-900/50 flex items-center justify-between transition-colors text-xs font-semibold text-red-300"
          >
            <span className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-red-500" />
              <span>Admin & Staff Command Center</span>
            </span>
            <span className="text-[10px] bg-red-600/30 text-red-300 px-2 py-0.5 rounded border border-red-500/40 font-gaming uppercase">
              {isAdmin ? 'Access Granted' : 'Restricted'}
            </span>
          </button>
        )}

        <button
          onClick={onOpenSupport}
          className="w-full p-3.5 rounded-2xl bg-[#121522] hover:bg-[#181c2d] border border-gray-800 flex items-center justify-between transition-colors text-xs font-semibold text-gray-200"
        >
          <span className="flex items-center gap-2.5">
            <Headphones className="w-4 h-4 text-red-400" />
            <span>24/7 Customer Support & Ticket History</span>
          </span>
          <span className="text-gray-500">&rarr;</span>
        </button>

        <button
          onClick={onOpenKYC}
          className="w-full p-3.5 rounded-2xl bg-[#121522] hover:bg-[#181c2d] border border-gray-800 flex items-center justify-between transition-colors text-xs font-semibold text-gray-200"
        >
          <span className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>KYC Verification & Age 18+ Certificate</span>
          </span>
          <span className="text-emerald-400 font-mono text-[11px]">{user.kyc.status.toUpperCase()}</span>
        </button>
      </div>

      {/* User Logout */}
      <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
        <div className="text-[11px] text-gray-500">
          Player ID: <span className="font-mono">{user.id}</span>
        </div>

        <button
          onClick={logout}
          className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-gray-800"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
