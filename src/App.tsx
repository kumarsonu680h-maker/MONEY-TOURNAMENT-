/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Header } from './components/Header.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { HomeView } from './views/HomeView.tsx';
import { MatchesView } from './views/MatchesView.tsx';
import { WalletView } from './views/WalletView.tsx';
import { LeaderboardView } from './views/LeaderboardView.tsx';
import { ProfileView } from './views/ProfileView.tsx';
import { AdminDashboardView } from './views/AdminDashboardView.tsx';
import { MatchDetailsModal } from './components/MatchDetailsModal.tsx';
import { JoinMatchModal } from './components/JoinMatchModal.tsx';
import { DepositModal } from './components/DepositModal.tsx';
import { WithdrawModal } from './components/WithdrawModal.tsx';
import { KYCModal } from './components/KYCModal.tsx';
import { NotificationsModal } from './components/NotificationsModal.tsx';
import { CustomerSupportModal } from './components/CustomerSupportModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { AdminLoginModal } from './components/AdminLoginModal.tsx';
import { Tournament, Announcement } from './types/index.ts';
import { AlertCircle, X, Sparkles, ShieldCheck } from 'lucide-react';

function AppContent() {
  const { user, isAdmin, adminUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedMatchForDetails, setSelectedMatchForDetails] = useState<Tournament | null>(null);
  const [selectedMatchForJoin, setSelectedMatchForJoin] = useState<Tournament | null>(null);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isKYCOpen, setIsKYCOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissAnnouncement, setDismissAnnouncement] = useState(false);

  useEffect(() => {
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => {
        if (data.announcements && data.announcements.length > 0) {
          setAnnouncement(data.announcements[0]);
        }
      })
      .catch(e => console.error(e));
  }, []);

  const handleJoinClick = (match: Tournament) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setSelectedMatchForJoin(match);
  };

  const handleDetailsClick = (match: Tournament) => {
    setSelectedMatchForDetails(match);
  };

  const handleJoinSuccess = (joinedMatch: Tournament) => {
    setSelectedMatchForJoin(null);
    setSelectedMatchForDetails(joinedMatch);
  };

  const handleOpenAdminPortal = () => {
    if (isAdmin) {
      setIsAdminPortalOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  // If Admin Portal is currently open, display the dedicated full-screen Admin Dashboard View
  if (isAdminPortalOpen && isAdmin) {
    return (
      <div className="min-h-screen bg-[#08090d] text-gray-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
        <AdminDashboardView onExitAdmin={() => setIsAdminPortalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090d] text-gray-100 flex flex-col font-sans bg-cyber-grid bg-radial-vignette relative selection:bg-red-600 selection:text-white">
      {/* Top Announcement Bar */}
      {announcement && !dismissAnnouncement && (
        <div className="bg-gradient-to-r from-red-900/90 via-red-800/80 to-black px-3 py-1.5 text-xs text-white border-b border-red-700/50 flex items-center justify-between z-50">
          <div className="flex items-center gap-2 max-w-5xl mx-auto truncate text-[11px] font-medium">
            <span className="font-gaming font-bold text-yellow-300 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
              {announcement.title}
            </span>
            <span className="text-gray-200 hidden sm:inline truncate">• {announcement.content}</span>
          </div>
          <button
            onClick={() => setDismissAnnouncement(true)}
            className="p-1 text-gray-300 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWallet={() => setActiveTab('wallet')}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdminPortal={handleOpenAdminPortal}
      />

      {/* Main Tab Views */}
      <main className="flex-1 w-full">
        {activeTab === 'home' && (
          <HomeView
            onJoinClick={handleJoinClick}
            onDetailsClick={handleDetailsClick}
            onNavigateTab={tab => setActiveTab(tab)}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenAdminPortal={handleOpenAdminPortal}
          />
        )}

        {activeTab === 'matches' && (
          <MatchesView
            onJoinClick={handleJoinClick}
            onDetailsClick={handleDetailsClick}
            onOpenAdminPortal={handleOpenAdminPortal}
          />
        )}

        {activeTab === 'wallet' && (
          <WalletView
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
            onOpenKYC={() => setIsKYCOpen(true)}
          />
        )}

        {activeTab === 'leaderboard' && <LeaderboardView />}

        {activeTab === 'profile' && (
          <ProfileView
            onOpenKYC={() => setIsKYCOpen(true)}
            onOpenSupport={() => setIsSupportOpen(true)}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
            onOpenAdminPortal={handleOpenAdminPortal}
          />
        )}

        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminDashboardView onExitAdmin={() => setActiveTab('home')} />
          ) : (
            <div className="py-20 text-center max-w-md mx-auto px-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-800/80 mx-auto flex items-center justify-center text-red-500">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="font-gaming font-bold text-xl text-white">Staff Authentication Required</h3>
              <p className="text-xs text-gray-400">
                The Admin Command Center is strictly restricted to tournament coordinators and system administrators.
              </p>
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-gaming font-bold text-xs uppercase glow-red-sm"
              >
                Log In As Admin
              </button>
            </div>
          )
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAdminPortal={handleOpenAdminPortal}
      />

      {/* Modals & Dialogs */}
      <MatchDetailsModal
        tournament={selectedMatchForDetails}
        onClose={() => setSelectedMatchForDetails(null)}
        onJoinClick={handleJoinClick}
      />

      <JoinMatchModal
        tournament={selectedMatchForJoin}
        onClose={() => setSelectedMatchForJoin(null)}
        onSuccess={handleJoinSuccess}
        onOpenDeposit={() => {
          setSelectedMatchForJoin(null);
          setIsDepositOpen(true);
        }}
      />

      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccess={() => {}}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onSuccess={() => {}}
        onOpenKYC={() => setIsKYCOpen(true)}
      />

      <KYCModal
        isOpen={isKYCOpen}
        onClose={() => setIsKYCOpen(false)}
        onSuccess={() => {}}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectTab={tab => {
          setIsNotificationsOpen(false);
          setActiveTab(tab);
        }}
      />

      <CustomerSupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoginOpen(false);
          setIsAdminPortalOpen(true);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
