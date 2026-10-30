import React, { useState, useEffect } from 'react';
import { Tournament } from '../types/index.ts';
import { MatchCard } from '../components/MatchCard.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Swords,
  Clock,
  KeyRound,
  CheckCircle2,
  Trophy,
  Search,
  Filter,
  Flame,
  Target,
  Zap,
} from 'lucide-react';

interface MatchesViewProps {
  onJoinClick: (tournament: Tournament) => void;
  onDetailsClick: (tournament: Tournament) => void;
  onOpenAdminPortal?: () => void;
}

export const MatchesView: React.FC<MatchesViewProps> = ({
  onJoinClick,
  onDetailsClick,
  onOpenAdminPortal,
}) => {
  const { user, isAdmin } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState<'upcoming' | 'live' | 'my_matches' | 'completed'>('upcoming');
  const [modeFilter, setModeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTournaments();
  }, [user?.id]);

  const fetchTournaments = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const statusTabs = [
    { id: 'upcoming', label: 'Upcoming', icon: Clock },
    { id: 'live', label: 'Live & Room Open', icon: KeyRound },
    { id: 'my_matches', label: 'My Matches', icon: CheckCircle2 },
    { id: 'completed', label: 'Results & History', icon: Trophy },
  ];

  const modeFilters = [
    { id: 'ALL', label: 'All Modes' },
    { id: 'BR', label: 'Battle Royale (BR)' },
    { id: 'CS', label: 'Clash Squad (CS)' },
    { id: 'Lone Wolf', label: 'Lone Wolf (1v1/2v2)' },
    { id: '4v4', label: '4v4 Squads' },
    { id: 'FREE', label: '₹0 Free Entry' },
  ];

  // Filtering logic
  const filtered = tournaments.filter(t => {
    // Status tab filter
    if (statusTab === 'upcoming' && t.status !== 'upcoming') return false;
    if (statusTab === 'live' && t.status !== 'room_open' && t.status !== 'live') return false;
    if (statusTab === 'completed' && t.status !== 'completed') return false;
    if (statusTab === 'my_matches') {
      const isJoined = (t as any).isUserJoined || t.participants.some(p => p.userId === user?.id);
      if (!isJoined) return false;
    }

    // Mode filter
    if (modeFilter === 'FREE' && t.entryFee !== 0) return false;
    if (modeFilter === '4v4' && t.mode !== '4v4') return false;
    if (modeFilter !== 'ALL' && modeFilter !== 'FREE' && modeFilter !== '4v4' && t.matchType !== modeFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchTitle = t.title.toLowerCase().includes(query);
      const matchMap = t.map.toLowerCase().includes(query);
      const matchGame = t.game.toLowerCase().includes(query);
      if (!matchTitle && !matchMap && !matchGame) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4 pb-24 max-w-7xl mx-auto px-3 sm:px-6 pt-3">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-gaming font-bold text-xl sm:text-2xl text-white tracking-wider flex items-center gap-2">
            <Swords className="w-6 h-6 text-red-500" />
            <span>ESPORTS TOURNAMENTS</span>
          </h2>
          <p className="text-xs text-gray-400">
            Free Fire India & Free Fire MAX Competitive Custom Rooms
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search match or map..."
            className="w-full bg-[#121522] border border-gray-800 focus:border-red-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Main Status Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#0c0e18] rounded-2xl border border-gray-800 text-xs font-gaming font-bold">
        {statusTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = statusTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id as any)}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-red-600 text-white glow-red-sm scale-[1.02]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#141724]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mode Sub-Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {modeFilters.map(m => (
          <button
            key={m.id}
            onClick={() => setModeFilter(m.id)}
            className={`px-3 py-1.5 rounded-xl font-gaming font-bold whitespace-nowrap transition-all ${
              modeFilter === m.id
                ? 'bg-red-950/60 text-red-400 border border-red-500/50'
                : 'bg-[#121522] text-gray-400 hover:bg-[#1a1f33] border border-gray-800'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Tournaments Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400 space-y-2">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading tournaments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center bg-[#0d0f18] rounded-2xl border border-gray-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-800/40 mx-auto flex items-center justify-center text-red-500">
            <Swords className="w-6 h-6 animate-pulse" />
          </div>
          <h4 className="font-gaming font-bold text-base text-gray-200 uppercase tracking-wide">
            {tournaments.length === 0
              ? 'No Tournaments Scheduled'
              : statusTab === 'my_matches'
              ? 'You have not joined any tournaments in this category yet.'
              : 'No matches found matching your filters.'}
          </h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {tournaments.length === 0
              ? 'All dummy matches have been purged. Admins can create and schedule official tournaments via the Admin Command Center.'
              : statusTab === 'my_matches'
              ? 'Browse the Upcoming tab to find Battle Royale, Clash Squad, or Lone Wolf matches to join!'
              : 'Try selecting All Modes or checking Upcoming matches.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {statusTab === 'my_matches' && (
              <button
                onClick={() => setStatusTab('upcoming')}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-gaming font-bold text-xs uppercase glow-red-sm"
              >
                Browse Upcoming Matches
              </button>
            )}
            {tournaments.length === 0 && onOpenAdminPortal && (
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
          {filtered.map(tournament => (
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
  );
};
