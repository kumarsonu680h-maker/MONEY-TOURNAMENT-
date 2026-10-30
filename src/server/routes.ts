import { Router, Request, Response } from 'express';
import { db } from './db.ts';
import {
  User,
  Tournament,
  Transaction,
  WithdrawalRequest,
  DepositRequest,
  SupportTicket,
  AppNotification,
  Participant,
  Banner,
  Announcement,
} from '../types/index.ts';

export const apiRouter = Router();

// Middleware: Extract user from header or session
function getAuthUser(req: Request): User | undefined {
  const authHeader = (req.headers['authorization'] as string) || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;
  const adminToken = (req.headers['x-admin-token'] as string) || bearerToken;
  const parsedAdminId = adminToken ? adminToken.replace(/^adm_/, '') : undefined;

  const userId =
    parsedAdminId ||
    (req.headers['x-user-id'] as string) ||
    (req.query.userId as string);

  if (!userId) {
    return undefined;
  }
  return db.getUserById(userId);
}

// Admin Authorization Middleware
function requireAdmin(req: Request, res: Response, next: Function) {
  const user = getAuthUser(req);
  if (!user || (user.role !== 'super_admin' && user.role !== 'tournament_manager')) {
    return res.status(403).json({
      error: 'Access Denied: Only authorized staff and administrators can access this feature.',
    });
  }
  next();
}

// -------------------------------------------------------------
// ADMIN AUTHENTICATION
// -------------------------------------------------------------
apiRouter.post('/admin/login', (req: Request, res: Response) => {
  const { mobile, password } = req.body;

  if (!mobile || !password) {
    return res.status(400).json({ error: 'Mobile number and admin password required' });
  }

  const cleanMobile = String(mobile).trim();
  const cleanPassword = String(password).trim();

  // Find user by mobile
  const user = db.getUserByMobile(cleanMobile);
  if (!user) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  // Verify role
  if (user.role !== 'super_admin' && user.role !== 'tournament_manager') {
    return res.status(403).json({
      error: 'Access Denied: This account does not have staff or administrator privileges.',
    });
  }

  // Check admin password
  // Super admin default password: 'adminpassword', Manager: 'modpassword'
  const validPass =
    (user.role === 'super_admin' && (cleanPassword === 'adminpassword' || cleanPassword === 'admin123')) ||
    (user.role === 'tournament_manager' && (cleanPassword === 'modpassword' || cleanPassword === 'manager123')) ||
    cleanPassword === 'adminpassword';

  if (!validPass) {
    return res.status(401).json({ error: 'Incorrect administrator password' });
  }

  const adminToken = `adm_${user.id}`;
  return res.json({
    success: true,
    token: adminToken,
    admin: {
      id: user.id,
      name: user.name,
      ign: user.ign,
      role: user.role,
      avatar: user.avatar,
      mobile: user.mobile,
    },
  });
});

apiRouter.get('/admin/me', requireAdmin, (req: Request, res: Response) => {
  const user = getAuthUser(req)!;
  return res.json({
    admin: {
      id: user.id,
      name: user.name,
      ign: user.ign,
      role: user.role,
      avatar: user.avatar,
      mobile: user.mobile,
    },
  });
});

// -------------------------------------------------------------
// PLAYER AUTH & PROFILE
// -------------------------------------------------------------
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { mobile, name, ign, ffUid, password, referralCode } = req.body;

  if (!mobile || !name || !ign || !ffUid || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const cleanMobile = String(mobile).trim();
  if (cleanMobile.length !== 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
  }

  const existing = db.getUserByMobile(cleanMobile);
  if (existing) {
    return res.status(400).json({ error: 'Mobile number is already registered' });
  }

  const newUserId = `user-${Date.now()}`;
  const generatedRefCode = `MT-${cleanMobile.slice(-4)}`;

  let bonusBalance = 0;
  let referredByUserId: string | undefined = undefined;

  // Check referral code
  if (referralCode) {
    const referrer = db.getUsers().find(
      u => u.referralCode.toLowerCase() === String(referralCode).trim().toLowerCase()
    );
    if (referrer) {
      bonusBalance = db.getSettings().referralBonusReferee; // ₹25 welcome bonus
      referredByUserId = referrer.id;
    }
  }

  const newUser: User = {
    id: newUserId,
    mobile: cleanMobile,
    name: String(name).trim(),
    ign: String(ign).trim(),
    ffUid: String(ffUid).trim(),
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanMobile)}`,
    role: 'player',
    wallet: {
      depositBalance: 0,
      winningBalance: 0,
      bonusBalance: bonusBalance,
      totalBalance: bonusBalance,
    },
    stats: {
      matchesPlayed: 0,
      matchesWon: 0,
      totalKills: 0,
      totalEarned: 0,
      winRate: 0,
    },
    kyc: {
      status: 'unverified',
    },
    referralCode: generatedRefCode,
    referredBy: referredByUserId,
    isBanned: false,
    createdAt: new Date().toISOString(),
  };

  db.saveUser(newUser);

  if (bonusBalance > 0) {
    db.addTransaction({
      id: `tx-${Date.now()}`,
      userId: newUserId,
      type: 'REFERRAL_BONUS',
      amount: bonusBalance,
      balanceBefore: 0,
      balanceAfter: bonusBalance,
      status: 'SUCCESS',
      paymentMethod: 'BONUS',
      remarks: 'Welcome referral signup bonus credited',
      createdAt: new Date().toISOString(),
    });
  }

  db.addNotification({
    id: `notif-${Date.now()}`,
    userId: newUserId,
    title: 'Welcome to MONEY TOURNAMENT! 🎮',
    message: 'Compete in Free Fire India & MAX tournaments. Add money or join free entry matches to win real cash!',
    type: 'system',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, user: newUser });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { mobile, password } = req.body;
  if (!mobile || !password) {
    return res.status(400).json({ error: 'Mobile and password required' });
  }

  const user = db.getUserByMobile(String(mobile).trim());
  if (!user) {
    return res.status(404).json({ error: 'No account found with this mobile number. Please register.' });
  }

  if (user.isBanned) {
    return res.status(403).json({ error: 'This account has been suspended for fair play violation.' });
  }

  return res.json({ success: true, user });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.json({ user });
});

apiRouter.put('/user/profile', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { ign, ffUid, avatar, name } = req.body;
  if (ign) user.ign = String(ign).trim();
  if (ffUid) user.ffUid = String(ffUid).trim();
  if (avatar) user.avatar = String(avatar).trim();
  if (name) user.name = String(name).trim();

  db.saveUser(user);
  return res.json({ success: true, user });
});

apiRouter.post('/user/kyc', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { fullName, docType, docNumber, state, is18Plus } = req.body;

  if (!fullName || !docType || !docNumber || !state) {
    return res.status(400).json({ error: 'All KYC fields are required' });
  }

  if (!is18Plus) {
    return res.status(400).json({ error: 'You must be at least 18 years old to participate in cash tournaments.' });
  }

  const restrictedStates = ['assam', 'odisha', 'telangana', 'andhra pradesh', 'nagaland', 'sikkim'];
  if (restrictedStates.includes(String(state).toLowerCase().trim())) {
    return res.status(400).json({
      error: `Due to state gaming regulations, real-money skill gaming is restricted in ${state}.`,
    });
  }

  user.kyc = {
    status: 'pending',
    fullName: String(fullName).trim(),
    docType,
    docNumber: String(docNumber).trim(),
    state: String(state).trim(),
    is18Plus: true,
    submittedAt: new Date().toISOString(),
    remarks: 'Document submitted for verification.',
  };

  db.saveUser(user);

  db.addNotification({
    id: `notif-${Date.now()}`,
    userId: user.id,
    title: 'KYC Verification Submitted',
    message: 'Your documents have been submitted to our compliance team for review.',
    type: 'system',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, user });
});

apiRouter.get('/user/notifications', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const notifs = db.getNotifications(user.id);
  return res.json({ notifications: notifs });
});

apiRouter.post('/user/notifications/mark-read', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  db.markNotificationsRead(user.id);
  return res.json({ success: true });
});

// -------------------------------------------------------------
// SUPPORT TICKETS (PLAYER & STAFF)
// -------------------------------------------------------------
apiRouter.get('/support-tickets', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.json({ tickets: [] });
  }

  if ((user.role === 'super_admin' || user.role === 'tournament_manager') && req.query.all === 'true') {
    return res.json({ tickets: db.getSupportTickets() });
  }

  const tickets = db.getSupportTickets(user.id);
  return res.json({ tickets });
});

apiRouter.get('/support-tickets/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const ticket = db.getSupportTicketById(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const isAdmin = user.role === 'super_admin' || user.role === 'tournament_manager';
  if (!isAdmin && ticket.userId !== user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  return res.json({ ticket });
});

apiRouter.post('/support-tickets', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Please log in to submit a support ticket' });
  }

  const { subject, category, message } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ error: 'Subject and message are required' });
  }

  const cleanSubject = String(subject).trim();
  const cleanMessage = String(message).trim();
  const ticketCategory = category || 'Other';

  const newTicket: SupportTicket = {
    id: `ticket-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: user.id,
    userName: user.name || user.ign || 'Player',
    userMobile: user.mobile || '',
    subject: cleanSubject,
    category: ticketCategory,
    status: 'open',
    replies: [
      {
        id: `reply-${Date.now()}-1`,
        sender: 'user',
        senderName: user.name || user.ign || 'Player',
        message: cleanMessage,
        timestamp: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.saveSupportTicket(newTicket);
  return res.json({ success: true, ticket: newTicket });
});

