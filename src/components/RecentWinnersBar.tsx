import React, { useState, useEffect } from 'react';
import { Trophy, Sparkles } from 'lucide-react';

interface WinnerItem {
  matchId: string;
  matchTitle: string;
  ign: string;
  avatar: string;
  prizeWon: number;
  rank: number;
  kills: number;
}

export const RecentWinnersBar: React.FC = () => {
  const [winners, setWinners] = useState<WinnerItem[]>([]);

  useEffect(() => {
    fetch('/api/recent-winners')
      .then(res => res.json())
      .then(data => {
        if (data.winners) {
          setWinners(data.winners);
        }
      })
      .catch(e => console.error('Error fetching winners', e));
  }, []);

  return (
    <div className="w-full bg-[#0d0f18] border border-red-950/50 rounded-xl p-2.5 overflow-hidden flex items-center gap-3 shadow-inner">
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-600/20 text-red-400 font-gaming font-bold text-xs shrink-0 border border-red-600/30">
        <Trophy className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400/30" />
        <span className="tracking-wide">CHAMPIONS</span>
      </div>

      {winners.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-gray-400 truncate">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <span className="truncate">
            Tournament season is live • Win Battle Royale, Clash Squad & Lone Wolf to claim cash prizes!
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto no-scrollbar flex items-center gap-3 scroll-smooth">
          {winners.map((w, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-[#141724] px-2.5 py-1 rounded-lg border border-gray-800 shrink-0 select-none hover:border-red-900/40 transition-colors"
            >
              <img
                src={w.avatar}
                alt={w.ign}
                className="w-5 h-5 rounded-full bg-black/40 border border-gray-700"
              />
              <span className="text-xs font-semibold text-gray-200 tracking-tight max-w-[110px] truncate">
                {w.ign}
              </span>
              <span className="text-[11px] font-bold text-emerald-400 font-gaming bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/30 flex items-center">
                +₹{w.prizeWon}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
