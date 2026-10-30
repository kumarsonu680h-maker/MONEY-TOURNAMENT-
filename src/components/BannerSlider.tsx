import React, { useState, useEffect } from 'react';
import { Banner } from '../types/index.ts';
import { ChevronRight, ChevronLeft, Sparkles, Award } from 'lucide-react';

interface BannerSliderProps {
  onNavigateTab: (tab: string) => void;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({ onNavigateTab }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch('/api/banners')
      .then(res => res.json())
      .then(data => {
        if (data.banners && data.banners.length > 0) {
          setBanners(data.banners);
        }
      })
      .catch(e => console.error('Error fetching banners', e));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-red-900/30 bg-[#0d101a] shadow-xl group">
      {/* Background with overlay */}
      <div className="relative h-44 sm:h-52 w-full overflow-hidden">
        <img
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          className="w-full h-full object-cover object-center filter brightness-[0.4] transition-all duration-700 transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090b12] via-[#090b12]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090b12]/90 via-[#090b12]/40 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider font-gaming bg-red-600 text-white shadow-md glow-red-sm uppercase">
              <Sparkles className="w-3 h-3" />
              {currentBanner.badgeText}
            </span>
            <span className="text-[10px] font-semibold text-gray-400 font-mono">
              FF INDIA & FF MAX
            </span>
          </div>

          <div className="space-y-1 max-w-lg">
            <h2 className="font-gaming font-bold text-lg sm:text-2xl text-white tracking-wide leading-tight drop-shadow-md">
              {currentBanner.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 font-medium line-clamp-2">
              {currentBanner.subtitle}
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => onNavigateTab(currentBanner.targetTab)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-gaming font-bold text-xs uppercase tracking-wider glow-red-sm transition-all hover:scale-105 active:scale-95"
            >
              <span>Explore Now</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-5 bg-red-500 glow-red-sm'
                      : 'w-1.5 bg-gray-600 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