apiRouter.post('/support-tickets/:id/reply', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Please log in to reply' });
  }

  const { message } = req.body;
  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: 'Reply message cannot be empty' });
  }

  const ticket = db.getSupportTicketById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Support ticket not found' });
  }

  const isAdmin = user.role === 'super_admin' || user.role === 'tournament_manager';
  if (!isAdmin && ticket.userId !== user.id) {
    return res.status(403).json({ error: 'Unauthorized to reply to this ticket' });
  }

  const reply = {
    id: `reply-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    sender: (isAdmin ? 'admin' : 'user') as 'admin' | 'user',
    senderName: isAdmin
      ? (user.role === 'super_admin' ? 'Support Admin' : 'Tournament Staff')
      : (user.name || user.ign || 'Player'),
    message: String(message).trim(),
    timestamp: new Date().toISOString(),
  };

  ticket.replies.push(reply);
  ticket.updatedAt = new Date().toISOString();
  if (isAdmin && ticket.status === 'open') {
    ticket.status = 'in_progress';
  } else if (!isAdmin && ticket.status === 'resolved') {
    ticket.status = 'in_progress';
  }

  db.saveSupportTicket(ticket);
  return res.json({ success: true, ticket });
});

apiRouter.patch('/support-tickets/:id/status', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { status } = req.body;
  if (!status || !['open', 'in_progress', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const ticket = db.getSupportTicketById(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const isAdmin = user.role === 'super_admin' || user.role === 'tournament_manager';
  if (!isAdmin && ticket.userId !== user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  ticket.status = status;
  ticket.updatedAt = new Date().toISOString();
  db.saveSupportTicket(ticket);
  return res.json({ success: true, ticket });
});

apiRouter.get('/admin/support-tickets', requireAdmin, (_req: Request, res: Response) => {
  return res.json({ tickets: db.getSupportTickets() });
});

// -------------------------------------------------------------
// TOURNAMENTS (PLAYER & PUBLIC)
// -------------------------------------------------------------
apiRouter.get('/tournaments', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { type, status, game } = req.query;

  let list = db.getTournaments();

  if (type) {
    list = list.filter(t => t.matchType === type);
  }
  if (status) {
    list = list.filter(t => t.status === status);
  }
  if (game) {
    list = list.filter(t => t.game === game);
  }

  const sanitizedList = list.map(t => {
    const isJoined = user ? t.participants.some(p => p.userId === user.id) : false;
    const isStaff = user && (user.role === 'super_admin' || user.role === 'tournament_manager');
    const canSeeRoom =
      isStaff ||
      (isJoined && (t.status === 'room_open' || t.status === 'live' || t.status === 'completed'));

    return {
      ...t,
      roomId: canSeeRoom ? t.roomId : undefined,
      roomPassword: canSeeRoom ? t.roomPassword : undefined,
      isUserJoined: isJoined,
    };
  });

  return res.json({ tournaments: sanitizedList });
});

apiRouter.get('/tournaments/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const match = db.getTournamentById(req.params.id);
  if (!match) return res.status(404).json({ error: 'Tournament not found' });

  const isJoined = user ? match.participants.some(p => p.userId === user.id) : false;
  const isStaff = user && (user.role === 'super_admin' || user.role === 'tournament_manager');
  const canSeeRoom =
    isStaff ||
    (isJoined && (match.status === 'room_open' || match.status === 'live' || match.status === 'completed'));

  return res.json({
    tournament: {
      ...match,
      roomId: canSeeRoom ? match.roomId : undefined,
      roomPassword: canSeeRoom ? match.roomPassword : undefined,
      isUserJoined: isJoined,
    },
  });
});

// Join Tournament
apiRouter.post('/tournaments/:id/join', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Please login to join tournament' });

  const match = db.getTournamentById(req.params.id);
  if (!match) return res.status(404).json({ error: 'Tournament not found' });

  if (match.status === 'completed' || match.status === 'cancelled') {
    return res.status(400).json({ error: 'This match has ended or was cancelled.' });
  }

  if (match.status === 'live') {
    return res.status(400).json({ error: 'Match is already in progress. Registration closed.' });
  }

  if (match.participants.some(p => p.userId === user.id)) {
    return res.status(400).json({ error: 'You are already registered for this tournament.' });
  }

  if (match.participants.length >= match.maxSlots) {
    return res.status(400).json({ error: 'Tournament is full! Try another match.' });
  }

  const { ign, ffUid, teamName } = req.body;
  const playerIgn = ign || user.ign;
  const playerUid = ffUid || user.ffUid;

  if (!playerIgn || !playerUid) {
    return res.status(400).json({ error: 'Free Fire In-Game Name (IGN) and Player UID are required.' });
  }

  const entryFee = match.entryFee;
  let bonusUsed = 0;
  let depositUsed = 0;
  let winningUsed = 0;

  if (entryFee > 0) {
    if (user.wallet.totalBalance < entryFee) {
      return res.status(400).json({
        error: `Insufficient balance (₹${user.wallet.totalBalance}). Required: ₹${entryFee}. Please add money.`,
      });
    }

    const maxBonusAllowed = Math.floor(entryFee * (db.getSettings().bonusPercentPerJoin / 100));
    bonusUsed = Math.min(user.wallet.bonusBalance, maxBonusAllowed);

    let remainingFee = entryFee - bonusUsed;

    depositUsed = Math.min(user.wallet.depositBalance, remainingFee);
    remainingFee -= depositUsed;

    if (remainingFee > 0) {
      if (user.wallet.winningBalance < remainingFee) {
        return res.status(400).json({ error: 'Insufficient deposit and winning balance.' });
      }
      winningUsed = remainingFee;
    }

    const balanceBefore = user.wallet.totalBalance;
    user.wallet.bonusBalance -= bonusUsed;
    user.wallet.depositBalance -= depositUsed;
    user.wallet.winningBalance -= winningUsed;
    user.wallet.totalBalance =
      user.wallet.bonusBalance + user.wallet.depositBalance + user.wallet.winningBalance;

    db.addTransaction({
      id: `tx-${Date.now()}`,
      userId: user.id,
      type: 'MATCH_JOIN',
      amount: entryFee,
      balanceBefore,
      balanceAfter: user.wallet.totalBalance,
      status: 'SUCCESS',
      paymentMethod: 'WALLET',
      matchId: match.id,
      remarks: `Entry fee for "${match.title}" (Paid: ₹${depositUsed + winningUsed}, Bonus: ₹${bonusUsed})`,
      createdAt: new Date().toISOString(),
    });
  }

  user.stats.matchesPlayed += 1;
  db.saveUser(user);

  const nextSlot = match.participants.length + 1;
  const participant: Participant = {
    userId: user.id,
    name: user.name,
    ign: playerIgn,
    ffUid: playerUid,
    avatar: user.avatar,
    slotNo: nextSlot,
    teamName: teamName || (match.mode === 'Solo' ? undefined : `Team #${nextSlot}`),
    joinedAt: new Date().toISOString(),
  };

  match.participants.push(participant);
  match.joinedCount = match.participants.length;
  db.saveTournament(match);

  db.addNotification({
    id: `notif-${Date.now()}`,
    userId: user.id,
    title: `Registered for ${match.matchType} Match! 🎟️`,
    message: `You are booked in Slot #${nextSlot}. Room ID will unlock 15 minutes before match start.`,
    type: 'match',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.json({
    success: true,
    message: `Successfully joined ${match.title}`,
    slotNo: nextSlot,
    wallet: user.wallet,
    match,
  });
});

