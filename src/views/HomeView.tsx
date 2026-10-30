import React, { useState, useEffect } from 'react';
import { Tournament } from '../types/index.ts';
import { BannerSlider } from '../components/BannerSlider.tsx';
import { RecentWinnersBar } from '../components/RecentWinnersBar.tsx';
import { MatchCard } from '../components/MatchCard.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Flame,
  Swords,
  Trophy,
  Gift,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Zap,
  Target,
  Users,
  Copy,
  Check,
} from 'lucide-react';

interface HomeViewProps {
  onJoinClick: (tournament: Tournament) => void;
  onDetailsClick: (tournament: Tournament) => void;
  onNavigateTab: (tab: string) => void;
  onOpenDeposit: () => void;
  onOpenAdminPortal?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onJoinClick,
  onDetailsClick,
  onNavigateTab,
  onOpenDeposit,
  onOpenAdminPortal,
}) => {
  const { user, isAdmin } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filterMode, setFilterMode] = useState<string>('ALL');
  const [copiedRef, setCopiedRef] = useState(false);

  useEffect(() => {
    fetchTournaments();
  }, [user?.id]);

  const fetchTournaments = async () => {
    try {
      const res = await fetch('/api/tournaments', {
        headers: { 'x-user-id': user?.id || '' },
      });
      const data = await res.json();
      if (data.tournaments) {
        setTournaments(data.tournaments);
      }
    } catch (e) {
      console.error('Error fetching tournaments', e);
    }
  };

  const handleCopyReferral = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.referralCode);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // Filter categories
  const categories = [
    { id: 'ALL', label: 'All Matches', icon: Flame },
    { id: 'BR', label: 'Battle Royale', icon: Swords },
    { id: 'CS', label: 'Clash Squad', icon: Zap },
    { id: 'Lone Wolf', label: 'Lone Wolf 1v1', icon: Target },
    { id: 'FREE', label: '₹0 Free Cups', icon: Sparkles },
  ];

  const filteredTournaments = tournaments.filter(t => {
    if (filterMode === 'ALL') return true;
    if (filterMode === 'FREE') return t.entryFee === 0;
    return t.matchType === filterMode;
  });

  const liveMatches = tournaments.filter(t => t.status === 'room_open' || t.status === 'live');
  const upcomingMatches = filteredTournaments.filter(t => t.status === 'upcoming');

  return (
    <div className="space-y-5 pb-24 max-w-7xl mx-auto px-3 sm:px-6 pt-3">
      {/* Hero Banner Carousel */}
      <BannerSlider onNavigateTab={onNavigateTab} />

      {/* Live Recent Winners Ticker */}
      <RecentWinnersBar />

      {/* Live / Room Open Matches Alert Section (if any) */}
      {liveMatches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
              </span>
              <h3 className="font-gaming font-bold text-base sm:text-lg text-white tracking-wider flex items-center gap-1.5">
                LIVE & ROOM OPEN MATCHES
              </h3>
            </div>
            <span className="text-xs text-red-400 font-gaming font-semibold">
              {liveMatches.length} Matches Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {liveMatches.map(tournament => (
              <MatchCard
                key={tournament.id}
                tournament={tournament}
                onJoinClick={onJoinClick}
                onDetailsClick={onDetailsClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mode Quick Filter Chips */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-gaming font-bold text-base sm:text-lg text-white tracking-wider">
            FEATURED TOURNAMENTS
          </h3>
          <button
            onClick={() => onNavigateTab('matches')}
            className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 font-gaming"
          >
            <span>View All ({tournaments.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable category pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = filterMode === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterMode(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-gaming font-bold whitespace-nowrap transition-all select-none ${
                  isSelected
                    ? 'bg-red-600 text-white glow-red-sm scale-105'
                    : 'bg-[#121522] hover:bg-[#1a1f33] text-gray-300 border border-gray-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Match Cards Grid */}
        {upcomingMatches.length === 0 ? (
          <div className="p-8 sm:p-10 text-center bg-[#0d0f18] rounded-2xl border border-gray-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-800/40 mx-auto flex items-center justify-center text-red-500">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="font-gaming font-bold text-base text-gray-200 uppercase tracking-wide">
              {tournaments.length === 0 ? 'No Active Tournaments' : 'No Matches In This Filter'}
            </h4>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              {tournaments.length === 0
                ? 'All sample data has been cleared. Real tournaments will appear here once published by the tournament admins.'
                : 'No matches found matching your current filter. Try selecting All Matches.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {filterMode !== 'ALL' && (
                <button
                  onClick={() => setFilterMode('ALL')}
                  className="px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200"
                >
                  Show All Matches
                </button>
              )}
              {onOpenAdminPortal && (
                <button
                  onClick={onOpenAdminPortal}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-gaming font-bold text-xs uppercase tracking-wider glow-red-sm"
                >
                  {isAdmin ? '+ Host Tournament (Admin)' : 'Staff Login & Host'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {upcomingMatches.map(tournament => (
              <MatchCard
                key={tournament.id}
                tournament={tournament}
                onJoinClick={onJoinClick}
                onDetailsClick={onDetailsClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Refer & Earn Banner Card */}
      {user && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/40 via-[#141829] to-[#0c0e18] border border-red-900/40 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-700 p-0.5 glow-gold shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-[#10131f] rounded-[14px] flex items-center justify-center text-yellow-400">
                <Gift className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 uppercase tracking-widest">
                REFER & EARN
              </span>
              <h4 className="font-gaming font-bold text-base sm:text-lg text-white mt-0.5">
                Earn ₹25 Bonus Cash per Friend
              </h4>
              <p className="text-xs text-gray-400">
                Your friend gets ₹25 welcome bonus, you get ₹15 on their first paid tournament!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="bg-black/60 border border-gray-700 px-3 py-1.5 rounded-xl font-mono font-bold text-xs text-white tracking-widest flex items-center gap-2">
              <span className="text-gray-400 text-[10px]">CODE:</span>
              <span className="text-yellow-400">{user.referralCode}</span>
            </div>
            <button
              onClick={handleCopyReferral}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-gaming font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 glow-red-sm shrink-0"
            >
              {copiedRef ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Safety, Fair Play & Indian Legal Compliance Notice */}
      <div className="rounded-2xl bg-[#0b0d14] border border-gray-800/80 p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-gaming font-bold text-gray-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>RESPONSIBLE ESPORTS & LEGAL COMPLIANCE IN INDIA</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          MONEY TOURNAMENT provides competitive electronic sports competitions based purely on gaming skill, reaction time, and tactical mastery. Strictly 18+ only. Users residing in states where real-money skill gaming is legally restricted (Assam, Odisha, Telangana, Andhra Pradesh, Nagaland, Sikkim) may only participate in free tournament formats.
        </p>
      </div>
    </div>
  );
};
