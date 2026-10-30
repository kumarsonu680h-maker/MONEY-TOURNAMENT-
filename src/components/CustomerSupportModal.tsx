import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { SupportTicket } from '../types/index.ts';
import {
  X,
  Headphones,
  MessageSquare,
  Send,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CustomerSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerSupportModal: React.FC<CustomerSupportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'tickets' | 'faqs'>('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<'Wallet' | 'Match / Room ID' | 'KYC' | 'Prize Dispute' | 'Other'>('Match / Room ID');
  const [newMessage, setNewMessage] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen || !user) return;
    fetchTickets();
  }, [isOpen, user?.id]);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/support-tickets', {
        headers: { 'x-user-id': user?.id || '' },
      });
      if (!res.ok) return;
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) return;
      const data = await res.json();
      if (data.tickets) {
        setTickets(data.tickets);
        if (selectedTicket) {
          const updated = data.tickets.find((t: any) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (e) {
      console.error('Error fetching tickets', e);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;

    try {
      const res = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          subject: newSubject.trim(),
          category: newCategory,
          message: newMessage.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewSubject('');
        setNewMessage('');
        setIsCreatingTicket(false);
        await fetchTickets();
        setSelectedTicket(data.ticket);
      }
    } catch (e) {
      console.error('Error creating ticket', e);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    try {
      const res = await fetch(`/api/support-tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({ message: replyText.trim() }),
      });
      if (res.ok) {
        setReplyText('');
        await fetchTickets();
      }
    } catch (e) {
      console.error('Error replying', e);
    }
  };

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'Where do I find the Free Fire Custom Room ID and Password?',
      a: 'The Room ID and Password will automatically unlock directly on your match card and Match Details modal 15 minutes before the scheduled start time. You will also receive an instant in-app notification.',
    },
    {
      q: 'How long do withdrawals take to reflect in my bank/UPI?',
      a: 'Withdrawals are typically processed within 5 to 15 minutes. During peak tournament hours, it may take up to 30 minutes. You can track the real-time status in your Wallet tab.',
    },
    {
      q: 'Why can I only withdraw my Winning Balance?',
      a: 'In strict compliance with Indian legal regulations for games of skill (IT Rules 2021 and Public Gambling Act exemptions), deposited cash is meant solely for match entry fees. Only net winnings can be withdrawn.',
    },
    {
      q: 'Are Emulators (PC/Bluestacks) allowed?',
      a: 'No! MONEY TOURNAMENT enforces a strict mobile-only policy. Playing on PC, emulator, or utilizing modified APKs/scripts will result in an immediate hardware ban and forfeiture of wallet balance.',
    },
    {
      q: 'What if a match gets cancelled by organizers?',
      a: 'If a match is cancelled due to game server maintenance or technical issues, 100% of your entry fee is automatically refunded back to your deposit balance.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-[#0c0e18] border border-red-900/40 rounded-2xl shadow-2xl p-5 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-900/80 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-gaming font-bold text-lg text-white">
              24/7 PLAYER SUPPORT
            </h3>
            <p className="text-xs text-gray-400">
              Instant assistance via WhatsApp, Telegram & In-App Tickets
            </p>
          </div>
        </div>

        {/* Quick Social Contacts */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <a
            href="https://wa.me/919876543210?text=Hi%20Money%20Tournament%20Support,%20I%20need%20assistance"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/40 text-emerald-400 text-xs font-semibold transition-all"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp Helpline</span>
            <ExternalLink className="w-3 h-3 text-emerald-500" />
          </a>

          <a
            href="https://t.me/moneytournament_official"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-sky-950/40 hover:bg-sky-900/40 border border-sky-800/40 text-sky-400 text-xs font-semibold transition-all"
          >
            <Send className="w-4 h-4 text-sky-400" />
            <span>Telegram Channel</span>
            <ExternalLink className="w-3 h-3 text-sky-500" />
          </a>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-gray-800 mb-3 text-xs font-gaming font-semibold">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              activeTab === 'tickets'
                ? 'border-red-500 text-red-400 font-bold'
                : 'border-transparent text-gray-400'
            }`}
          >
            My Support Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              activeTab === 'faqs'
                ? 'border-red-500 text-red-400 font-bold'
                : 'border-transparent text-gray-400'
            }`}
          >
            FAQs & Help
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 space-y-3 pr-1">
          {activeTab === 'tickets' ? (
            isCreatingTicket ? (
              <form onSubmit={handleCreateTicket} className="space-y-3 bg-[#121522] p-3.5 rounded-xl border border-gray-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white font-gaming">
                    NEW SUPPORT TICKET
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsCreatingTicket(false)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="text-[11px] text-gray-300 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full bg-[#181c2e] border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                  >
                    <option value="Match / Room ID">Match / Room ID Issue</option>
                    <option value="Wallet">Wallet / Deposit / Withdrawal</option>
                    <option value="KYC">KYC Verification</option>
                    <option value="Prize Dispute">Prize Dispute / Kill Verification</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-gray-300 block mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    placeholder="Brief description of your issue"
                    className="w-full bg-[#181c2e] border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-gray-300 block mb-1">Message</label>
                  <textarea
                    rows={3}
                    required
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Provide details, match ID, or transaction UTR if applicable..."
                    className="w-full bg-[#181c2e] border border-gray-800 rounded-lg p-2.5 text-xs text-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-gaming font-bold text-xs uppercase"
                >
                  Submit Ticket
                </button>
              </form>
            ) : selectedTicket ? (
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-xs text-red-400 hover:underline font-gaming font-semibold flex items-center gap-1"
                >
                  &larr; Back to all tickets
                </button>

                <div className="bg-[#121522] border border-gray-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-mono block">
                        {selectedTicket.category} • {selectedTicket.id}
                      </span>
                      <h4 className="font-bold text-sm text-white">{selectedTicket.subject}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        selectedTicket.status === 'resolved'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {selectedTicket.status}
                    </span>
                  </div>

                  {/* Thread */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedTicket.replies.map(rep => (
                      <div
                        key={rep.id}
                        className={`p-2.5 rounded-xl text-xs max-w-[85%] ${
                          rep.sender === 'user'
                            ? 'bg-[#1c2236] text-gray-200 ml-auto border border-gray-800'
                            : 'bg-red-950/30 text-white mr-auto border border-red-900/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px] text-gray-400 mb-1">
                          <span className="font-bold text-red-400">
                            {rep.sender === 'user' ? 'You' : 'Official Support Staff'}
                          </span>
                          <span>{new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p>{rep.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reply Input */}
                  <form onSubmit={handleSendReply} className="flex gap-2 pt-2 border-t border-gray-800">
                    <input
                      type="text"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 bg-[#181c2e] border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-gaming text-xs font-bold"
                    >
                      Reply
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => setIsCreatingTicket(true)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-gaming font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md glow-red-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Create New Ticket</span>
                </button>

                {tickets.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-xs">
                    No support tickets open. Feel free to contact us anytime!
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {tickets.map(ticket => (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className="p-3 rounded-xl bg-[#121522] hover:bg-[#181c2d] border border-gray-800 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 font-mono">
                              {ticket.category}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                ticket.status === 'resolved'
                                  ? 'bg-emerald-950 text-emerald-400'
                                  : 'bg-amber-950 text-amber-400'
                              }`}
                            >
                              {ticket.status}
                            </span>
                          </div>
                          <h5 className="font-semibold text-xs text-white mt-0.5">
                            {ticket.subject}
                          </h5>
                        </div>
                        <span className="text-[10px] text-gray-500">
                          {ticket.replies.length} replies &rarr;
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="space-y-2">
              {faqs.map((faq, idx) => {
                const isExpanded = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl bg-[#121522] border border-gray-800 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                      className="w-full p-3 text-left flex items-center justify-between gap-2 text-xs font-semibold text-gray-200"
                    >
                      <span className="flex items-center gap-2">
                        <HelpCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        {faq.q}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 text-xs text-gray-400 leading-relaxed border-t border-gray-800/60 pt-2">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