// -------------------------------------------------------------
// WALLET & TRANSACTIONS
// -------------------------------------------------------------
apiRouter.get('/wallet/summary', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const pendingWithdrawals = db.getWithdrawals(user.id).filter(w => w.status === 'PENDING');
  const pendingAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  return res.json({
    wallet: user.wallet,
    pendingWithdrawalAmount: pendingAmount,
    settings: {
      minDeposit: db.getSettings().minDeposit,
      minWithdrawal: db.getSettings().minWithdrawal,
      upiId: db.getSettings().upiId,
      upiMerchantName: db.getSettings().upiMerchantName,
      depositsPaused: db.getSettings().depositsPaused,
      manualVerificationMode: db.getSettings().manualVerificationMode,
    },
  });
});

apiRouter.get('/settings', (_req: Request, res: Response) => {
  const s = db.getSettings();
  return res.json({
    settings: {
      upiId: s.upiId,
      upiMerchantName: s.upiMerchantName,
      minDeposit: s.minDeposit,
      minWithdrawal: s.minWithdrawal,
      depositsPaused: s.depositsPaused,
      manualVerificationMode: s.manualVerificationMode,
      bonusPercentPerJoin: s.bonusPercentPerJoin,
      referralBonusReferee: s.referralBonusReferee,
      referralBonusReferrer: s.referralBonusReferrer,
      telegramSupportLink: s.telegramSupportLink,
      whatsappSupportNumber: s.whatsappSupportNumber,
      fairPlayPledge: s.fairPlayPledge,
      legalDisclaimer: s.legalDisclaimer,
    },
  });
});

apiRouter.get('/wallet/transactions', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const txs = db.getTransactions(user.id);
  return res.json({ transactions: txs });
});

apiRouter.post('/wallet/deposit/initiate', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const settings = db.getSettings();
  if (settings.depositsPaused) {
    return res.status(403).json({
      error: 'Deposits are temporarily paused by administration for banking reconciliation. Please try again shortly.',
    });
  }

  const { amount } = req.body;
  const numAmount = Number(amount);
  if (!numAmount || numAmount < settings.minDeposit) {
    return res.status(400).json({ error: `Minimum deposit amount is ₹${settings.minDeposit}` });
  }

  const txnRef = `MT${Date.now().toString().slice(-8)}`;
  const upiUrl = `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(
    settings.upiMerchantName
  )}&am=${numAmount}&tr=${txnRef}&tn=${encodeURIComponent(`Wallet Deposit - ${user.name}`)}&cu=INR`;

  return res.json({
    success: true,
    amount: numAmount,
    txnRef,
    upiId: settings.upiId,
    merchantName: settings.upiMerchantName,
    upiUrl,
    depositsPaused: settings.depositsPaused,
  });
});

apiRouter.post('/wallet/deposit/verify', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const settings = db.getSettings();
  if (settings.depositsPaused) {
    return res.status(403).json({
      error: 'Deposits are temporarily paused by administration. Please check back shortly.',
    });
  }

  const { amount, utrNumber } = req.body;
  const numAmount = Number(amount);

  if (!numAmount || numAmount < settings.minDeposit) {
    return res.status(400).json({ error: `Minimum deposit amount is ₹${settings.minDeposit}` });
  }

  const cleanUtr = String(utrNumber || '').trim();
  if (cleanUtr.length < 8) {
    return res.status(400).json({ error: 'Please enter a valid 12-digit UPI Reference / UTR Number' });
  }

  // Security Check: Ensure UTR is not duplicate in existing deposits or completed transactions
  const existingDep = db.getDeposits().find(d => d.utrNumber.toLowerCase() === cleanUtr.toLowerCase());
  if (existingDep) {
    return res.status(400).json({
      error: `This UTR reference (${cleanUtr}) has already been submitted (Status: ${existingDep.status}). Duplicate submissions are blocked.`,
    });
  }

  const existingTx = db.getTransactions().find(tx => tx.utrNumber && tx.utrNumber.toLowerCase() === cleanUtr.toLowerCase());
  if (existingTx) {
    return res.status(400).json({ error: 'This UTR number has already been processed and credited.' });
  }

  // CRITICAL SECURITY ENFORCEMENT:
  // Never mark deposits successful automatically. Every deposit starts as PENDING.
  // Wallet balance is NEVER credited here; it is credited strictly upon verified admin approval.
  const depReq: DepositRequest = {
    id: `dep-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userMobile: user.mobile,
    amount: numAmount,
    utrNumber: cleanUtr,
    upiId: settings.upiId,
    status: 'PENDING',
    credited: false,
    createdAt: new Date().toISOString(),
    remarks: 'Awaiting manual admin verification against bank statement',
  };
  db.addDeposit(depReq);

  const tx: Transaction = {
    id: `tx-${Date.now()}`,
    userId: user.id,
    type: 'DEPOSIT',
    amount: numAmount,
    balanceBefore: user.wallet.totalBalance,
    balanceAfter: user.wallet.totalBalance,
    status: 'PENDING',
    paymentMethod: 'UPI',
    utrNumber: cleanUtr,
    remarks: `Manual UPI deposit submitted (UTR: ${cleanUtr}). Awaiting staff verification.`,
    createdAt: new Date().toISOString(),
  };
  db.addTransaction(tx);

  db.addNotification({
    id: `notif-${Date.now()}`,
    userId: user.id,
    title: `₹${numAmount} Deposit Request Submitted ⏳`,
    message: `Your deposit (UTR: ${cleanUtr}) is Pending review. Our staff will verify the bank credit and update your wallet.`,
    type: 'wallet',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.json({
    success: true,
    instant: false,
    status: 'PENDING',
    message: 'Deposit submitted! Every deposit is verified by staff before wallet credit. Please allow 5-10 minutes.',
    depositRequest: depReq,
  });
});

apiRouter.post('/wallet/withdraw', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { amount, payoutMethod, upiId, bankDetails } = req.body;
  const numAmount = Number(amount);

  if (!numAmount || numAmount < db.getSettings().minWithdrawal) {
    return res.status(400).json({ error: `Minimum withdrawal amount is ₹${db.getSettings().minWithdrawal}` });
  }

  if (user.wallet.winningBalance < numAmount) {
    return res.status(400).json({
      error: `Insufficient Winning Balance. You have ₹${user.wallet.winningBalance} in winnings. Only match winnings can be withdrawn.`,
    });
  }

  if (payoutMethod === 'UPI') {
    if (!upiId || !String(upiId).includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid UPI ID (e.g. mobile@paytm or user@okaxis)' });
    }
  } else if (payoutMethod === 'BANK') {
    if (!bankDetails?.accountNumber || !bankDetails?.ifsc || !bankDetails?.holderName) {
      return res.status(400).json({ error: 'Please fill complete bank account number, IFSC, and account holder name' });
    }
  } else {
    return res.status(400).json({ error: 'Invalid payout method' });
  }

  const balanceBefore = user.wallet.totalBalance;
  user.wallet.winningBalance -= numAmount;
  user.wallet.totalBalance =
    user.wallet.depositBalance + user.wallet.winningBalance + user.wallet.bonusBalance;
  db.saveUser(user);

  const withdrawReq: WithdrawalRequest = {
    id: `wd-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userMobile: user.mobile,
    amount: numAmount,
    payoutMethod,
    upiId: payoutMethod === 'UPI' ? upiId : undefined,
    bankDetails: payoutMethod === 'BANK' ? bankDetails : undefined,
    status: 'PENDING',
    requestTime: new Date().toISOString(),
    auditLog: [
      {
        action: 'CREATED',
        status: 'PENDING',
        adminId: 'SYSTEM',
        adminName: 'Player Request',
        timestamp: new Date().toISOString(),
        remarks: `Withdrawal request for ₹${numAmount} submitted via ${payoutMethod}`,
      },
    ],
  };
  db.addWithdrawal(withdrawReq);

  db.addTransaction({
    id: `tx-${Date.now()}`,
    userId: user.id,
    type: 'WITHDRAWAL',
    amount: numAmount,
    balanceBefore,
    balanceAfter: user.wallet.totalBalance,
    status: 'PENDING',
    paymentMethod: payoutMethod === 'UPI' ? 'UPI' : 'BANK_TRANSFER',
    upiId: payoutMethod === 'UPI' ? upiId : undefined,
    bankDetails: payoutMethod === 'BANK' ? bankDetails : undefined,
    remarks: `Withdrawal request for ₹${numAmount} submitted (${payoutMethod})`,
    createdAt: new Date().toISOString(),
  });

  return res.json({
    success: true,
    message: 'Withdrawal request created successfully.',
    withdrawal: withdrawReq,
    wallet: user.wallet,
  });
});

