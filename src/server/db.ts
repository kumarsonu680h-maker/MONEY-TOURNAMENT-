import fs from 'fs';
import path from 'path';
import {
  User,
  Tournament,
  Transaction,
  WithdrawalRequest,
  DepositRequest,
  Announcement,
  Banner,
  SupportTicket,
  AppNotification,
  AppSettings,
  AdminAuditLog,
  ReferralRecord,
} from '../types/index.ts';

interface DBData {
  users: User[];
  tournaments: Tournament[];
  transactions: Transaction[];
  withdrawals: WithdrawalRequest[];
  deposits: DepositRequest[];
  announcements: Announcement[];
  banners: Banner[];
  supportTickets: SupportTicket[];
  notifications: AppNotification[];
  settings: AppSettings;
  auditLogs: AdminAuditLog[];
  referrals: ReferralRecord[];
  deletedUsersAudit: Array<{
    userId: string;
    userName: string;
    mobile: string;
    removedBy: string;
    removedAt: string;
    lastWalletBalance: number;
    reason?: string;
  }>;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.resolve(DB_DIR, 'tournament_db.json');

// Clean initial data with NO dummy tournaments
const initialData: DBData = {
  settings: {
    upiId: 'moneytournament.merchant@okaxis',
    upiMerchantName: 'MONEY TOURNAMENT ESPORTS',
    upiQrImageUrl: undefined,
    minDeposit: 10,
    minWithdrawal: 50,
    bonusPercentPerJoin: 10,
    referralBonusReferee: 25,
    referralBonusReferrer: 15,
    referralProgramEnabled: true,
    depositsPaused: false,
    manualVerificationMode: true,
    telegramSupportLink: 'https://t.me/moneytournament_official',
    telegramGroupLink: 'https://t.me/moneytournament_community',
    whatsappSupportNumber: '+919876543210',
    websiteUrl: 'https://moneytournament.in',
    supportEmail: 'support@moneytournament.in',
    appDownloadLink: 'https://moneytournament.in/download',
    fairPlayPledge: 'Zero tolerance for emulators, hacks, headshot scripts, or modified APKs. Instant ban and prize forfeit.',
    legalDisclaimer: 'Skill gaming platform complying with Indian IT Act and Public Gambling Act exemptions. Restricted to 18+ players outside prohibited states (Assam, Odisha, Telangana, Andhra Pradesh, Nagaland, Sikkim).',
  },
  banners: [
    {
      id: 'banner-1',
      title: 'FREE FIRE INDIA & MAX CHAMPIONSHIP',
      subtitle: 'Daily Esports Cash Tournaments • Instant UPI Payouts',
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
      badgeText: 'FEATURED',
      targetTab: 'matches',
      active: true,
    },
    {
      id: 'banner-2',
      title: 'DAILY ₹0 FREE ENTRY MEGA CUPS',
      subtitle: 'Zero entry fee, Win Real Cash directly to your wallet!',
      imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
      badgeText: 'FREE ENTRY',
      targetTab: 'matches',
      active: true,
    },
    {
      id: 'banner-3',
      title: 'REFER FRIENDS & EARN ₹25 BONUS',
      subtitle: 'Share your code. Earn instantly on their first match join!',
      imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
      badgeText: 'BONUS CASH',
      targetTab: 'profile',
      active: true,
    },
  ],
  announcements: [
    {
      id: 'ann-1',
      title: '🔥 Room ID distribution starts 15 mins before match!',
      content: 'Make sure your Free Fire game is updated. Emulators are strictly prohibited.',
      type: 'info',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ann-2',
      title: '⚡ Instant UPI Withdrawals Live 24/7',
      content: 'Winning cash can be transferred to Google Pay, PhonePe, Paytm within 5 minutes.',
      type: 'event',
      active: true,
      createdAt: new Date().toISOString(),
    },
  ],
  users: [
    {
      id: 'user-admin',
      mobile: '9999999999',
      name: 'Super Admin',
      ign: '亗 MT • FOUNDER 亗',
      ffUid: '1000000001',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AdminSonu',
      role: 'super_admin',
      wallet: {
        depositBalance: 5000,
        winningBalance: 12000,
        bonusBalance: 500,
        totalBalance: 17500,
      },
      stats: {
        matchesPlayed: 0,
        matchesWon: 0,
        totalKills: 0,
        totalEarned: 0,
        winRate: 0,
      },
      kyc: {
        status: 'verified',
        fullName: 'Super Administrator',
        docType: 'PAN',
        docNumber: 'ABCDE1234F',
        state: 'Delhi',
        is18Plus: true,
        submittedAt: '2026-09-01T00:00:00.000Z',
        reviewedAt: '2026-09-01T00:00:00.000Z',
      },
      referralCode: 'ADMIN-01',
      status: 'active',
      isBanned: false,
      createdAt: '2026-09-01T00:00:00.000Z',
    },
    {
      id: 'user-manager',
      mobile: '8888888888',
      name: 'Match Coordinator',
      ign: '亗 MT • REFEREE 亗',
      ffUid: '1000000002',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ManagerOp',
      role: 'tournament_manager',
      wallet: {
        depositBalance: 200,
        winningBalance: 500,
        bonusBalance: 100,
        totalBalance: 800,
      },
      stats: {
        matchesPlayed: 0,
        matchesWon: 0,
        totalKills: 0,
        totalEarned: 0,
        winRate: 0,
      },
      kyc: {
        status: 'verified',
        fullName: 'Match Coordinator',
        docType: 'Aadhaar',
        docNumber: 'XXXX-XXXX-4422',
        state: 'Maharashtra',
        is18Plus: true,
      },
      referralCode: 'MOD-99',
      status: 'active',
      isBanned: false,
      createdAt: '2026-09-15T00:00:00.000Z',
    },
    {
      id: 'user-1',
      mobile: '9876543210',
      name: 'Sonu Kumar',
      ign: '亗 ʀᴅx • ᴋɪʟʟᴇʀ 亗',
      ffUid: '2849182371',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=FreeFireWarrior',
      role: 'player',
      wallet: {
        depositBalance: 250,
        winningBalance: 150,
        bonusBalance: 50,
        totalBalance: 450,
      },
      stats: {
        matchesPlayed: 0,
        matchesWon: 0,
        totalKills: 0,
        totalEarned: 0,
        winRate: 0,
      },
      kyc: {
        status: 'verified',
        fullName: 'Sonu Kumar',
        docType: 'Aadhaar',
        docNumber: 'XXXX-XXXX-8912',
        state: 'Bihar',
        is18Plus: true,
        submittedAt: '2026-10-15T10:00:00.000Z',
        reviewedAt: '2026-10-15T11:30:00.000Z',
        remarks: 'Verified successfully. Age 18+ confirmed.',
      },
      referralCode: 'MT-7788',
      referralCount: 2,
      referralEarnings: 30,
      status: 'active',
      isBanned: false,
      createdAt: '2026-10-01T00:00:00.000Z',
    },
    {
      id: 'user-2',
      mobile: '9811223344',
      name: 'Aditya Raj',
      ign: '⚡ VIPER_GOD ⚡',
      ffUid: '1928374650',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ViperGod',
      role: 'player',
      wallet: { depositBalance: 100, winningBalance: 50, bonusBalance: 25, totalBalance: 175 },
      stats: { matchesPlayed: 0, matchesWon: 0, totalKills: 0, totalEarned: 0, winRate: 0 },
      kyc: { status: 'verified', is18Plus: true, fullName: 'Aditya Raj' },
      referralCode: 'VIPER-01',
      referredBy: 'user-1',
      status: 'active',
      isBanned: false,
      createdAt: '2026-09-20T00:00:00.000Z',
    },
  ],
  // All demo / sample tournaments REMOVED completely!
  tournaments: [],
  transactions: [
    {
      id: 'tx-init-1',
      userId: 'user-1',
      type: 'DEPOSIT',
      amount: 250,
      balanceBefore: 0,
      balanceAfter: 250,
      status: 'SUCCESS',
      paymentMethod: 'UPI',
      utrNumber: '428910481928',
      remarks: 'Wallet top-up via UPI',
      createdAt: new Date().toISOString(),
    },
  ],
  withdrawals: [],
  deposits: [],
  supportTickets: [],
  notifications: [
    {
      id: 'notif-welcome',
      userId: 'user-1',
      title: 'Welcome to MONEY TOURNAMENT! 🎮',
      message: 'Compete in Free Fire India & MAX tournaments. Add money or join free entry matches to win real cash!',
      type: 'system',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ],
  auditLogs: [
    {
      id: 'log-init-1',
      adminId: 'user-admin',
      adminName: 'Super Admin',
      action: 'SYSTEM_INITIALIZED',
      targetType: 'settings',
      details: 'Money Tournament platform initialized with manual verification and live server time sync.',
      timestamp: new Date().toISOString(),
    },
  ],
  referrals: [
    {
      id: 'ref-init-1',
      referrerId: 'user-1',
      referrerName: 'Sonu Kumar',
      refereeId: 'user-2',
      refereeName: 'Aditya Raj',
      refereeMobile: '9811223344',
      bonusAmount: 15,
      status: 'BONUS_CREDITED',
      createdAt: '2026-10-18T10:00:00.000Z',
    },
  ],
  deletedUsersAudit: [],
};

class TournamentDB {
  private data: DBData;

  constructor() {
    this.data = this.loadData();
    // Clean out old dummy tournaments if they were persisted before
    this.cleanupOldDummies();
  }

  private cleanupOldDummies(): void {
    let modified = false;
    // Check if tournaments array has old dummy IDs
    const dummyIds = ['match-101', 'match-102', 'match-103', 'match-104', 'match-105', 'match-106', 'match-100'];
    const hasDummy = this.data.tournaments.some(t => dummyIds.includes(t.id));
    if (hasDummy) {
      this.data.tournaments = this.data.tournaments.filter(t => !dummyIds.includes(t.id));
      modified = true;
    }
    if (modified) {
      this.saveData();
    }
  }

  private loadData(): DBData {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent) as DBData;
        // Purge dummy tournaments
        const dummyIds = ['match-101', 'match-102', 'match-103', 'match-104', 'match-105', 'match-106', 'match-100'];
        parsed.tournaments = (parsed.tournaments || []).filter(t => !dummyIds.includes(t.id));
        parsed.settings = { ...initialData.settings, ...(parsed.settings || {}) };
        parsed.auditLogs = parsed.auditLogs || [];
        parsed.referrals = parsed.referrals || [];
        parsed.deletedUsersAudit = parsed.deletedUsersAudit || [];

        // Ensure user branding: Vikas Kumar -> Sonu Kumar
        if (parsed.users) {
          parsed.users.forEach(u => {
            if (u.name === 'Vikas Kumar') u.name = 'Sonu Kumar';
            if (u.kyc && u.kyc.fullName === 'Vikas Kumar Mandal') u.kyc.fullName = 'Sonu Kumar';
            if (!u.status) u.status = 'active';
          });
        }
        return parsed;
      } else {
        this.saveData(initialData);
        return initialData;
      }
    } catch (e) {
      console.error('Error loading DB from file, using fallback initial data', e);
      return initialData;
    }
  }

  private saveData(dataToSave?: DBData): void {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving DB to file', e);
    }
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByMobile(mobile: string): User | undefined {
    return this.data.users.find(u => u.mobile === mobile);
  }

  saveUser(user: User): void {
    const idx = this.data.users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      this.data.users[idx] = user;
    } else {
      this.data.users.push(user);
    }
    this.saveData();
  }

  // Tournaments
  getTournaments(): Tournament[] {
    return this.data.tournaments;
  }

  getTournamentById(id: string): Tournament | undefined {
    return this.data.tournaments.find(t => t.id === id);
  }

  saveTournament(tournament: Tournament): void {
    const idx = this.data.tournaments.findIndex(t => t.id === tournament.id);
    if (idx >= 0) {
      this.data.tournaments[idx] = tournament;
    } else {
      this.data.tournaments.unshift(tournament);
    }
    this.saveData();
  }

  deleteTournament(id: string): boolean {
    const idx = this.data.tournaments.findIndex(t => t.id === id);
    if (idx >= 0) {
      this.data.tournaments.splice(idx, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  // Transactions
  getTransactions(userId?: string): Transaction[] {
    if (userId) {
      return this.data.transactions.filter(tx => tx.userId === userId);
    }
    return this.data.transactions;
  }

  addTransaction(tx: Transaction): void {
    this.data.transactions.unshift(tx);
    this.saveData();
  }

  // Withdrawals
  getWithdrawals(userId?: string): WithdrawalRequest[] {
    if (userId) {
      return this.data.withdrawals.filter(w => w.userId === userId);
    }
    return this.data.withdrawals;
  }

  addWithdrawal(w: WithdrawalRequest): void {
    this.data.withdrawals.unshift(w);
    this.saveData();
  }

  updateWithdrawal(id: string, updates: Partial<WithdrawalRequest>): WithdrawalRequest | undefined {
    const idx = this.data.withdrawals.findIndex(w => w.id === id);
    if (idx >= 0) {
      this.data.withdrawals[idx] = { ...this.data.withdrawals[idx], ...updates };
      this.saveData();
      return this.data.withdrawals[idx];
    }
    return undefined;
  }

  // Deposits
  getDeposits(): DepositRequest[] {
    return this.data.deposits;
  }

  addDeposit(d: DepositRequest): void {
    this.data.deposits.unshift(d);
    this.saveData();
  }

  updateDeposit(id: string, updates: Partial<DepositRequest>): DepositRequest | undefined {
    const idx = this.data.deposits.findIndex(d => d.id === id);
    if (idx >= 0) {
      this.data.deposits[idx] = { ...this.data.deposits[idx], ...updates };
      this.saveData();
      return this.data.deposits[idx];
    }
    return undefined;
  }

  // Announcements
  getAnnouncements(): Announcement[] {
    return this.data.announcements.filter(a => a.active);
  }

  getAllAnnouncements(): Announcement[] {
    return this.data.announcements;
  }

  saveAnnouncement(ann: Announcement): void {
    const idx = this.data.announcements.findIndex(a => a.id === ann.id);
    if (idx >= 0) {
      this.data.announcements[idx] = ann;
    } else {
      this.data.announcements.unshift(ann);
    }
    this.saveData();
  }

  deleteAnnouncement(id: string): boolean {
    const idx = this.data.announcements.findIndex(a => a.id === id);
    if (idx >= 0) {
      this.data.announcements.splice(idx, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  // Banners
  getBanners(): Banner[] {
    return this.data.banners.filter(b => b.active);
  }

  getAllBanners(): Banner[] {
    return this.data.banners;
  }

  saveBanner(banner: Banner): void {
    const idx = this.data.banners.findIndex(b => b.id === banner.id);
    if (idx >= 0) {
      this.data.banners[idx] = banner;
    } else {
      this.data.banners.unshift(banner);
    }
    this.saveData();
  }

  deleteBanner(id: string): boolean {
    const idx = this.data.banners.findIndex(b => b.id === id);
    if (idx >= 0) {
      this.data.banners.splice(idx, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  // Support Tickets
  getSupportTickets(userId?: string): SupportTicket[] {
    if (userId) {
      return this.data.supportTickets.filter(t => t.userId === userId);
    }
    return this.data.supportTickets;
  }

  getSupportTicketById(id: string): SupportTicket | undefined {
    return this.data.supportTickets.find(t => t.id === id);
  }

  saveSupportTicket(ticket: SupportTicket): void {
    const idx = this.data.supportTickets.findIndex(t => t.id === ticket.id);
    if (idx >= 0) {
      this.data.supportTickets[idx] = ticket;
    } else {
      this.data.supportTickets.unshift(ticket);
    }
    this.saveData();
  }

  // Notifications
  getNotifications(userId: string): AppNotification[] {
    return this.data.notifications.filter(n => n.userId === userId);
  }

  addNotification(notif: AppNotification): void {
    this.data.notifications.unshift(notif);
    this.saveData();
  }

  broadcastNotification(notif: Omit<AppNotification, 'id' | 'userId' | 'createdAt'>): void {
    const allUsers = this.getUsers();
    allUsers.forEach(u => {
      this.addNotification({
        ...notif,
        id: `notif-${Date.now()}-${u.id}`,
        userId: u.id,
        createdAt: new Date().toISOString(),
      });
    });
  }

  markNotificationsRead(userId: string): void {
    this.data.notifications.forEach(n => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });
    this.saveData();
  }

  // Settings
  getSettings(): AppSettings {
    return this.data.settings;
  }

  updateSettings(settings: Partial<AppSettings>): AppSettings {
    this.data.settings = { ...this.data.settings, ...settings };
    this.saveData();
    return this.data.settings;
  }

  // Audit Logs
  getAuditLogs(): AdminAuditLog[] {
    return this.data.auditLogs || [];
  }

  addAuditLog(log: AdminAuditLog): void {
    if (!this.data.auditLogs) this.data.auditLogs = [];
    this.data.auditLogs.unshift(log);
    this.saveData();
  }

  // Referrals
  getReferrals(): ReferralRecord[] {
    return this.data.referrals || [];
  }

  addReferral(ref: ReferralRecord): void {
    if (!this.data.referrals) this.data.referrals = [];
    this.data.referrals.unshift(ref);
    this.saveData();
  }

  // Member Management
  updateUserStatus(userId: string, status: 'active' | 'suspended', adminId: string, adminName: string): User | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;
    user.status = status;
    user.isBanned = status === 'suspended';
    this.updateUser(userId, { status, isBanned: user.isBanned });

    this.addAuditLog({
      id: `audit-${Date.now()}`,
      adminId,
      adminName,
      action: status === 'suspended' ? 'MEMBER_SUSPENDED' : 'MEMBER_REACTIVATED',
      targetType: 'user',
      targetId: userId,
      details: `${user.name} (${user.mobile}) status changed to ${status} by ${adminName}.`,
      timestamp: new Date().toISOString(),
    });

    return user;
  }

  deleteUser(userId: string, adminId: string, adminName: string, reason?: string): boolean {
    const idx = this.data.users.findIndex(u => u.id === userId);
    if (idx === -1) return false;

    const user = this.data.users[idx];
    if (user.role === 'super_admin') return false;

    if (!this.data.deletedUsersAudit) this.data.deletedUsersAudit = [];
    this.data.deletedUsersAudit.unshift({
      userId: user.id,
      userName: user.name,
      mobile: user.mobile,
      removedBy: adminName,
      removedAt: new Date().toISOString(),
      lastWalletBalance: user.wallet.totalBalance,
      reason: reason || 'Removed by admin',
    });

    this.data.users.splice(idx, 1);
    this.saveData();

    this.addAuditLog({
      id: `audit-${Date.now()}`,
      adminId,
      adminName,
      action: 'MEMBER_REMOVED',
      targetType: 'user',
      targetId: userId,
      details: `Removed member ${user.name} (Mobile: ${user.mobile}, Balance: ₹${user.wallet.totalBalance}). Reason: ${reason || 'N/A'}. Audit record preserved.`,
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  getDeletedUsersAudit() {
    return this.data.deletedUsersAudit || [];
  }

  adjustUserBalance(
    userId: string,
    balanceType: 'deposit' | 'winning' | 'bonus',
    amount: number,
    isAddition: boolean,
    reason: string,
    admin: { id: string; name: string }
  ): { success: boolean; user?: User; transaction?: Transaction; error?: string } {
    const user = this.getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };

    const cleanAmount = Math.abs(amount);
    if (cleanAmount <= 0) return { success: false, error: 'Invalid amount' };

    const balanceBefore = user.wallet.totalBalance;

    if (!isAddition) {
      if (balanceType === 'deposit' && user.wallet.depositBalance < cleanAmount) {
        return { success: false, error: `Insufficient deposit balance (Current: ₹${user.wallet.depositBalance})` };
      }
      if (balanceType === 'winning' && user.wallet.winningBalance < cleanAmount) {
        return { success: false, error: `Insufficient winning balance (Current: ₹${user.wallet.winningBalance})` };
      }
      if (balanceType === 'bonus' && user.wallet.bonusBalance < cleanAmount) {
        return { success: false, error: `Insufficient bonus balance (Current: ₹${user.wallet.bonusBalance})` };
      }
    }

    if (balanceType === 'deposit') {
      user.wallet.depositBalance = isAddition
        ? user.wallet.depositBalance + cleanAmount
        : user.wallet.depositBalance - cleanAmount;
    } else if (balanceType === 'winning') {
      user.wallet.winningBalance = isAddition
        ? user.wallet.winningBalance + cleanAmount
        : user.wallet.winningBalance - cleanAmount;
    } else {
      user.wallet.bonusBalance = isAddition
        ? user.wallet.bonusBalance + cleanAmount
        : user.wallet.bonusBalance - cleanAmount;
    }

    user.wallet.totalBalance =
      user.wallet.depositBalance + user.wallet.winningBalance + user.wallet.bonusBalance;

    const tx: Transaction = {
      id: `tx-adj-${Date.now()}`,
      userId: user.id,
      type: 'ADMIN_ADJUSTMENT',
      amount: cleanAmount,
      balanceBefore,
      balanceAfter: user.wallet.totalBalance,
      status: 'SUCCESS',
      paymentMethod: 'WALLET',
      remarks: `${isAddition ? 'Admin Credit (+)' : 'Admin Debit (-)'} ${balanceType.toUpperCase()}: ${reason} (by ${admin.name})`,
      approvedBy: admin.name,
      createdAt: new Date().toISOString(),
    };

    this.addTransaction(tx);
    this.updateUser(user.id, { wallet: user.wallet });

    this.addNotification({
      id: `notif-adj-${Date.now()}`,
      userId: user.id,
      title: isAddition ? '₹ Wallet Balance Credited' : '₹ Wallet Balance Adjusted',
      message: `${isAddition ? `₹${cleanAmount} added to` : `₹${cleanAmount} deducted from`} your ${balanceType} balance. Reason: ${reason}.`,
      type: 'wallet',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    this.addAuditLog({
      id: `audit-${Date.now()}`,
      adminId: admin.id,
      adminName: admin.name,
      action: isAddition ? 'WALLET_CREDITED' : 'WALLET_DEBITED',
      targetType: 'user',
      targetId: user.id,
      details: `${isAddition ? 'Added' : 'Deducted'} ₹${cleanAmount} (${balanceType} balance) for ${user.name}. Reason: ${reason}. Prev: ₹${balanceBefore}, New: ₹${user.wallet.totalBalance}`,
      timestamp: new Date().toISOString(),
    });

    return { success: true, user, transaction: tx };
  }
}

export const db = new TournamentDB();
