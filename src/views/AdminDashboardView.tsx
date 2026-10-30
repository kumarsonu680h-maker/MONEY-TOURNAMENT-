import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Tournament,
  User,
  DepositRequest,
  WithdrawalRequest,
  GameType,
  MatchType,
  MatchMode,
  MatchMap,
  Transaction,
  Banner,
  Announcement,
} from '../types/index.ts';
import {
  ShieldAlert,
  PlusCircle,
  KeyRound,
  Award,
  Users,
  CreditCard,
  Settings,
  AlertCircle,
  CheckCircle2,
  Trophy,
  Flame,
  Swords,
  Check,
  X,
  IndianRupee,
  RefreshCw,
  Ban,
  DollarSign,
  Edit,
  Trash2,
  Send,
  Bell,
  Eye,
  LogOut,
  Sparkles,
  Zap,
  Target,
  FileText,
  Clock,
  UserMinus,
  Search,
  PauseCircle,
  PlayCircle,
  History,
} from 'lucide-react';

interface AdminDashboardViewProps {
  onExitAdmin: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onExitAdmin }) => {
  const { adminUser, adminToken, adminLogout } = useAuth();

  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'tournaments'
    | 'registrations'
    | 'rooms'
    | 'results'
    | 'finance'
    | 'players'
    | 'content'
    | 'ledger'
    | 'settings'
  >('dashboard');

  const [stats, setStats] = useState<any>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [players, setPlayers] = useState<User[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Tournament Create / Edit Form State
  const [isEditingTournament, setIsEditingTournament] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formGame, setFormGame] = useState<GameType>('Free Fire MAX');
  const [formType, setFormType] = useState<MatchType>('BR');
  const [formMode, setFormMode] = useState<MatchMode>('Squad');
  const [formMap, setFormMap] = useState<MatchMap>('Bermuda');
  const [formEntryFee, setFormEntryFee] = useState<number>(25);
  const [formPrizePool, setFormPrizePool] = useState<number>(1000);
  const [formPerKill, setFormPerKill] = useState<number>(20);
  const [formMaxSlots, setFormMaxSlots] = useState<number>(48);
  const [formScheduleMins, setFormScheduleMins] = useState<number>(30);
  const [formBannerUrl, setFormBannerUrl] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Room Credentials Updater State
  const [selectedRoomMatch, setSelectedRoomMatch] = useState<Tournament | null>(null);
  const [editRoomId, setEditRoomId] = useState('');
  const [editRoomPass, setEditRoomPass] = useState('');
  const [editRoomStatus, setEditRoomStatus] = useState<'upcoming' | 'room_open' | 'live'>('room_open');

  // Player Registrations view State
  const [selectedRegMatch, setSelectedRegMatch] = useState<Tournament | null>(null);

  // Result Processing State
  const [selectedResultMatch, setSelectedResultMatch] = useState<Tournament | null>(null);
  const [participantResults, setParticipantResults] = useState<
    Record<string, { rank: number; kills: number }>
  >({});

  // Player Balance Adjustment State
  const [adjustPlayer, setAdjustPlayer] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(100);
  const [adjustWalletType, setAdjustWalletType] = useState<'deposit' | 'winning' | 'bonus'>('winning');
  const [adjustRemarks, setAdjustRemarks] = useState('');

  // Banner Creation Form
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
  const [newBannerImg, setNewBannerImg] = useState('');
  const [newBannerBadge, setNewBannerBadge] = useState('FEATURED');

  // Announcement Form
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');

  // Broadcast Notification Form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  // Financial controls state & filters
  const [depositsPaused, setDepositsPaused] = useState(false);
  const [manualVerificationMode, setManualVerificationMode] = useState(true);
  const [depositFilter, setDepositFilter] = useState<'ALL' | 'PENDING' | 'VERIFYING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [withdrawalFilter, setWithdrawalFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'SUCCESSFUL' | 'REJECTED'>('PENDING');
  const [selectedWdAudit, setSelectedWdAudit] = useState<WithdrawalRequest | null>(null);

  // Search filter for players & ledger
  const [playerSearch, setPlayerSearch] = useState('');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerFilter, setLedgerFilter] = useState('ALL');

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const headers = { 'x-admin-token': adminToken || '' };
      const [statsRes, matchRes, playerRes, depRes, wdRes, banRes, annRes, txRes, setRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/tournaments', { headers }),
        fetch('/api/admin/players', { headers }),
        fetch('/api/admin/deposits', { headers }),
        fetch('/api/admin/withdrawals', { headers }),
        fetch('/api/admin/banners', { headers }),
        fetch('/api/admin/announcements', { headers }),
        fetch('/api/admin/transactions', { headers }),
        fetch('/api/settings'),
      ]);

      const [sData, mData, pData, dData, wData, bData, aData, tData, setData] = await Promise.all([
        statsRes.json(),
        matchRes.json(),
        playerRes.json(),
        depRes.json(),
        wdRes.json(),
        banRes.json(),
        annRes.json(),
        txRes.json(),
        setRes.json(),
      ]);

      if (sData) setStats(sData);
      if (mData.tournaments) setTournaments(mData.tournaments);
      if (pData.players) setPlayers(pData.players);
      if (dData.deposits) setDeposits(dData.deposits);
      if (wData.withdrawals) setWithdrawals(wData.withdrawals);
      if (bData.banners) setBanners(bData.banners);
      if (aData.announcements) setAnnouncements(aData.announcements);
      if (tData.transactions) setAllTransactions(tData.transactions);
      if (setData?.settings) {
        setDepositsPaused(!!setData.settings.depositsPaused);
        setManualVerificationMode(setData.settings.manualVerificationMode !== false);
      }
    } catch (e) {
      console.error('Error loading admin dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMsg({ text, type });
    setTimeout(() => setActionMsg(null), 3500);
  };

  // Tournament Create or Edit Submit
  const handleSaveTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    const headers = {
      'Content-Type': 'application/json',
      'x-admin-token': adminToken || '',
    };

    try {
      if (isEditingTournament && editingId) {
        // Edit existing
        const res = await fetch(`/api/admin/tournaments/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            title: formTitle.trim(),
            game: formGame,
            matchType: formType,
            mode: formMode,
            map: formMap,
            entryFee: Number(formEntryFee),
            prizePool: Number(formPrizePool),
            perKill: Number(formPerKill),
            maxSlots: Number(formMaxSlots),
            bannerUrl: formBannerUrl.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        showMsg(`Tournament updated successfully!`);
      } else {
        // Create new
        const scheduleTime = new Date(Date.now() + formScheduleMins * 60 * 1000).toISOString();
        const res = await fetch('/api/admin/tournaments', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: formTitle.trim(),
            game: formGame,
            matchType: formType,
            mode: formMode,
            map: formMap,
            entryFee: Number(formEntryFee),
            prizePool: Number(formPrizePool),
            perKill: Number(formPerKill),
            maxSlots: Number(formMaxSlots),
            scheduleTime,
            bannerUrl: formBannerUrl.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        showMsg(`Tournament "${data.tournament.title}" created successfully!`);
      }

      setShowCreateModal(false);
      setIsEditingTournament(false);
      setEditingId(null);
      resetForm();
      fetchAdminData();
    } catch (err: any) {
      showMsg(err.message, 'error');
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormGame('Free Fire MAX');
    setFormType('BR');
    setFormMode('Squad');
    setFormMap('Bermuda');
    setFormEntryFee(25);
    setFormPrizePool(1000);
    setFormPerKill(20);
    setFormMaxSlots(48);
    setFormScheduleMins(30);
    setFormBannerUrl('');
  };

  const handleOpenEdit = (t: Tournament) => {
    setIsEditingTournament(true);
    setEditingId(t.id);
    setFormTitle(t.title);
    setFormGame(t.game);
    setFormType(t.matchType);
    setFormMode(t.mode);
    setFormMap(t.map);
    setFormEntryFee(t.entryFee);
    setFormPrizePool(t.prizePool);
    setFormPerKill(t.perKill);
    setFormMaxSlots(t.maxSlots);
    setFormBannerUrl(t.bannerUrl || '');
    setShowCreateModal(true);
  };

  // Delete Tournament
  const handleDeleteTournament = async (tournamentId: string) => {
    if (!confirm('Are you sure you want to delete this tournament? Any registered participants will be automatically refunded.')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/tournaments/${tournamentId}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken || '' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showMsg('Tournament deleted successfully.');
      fetchAdminData();
    } catch (err: any) {
      showMsg(err.message, 'error');
    }
  };

  // Kick / Remove Participant
  const handleKickParticipant = async (tournamentId: string, userId: string, ign: string) => {
    if (!confirm(`Remove player "${ign}" from this tournament? Entry fee will be automatically refunded.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/tournaments/${tournamentId}/remove-participant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken || '',
        },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showMsg(`Player ${ign} removed and refunded.`);
      fetchAdminData();
      if (selectedRegMatch) {
        setSelectedRegMatch(data.match);
      }
    } catch (err: any) {
      showMsg(err.message, 'error');
    }
  };

  // 1-Click Generate Room ID and Password
  const handleGenerateRoomCreds = () => {
    const randomRoom = Math.floor(100000 + Math.random() * 900000).toString();
    const randomPass = Math.floor(1000 + Math.random() * 9000).toString();
    setEditRoomId(randomRoom);
    setEditRoomPass(randomPass);
  };

  // Update Room ID / Password
  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomMatch) return;

    try {
      const res = await fetch(`/api/admin/tournaments/${selectedRoomMatch.id}/room`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken || '',
        },
        body: JSON.stringify({
          roomId: editRoomId.trim(),
          roomPassword: editRoomPass.trim(),
          status: editRoomStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showMsg('Room details updated and broadcasted to registered players!');
      setSelectedRoomMatch(null);
      fetchAdminData();
    } catch (err: any) {
      showMsg(err.message, 'error');
    }
  };

  // Prepare result distribution
  const handleSelectResultMatch = (match: Tournament) => {
    setSelectedResultMatch(match);
    const initial: Record<string, { rank: number; kills: number }> = {};
    match.participants.forEach((p, idx) => {
      initial[p.userId] = { rank: p.rank || idx + 1, kills: p.kills || 0 };
    });
    setParticipantResults(initial);
  };

  // Submit Results and Auto-Credit Prizes
  const handleDistributeResults = async () => {
    if (!selectedResultMatch) return;

    const resultsArray = Object.entries(participantResults).map(([userId, data]) => ({
      userId,
      rank: Number(data.rank),
      kills: Number(data.kills),
    }));

    try {
      const res = await fetch(`/api/admin/tournaments/${selectedResultMatch.id}/distribute-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken || '',
        },
        body: JSON.stringify({ results: resultsArray }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showMsg('Results finalized! Prizes automatically credited to player winning balances.');
      setSelectedResultMatch(null);
      fetchAdminData();
    } catch (err: any) {
      showMsg(err.message, 'error');
    }
  };

  // Financial Control Toggles
  const handleTogglePauseDeposits = async () => {
    try {
      const res = await fetch('/api/admin/settings/toggle-deposits', {
        method: 'POST',
        headers: { 'x-admin-token': adminToken || '' },
      });
      const data = await res.json();
      if (res.ok) {
        setDepositsPaused(data.depositsPaused);
        showMsg(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleManualMode = async () => {
    try {
      const res = await fetch('/api/admin/settings/toggle-manual-mode', {
        method: 'POST',
        headers: { 'x-admin-token': adminToken || '' },
      });
      const data = await res.json();
      if (res.ok) {
        setManualVerificationMode(data.manualVerificationMode);
        showMsg(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Deposit Actions: Verify (Mark Under Review), Approve (Credit Wallet Once), Reject
  const handleVerifyDeposit = async (depId: string) => {
    try {
      const res = await fetch(`/api/admin/deposits/${depId}/verify`, {
        method: 'POST',
        headers: { 'x-admin-token': adminToken || '' },
      });
      const data = await res.json();
      if (res.ok) {
        showMsg('Deposit marked as VERIFYING (under review)');
        fetchAdminData();
      } else {
        showMsg(data.error || 'Failed to update deposit status', 'error');
      }
    } catch (e: any) {
      showMsg(e.message, 'error');
    }
  };

  const handleApproveDeposit = async (depId: string) => {
    if (!confirm('Approve this deposit and credit the player wallet? This action credits balance strictly once.')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/deposits/${depId}/approve`, {
        method: 'POST',
        headers: { 'x-admin-token': adminToken || '' },
      });
      const data = await res.json();
      if (res.ok) {
        showMsg(data.message || 'Deposit approved and player wallet credited!');
        fetchAdminData();
      } else {
        showMsg(data.error || 'Failed to approve deposit', 'error');
      }
    } catch (e: any) {
      showMsg(e.message, 'error');
    }
  };

  const handleRejectDeposit = async (depId: string) => {
    const reason = prompt('Enter rejection reason (UTR invalid, payment not found in bank statement):', 'UTR not matched in bank statement');
    if (!reason) return;
    try {
      const res = await fetch(`/api/admin/deposits/${depId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken || '',
        },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg('Deposit rejected.');
        fetchAdminData();
      } else {
        showMsg(data.error || 'Failed to reject deposit', 'error');
      }
    } catch (e: any) {
      showMsg(e.message, 'error');
    }
  };

  // Withdrawal Actions: Set Pending, Approve (Queue), Mark Successful (Confirm UTR), Reject (Refund)
  const handleSetPendingWithdrawal = async (wdId: string) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${wdId}/set-pending`, {
        method: 'POST',
        headers: { 'x-admin-token': adminToken || '' },
      });
      const data = await res.json();
      if (res.ok) {
        showMsg('Withdrawal status reverted to Pending.');
        fetchAdminData();
      } else {
        showMsg(data.error || 'Failed to update withdrawal', 'error');
      }
    } catch (e: any) {
      showMsg(e.message, 'error');
    }
  };

  const handleApproveWithdrawal = async (wdId: string) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${wdId}/approve`, {
        method: 'POST',
        headers: { 'x-admin-token': adminToken || '' },
      });
      const data = await res.json();
      if (res.ok) {
        showMsg('Withdrawal marked as APPROVED. Queued for payout dispatch.');
        fetchAdminData();
      } else {
        showMsg(data.error || 'Failed to approve withdrawal', 'error');
      }
    } catch (e: any) {
      showMsg(e.message, 'error');
    }
  };

  const handleMarkSuccessfulWithdrawal = async (wdId: string) => {
    const payoutUtr = prompt('Enter Bank / UPI Transaction Reference UTR number confirming payment transfer:', `BNK${Date.now().toString().slice(-8)}`);
    if (!payoutUtr) return;

    try {
      const res = await fetch(`/api/admin/withdrawals/${wdId}/mark-successful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken || '',
        },
        body: JSON.stringify({ payoutUtr }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg('Payment confirmed! Withdrawal marked as Successful with UTR.');
        fetchAdminData();
      } else {
        showMsg(data.error || 'Failed to confirm payout', 'error');
      }
    } catch (e: any) {
      showMsg(e.message, 'error');
    }
  };

  const handleRejectWithdrawal = async (wdId: string) => {
    const reason = prompt('Enter rejection reason (winning balance will be safely refunded to player):', 'Invalid UPI ID / Bank account mismatch');
    if (!reason) return;

    try {
      const res = await fetch(`/api/admin/withdrawals/${wdId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken || '',
        },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg('Withdrawal rejected and winning balance refunded to player.');
        fetchAdminData();
      } else {
        showMsg(data.error || 'Failed to reject withdrawal', 'error');
      }
    } catch (e: any) {
      showMsg(e.message, 'error');
    }
  };

  // Adjust Player Balance
  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustPlayer) return;

    try {
      const res = await fetch(`/api/admin/players/${adjustPlayer.id}/adjust-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken || '',
        },
        body: JSON.stringify({
          amount: Number(adjustAmount),
          walletType: adjustWalletType,
          remarks: adjustRemarks.trim() || 'Admin manual balance adjustment',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showMsg('Player balance updated successfully.');
      setAdjustPlayer(null);
      fetchAdminData();
    } catch (err: any) {
      showMsg(err.message, 'error');
    }
  };

  // Ban / Unban Player
  const handleToggleBan = async (playerId: string) => {
    try {
      const res = await fetch(`/api/admin/players/${playerId}/ban`, {
        method: 'PUT',
        headers: { 'x-admin-token': adminToken || '' },
      });
      const data = await res.json();
      if (res.ok) {
        showMsg(`Player ${data.isBanned ? 'banned' : 'unbanned'}.`);
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Hero Banner
  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken || '',
        },
        body: JSON.stringify({
          title: newBannerTitle.trim(),
          subtitle: newBannerSubtitle.trim(),
          imageUrl: newBannerImg.trim(),
          badgeText: newBannerBadge.trim(),
          targetTab: 'matches',
        }),
      });
      if (res.ok) {
        showMsg('Banner created successfully!');
        setNewBannerTitle('');
        setNewBannerSubtitle('');
        setNewBannerImg('');
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken || '' },
      });
      showMsg('Banner removed.');
      fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Create Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken || '',
        },
        body: JSON.stringify({
          title: newAnnTitle.trim(),
          content: newAnnContent.trim(),
          type: 'info',
        }),
      });
      if (res.ok) {
        showMsg('Announcement published on player app!');
        setNewAnnTitle('');
        setNewAnnContent('');
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken || '' },
      });
      showMsg('Announcement removed.');
      fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Broadcast Notification
  const handleBroadcastNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/broadcast-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken || '',
        },
        body: JSON.stringify({
          title: broadcastTitle.trim(),
          message: broadcastMsg.trim(),
          type: 'system',
        }),
      });
      if (res.ok) {
        showMsg('Push notification sent to all registered players!');
        setBroadcastTitle('');
        setBroadcastMsg('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredPlayers = players.filter(p => {
    if (!playerSearch.trim()) return true;
    const q = playerSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.ign.toLowerCase().includes(q) ||
      p.mobile.includes(q) ||
      p.ffUid.includes(q)
    );
  });

  const filteredLedger = allTransactions.filter(t => {
    if (ledgerFilter !== 'ALL' && t.type !== ledgerFilter) return false;
    if (ledgerSearch.trim()) {
      const q = ledgerSearch.toLowerCase();
      return (
        t.remarks.toLowerCase().includes(q) ||
        (t.utrNumber && t.utrNumber.includes(q)) ||
        t.userId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Trophy },
    { id: 'tournaments', label: 'Tournaments', icon: Swords },
    { id: 'registrations', label: 'Registrations', icon: Users },
    { id: 'rooms', label: 'Room Manager', icon: KeyRound },
    { id: 'results', label: 'Results & Prizes', icon: Award },
    { id: 'finance', label: 'Payments & Payouts', icon: CreditCard },
    { id: 'players', label: 'Players & KYC', icon: Users },
    { id: 'content', label: 'Banners & Alerts', icon: Bell },
    { id: 'ledger', label: 'Audit Ledger', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#06080d] text-gray-100 flex flex-col font-sans">
      {/* Top Admin Command Bar */}
      <header className="sticky top-0 z-40 bg-[#0a0c14]/95 backdrop-blur-md border-b border-red-600/40 px-3 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-black p-0.5 glow-red-sm flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-gaming font-bold text-base sm:text-lg text-white tracking-wider">
                  MONEY TOURNAMENT <span className="text-red-500 glow-red-text">ADMIN</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-red-600/20 border border-red-500/40 text-red-400 uppercase tracking-widest">
                  {adminUser?.role === 'super_admin' ? 'SUPER ADMIN' : 'COORDINATOR'}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 -mt-0.5 hidden sm:block">
                Logged in as {adminUser?.name} (+91 {adminUser?.mobile})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              className="p-2 rounded-lg bg-[#141724] hover:bg-[#1d2236] border border-gray-800 text-gray-300 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-500' : ''}`} />
            </button>

            <button
              onClick={onExitAdmin}
              className="px-3 py-1.5 rounded-xl bg-[#141724] hover:bg-[#1c2236] border border-gray-800 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Player View</span>
            </button>

            <button
              onClick={() => {
                adminLogout();
                onExitAdmin();
              }}
              className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-800/40 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Action Alert Toast */}
      {actionMsg && (
        <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 pt-3">
          <div
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 shadow-lg animate-in fade-in ${
              actionMsg.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-red-950/60 border-red-700/60 text-red-300'
            }`}
          >
            {actionMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{actionMsg.text}</span>
          </div>
        </div>
      )}

      {/* Main Admin Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 pt-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar p-1.5 bg-[#0a0c14] rounded-2xl border border-gray-800 text-xs font-gaming font-bold">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-1.5 py-2 px-3 rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-red-600 text-white glow-red-sm scale-[1.02]'
                    : 'text-gray-400 hover:text-white hover:bg-[#121522]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Admin Tab Body */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-5 flex-1">
        {/* TAB 1: DASHBOARD STATS */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-[#0e111d] border border-gray-800">
                <span className="text-[10px] text-gray-400 block uppercase font-medium">
                  Active Tournaments
                </span>
                <span className="font-gaming font-bold text-2xl sm:text-3xl text-white mt-1 block">
                  {stats.activeTournaments} / {stats.totalTournaments}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0e111d] border border-gray-800">
                <span className="text-[10px] text-gray-400 block uppercase font-medium">
                  Registered Players
                </span>
                <span className="font-gaming font-bold text-2xl sm:text-3xl text-cyan-400 mt-1 block">
                  {stats.totalPlayers}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0e111d] border border-gray-800">
                <span className="text-[10px] text-gray-400 block uppercase font-medium">
                  Prizes Distributed
                </span>
                <span className="font-gaming font-bold text-2xl sm:text-3xl text-yellow-400 mt-1 block">
                  ₹{stats.totalPrizeDistributed}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0e111d] border border-gray-800">
                <span className="text-[10px] text-gray-400 block uppercase font-medium">
                  Deposits Verified
                </span>
                <span className="font-gaming font-bold text-2xl sm:text-3xl text-emerald-400 mt-1 block">
                  ₹{stats.totalDeposits}
                </span>
              </div>
            </div>

            {/* Quick Action Alerts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => setActiveTab('finance')}
                className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40 cursor-pointer hover:bg-amber-950/30 transition-colors flex items-center justify-between"
              >
                <div>
                  <h4 className="font-gaming font-bold text-sm text-amber-300">
                    Pending Withdrawals: {stats.pendingWithdrawalsCount}
                  </h4>
                  <p className="text-xs text-gray-400">Review requests and transfer payouts</p>
                </div>
                <CreditCard className="w-5 h-5 text-amber-400" />
              </div>

              <div
                onClick={() => setActiveTab('finance')}
                className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-900/40 cursor-pointer hover:bg-cyan-950/30 transition-colors flex items-center justify-between"
              >
                <div>
                  <h4 className="font-gaming font-bold text-sm text-cyan-300">
                    Pending Deposits: {stats.pendingDepositsCount}
                  </h4>
                  <p className="text-xs text-gray-400">Verify manual UPI UTR numbers</p>
                </div>
                <IndianRupee className="w-5 h-5 text-cyan-400" />
              </div>

              <div
                onClick={() => {
                  resetForm();
                  setIsEditingTournament(false);
                  setShowCreateModal(true);
                }}
                className="p-4 rounded-2xl bg-red-950/20 border border-red-900/40 cursor-pointer hover:bg-red-950/30 transition-colors flex items-center justify-between"
              >
                <div>
                  <h4 className="font-gaming font-bold text-sm text-red-300">
                    Host New Tournament
                  </h4>
                  <p className="text-xs text-gray-400">Configure BR, CS, or Lone Wolf</p>
                </div>
                <PlusCircle className="w-5 h-5 text-red-400" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TOURNAMENTS MANAGEMENT */}
        {activeTab === 'tournaments' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-gaming font-bold text-lg text-white">
                  TOURNAMENT MANAGEMENT ({tournaments.length})
                </h3>
                <p className="text-xs text-gray-400">
                  Create, edit, delete, and control Free Fire esports tournaments
                </p>
              </div>

              <button
                onClick={() => {
                  resetForm();
                  setIsEditingTournament(false);
                  setShowCreateModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-gaming font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 glow-red-sm self-start sm:self-auto"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Tournament</span>
              </button>
            </div>

            {tournaments.length === 0 ? (
              <div className="p-12 text-center bg-[#0d0f18] rounded-2xl border border-gray-800 space-y-3">
                <Swords className="w-12 h-12 text-gray-600 mx-auto" />
                <h4 className="font-gaming font-bold text-base text-gray-300">
                  NO TOURNAMENTS IN DATABASE
                </h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  All dummy tournaments have been removed. Click &quot;Create Tournament&quot; above to publish your first real Free Fire match!
                </p>
                <button
                  onClick={() => {
                    resetForm();
                    setIsEditingTournament(false);
                    setShowCreateModal(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-gaming font-bold text-xs uppercase"
                >
                  Create First Tournament Now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {tournaments.map(t => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-[#0e111d] border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-gray-700 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-gaming font-bold px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800/40 uppercase">
                          {t.matchType} • {t.mode}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                          {t.game}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          Map: {t.map}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.2 rounded uppercase ${
                            t.status === 'room_open'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : t.status === 'live'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : t.status === 'completed'
                              ? 'bg-gray-800 text-gray-400'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      <h4 className="font-gaming font-bold text-base text-white">
                        {t.title}
                      </h4>

                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>Entry: <strong className="text-white">{t.entryFee === 0 ? 'FREE' : `₹${t.entryFee}`}</strong></span>
                        <span>Prize Pool: <strong className="text-yellow-400">₹{t.prizePool}</strong></span>
                        <span>Per Kill: <strong className="text-cyan-400">₹{t.perKill}</strong></span>
                        <span>Joined: <strong className="text-white">{t.joinedCount}</strong> / {t.maxSlots}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          setSelectedRegMatch(t);
                          setActiveTab('registrations');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#141724] hover:bg-[#1d2236] text-gray-200 border border-gray-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Players ({t.joinedCount})</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-2 rounded-xl bg-[#141724] hover:bg-[#1d2236] text-gray-300 hover:text-white border border-gray-700 transition-colors"
                        title="Edit Tournament"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteTournament(t.id)}
                        className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 transition-colors"
                        title="Delete Tournament"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REGISTRATIONS MANAGEMENT */}
        {activeTab === 'registrations' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-gaming font-bold text-lg text-white">
                PLAYER REGISTRATIONS & ROSTER
              </h3>
              <p className="text-xs text-gray-400">
                Inspect registered players per tournament, manage slots, and kick/refund players
              </p>
            </div>

            {/* Select Match Dropdown */}
            <div className="bg-[#0e111d] p-3 rounded-xl border border-gray-800 flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-400">Select Tournament:</span>
              <select
                value={selectedRegMatch?.id || ''}
                onChange={e => {
                  const m = tournaments.find(t => t.id === e.target.value);
                  setSelectedRegMatch(m || null);
                }}
                className="flex-1 bg-[#141829] border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
              >
                <option value="">-- Choose a tournament --</option>
                {tournaments.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.joinedCount}/{t.maxSlots} joined) [{t.status}]
                  </option>
                ))}
              </select>
            </div>

            {selectedRegMatch ? (
              <div className="bg-[#0e111d] rounded-2xl border border-gray-800 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <div>
                    <h4 className="font-gaming font-bold text-sm text-white">
                      {selectedRegMatch.title}
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      Slots occupied: {selectedRegMatch.participants.length} / {selectedRegMatch.maxSlots}
                    </p>
                  </div>
                  <span className="text-xs font-gaming font-bold text-yellow-400">
                    Entry Fee: ₹{selectedRegMatch.entryFee}
                  </span>
                </div>

                {selectedRegMatch.participants.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-500">
                    No players have registered for this tournament yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedRegMatch.participants.map(p => (
                      <div
                        key={p.userId}
                        className="p-3 rounded-xl bg-[#141829] border border-gray-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded bg-black/60 border border-gray-700 flex items-center justify-center font-mono font-bold text-[10px] text-gray-400">
                            #{p.slotNo}
                          </span>
                          <img src={p.avatar} alt={p.ign} className="w-7 h-7 rounded-full bg-black" />
                          <div>
                            <span className="font-bold text-white block">{p.ign}</span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              UID: {p.ffUid} {p.teamName ? `• Team: ${p.teamName}` : ''}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleKickParticipant(selectedRegMatch.id, p.userId, p.ign)}
                          className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-400 border border-red-800/40 font-semibold text-xs flex items-center gap-1"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>Kick & Refund</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-gray-500 bg-[#0e111d] rounded-2xl border border-gray-800">
                Please select a tournament from the dropdown above to view registrations.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ROOM MANAGER (GENERATE & PUSH CREDENTIALS) */}
        {activeTab === 'rooms' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-gaming font-bold text-lg text-white">
                ROOM CREDENTIALS & MATCH CONTROL
              </h3>
              <p className="text-xs text-gray-400">
                Generate 6-digit Room ID & Password, push live to registered players, and control match status
              </p>
            </div>

            <div className="space-y-2">
              {tournaments.map(match => (
                <div
                  key={match.id}
                  className="p-4 rounded-2xl bg-[#0e111d] border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-gaming font-bold px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800/40 uppercase">
                        {match.matchType} • {match.mode}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        {match.joinedCount} / {match.maxSlots} Joined
                      </span>
                    </div>
                    <h4 className="font-gaming font-bold text-sm text-white mt-1">
                      {match.title}
                    </h4>
                    <p className="text-xs text-gray-400">
                      Room ID: <strong className="text-emerald-400 font-mono">{match.roomId || 'Not set'}</strong> | Pass: <strong className="text-emerald-400 font-mono">{match.roomPassword || 'Not set'}</strong> | Status: <span className="uppercase font-bold text-red-400">{match.status}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedRoomMatch(match);
                        setEditRoomId(match.roomId || '');
                        setEditRoomPass(match.roomPassword || '');
                        setEditRoomStatus(match.status === 'upcoming' ? 'room_open' : (match.status as any));
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-gaming font-bold text-xs flex items-center gap-1.5 shadow"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Set Room ID / Pass</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Room Credentials Modal */}
            {selectedRoomMatch && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
                <form
                  onSubmit={handleUpdateRoom}
                  className="w-full max-w-md bg-[#0a0c14] border border-emerald-600/50 rounded-2xl p-5 space-y-4 glow-cyan"
                >
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <h4 className="font-gaming font-bold text-sm text-white">
                      MANAGE ROOM: {selectedRoomMatch.title}
                    </h4>
                    <button type="button" onClick={() => setSelectedRoomMatch(null)}>
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleGenerateRoomCreds}
                      className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-gaming font-bold text-xs flex items-center gap-1"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>⚡ Auto-Generate Room & Pass</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">
                      Free Fire Custom Room ID
                    </label>
                    <input
                      type="text"
                      required
                      value={editRoomId}
                      onChange={e => setEditRoomId(e.target.value)}
                      placeholder="e.g. 891042"
                      className="w-full bg-[#121522] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">
                      Room Password
                    </label>
                    <input
                      type="text"
                      required
                      value={editRoomPass}
                      onChange={e => setEditRoomPass(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full bg-[#121522] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">
                      Match Status
                    </label>
                    <select
                      value={editRoomStatus}
                      onChange={e => setEditRoomStatus(e.target.value as any)}
                      className="w-full bg-[#121522] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="room_open">ROOM OPEN (Push ID to all registered players)</option>
                      <option value="live">LIVE (Match in progress)</option>
                      <option value="upcoming">UPCOMING (Hide ID until 15m before)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-gaming font-bold text-xs uppercase tracking-wider"
                  >
                    Save & Push Notification to Players
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: RESULTS & PRIZE DISTRIBUTION */}
        {activeTab === 'results' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-gaming font-bold text-lg text-white">
                RESULTS & AUTOMATIC PRIZE DISTRIBUTION
              </h3>
              <p className="text-xs text-gray-400">
                Declare kills and rank placements; automatically credits players' winning balances on the server
              </p>
            </div>

            {!selectedResultMatch ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-400">
                  Select a tournament with registered participants to declare results:
                </p>
                {tournaments.map(m => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl bg-[#0e111d] border border-gray-800 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-gaming font-bold text-sm text-white">{m.title}</h4>
                      <p className="text-xs text-gray-400">
                        {m.participants.length} players registered • Prize Pool: ₹{m.prizePool} • Status: {m.status}
                      </p>
                    </div>

                    <button
                      disabled={m.participants.length === 0}
                      onClick={() => handleSelectResultMatch(m)}
                      className={`px-3.5 py-1.5 rounded-xl font-gaming font-bold text-xs ${
                        m.participants.length === 0
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                      }`}
                    >
                      {m.status === 'completed' ? 'Re-Declare Results' : 'Declare Results'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#0e111d] border border-gray-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <div>
                    <h4 className="font-gaming font-bold text-base text-white">
                      {selectedResultMatch.title}
                    </h4>
                    <p className="text-xs text-gray-400">
                      1st: ₹{selectedResultMatch.prizeDistribution.rank1} | 2nd: ₹{selectedResultMatch.prizeDistribution.rank2} | Per Kill: ₹{selectedResultMatch.perKill}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedResultMatch(null)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Change Tournament
                  </button>
                </div>

                {/* Participants Roster with Ranks and Kills Input */}
                <div className="space-y-2">
                  {selectedResultMatch.participants.map(p => {
                    const curr = participantResults[p.userId] || { rank: 1, kills: 0 };
                    let rankPrize = 0;
                    if (curr.rank === 1) rankPrize = selectedResultMatch.prizeDistribution.rank1;
                    else if (curr.rank === 2) rankPrize = selectedResultMatch.prizeDistribution.rank2;
                    else if (curr.rank === 3) rankPrize = selectedResultMatch.prizeDistribution.rank3 || 0;
                    const killPrize = curr.kills * selectedResultMatch.perKill;
                    const totalEstPrize = rankPrize + killPrize;

                    return (
                      <div
                        key={p.userId}
                        className="p-3 rounded-xl bg-[#141829] border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={p.avatar} alt={p.ign} className="w-8 h-8 rounded-full bg-black" />
                          <div>
                            <span className="font-bold text-white block">{p.ign}</span>
                            <span className="text-[10px] text-gray-400 font-mono">UID: {p.ffUid}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <label className="text-[10px] text-gray-400">Rank:</label>
                            <input
                              type="number"
                              min={1}
                              value={curr.rank}
                              onChange={e =>
                                setParticipantResults({
                                  ...participantResults,
                                  [p.userId]: { ...curr, rank: Number(e.target.value) },
                                })
                              }
                              className="w-14 bg-black/60 border border-gray-700 rounded px-2 py-1 text-center text-xs font-bold font-gaming text-white"
                            />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <label className="text-[10px] text-gray-400">Kills:</label>
                            <input
                              type="number"
                              min={0}
                              value={curr.kills}
                              onChange={e =>
                                setParticipantResults({
                                  ...participantResults,
                                  [p.userId]: { ...curr, kills: Number(e.target.value) },
                                })
                              }
                              className="w-14 bg-black/60 border border-gray-700 rounded px-2 py-1 text-center text-xs font-bold font-gaming text-white"
                            />
                          </div>

                          <div className="text-right min-w-[80px]">
                            <span className="font-gaming font-bold text-emerald-400 block text-xs">
                              ₹{totalEstPrize}
                            </span>
                            <span className="text-[9px] text-gray-500">Auto-credit</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleDistributeResults}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-gaming font-bold text-xs uppercase tracking-wider shadow-lg"
                >
                  1-Click Distribute Prizes & Credit Winning Wallets
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: FINANCE (DEPOSITS & WITHDRAWALS) */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            {/* System Financial Controls Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#121524] via-[#10131f] to-[#0c0e18] border border-gray-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-gaming font-bold text-base text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    <span>SYSTEM FINANCIAL SECURITY & RECONCILIATION CONTROLS</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Configure real-time deposit acceptance, staff manual verification rules, and payout safeguards.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Pause Deposits Toggle */}
                  <button
                    onClick={handleTogglePauseDeposits}
                    className={`px-3.5 py-2 rounded-xl text-xs font-gaming font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                      depositsPaused
                        ? 'bg-amber-600 hover:bg-amber-500 text-white'
                        : 'bg-[#181c2d] hover:bg-[#20263c] text-emerald-400 border border-emerald-800/50'
                    }`}
                  >
                    {depositsPaused ? (
                      <>
                        <PauseCircle className="w-4 h-4" />
                        <span>DEPOSITS: PAUSED</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-4 h-4 text-emerald-400" />
                        <span>DEPOSITS: ACTIVE</span>
                      </>
                    )}
                  </button>

                  {/* Manual Mode Toggle */}
                  <button
                    onClick={handleToggleManualMode}
                    className={`px-3.5 py-2 rounded-xl text-xs font-gaming font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                      manualVerificationMode
                        ? 'bg-red-950/60 text-red-400 border border-red-800/60'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>MANUAL REVIEW: {manualVerificationMode ? 'STRICT' : 'STANDARD'}</span>
                  </button>
                </div>
              </div>

              {depositsPaused && (
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-xs text-amber-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    <strong>Deposits are currently PAUSED:</strong> Players cannot submit new UPI deposit requests until resumed. Existing requests remain safely queued in Pending.
                  </span>
                </div>
              )}
            </div>

            {/* DEPOSITS MANAGEMENT SECTION */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-gaming font-bold text-base text-white flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-cyan-400" />
                    <span>DEPOSIT VERIFICATION & APPROVAL QUEUE</span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Wallet balance is credited strictly once upon verified admin approval. Never auto-credited.
                  </p>
                </div>

                {/* Filter Pills for Deposits */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-gaming">
                  {(['PENDING', 'VERIFYING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(f => {
                    const count =
                      f === 'ALL'
                        ? deposits.length
                        : deposits.filter(d => d.status === f).length;
                    return (
                      <button
                        key={f}
                        onClick={() => setDepositFilter(f)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-all ${
                          depositFilter === f
                            ? 'bg-cyan-600 text-white shadow'
                            : 'bg-[#121522] hover:bg-[#1a1f33] text-gray-400 border border-gray-800'
                        }`}
                      >
                        {f} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deposit List */}
              {deposits.filter(d => depositFilter === 'ALL' || d.status === depositFilter).length === 0 ? (
                <div className="p-6 bg-[#0e111d] rounded-2xl border border-gray-800 text-xs text-gray-500 text-center">
                  No deposit requests found in category: {depositFilter}.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {deposits
                    .filter(d => depositFilter === 'ALL' || d.status === depositFilter)
                    .map(dep => (
                      <div
                        key={dep.id}
                        className="p-4 rounded-2xl bg-[#0e111d] border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-gaming font-bold text-white text-base">
                              ₹{dep.amount}
                            </span>
                            <span className="text-gray-300">
                              from <strong>{dep.userName}</strong> (+91 {dep.userMobile})
                            </span>

                            {/* Status Badge */}
                            <span
                              className={`text-[10px] font-gaming font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                dep.status === 'APPROVED'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : dep.status === 'VERIFYING'
                                  ? 'bg-blue-950 text-blue-400 border border-blue-800 animate-pulse'
                                  : dep.status === 'REJECTED'
                                  ? 'bg-red-950 text-red-400 border border-red-800'
                                  : 'bg-amber-950 text-amber-400 border border-amber-800'
                              }`}
                            >
                              {dep.status}
                            </span>

                            {dep.credited && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-900/40 text-emerald-300 rounded border border-emerald-700/50">
                                ✓ Credited
                              </span>
                            )}
                          </div>

                          <div className="mt-1 space-y-0.5 text-[11px] text-gray-400 font-mono">
                            <div>
                              UTR / Ref: <strong className="text-cyan-400 font-bold">{dep.utrNumber}</strong>
                            </div>
                            <div className="text-gray-500 text-[10px]">
                              Submitted: {new Date(dep.createdAt).toLocaleString('en-IN')}
                              {dep.approvedAt && ` • Approved: ${new Date(dep.approvedAt).toLocaleTimeString('en-IN')}`}
                              {dep.rejectedAt && ` • Rejected: ${new Date(dep.rejectedAt).toLocaleTimeString('en-IN')}`}
                            </div>
                            {dep.remarks && (
                              <div className="text-gray-400 text-[10px] italic">
                                Note: {dep.remarks}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Admin Deposit Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {dep.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleVerifyDeposit(dep.id)}
                                className="px-3 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800 text-xs font-semibold"
                                title="Mark under review while checking bank statement"
                              >
                                🔍 Verify (Review)
                              </button>
                              <button
                                onClick={() => handleApproveDeposit(dep.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-gaming text-xs font-bold glow-red-sm"
                              >
                                ✓ Approve & Credit
                              </button>
                              <button
                                onClick={() => handleRejectDeposit(dep.id)}
                                className="px-3 py-1.5 rounded-xl bg-red-950 hover:bg-red-900 text-red-400 border border-red-800/60 text-xs font-semibold"
                              >
                                ✕ Reject
                              </button>
                            </>
                          )}

                          {dep.status === 'VERIFYING' && (
                            <>
                              <button
                                onClick={() => handleApproveDeposit(dep.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-gaming text-xs font-bold glow-red-sm"
                              >
                                ✓ Approve & Credit
                              </button>
                              <button
                                onClick={() => handleRejectDeposit(dep.id)}
                                className="px-3 py-1.5 rounded-xl bg-red-950 hover:bg-red-900 text-red-400 border border-red-800/60 text-xs font-semibold"
                              >
                                ✕ Reject
                              </button>
                            </>
                          )}

                          {dep.status === 'APPROVED' && (
                            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Balance Credited (Locked)</span>
                            </span>
                          )}

                          {dep.status === 'REJECTED' && (
                            <span className="text-[11px] font-semibold text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              <span>Rejected (No Balance Credited)</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* WITHDRAWALS MANAGEMENT SECTION */}
            <div className="space-y-3 pt-4 border-t border-gray-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-gaming font-bold text-base text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-400" />
                    <span>WITHDRAWAL PAYOUTS & AUDIT MANAGEMENT</span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Never auto-approved. Successful status requires actual payment confirmation with UTR.
                  </p>
                </div>

                {/* Filter Pills for Withdrawals */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-gaming">
                  {(['PENDING', 'APPROVED', 'SUCCESSFUL', 'REJECTED', 'ALL'] as const).map(f => {
                    const count =
                      f === 'ALL'
                        ? withdrawals.length
                        : withdrawals.filter(w =>
                            f === 'SUCCESSFUL'
                              ? w.status === 'SUCCESSFUL' || (w.status as any) === 'TRANSFERRED'
                              : w.status === f
                          ).length;
                    return (
                      <button
                        key={f}
                        onClick={() => setWithdrawalFilter(f)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-all ${
                          withdrawalFilter === f
                            ? 'bg-amber-600 text-white shadow'
                            : 'bg-[#121522] hover:bg-[#1a1f33] text-gray-400 border border-gray-800'
                        }`}
                      >
                        {f} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Withdrawal List */}
              {withdrawals.filter(w => {
                if (withdrawalFilter === 'ALL') return true;
                if (withdrawalFilter === 'SUCCESSFUL') {
                  return w.status === 'SUCCESSFUL' || (w.status as any) === 'TRANSFERRED';
                }
                return w.status === withdrawalFilter;
              }).length === 0 ? (
                <div className="p-6 bg-[#0e111d] rounded-2xl border border-gray-800 text-xs text-gray-500 text-center">
                  No withdrawal requests in category: {withdrawalFilter}.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {withdrawals
                    .filter(w => {
                      if (withdrawalFilter === 'ALL') return true;
                      if (withdrawalFilter === 'SUCCESSFUL') {
                        return w.status === 'SUCCESSFUL' || (w.status as any) === 'TRANSFERRED';
                      }
                      return w.status === withdrawalFilter;
                    })
                    .map(wd => (
                      <div
                        key={wd.id}
                        className="p-4 rounded-2xl bg-[#0e111d] border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-gaming font-bold text-white text-base">
                              ₹{wd.amount}
                            </span>
                            <span className="text-gray-300">
                              for <strong>{wd.userName}</strong> (+91 {wd.userMobile})
                            </span>

                            {/* Status Badge */}
                            <span
                              className={`text-[10px] font-gaming font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                wd.status === 'SUCCESSFUL' || (wd.status as any) === 'TRANSFERRED'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : wd.status === 'APPROVED'
                                  ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                                  : wd.status === 'REJECTED'
                                  ? 'bg-red-950 text-red-400 border border-red-800'
                                  : 'bg-amber-950 text-amber-400 border border-amber-800'
                              }`}
                            >
                              {wd.status === 'TRANSFERRED' ? 'SUCCESSFUL' : wd.status}
                            </span>
                          </div>

                          <span className="text-[11px] text-emerald-400 font-mono block mt-1">
                            {wd.payoutMethod === 'UPI'
                              ? `UPI ID: ${wd.upiId}`
                              : `Bank: ${wd.bankDetails?.accountNumber} | IFSC: ${wd.bankDetails?.ifsc} | Holder: ${wd.bankDetails?.holderName}`}
                          </span>

                          <div className="mt-1 text-[10px] text-gray-500 font-mono">
                            Requested: {new Date(wd.requestTime).toLocaleString('en-IN')}
                            {wd.payoutUtr && ` • Payout UTR: ${wd.payoutUtr}`}
                            {wd.rejectionReason && ` • Reason: ${wd.rejectionReason}`}
                          </div>
                        </div>

                        {/* Admin Withdrawal Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Audit Trail Button */}
                          <button
                            onClick={() => setSelectedWdAudit(wd)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#141829] hover:bg-[#1d2236] border border-gray-700 text-gray-300 text-xs font-semibold flex items-center gap-1"
                            title="View complete audit trail"
                          >
                            <History className="w-3.5 h-3.5 text-gray-400" />
                            <span>Audit</span>
                          </button>

                          {wd.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApproveWithdrawal(wd.id)}
                                className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-semibold"
                              >
                                ⚡ Approve
                              </button>
                              <button
                                onClick={() => handleMarkSuccessfulWithdrawal(wd.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-gaming text-xs font-bold"
                              >
                                💰 Confirm Paid (UTR)
                              </button>
                              <button
                                onClick={() => handleRejectWithdrawal(wd.id)}
                                className="px-3 py-1.5 rounded-xl bg-red-950 hover:bg-red-900 text-red-400 border border-red-800/60 text-xs font-semibold"
                              >
                                ✕ Reject & Refund
                              </button>
                            </>
                          )}

                          {wd.status === 'APPROVED' && (
                            <>
                              <button
                                onClick={() => handleMarkSuccessfulWithdrawal(wd.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-gaming text-xs font-bold"
                              >
                                💰 Confirm Paid (UTR)
                              </button>
                              <button
                                onClick={() => handleSetPendingWithdrawal(wd.id)}
                                className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold"
                              >
                                ⏪ Set Pending
                              </button>
                              <button
                                onClick={() => handleRejectWithdrawal(wd.id)}
                                className="px-3 py-1.5 rounded-xl bg-red-950 hover:bg-red-900 text-red-400 border border-red-800/60 text-xs font-semibold"
                              >
                                ✕ Reject & Refund
                              </button>
                            </>
                          )}

                          {(wd.status === 'SUCCESSFUL' || (wd.status as any) === 'TRANSFERRED') && (
                            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Paid (Ref: {wd.payoutUtr})</span>
                            </span>
                          )}

                          {wd.status === 'REJECTED' && (
                            <span className="text-[11px] font-semibold text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              <span>Refunded to Winning Balance</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Withdrawal Audit Trail Modal */}
            {selectedWdAudit && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
                <div className="w-full max-w-lg bg-[#0c0e18] border border-gray-800 rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <div>
                      <h4 className="font-gaming font-bold text-base text-white flex items-center gap-2">
                        <History className="w-4 h-4 text-amber-400" />
                        <span>WITHDRAWAL AUDIT TRAIL</span>
                      </h4>
                      <p className="text-xs text-gray-400">
                        Request ID: <span className="font-mono text-white">{selectedWdAudit.id}</span> • ₹{selectedWdAudit.amount}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedWdAudit(null)}
                      className="p-1 text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-[#121522] rounded-xl border border-gray-800 flex justify-between">
                      <span className="text-gray-400">Player:</span>
                      <span className="text-white font-bold">{selectedWdAudit.userName} (+91 {selectedWdAudit.userMobile})</span>
                    </div>
                    <div className="p-3 bg-[#121522] rounded-xl border border-gray-800 flex justify-between">
                      <span className="text-gray-400">Payout Method:</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        {selectedWdAudit.payoutMethod === 'UPI' ? selectedWdAudit.upiId : selectedWdAudit.bankDetails?.accountNumber}
                      </span>
                    </div>
                    {selectedWdAudit.payoutUtr && (
                      <div className="p-3 bg-[#121522] rounded-xl border border-emerald-900/40 flex justify-between">
                        <span className="text-gray-400">Bank / UPI Reference UTR:</span>
                        <span className="text-emerald-300 font-mono font-bold">{selectedWdAudit.payoutUtr}</span>
                      </div>
                    )}
                  </div>

                  {/* Chronological Audit Logs */}
                  <div className="space-y-2">
                    <span className="text-xs font-gaming font-bold text-gray-300 block">
                      Chronological Audit Events:
                    </span>
                    {(selectedWdAudit.auditLog && selectedWdAudit.auditLog.length > 0) ? (
                      selectedWdAudit.auditLog.map((log, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-xl bg-[#141829] border border-gray-800 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-gaming font-bold text-amber-400 uppercase tracking-wide">
                              {log.action}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {new Date(log.timestamp).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="text-gray-300 text-[11px]">
                            {log.remarks || `Status set to ${log.status}`}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            Authorized by: <strong className="text-gray-300">{log.adminName}</strong> ({log.adminId})
                            {log.payoutUtr && ` • UTR: ${log.payoutUtr}`}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 rounded-xl bg-[#141829] border border-gray-800 text-xs text-gray-400">
                        Initiated on {new Date(selectedWdAudit.requestTime).toLocaleString('en-IN')}.
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedWdAudit(null)}
                    className="w-full py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-gaming text-xs uppercase"
                  >
                    Close Audit Window
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: PLAYERS & KYC */}
        {activeTab === 'players' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-gaming font-bold text-lg text-white">
                  PLAYER ACCOUNTS & COMPLIANCE ({players.length})
                </h3>
                <p className="text-xs text-gray-400">
                  Manage player wallets, KYC document verification, and account security
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={playerSearch}
                  onChange={e => setPlayerSearch(e.target.value)}
                  placeholder="Search player, IGN, or UID..."
                  className="w-full bg-[#0e111d] border border-gray-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              {filteredPlayers.map(p => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-[#0e111d] border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img src={p.avatar} alt={p.ign} className="w-10 h-10 rounded-xl bg-black" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-gaming font-bold text-sm text-white">{p.ign}</span>
                        <span className="text-[10px] text-gray-400">({p.name})</span>
                        {p.isBanned && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-800 font-bold uppercase">
                            BANNED
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        Mob: +91 {p.mobile} • UID: {p.ffUid} • KYC: <strong className="text-white">{p.kyc.status}</strong>
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Wallet: Deposit: ₹{p.wallet.depositBalance} | Winning: ₹{p.wallet.winningBalance} | Total: <strong className="text-emerald-400">₹{p.wallet.totalBalance}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setAdjustPlayer(p);
                        setAdjustAmount(100);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#141829] hover:bg-[#1d2236] border border-gray-700 text-gray-200 text-xs font-semibold"
                    >
                      Adjust Balance
                    </button>

                    <button
                      onClick={() => handleToggleBan(p.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        p.isBanned
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {p.isBanned ? 'Unban' : 'Ban'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Adjust Player Balance Modal */}
            {adjustPlayer && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <form
                  onSubmit={handleAdjustBalance}
                  className="w-full max-w-sm bg-[#0a0c14] border border-gray-800 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <h4 className="font-gaming font-bold text-sm text-white">
                      Adjust Wallet: {adjustPlayer.ign}
                    </h4>
                    <button type="button" onClick={() => setAdjustPlayer(null)}>
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Amount (Positive to credit, Negative to debit)
                    </label>
                    <input
                      type="number"
                      required
                      value={adjustAmount}
                      onChange={e => setAdjustAmount(Number(e.target.value))}
                      className="w-full bg-[#141829] border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white font-gaming"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Wallet Category</label>
                    <select
                      value={adjustWalletType}
                      onChange={e => setAdjustWalletType(e.target.value as any)}
                      className="w-full bg-[#141829] border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white"
                    >
                      <option value="winning">Winning Balance (Withdrawable)</option>
                      <option value="deposit">Deposit Balance</option>
                      <option value="bonus">Bonus Balance</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Audit Reason</label>
                    <input
                      type="text"
                      value={adjustRemarks}
                      onChange={e => setAdjustRemarks(e.target.value)}
                      placeholder="e.g. Prize dispute bonus / adjustment"
                      className="w-full bg-[#141829] border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-gaming font-bold text-xs rounded-xl uppercase"
                  >
                    Save Balance Adjustment
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: BANNERS, ALERTS & NOTIFICATIONS */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Broadcast Notification Tool */}
            <form onSubmit={handleBroadcastNotification} className="bg-[#0e111d] p-5 rounded-2xl border border-gray-800 space-y-3">
              <h4 className="font-gaming font-bold text-sm text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-red-500" />
                BROADCAST PUSH NOTIFICATION TO ALL PLAYERS
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={e => setBroadcastTitle(e.target.value)}
                  placeholder="Notification Title (e.g. Mega Sunday ₹10K Cup is LIVE!)"
                  className="bg-[#141829] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
                <input
                  type="text"
                  required
                  value={broadcastMsg}
                  onChange={e => setBroadcastMsg(e.target.value)}
                  placeholder="Notification Message body..."
                  className="bg-[#141829] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-gaming font-bold text-xs uppercase"
              >
                Send Broadcast Notification
              </button>
            </form>

            {/* Manage Hero Banners */}
            <div className="space-y-3">
              <h4 className="font-gaming font-bold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                HERO PROMO BANNERS ({banners.length})
              </h4>

              <form onSubmit={handleCreateBanner} className="bg-[#0e111d] p-4 rounded-2xl border border-gray-800 space-y-3">
                <span className="text-xs font-semibold text-gray-300 block">Create New Banner:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    required
                    value={newBannerTitle}
                    onChange={e => setNewBannerTitle(e.target.value)}
                    placeholder="Banner Title"
                    className="bg-[#141829] border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                  <input
                    type="text"
                    value={newBannerSubtitle}
                    onChange={e => setNewBannerSubtitle(e.target.value)}
                    placeholder="Subtitle"
                    className="bg-[#141829] border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                  <input
                    type="url"
                    required
                    value={newBannerImg}
                    onChange={e => setNewBannerImg(e.target.value)}
                    placeholder="Image URL (Unsplash or direct image link)"
                    className="bg-[#141829] border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                  <input
                    type="text"
                    value={newBannerBadge}
                    onChange={e => setNewBannerBadge(e.target.value)}
                    placeholder="Badge Text (e.g. FEATURED)"
                    className="bg-[#141829] border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-gaming font-bold text-xs uppercase"
                >
                  Add Banner
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {banners.map(b => (
                  <div key={b.id} className="relative rounded-2xl overflow-hidden border border-gray-800 bg-[#0e111d]">
                    <img src={b.imageUrl} alt={b.title} className="w-full h-28 object-cover brightness-50" />
                    <div className="p-3">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-600 text-white uppercase">
                        {b.badgeText}
                      </span>
                      <h5 className="font-gaming font-bold text-xs text-white mt-1 truncate">{b.title}</h5>
                      <p className="text-[10px] text-gray-400 line-clamp-1">{b.subtitle}</p>
                      <button
                        onClick={() => handleDeleteBanner(b.id)}
                        className="mt-2 text-[10px] text-red-400 hover:underline font-semibold"
                      >
                        Delete Banner
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manage Announcements */}
            <div className="space-y-3">
              <h4 className="font-gaming font-bold text-sm text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                TOP ANNOUNCEMENT BAR TICKERS
              </h4>

              <form onSubmit={handleCreateAnnouncement} className="bg-[#0e111d] p-4 rounded-2xl border border-gray-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    required
                    value={newAnnTitle}
                    onChange={e => setNewAnnTitle(e.target.value)}
                    placeholder="Announcement Title"
                    className="bg-[#141829] border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                  <input
                    type="text"
                    required
                    value={newAnnContent}
                    onChange={e => setNewAnnContent(e.target.value)}
                    placeholder="Announcement Content message..."
                    className="bg-[#141829] border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-gaming font-bold text-xs uppercase"
                >
                  Publish Announcement
                </button>
              </form>

              <div className="space-y-2">
                {announcements.map(a => (
                  <div key={a.id} className="p-3 rounded-xl bg-[#0e111d] border border-gray-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">{a.title}</span>
                      <span className="text-[11px] text-gray-400">{a.content}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(a.id)}
                      className="text-red-400 hover:text-red-300 text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: PLATFORM AUDIT TRANSACTION LEDGER */}
        {activeTab === 'ledger' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-gaming font-bold text-lg text-white">
                  PLATFORM TRANSACTION LEDGER ({allTransactions.length})
                </h3>
                <p className="text-xs text-gray-400">
                  Real-time immutable financial records of all deposits, match entries, and payouts
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={ledgerFilter}
                  onChange={e => setLedgerFilter(e.target.value)}
                  className="bg-[#0e111d] border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                >
                  <option value="ALL">All Types</option>
                  <option value="DEPOSIT">Deposits</option>
                  <option value="WITHDRAWAL">Withdrawals</option>
                  <option value="MATCH_JOIN">Match Fees</option>
                  <option value="MATCH_WINNING">Prizes</option>
                  <option value="MATCH_REFUND">Refunds</option>
                </select>

                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={ledgerSearch}
                    onChange={e => setLedgerSearch(e.target.value)}
                    placeholder="Search ledger..."
                    className="w-full bg-[#0e111d] border border-gray-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {filteredLedger.map(tx => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-[#0e111d] border border-gray-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-gray-800 text-gray-300 uppercase font-mono">
                        {tx.type}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-gray-200 mt-0.5">{tx.remarks}</p>
                    {tx.utrNumber && (
                      <span className="text-[10px] text-gray-500 font-mono block">Ref: {tx.utrNumber}</span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="font-gaming font-bold text-sm text-white">
                      ₹{tx.amount}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono block">
                      Balance: ₹{tx.balanceAfter}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* CREATE / EDIT TOURNAMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleSaveTournament}
            className="w-full max-w-xl bg-[#0a0c14] border border-red-600/50 rounded-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto glow-red"
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="font-gaming font-bold text-base text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-red-500" />
                <span>{isEditingTournament ? 'EDIT TOURNAMENT' : 'CREATE TOURNAMENT'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full bg-gray-900 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Tournament Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="e.g. CLASH SQUAD 4v4 PRO SHOWDOWN #205"
                className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Game</label>
                <select
                  value={formGame}
                  onChange={e => setFormGame(e.target.value as any)}
                  className="w-full bg-[#121522] border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                >
                  <option value="Free Fire MAX">Free Fire MAX</option>
                  <option value="Free Fire India">Free Fire India</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Type</label>
                <select
                  value={formType}
                  onChange={e => setFormType(e.target.value as any)}
                  className="w-full bg-[#121522] border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                >
                  <option value="BR">Battle Royale</option>
                  <option value="CS">Clash Squad</option>
                  <option value="Lone Wolf">Lone Wolf</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Mode</label>
                <select
                  value={formMode}
                  onChange={e => setFormMode(e.target.value as any)}
                  className="w-full bg-[#121522] border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                >
                  <option value="Solo">Solo</option>
                  <option value="Duo">Duo</option>
                  <option value="Squad">Squad</option>
                  <option value="1v1">1v1</option>
                  <option value="2v2">2v2</option>
                  <option value="4v4">4v4</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Map</label>
                <select
                  value={formMap}
                  onChange={e => setFormMap(e.target.value as any)}
                  className="w-full bg-[#121522] border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                >
                  <option value="Bermuda">Bermuda</option>
                  <option value="Kalahari">Kalahari</option>
                  <option value="Purgatory">Purgatory</option>
                  <option value="Alpine">Alpine</option>
                  <option value="Nexterra">Nexterra</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Entry Fee (₹0 = Free)
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={formEntryFee}
                  onChange={e => setFormEntryFee(Number(e.target.value))}
                  className="w-full bg-[#121522] border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-gaming outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Prize Pool (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={formPrizePool}
                  onChange={e => setFormPrizePool(Number(e.target.value))}
                  className="w-full bg-[#121522] border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-gaming outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Per Kill Bounty (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={formPerKill}
                  onChange={e => setFormPerKill(Number(e.target.value))}
                  className="w-full bg-[#121522] border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-gaming outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Max Player Slots
                </label>
                <input
                  type="number"
                  min={2}
                  max={48}
                  required
                  value={formMaxSlots}
                  onChange={e => setFormMaxSlots(Number(e.target.value))}
                  className="w-full bg-[#121522] border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-gaming outline-none"
                />
              </div>
            </div>

            {!isEditingTournament && (
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Start Schedule (Minutes from now)
                </label>
                <input
                  type="number"
                  min={5}
                  value={formScheduleMins}
                  onChange={e => setFormScheduleMins(Number(e.target.value))}
                  className="w-full bg-[#121522] border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Custom Banner Image URL <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="url"
                value={formBannerUrl}
                onChange={e => setFormBannerUrl(e.target.value)}
                placeholder="Leave blank for automatic mode-themed banner"
                className="w-full bg-[#121522] border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-gaming font-bold text-xs uppercase tracking-wider glow-red-sm"
            >
              {isEditingTournament ? 'Save Tournament Changes' : 'Publish Tournament Live to Player App'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