apiRouter.get('/wallet/withdrawals', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const wds = db.getWithdrawals(user.id);
  return res.json({ withdrawals: wds });
});

// -------------------------------------------------------------
// LEADERBOARD & RECENT WINNERS
// -------------------------------------------------------------
apiRouter.get('/leaderboard', (req: Request, res: Response) => {
  const { filter } = req.query;
  const allPlayers = db.getUsers().filter(u => u.role === 'player');

  let sorted = [...allPlayers];
  if (filter === 'kills') {
    sorted.sort((a, b) => b.stats.totalKills - a.stats.totalKills);
  } else if (filter === 'wins') {
    sorted.sort((a, b) => b.stats.matchesWon - a.stats.matchesWon);
  } else {
    sorted.sort((a, b) => b.stats.totalEarned - a.stats.totalEarned);
  }

  const leaderboard = sorted.slice(0, 20).map((u, index) => ({
    rank: index + 1,
    id: u.id,
    name: u.name,
    ign: u.ign,
    ffUid: u.ffUid,
    avatar: u.avatar,
    totalEarned: u.stats.totalEarned,
    matchesPlayed: u.stats.matchesPlayed,
    matchesWon: u.stats.matchesWon,
    totalKills: u.stats.totalKills,
    winRate: u.stats.winRate,
  }));

  return res.json({ leaderboard });
});

apiRouter.get('/recent-winners', (req: Request, res: Response) => {
  const completed = db.getTournaments().filter(t => t.status === 'completed');
  const winners: Array<{
    matchId: string;
    matchTitle: string;
    ign: string;
    avatar: string;
    prizeWon: number;
    rank: number;
    kills: number;
    time: string;
  }> = [];

  completed.forEach(m => {
    m.participants
      .filter(p => (p.prizeWon || 0) > 0)
      .forEach(p => {
        winners.push({
          matchId: m.id,
          matchTitle: m.title,
          ign: p.ign,
          avatar: p.avatar,
          prizeWon: p.prizeWon || 0,
          rank: p.rank || 1,
          kills: p.kills || 0,
          time: m.scheduleTime,
        });
      });
  });

  return res.json({ winners });
});

// -------------------------------------------------------------
// PUBLIC CONTENT
// -------------------------------------------------------------
apiRouter.get('/announcements', (_req: Request, res: Response) => {
  return res.json({ announcements: db.getAnnouncements() });
});

apiRouter.get('/banners', (_req: Request, res: Response) => {
  return res.json({ banners: db.getBanners() });
});

apiRouter.get('/settings', (_req: Request, res: Response) => {
  return res.json({ settings: db.getSettings() });
});

// -------------------------------------------------------------
// ADMIN MANAGEMENT APIS (ROLE PROTECTED)
// -------------------------------------------------------------

// Create Tournament
apiRouter.post('/admin/tournaments', requireAdmin, (req: Request, res: Response) => {
  const admin = getAuthUser(req)!;
  const {
    title,
    game,
    matchType,
    mode,
    map,
    entryFee,
    prizePool,
    perKill,
    prizeDistribution,
    maxSlots,
    scheduleTime,
    rules,
    bannerUrl,
  } = req.body;

  if (!title || !game || !matchType || !mode || !map || entryFee === undefined) {
    return res.status(400).json({ error: 'Missing required tournament configuration fields' });
  }

  const defaultBanners: Record<string, string> = {
    BR: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    CS: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    'Lone Wolf': 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
  };

  const newTournament: Tournament = {
    id: `match-${Date.now().toString().slice(-6)}`,
    title: String(title).trim(),
    game,
    matchType,
    mode,
    map,
    entryFee: Number(entryFee),
    prizePool: Number(prizePool || 0),
    perKill: Number(perKill || 0),
    prizeDistribution: prizeDistribution || {
      rank1: Math.round(Number(prizePool || 0) * 0.5),
      rank2: Math.round(Number(prizePool || 0) * 0.25),
      rank3: Math.round(Number(prizePool || 0) * 0.15),
      perKill: Number(perKill || 0),
    },
    maxSlots: Number(maxSlots || 48),
    joinedCount: 0,
    scheduleTime: scheduleTime || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    status: 'upcoming',
    rules:
      rules && rules.length > 0
        ? rules
        : [
            'No emulators / PC allowed. Mobile only.',
            'No illegal scripts or hacks. Instant permanent ban.',
            'Room ID and Password will appear 15 minutes before match start.',
            'Take screenshot of victory screen for verification.',
          ],
    bannerUrl: bannerUrl || defaultBanners[matchType] || defaultBanners.BR,
    participants: [],
    createdAt: new Date().toISOString(),
    createdBy: admin.id,
  };

  db.saveTournament(newTournament);
  return res.json({ success: true, tournament: newTournament });
});

