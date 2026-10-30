import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';
import { Download, Smartphone, X, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already installed in standalone mode, return null or an installed badge
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (isInstallable) {
      setIsInstalling(true);
      try {
        await install();
      } finally {
        setIsInstalling(false);
      }
    } else {
      // If ambient prompt not triggered yet, show fallback tip modal
      setShowIOSGuide(true);
    }
  };

  if (variant === 'banner') {
    return (
      <>
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/80 via-black to-red-950/80 border border-red-600/50 p-3 sm:p-4 glow-red-sm flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-gaming font-bold text-xs sm:text-sm text-white">INSTALL ANDROID APP / PWA</span>
                <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-mono font-bold">FAST & LIGHT</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Play full-screen with instant room alerts and faster tournament joining.
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-gaming font-bold text-xs uppercase tracking-wider glow-red-sm flex items-center justify-center gap-1.5 shrink-0 transition-transform active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isInstalling ? 'Installing...' : 'Install App'}</span>
          </button>
        </div>

        {/* Instructions Modal */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#0d0f18] border border-red-600/50 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-gaming font-bold text-base text-white">
                  <Smartphone className="w-5 h-5 text-red-500" />
                  <span>How to Install</span>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isIOS ? (
                <div className="space-y-2.5 text-xs text-gray-300">
                  <p className="text-gray-200">To install on iPhone or iPad Safari:</p>
                  <div className="p-3 rounded-xl bg-black/40 border border-gray-800 space-y-2">
                    <p className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">1.</span>
                      <span>Tap the <strong>Share</strong> button (box with arrow) in Safari bottom bar.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">2.</span>
                      <span>Scroll down and select <strong>Add to Home Screen</strong>.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">3.</span>
                      <span>Tap <strong>Add</strong> in the top right corner.</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 text-xs text-gray-300">
                  <p className="text-gray-200">To install on Android Chrome:</p>
                  <div className="p-3 rounded-xl bg-black/40 border border-gray-800 space-y-2">
                    <p className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">1.</span>
                      <span>Tap the <strong>three dots menu (⋮)</strong> in Chrome.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">2.</span>
                      <span>Tap <strong>Install App</strong> or <strong>Add to Home Screen</strong>.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">3.</span>
                      <span>Tap <strong>Install</strong> to add MONEY TOURNAMENT to your app drawer.</span>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[11px] text-green-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Safe, Verified & Light Web App</span>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        title="Install Money Tournament App"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-gaming font-bold text-[11px] uppercase tracking-wider glow-red-sm shadow transition-all hover:scale-105 active:scale-95 ${className}`}
      >
        <Download className="w-3.5 h-3.5 text-white" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">App</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#0d0f18] border border-red-600/50 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-gaming font-bold text-base text-white">
                <Smartphone className="w-5 h-5 text-red-500" />
                <span>Install Mobile App</span>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-2.5 text-xs text-gray-300">
                <p className="text-gray-200">To install on iOS Safari:</p>
                <div className="p-3 rounded-xl bg-black/40 border border-gray-800 space-y-2">
                  <p className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">1.</span>
                    <span>Tap <strong>Share</strong> in the Safari toolbar.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">2.</span>
                    <span>Select <strong>Add to Home Screen</strong>.</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs text-gray-300">
                <p className="text-gray-200">To install on Android:</p>
                <div className="p-3 rounded-xl bg-black/40 border border-gray-800 space-y-2">
                  <p className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">1.</span>
                    <span>Tap <strong>three dots (⋮)</strong> in Chrome.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">2.</span>
                    <span>Select <strong>Install App</strong>.</span>
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-gaming font-bold text-xs uppercase"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
