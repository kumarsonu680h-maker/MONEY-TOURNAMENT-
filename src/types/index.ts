export type GameType = 'Free Fire India' | 'Free Fire MAX';
export type MatchType = 'BR' | 'CS' | 'Lone Wolf';
export type MatchMode = 'Solo' | 'Duo' | 'Squad' | '1v1' | '2v2' | '4v4';
export type MatchMap = 'Bermuda' | 'Purgatory' | 'Kalahari' | 'Alpine' | 'Nexterra';
export type MatchStatus = 'upcoming' | 'starting_soon' | 'room_open' | 'live' | 'completed' | 'cancelled';

export interface Participant {
  userId: string;
  name: string;
  ign: string;
  ffUid: string;
  avatar: string;
  slotNo: number;
  teamName?: string;
  joinedAt: string;
  kills?: number;
  rank?: number;
  prizeWon?: number;
}

export interface PrizeDistribution {
  rank1: number;
  rank2: number;
  rank3?: number;
  rank4To10?: number;
  perKill: number;
}

export interface Tournament {
  id: string;
  title: string;
  game: GameType;
  matchType: MatchType;
  mode: MatchMode;
  map: MatchMap;
  entryFee: number;
  prizePool: number;
  perKill: number;
  prizeDistribution: PrizeDistribution;
  maxSlots: number;
  joinedCount: number;
  scheduleTime: string;
  scheduledDate?: string;
  scheduledTime?: string;
  scheduledAt?: string; // ISO 8601 string used for synchronized server countdown
  status: MatchStatus;
  roomId?: string;
  roomPassword?: string;
  roomNotes?: string;
  rules: string[];
  bannerUrl: string;
  participants: Participant[];
  cancellationReason?: string;
  rescheduledCount?: number;
  createdAt: string;
  createdBy: string;
}

export type UserRole = 'player' | 'tournament_manager' | 'super_admin';

export type KYCStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface KYCData {
  status: KYCStatus;
  fullName?: string;
  docType?: 'Aadhaar' | 'PAN' | 'Voter ID';
  docNumber?: string;
  state?: string;
  is18Plus?: boolean;
  submittedAt?: string;
  reviewedAt?: string;
  remarks?: string;
}

export interface UserStats {
  matchesPlayed: number;
  matchesWon: number;
  totalKills: number;
  totalEarned: number;
  winRate: number;
}

export interface UserWallet {
  depositBalance: number;
  winningBalance: number;
  bonusBalance: number;
  totalBalance: number;
}

export interface User {
  id: string;
  mobile: string;
  name: string;
  ign: string;
  ffUid: string;
  avatar: string;
  role: UserRole;
  wallet: UserWallet;
  stats: UserStats;
  kyc: KYCData;
  referralCode: string;
  referredBy?: string;
  referralCount?: number;
  referralEarnings?: number;
  status?: 'active' | 'suspended';
  isBanned: boolean;
  createdAt: string;
  lastActiveAt?: string;
}

export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'MATCH_JOIN'
  | 'MATCH_REFUND'
  | 'MATCH_WINNING'
  | 'REFERRAL_BONUS'
  | 'ADMIN_ADJUSTMENT';

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REJECTED';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: TransactionStatus;
  paymentMethod?: 'UPI' | 'QR' | 'WALLET' | 'BANK_TRANSFER' | 'BONUS';
  utrNumber?: string;
  upiId?: string;
  bankDetails?: {
    accountNumber: string;
    ifsc: string;
    holderName: string;
  };
  matchId?: string;
  remarks: string;
  createdAt: string;
  approvedBy?: string;
}

export interface WithdrawalAuditEntry {
  action: 'CREATED' | 'SET_PENDING' | 'APPROVED' | 'SUCCESSFUL' | 'REJECTED';
  status: 'PENDING' | 'APPROVED' | 'SUCCESSFUL' | 'REJECTED';
  adminId: string;
  adminName: string;
  timestamp: string;
  remarks?: string;
  payoutUtr?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userMobile: string;
  amount: number;
  payoutMethod: 'UPI' | 'BANK';
  upiId?: string;
  bankDetails?: {
    accountNumber: string;
    ifsc: string;
    holderName: string;
  };
  status: 'PENDING' | 'APPROVED' | 'SUCCESSFUL' | 'TRANSFERRED' | 'REJECTED';
  requestTime: string;
  updatedAt?: string;
  approvedTime?: string;
  approvedBy?: string;
  processedTime?: string;
  processedBy?: string;
  payoutUtr?: string;
  rejectionReason?: string;
  auditLog?: WithdrawalAuditEntry[];
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  userMobile: string;
  amount: number;
  utrNumber: string;
  upiId: string;
  status: 'PENDING' | 'VERIFYING' | 'APPROVED' | 'REJECTED';
  credited: boolean;
  createdAt: string;
  reviewedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  remarks?: string;
  rejectionReason?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'alert' | 'event' | 'maintenance';
  active: boolean;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  badgeText: string;
  targetTab: string;
  active: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userMobile: string;
  subject: string;
  category: 'Wallet' | 'Match / Room ID' | 'KYC' | 'Prize Dispute' | 'Other';
  status: 'open' | 'in_progress' | 'resolved';
  replies: Array<{
    id: string;
    sender: 'user' | 'admin';
    senderName: string;
    message: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'match' | 'wallet' | 'system' | 'reward';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface AppSettings {
  upiId: string;
  upiMerchantName: string;
  upiQrImageUrl?: string; // Admin uploaded UPI QR image (data URL or direct URL)
  minDeposit: number;
  minWithdrawal: number;
  bonusPercentPerJoin: number;
  referralBonusReferee: number;
  referralBonusReferrer: number;
  referralProgramEnabled: boolean;
  depositsPaused: boolean;
  manualVerificationMode: boolean;
  telegramSupportLink: string;
  telegramGroupLink?: string;
  whatsappSupportNumber: string;
  websiteUrl?: string;
  supportEmail?: string;
  appDownloadLink?: string;
  fairPlayPledge: string;
  legalDisclaimer: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: 'user' | 'tournament' | 'deposit' | 'withdrawal' | 'settings' | 'qr';
  targetId?: string;
  details: string;
  timestamp: string;
}

export interface ReferralRecord {
  id: string;
  referrerId: string;
  referrerName: string;
  refereeId: string;
  refereeName: string;
  refereeMobile: string;
  bonusAmount: number;
  status: 'BONUS_CREDITED' | 'PENDING_MATCH' | 'DISABLED';
  createdAt: string;
}