// Edit Tournament
apiRouter.put('/admin/tournaments/:id', requireAdmin, (req: Request, res: Response) => {
  const match = db.getTournamentById(req.params.id);
  if (!match) return res.status(404).json({ error: 'Tournament not found' });

  const {
    title,
    game,
    matchType,
    mode,
    map,
    entryFee,
    prizePool,
    perKill,
    maxSlots,
    scheduleTime,
    rules,
    bannerUrl,
    status,
  } = req.body;

  if (title !== undefined) match.title = String(title).trim();
  if (game !== undefined) match.game = game;
  if (matchType !== undefined) match.matchType = matchType;
  if (mode !== undefined) match.mode = mode;
  if (map !== undefined) match.map = map;
  if (entryFee !== undefined) match.entryFee = Number(entryFee);
  if (prizePool !== undefined) match.prizePool = Number(prizePool);
  if (perKill !== undefined) match.perKill = Number(perKill);
  if (maxSlots !== undefined) match.maxSlots = Number(maxSlots);
  if (scheduleTime !== undefined) match.scheduleTime = scheduleTime;
  if (rules !== undefined) match.rules = rules;
  if (bannerUrl !== undefined) match.bannerUrl = bannerUrl;
  if (status !== undefined) match.status = status;

  db.saveTournament(match);
  return res.json({ success: true, tournament: match });
});

// Delete Tournament
apiRouter.delete('/admin/tournaments/:id', requireAdmin, (req: Request, res: Response) => {
  const match = db.getTournamentById(req.params.id);
  if (!match) return res.status(404).json({ error: 'Tournament not found' });

  // Auto-refund participants if match had entry fee and was not completed
  if (match.entryFee > 0 && match.status !== 'completed') {
    match.participants.forEach(p => {
      const player = db.getUserById(p.userId);
      if (player) {
        const balanceBefore = player.wallet.totalBalance;
        player.wallet.depositBalance += match.entryFee;
        player.wallet.totalBalance =
          player.wallet.depositBalance + player.wallet.winningBalance + player.wallet.bonusBalance;
        db.saveUser(player);

        db.addTransaction({
          id: `tx-${Date.now()}-${player.id}`,
          userId: player.id,
          type: 'MATCH_REFUND',
          amount: match.entryFee,
          balanceBefore,
          balanceAfter: player.wallet.totalBalance,
          status: 'SUCCESS',
          paymentMethod: 'WALLET',
          matchId: match.id,
          remarks: `Refund of entry fee for deleted tournament "${match.title}"`,
          createdAt: new Date().toISOString(),
        });
      }
    });
  }

  db.deleteTournament(match.id);
  return res.json({ success: true, message: 'Tournament deleted successfully.' });
});

// Remove / Kick Participant
apiRouter.post('/admin/tournaments/:id/remove-participant', requireAdmin, (req: Request, res: Response) => {
  const match = db.getTournamentById(req.params.id);
  if (!match) return res.status(404).json({ error: 'Tournament not found' });

  const { userId } = req.body;
  const pIndex = match.participants.findIndex(p => p.userId === userId);
  if (pIndex < 0) {
    return res.status(404).json({ error: 'Player is not registered in this tournament' });
  }

  // Refund player if entry fee paid
  if (match.entryFee > 0) {
    const player = db.getUserById(userId);
    if (player) {
      const balanceBefore = player.wallet.totalBalance;
      player.wallet.depositBalance += match.entryFee;
      player.wallet.totalBalance =
        player.wallet.depositBalance + player.wallet.winningBalance + player.wallet.bonusBalance;
      db.saveUser(player);

      db.addTransaction({
        id: `tx-${Date.now()}-${player.id}`,
        userId: player.id,
        type: 'MATCH_REFUND',
        amount: match.entryFee,
        balanceBefore,
        balanceAfter: player.wallet.totalBalance,
        status: 'SUCCESS',
        paymentMethod: 'WALLET',
        matchId: match.id,
        remarks: `Refund of entry fee for removed slot in "${match.title}"`,
        createdAt: new Date().toISOString(),
      });
    }
  }

  match.participants.splice(pIndex, 1);
  match.joinedCount = match.participants.length;
  // Re-index slots
  match.participants.forEach((p, i) => {
    p.slotNo = i + 1;
  });
  db.saveTournament(match);

  return res.json({ success: true, match });
});

