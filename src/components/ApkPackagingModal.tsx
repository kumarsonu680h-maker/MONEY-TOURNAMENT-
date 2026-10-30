import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Terminal,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ApkPackagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  appDownloadLink?: string;
}

export const ApkPackagingModal: React.FC<ApkPackagingModalProps> = ({
  isOpen,
  onClose,
  appDownloadLink = 'https://moneytournament.in/download',
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const steps = [
    {
      title: '1. Install Capacitor Native Dependencies',
      desc: 'Add the official Capacitor core, CLI, and native Android runtime to your project:',
      command: 'npm install @capacitor/core @capacitor/android && npm install -D @capacitor/cli',
    },
    {
      title: '2. Build Web Application Assets',
      desc: 'Compile the high-performance Vite React production bundle into the dist/ directory:',
      command: 'npm run build',
    },
    {
      title: '3. Initialize Android Studio Project',
      desc: 'Generate the native Android Studio project structure:',
      command: 'npx cap add android',
    },
    {
      title: '4. Sync Web Assets with Native Project',
      desc: 'Sync the latest web assets, icons, and configuration into the native Android platform:',
      command: 'npx cap sync android',
    },
    {
      title: '5. Build APK in Android Studio or Command Line',
      desc: 'Open the native project in Android Studio to build the signed APK:',
      command: 'npx cap open android',
    },
    {
      title: '6. Direct Gradle CLI APK Build (Headless)',
      desc: 'Alternatively, generate the debug APK directly via command line without Android Studio UI:',
      command: 'cd android && ./gradlew assembleDebug',
    },
  ];

  const handleCopy = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0c0e18] border border-red-600/60 rounded-3xl shadow-2xl p-5 sm:p-6 overflow-y-auto max-h-[92vh] space-y-5 glow-red">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-900/80 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-black p-0.5 glow-red shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-[#0c0e18] rounded-[14px] flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-red-500 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-gaming font-bold text-lg sm:text-xl text-white">
                ANDROID APK & CAPACITOR PACKAGING
              </h3>
              <span className="text-[10px] bg-red-600/30 border border-red-500 text-red-300 px-2 py-0.5 rounded-full font-mono font-bold">
                READY
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Native APK packaging instructions for MONEY TOURNAMENT (Package:{' '}
              <span className="text-red-400 font-mono">com.moneytournament.esports</span>)
            </p>
          </div>
        </div>

        {/* App Meta Info Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-[#121522] border border-gray-800 text-xs">
          <div>
            <span className="text-[10px] text-gray-500 block uppercase font-semibold">App ID</span>
            <span className="text-white font-mono font-bold text-[11px] truncate block">
              com.moneytournament.esports
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 block uppercase font-semibold">Target SDK</span>
            <span className="text-emerald-400 font-mono font-bold">Android 14 (API 34)</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 block uppercase font-semibold">Config File</span>
            <span className="text-yellow-400 font-mono font-bold">capacitor.config.ts</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 block uppercase font-semibold">Web Output</span>
            <span className="text-cyan-400 font-mono font-bold">dist/ (Vite PWA)</span>
          </div>
        </div>

        {/* Download Direct APK link */}
        {appDownloadLink && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/60 via-black to-red-950/60 border border-red-700/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs font-gaming font-bold text-white flex items-center gap-1.5">
                <Download className="w-4 h-4 text-red-500" />
                OFFICIAL ANDROID APK DOWNLOAD LINK
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5 font-mono truncate max-w-sm">
                {appDownloadLink}
              </p>
            </div>
            <a
              href={appDownloadLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-gaming font-bold text-xs uppercase tracking-wider glow-red-sm flex items-center gap-1.5 shrink-0"
            >
              <span>Download APK</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Steps List */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
            Step-by-Step Native APK Packaging
          </span>

          <div className="space-y-2.5">
            {steps.map((st, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-[#121522] border border-gray-800/90 hover:border-red-900/40 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{st.title}</span>
                  <button
                    onClick={() => handleCopy(st.command, i)}
                    className="p-1 px-2 rounded-lg bg-black/60 hover:bg-black text-[10px] text-gray-400 hover:text-white flex items-center gap-1 border border-gray-800 transition-colors"
                  >
                    {copiedIndex === i ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">{st.desc}</p>
                <div className="bg-black/80 rounded-lg p-2 font-mono text-xs text-red-400 overflow-x-auto border border-gray-800">
                  <code>{st.command}</code>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Output Location & Release Signing Tips */}
        <div className="p-4 rounded-2xl bg-[#090b12] border border-gray-800 space-y-2 text-xs">
          <span className="font-semibold text-gray-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            APK Output Location & Distribution
          </span>
          <p className="text-[11px] text-gray-400">
            • <strong>Debug APK:</strong> Generated at{' '}
            <code className="text-yellow-400 font-mono">android/app/build/outputs/apk/debug/app-debug.apk</code>
            <br />• <strong>Release Signed APK:</strong> In Android Studio, go to{' '}
            <code className="text-cyan-400 font-mono">Build &gt; Generate Signed Bundle / APK</code>, choose APK, select or create your release keystore, and export for production distribution.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-gaming font-bold text-xs uppercase tracking-wider transition-colors"
        >
          Close Packaging Guide
        </button>
      </div>
    </div>
  );
};