// Update Room ID / Password & Status
apiRouter.put('/admin/tournaments/:id/room', requireAdmin, (req: Request, res: Response) => {
  const match = db.getTournamentById(req.params.id);
  if (!match) return res.status(404).json({ error: 'Tournament not found' });

  const { roomId, roomPassword, roomNotes, status } = req.body;
  if (roomId !== undefined) match.roomId = String(roomId).trim();
  if (roomPassword !== undefined) match.roomPassword = String(roomPassword).trim();
  if (roomNotes !== undefined) match.roomNotes = String(roomNotes).trim();
  if (status) match.status = status;

  db.saveTournament(match);

  // Send push notification to all joined participants
  if (roomId && (status === 'room_open' || match.status === 'room_open')) {
    match.participants.forEach(p => {
      db.addNotification({
        id: `notif-${Date.now()}-${p.userId}`,
        userId: p.userId,
        title: `Room ID Released for ${match.matchType} Match! 🔑`,
        message: `Room ID: ${match.roomId} | Password: ${match.roomPassword}. Join now in Free Fire!`,
        type: 'match',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    });
  }

  return res.json({ success: true, tournament: match });
});

// Distribute Results & Auto-Credit Prizes
apiRouter.post('/admin/tournaments/:id/distribute-results', requireAdmin, (req: Request, res: Response) => {
  const match = db.getTournamentById(req.params.id);
  if (!match) return res.status(404).json({ error: 'Tournament not found' });

  const { results } = req.body;
  if (!Array.isArray(results)) {
    return res.status(400).json({ error: 'Results array required' });
  }

  results.forEach(resItem => {
    const participant = match.participants.find(p => p.userId === resItem.userId);
    if (!participant) return;

    participant.rank = resItem.rank;
    participant.kills = resItem.kills || 0;

    let rankPrize = 0;
    if (resItem.rank === 1) rankPrize = match.prizeDistribution.rank1;
    else if (resItem.rank === 2) rankPrize = match.prizeDistribution.rank2;
    else if (resItem.rank === 3) rankPrize = match.prizeDistribution.rank3 || 0;

    const killPrize = (resItem.kills || 0) * (match.perKill || 0);
    const totalPrize = rankPrize + killPrize;
    participant.prizeWon = totalPrize;

    if (totalPrize > 0) {
      const player = db.getUserById(resItem.userId);
      if (player) {
        const balanceBefore = player.wallet.totalBalance;
        player.wallet.winningBalance += totalPrize;
        player.wallet.totalBalance =
          player.wallet.depositBalance + player.wallet.winningBalance + player.wallet.bonusBalance;

        player.stats.totalEarned += totalPrize;
        player.stats.totalKills += resItem.kills || 0;
        if (resItem.rank === 1) {
          player.stats.matchesWon += 1;
        }
        player.stats.winRate = Math.round(
          (player.stats.matchesWon / Math.max(1, player.stats.matchesPlayed)) * 100
        );

        db.saveUser(player);

        db.addTransaction({
          id: `tx-${Date.now()}-${player.id}`,
          userId: player.id,
          type: 'MATCH_WINNING',
          amount: totalPrize,
          balanceBefore,
          balanceAfter: player.wallet.totalBalance,
          status: 'SUCCESS',
          paymentMethod: 'WALLET',
          matchId: match.id,
          remarks: `Prize for "${match.title}": Rank #${resItem.rank} (₹${rankPrize}) + ${resItem.kills} Kills (₹${killPrize})`,
          createdAt: new Date().toISOString(),
        });

        db.addNotification({
          id: `notif-${Date.now()}-${player.id}`,
          userId: player.id,
          title: `🏆 You Won ₹${totalPrize} in ${match.title}!`,
          message: `Rank #${resItem.rank} with ${resItem.kills} kills. Cash credited to your Winning Balance.`,
          type: 'reward',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
  });

  match.status = 'completed';
  db.saveTournament(match);

  return res.json({ success: true, message: 'Results processed and prizes credited successfully!', match });
});

// Admin: Players & KYC
apiRouter.get('/admin/players', requireAdmin, (_req: Request, res: Response) => {
  return res.json({ players: db.getUsers() });
});

apiRouter.put('/admin/players/:id/kyc', requireAdmin, (req: Request, res: Response) => {
  const player = db.getUserById(req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const { status, remarks } = req.body;
  player.kyc.status = status;
  player.kyc.reviewedAt = new Date().toISOString();
  if (remarks) player.kyc.remarks = remarks;
  db.saveUser(player);

  db.addNotification({
    id: `notif-${Date.now()}`,
    userId: player.id,
    title: status === 'verified' ? 'KYC Verified Successfully! ✅' : 'KYC Document Rejected ❌',
    message:
      status === 'verified'
        ? 'Your KYC is approved! You can now withdraw real cash anytime.'
        : `KYC was rejected. Reason: ${remarks || 'Document illegible'}. Please resubmit.`,
    type: 'system',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, player });
});

apiRouter.post('/admin/players/:id/adjust-balance', requireAdmin, (req: Request, res: Response) => {
  const player = db.getUserById(req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const { amount, walletType, remarks } = req.body;
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount === 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  const balanceBefore = player.wallet.totalBalance;
  if (walletType === 'winning') {
    player.wallet.winningBalance = Math.max(0, player.wallet.winningBalance + numAmount);
  } else if (walletType === 'bonus') {
    player.wallet.bonusBalance = Math.max(0, player.wallet.bonusBalance + numAmount);
  } else {
    player.wallet.depositBalance = Math.max(0, player.wallet.depositBalance + numAmount);
  }
  player.wallet.totalBalance =
    player.wallet.depositBalance + player.wallet.winningBalance + player.wallet.bonusBalance;
  db.saveUser(player);

  db.addTransaction({
    id: `tx-${Date.now()}`,
    userId: player.id,
    type: 'ADMIN_ADJUSTMENT',
    amount: Math.abs(numAmount),
    balanceBefore,
    balanceAfter: player.wallet.totalBalance,
    status: 'SUCCESS',
    remarks: remarks || `Admin manual balance adjustment (${numAmount > 0 ? '+' : ''}${numAmount})`,
    createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, player });
});

apiRouter.put('/admin/players/:id/ban', requireAdmin, (req: Request, res: Response) => {
  const player = db.getUserById(req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  player.isBanned = !player.isBanned;
  db.saveUser(player);
  return res.json({ success: true, isBanned: player.isBanned });
});

// Admin: Deposits Management
apiRouter.get('/admin/deposits', requireAdmin, (_req: Request, res: Response) => {
  return res.json({ deposits: db.getDeposits() });
});

// Admin Action 1: Verify (Put deposit into VERIFYING / Under Review status)
apiRouter.post('/admin/deposits/:id/verify', requireAdmin, (req: Request, res: Response) => {
  const admin = getAuthUser(req)!;
  const deposit = db.getDeposits().find(d => d.id === req.params.id);
  if (!deposit) return res.status(404).json({ error: 'Deposit request not found' });

  if (deposit.credited || deposit.status === 'APPROVED') {
    return res.status(400).json({ error: 'Deposit has already been verified, approved, and credited.' });
  }

  if (deposit.status === 'REJECTED') {
    return res.status(400).json({ error: 'Deposit has already been rejected.' });
  }

  deposit.status = 'VERIFYING';
  deposit.verifiedAt = new Date().toISOString();
  deposit.verifiedBy = admin.id;
  deposit.reviewedAt = new Date().toISOString();
  deposit.remarks = `Being verified by admin ${admin.name || admin.ign} against bank statements`;
  db.updateDeposit(deposit.id, deposit);

  // Sync player transaction note
  const txs = db.getTransactions(deposit.userId);
  const tx = txs.find(t => t.type === 'DEPOSIT' && t.utrNumber === deposit.utrNumber);
  if (tx) {
    tx.remarks = `UPI Deposit under verification by admin (UTR: ${deposit.utrNumber})`;
  }

  return res.json({
    success: true,
    message: 'Deposit status updated to VERIFYING (Under Review).',
    deposit,
  });
});

// Admin Action 2: Approve / Successful (Strict single-credit check)
apiRouter.post('/admin/deposits/:id/approve', requireAdmin, (req: Request, res: Response) => {
  const admin = getAuthUser(req)!;
  const deposit = db.getDeposits().find(d => d.id === req.params.id);
  if (!deposit) return res.status(404).json({ error: 'Deposit request not found' });

  // SECURITY GUARD: Prevent duplicate credits
  if (deposit.credited || deposit.status === 'APPROVED') {
    return res.status(400).json({
      error: 'Deposit has already been approved and credited. Duplicate credits are strictly prevented.',
    });
  }

  if (deposit.status === 'REJECTED') {
    return res.status(400).json({ error: 'Cannot approve a rejected deposit request.' });
  }

  const player = db.getUserById(deposit.userId);
  if (!player) return res.status(404).json({ error: 'Player account not found' });

  // Update Deposit record
  deposit.status = 'APPROVED';
  deposit.credited = true;
  deposit.approvedAt = new Date().toISOString();
  deposit.approvedBy = admin.id;
  deposit.reviewedAt = new Date().toISOString();
  deposit.remarks = `Verified and approved by admin ${admin.name || admin.ign}`;
  db.updateDeposit(deposit.id, deposit);

  // Credit player wallet balance strictly ONCE
  const balanceBefore = player.wallet.totalBalance;
  player.wallet.depositBalance += deposit.amount;
  player.wallet.totalBalance =
    player.wallet.depositBalance + player.wallet.winningBalance + player.wallet.bonusBalance;
  db.saveUser(player);

  // Synchronize player transaction ledger
  const txs = db.getTransactions(player.id);
  const existingTx = txs.find(t => t.type === 'DEPOSIT' && t.utrNumber === deposit.utrNumber);
  if (existingTx) {
    existingTx.status = 'SUCCESS';
    existingTx.balanceBefore = balanceBefore;
    existingTx.balanceAfter = player.wallet.totalBalance;
    existingTx.approvedBy = admin.id;
    existingTx.remarks = `Deposit verified and approved by admin (UTR: ${deposit.utrNumber})`;
  } else {
    db.addTransaction({
      id: `tx-${Date.now()}`,
      userId: player.id,
      type: 'DEPOSIT',
      amount: deposit.amount,
      balanceBefore,
      balanceAfter: player.wallet.totalBalance,
      status: 'SUCCESS',
      paymentMethod: 'UPI',
      utrNumber: deposit.utrNumber,
      approvedBy: admin.id,
      remarks: `Manual deposit approved by admin (UTR: ${deposit.utrNumber})`,
      createdAt: new Date().toISOString(),
    });
  }

  db.addNotification({
    id: `notif-${Date.now()}`,
    userId: player.id,
    title: `₹${deposit.amount} Deposit Approved! ✅`,
    message: `Payment verified by admin. ₹${deposit.amount} has been credited to your Deposit Wallet.`,
    type: 'wallet',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.json({
    success: true,
    message: `₹${deposit.amount} successfully credited to player ${player.ign} wallet.`,
    deposit,
    wallet: player.wallet,
  });
});

// Admin Action 3: Reject Deposit
apiRouter.post('/admin/deposits/:id/reject', requireAdmin, (req: Request, res: Response) => {
  const admin = getAuthUser(req)!;
  const deposit = db.getDeposits().find(d => d.id === req.params.id);
  if (!deposit) return res.status(404).json({ error: 'Deposit request not found' });

  if (deposit.credited || deposit.status === 'APPROVED') {
    return res.status(400).json({
      error: 'Cannot reject a deposit that has already been approved and credited.',
    });
  }

  if (deposit.status === 'REJECTED') {
    return res.status(400).json({ error: 'Deposit has already been rejected.' });
  }

  const { reason } = req.body;
  const rejectionMsg = reason || 'Payment not found in bank statement or invalid UTR';

  deposit.status = 'REJECTED';
  deposit.rejectedAt = new Date().toISOString();
  deposit.rejectedBy = admin.id;
  deposit.reviewedAt = new Date().toISOString();
  deposit.rejectionReason = rejectionMsg;
  deposit.remarks = `Rejected by admin ${admin.name || admin.ign}: ${rejectionMsg}`;
  db.updateDeposit(deposit.id, deposit);

  // Synchronize player transaction ledger
  const txs = db.getTransactions(deposit.userId);
  const existingTx = txs.find(t => t.type === 'DEPOSIT' && t.utrNumber === deposit.utrNumber);
  if (existingTx) {
    existingTx.status = 'REJECTED';
    existingTx.remarks = `Deposit rejected by admin: ${rejectionMsg}`;
  }

  db.addNotification({
    id: `notif-${Date.now()}`,
    userId: deposit.userId,
    title: 'Deposit Request Rejected ❌',
    message: `Deposit of ₹${deposit.amount} (UTR: ${deposit.utrNumber}) could not be verified. Reason: ${rejectionMsg}.`,
    type: 'wallet',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.json({
    success: true,
    message: 'Deposit request rejected.',
    deposit,
  });
});

// Admin: Withdrawals Management
apiRouter.get('/admin/withdrawals', requireAdmin, (_req: Request, res: Response) => {
  return res.json({ withdrawals: db.getWithdrawals() });
});

// Admin Action 1: Set Withdrawal to Pending
apiRouter.post('/admin/withdrawals/:id/set-pending', requireAdmin, (req: Request, res: Response) => {
  const admin = getAuthUser(req)!;
  const wd = db.getWithdrawals().find(w => w.id === req.params.id);
  if (!wd) return res.status(404).json({ error: 'Withdrawal not found' });

  if (wd.status === 'SUCCESSFUL' || wd.status === 'TRANSFERRED') {
    return res.status(400).json({ error: 'Cannot revert a completed/successful payout to pending.' });
  }

  if (wd.status === 'REJECTED') {
    return res.status(400).json({ error: 'Cannot revert a rejected and refunded withdrawal to pending.' });
  }

  wd.status = 'PENDING';
  wd.updatedAt = new Date().toISOString();
  if (!wd.auditLog) wd.auditLog = [];
  wd.auditLog.push({
    action: 'SET_PENDING',
    status: 'PENDING',
    adminId: admin.id,
    adminName: admin.name || admin.ign,
    timestamp: new Date().toISOString(),
    remarks: 'Reverted to Pending status for further review',
  });
  db.updateWithdrawal(wd.id, wd);

  return res.json({ success: true, withdrawal: wd });
});

// Admin Action 2: Approve Withdrawal (Mark Approved for Payout)
apiRouter.post('/admin/withdrawals/:id/approve', requireAdmin, (req: Request, res: Response) => {
  const admin = getAuthUser(req)!;
  const wd = db.getWithdrawals().find(w => w.id === req.params.id);
  if (!wd) return res.status(404).json({ error: 'Withdrawal not found' });

  if (wd.status === 'SUCCESSFUL' || wd.status === 'TRANSFERRED') {
    return res.status(400).json({ error: 'Withdrawal is already marked successful and paid.' });
  }

  if (wd.status === 'REJECTED') {
    return res.status(400).json({ error: 'Cannot approve a rejected withdrawal.' });
  }

  wd.status = 'APPROVED';
  wd.approvedTime = new Date().toISOString();
  wd.approvedBy = admin.id;
  wd.updatedAt = new Date().toISOString();

  if (!wd.auditLog) wd.auditLog = [];
  wd.auditLog.push({
    action: 'APPROVED',
    status: 'APPROVED',
    adminId: admin.id,
    adminName: admin.name || admin.ign,
    timestamp: new Date().toISOString(),
    remarks: `Approved for payout processing by ${admin.name || admin.ign}`,
  });
  db.updateWithdrawal(wd.id, wd);

  db.addNotification({
    id: `notif-${Date.now()}`,
    userId: wd.userId,
    title: `Withdrawal of ₹${wd.amount} Approved! ⚡`,
    message: `Your request has been approved and is queued for bank transfer. You will receive payout UTR shortly.`,
    type: 'wallet',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, message: 'Withdrawal status set to APPROVED.', withdrawal: wd });
});

// Admin Action 3: Mark Withdrawal Successful (Requires actual payment confirmation with UTR)
apiRouter.post('/admin/withdrawals/:id/mark-successful', requireAdmin, (req: Request, res: Response) => {
  const admin = getAuthUser(req)!;
  const wd = db.getWithdrawals().find(w => w.id === req.params.id);
  if (!wd) return res.status(404).json({ error: 'Withdrawal not found' });

  if (wd.status === 'REJECTED') {
    return res.status(400).json({ error: 'Cannot mark a rejected withdrawal as successful.' });
  }

  const { payoutUtr } = req.body;
  const cleanUtr = String(payoutUtr || '').trim();
  if (!cleanUtr || cleanUtr.length < 4) {
    return res.status(400).json({
      error: 'Valid Bank / UPI Payout UTR / Transaction Reference number is required to confirm successful payment.',
    });
  }

  wd.status = 'SUCCESSFUL';
  wd.processedTime = new Date().toISOString();
  wd.processedBy = admin.id;
  wd.payoutUtr = cleanUtr;
  wd.updatedAt = new Date().toISOString();

  if (!wd.auditLog) wd.auditLog = [];
  wd.auditLog.push({
    action: 'SUCCESSFUL',
    status: 'SUCCESSFUL',
    adminId: admin.id,
    adminName: admin.name || admin.ign,
    timestamp: new Date().toISOString(),
    remarks: `Payment confirmed by admin via ${wd.payoutMethod}`,
    payoutUtr: cleanUtr,
  });
  db.updateWithdrawal(wd.id, wd);

  // Synchronize player transaction ledger
  const txs = db.getTransactions(wd.userId);
  const tx = txs.find(t => t.type === 'WITHDRAWAL' && (t.status === 'PENDING' || t.status === 'SUCCESS') && t.amount === wd.amount);
  if (tx) {
    tx.status = 'SUCCESS';
    tx.utrNumber = cleanUtr;
    tx.approvedBy = admin.id;
    tx.remarks = `Withdrawal paid via ${wd.payoutMethod} (Ref/UTR: ${cleanUtr})`;
  }

  db.addNotification({
    id: `notif-${Date.now()}`,
    userId: wd.userId,
    title: `₹${wd.amount} Transferred to your ${wd.payoutMethod}! 💰`,
    message: `Payout successfully completed! Bank Reference / UTR: ${cleanUtr}.`,
    type: 'wallet',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.json({
    success: true,
    message: 'Withdrawal marked as Successful with confirmed payout reference.',
    withdrawal: wd,
  });
});

// Admin Action 4: Reject Withdrawal & Safely Refund Winning Balance
apiRouter.post('/admin/withdrawals/:id/reject', requireAdmin, (req: Request, res: Response) => {
  const admin = getAuthUser(req)!;
  const wd = db.getWithdrawals().find(w => w.id === req.params.id);
  if (!wd) return res.status(404).json({ error: 'Withdrawal not found' });

  if (wd.status === 'SUCCESSFUL' || wd.status === 'TRANSFERRED') {
    return res.status(400).json({
      error: 'Cannot reject a withdrawal that has already been confirmed as successfully transferred.',
    });
  }

  if (wd.status === 'REJECTED') {
    return res.status(400).json({ error: 'Withdrawal has already been rejected and refunded.' });
  }

  const { reason } = req.body;
  const rejectionMsg = reason || 'KYC / bank mismatch or incorrect UPI details';

  wd.status = 'REJECTED';
  wd.processedTime = new Date().toISOString();
  wd.processedBy = admin.id;
  wd.rejectionReason = rejectionMsg;
  wd.updatedAt = new Date().toISOString();

  if (!wd.auditLog) wd.auditLog = [];
  wd.auditLog.push({
    action: 'REJECTED',
    status: 'REJECTED',
    adminId: admin.id,
    adminName: admin.name || admin.ign,
    timestamp: new Date().toISOString(),
    remarks: `Rejected by admin: ${rejectionMsg}. Balance refunded.`,
  });
  db.updateWithdrawal(wd.id, wd);

  // Safely restore winning balance to player
  const player = db.getUserById(wd.userId);
  if (player) {
    const balanceBefore = player.wallet.totalBalance;
    player.wallet.winningBalance += wd.amount;
    player.wallet.totalBalance =
      player.wallet.depositBalance + player.wallet.winningBalance + player.wallet.bonusBalance;
    db.saveUser(player);

    // Synchronize transaction ledger: add refund transaction and mark withdrawal request rejected
    db.addTransaction({
      id: `tx-${Date.now()}`,
      userId: player.id,
      type: 'MATCH_REFUND',
      amount: wd.amount,
      balanceBefore,
      balanceAfter: player.wallet.totalBalance,
      status: 'SUCCESS',
      paymentMethod: 'WALLET',
      remarks: `Withdrawal of ₹${wd.amount} rejected and refunded to Winning Balance: ${rejectionMsg}`,
      createdAt: new Date().toISOString(),
    });

    const txs = db.getTransactions(player.id);
    const origTx = txs.find(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING' && t.amount === wd.amount);
    if (origTx) {
      origTx.status = 'REJECTED';
      origTx.remarks = `Withdrawal rejected: ${rejectionMsg} (Refunded to winning balance)`;
    }

    db.addNotification({
      id: `notif-${Date.now()}`,
      userId: player.id,
      title: 'Withdrawal Request Rejected ⚠️',
      message: `₹${wd.amount} has been refunded to your winning balance. Reason: ${rejectionMsg}.`,
      type: 'wallet',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  return res.json({
    success: true,
    message: 'Withdrawal rejected and winning balance refunded to player.',
    withdrawal: wd,
  });
});

// Admin: Settings Management & Financial Controls
apiRouter.post('/admin/settings/toggle-deposits', requireAdmin, (_req: Request, res: Response) => {
  const current = db.getSettings();
  const updated = db.updateSettings({ depositsPaused: !current.depositsPaused });
  return res.json({
    success: true,
    depositsPaused: updated.depositsPaused,
    message: updated.depositsPaused
      ? 'Deposits are now PAUSED for all players.'
      : 'Deposits are now ACTIVE and accepting submissions.',
  });
});

apiRouter.post('/admin/settings/toggle-manual-mode', requireAdmin, (_req: Request, res: Response) => {
  const current = db.getSettings();
  const updated = db.updateSettings({ manualVerificationMode: !current.manualVerificationMode });
  return res.json({
    success: true,
    manualVerificationMode: updated.manualVerificationMode,
    message: updated.manualVerificationMode
      ? 'Manual Verification Mode ENABLED: All deposits strictly require staff verification.'
      : 'Manual Verification Mode updated.',
  });
});

apiRouter.put('/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const updates = req.body;
  const updated = db.updateSettings(updates);
  return res.json({ success: true, settings: updated });
});

// Admin: Banners & Announcements & Push Notifications
apiRouter.get('/admin/banners', requireAdmin, (_req: Request, res: Response) => {
  return res.json({ banners: db.getAllBanners() });
});

apiRouter.post('/admin/banners', requireAdmin, (req: Request, res: Response) => {
  const { title, subtitle, imageUrl, badgeText, targetTab } = req.body;
  if (!title || !imageUrl) {
    return res.status(400).json({ error: 'Title and image URL required' });
  }

  const newBanner: Banner = {
    id: `banner-${Date.now()}`,
    title: String(title).trim(),
    subtitle: String(subtitle || '').trim(),
    imageUrl: String(imageUrl).trim(),
    badgeText: String(badgeText || 'FEATURED').trim(),
    targetTab: targetTab || 'matches',
    active: true,
  };

  db.saveBanner(newBanner);
  return res.json({ success: true, banner: newBanner });
});

apiRouter.delete('/admin/banners/:id', requireAdmin, (req: Request, res: Response) => {
  db.deleteBanner(req.params.id);
  return res.json({ success: true });
});

apiRouter.get('/admin/announcements', requireAdmin, (_req: Request, res: Response) => {
  return res.json({ announcements: db.getAllAnnouncements() });
});

apiRouter.post('/admin/announcements', requireAdmin, (req: Request, res: Response) => {
  const { title, content, type } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content required' });
  }

  const ann: Announcement = {
    id: `ann-${Date.now()}`,
    title: String(title).trim(),
    content: String(content).trim(),
    type: type || 'info',
    active: true,
    createdAt: new Date().toISOString(),
  };

  db.saveAnnouncement(ann);
  return res.json({ success: true, announcement: ann });
});

apiRouter.delete('/admin/announcements/:id', requireAdmin, (req: Request, res: Response) => {
  db.deleteAnnouncement(req.params.id);
  return res.json({ success: true });
});

apiRouter.post('/admin/broadcast-notification', requireAdmin, (req: Request, res: Response) => {
  const { title, message, type } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message required' });
  }

  db.broadcastNotification({
    title: String(title).trim(),
    message: String(message).trim(),
    type: type || 'system',
    isRead: false,
  });

  return res.json({ success: true, message: 'Notification broadcasted to all players.' });
});

// Admin: Transactions History (Across all users)
apiRouter.get('/admin/transactions', requireAdmin, (_req: Request, res: Response) => {
  return res.json({ transactions: db.getTransactions() });
});

// Admin: Stats
apiRouter.get('/admin/stats', requireAdmin, (_req: Request, res: Response) => {
  const users = db.getUsers().filter(u => u.role === 'player');
  const tournaments = db.getTournaments();
  const txs = db.getTransactions();

  const totalPrizeDistributed = tournaments
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.participants.reduce((pSum, p) => pSum + (p.prizeWon || 0), 0), 0);

  const totalDeposits = txs
    .filter(t => t.type === 'DEPOSIT' && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = txs
    .filter(t => t.type === 'WITHDRAWAL' && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingWithdrawalsCount = db.getWithdrawals().filter(w => w.status === 'PENDING').length;
  const pendingDepositsCount = db.getDeposits().filter(d => d.status === 'PENDING').length;

  return res.json({
    totalPlayers: users.length,
    totalTournaments: tournaments.length,
    activeTournaments: tournaments.filter(
      t => t.status === 'upcoming' || t.status === 'room_open' || t.status === 'live'
    ).length,
    totalPrizeDistributed,
    totalDeposits,
    totalWithdrawals,
    pendingWithdrawalsCount,
    pendingDepositsCount,
  });
});

apiRouter.put('/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  return res.json({ success: true, settings: updated });
});
