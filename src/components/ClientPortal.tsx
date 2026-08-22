import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClientInfo, Ticket, CommentItem } from '../types';
import { DeltaLogo } from './DeltaLogo';
import { TicketStatusBadge } from './TicketStatusBadge';
import { 
  User, 
  Wifi, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Star, 
  MessageSquare, 
  ShieldCheck, 
  PhoneCall, 
  MapPin, 
  LogOut,
  ArrowRight,
  Sparkles,
  Mail,
  Mic
} from 'lucide-react';

interface ClientPortalProps {
  clients: ClientInfo[];
  tickets: Ticket[];
  loggedInCid: string | null;
  onLogin: (cid: string) => void;
  onLogout: () => void;
  lang: 'bn' | 'en';
  onOpenNewTicketModal: () => void;
  onAddComment: (ticketId: string, text: string) => void;
  onRateTicket: (ticketId: string, rating: number, feedback: string) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  clients,
  tickets,
  loggedInCid,
  onLogin,
  onLogout,
  lang,
  onOpenNewTicketModal,
  onAddComment,
  onRateTicket,
}) => {
  const [cidInput, setCidInput] = useState('');
  const [whatsappInput, setWhatsappInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Comment input per ticket
  const [commentTextMap, setCommentTextMap] = useState<{ [ticketId: string]: string }>({});

  // Rating state
  const [ratingMap, setRatingMap] = useState<{ [ticketId: string]: number }>({});
  const [feedbackMap, setFeedbackMap] = useState<{ [ticketId: string]: string }>({});

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedCid = cidInput.trim().toUpperCase();
    const cleanPhoneInput = whatsappInput.trim().replace(/[^0-9]/g, '');

    if (!normalizedCid) {
      setLoginError(lang === 'bn' ? 'CID নম্বরটি লিখুন' : 'Please enter your CID Number');
      return;
    }

    const foundByCid = clients.find(c => c.cid.toUpperCase() === normalizedCid);

    if (!foundByCid) {
      setLoginError(
        lang === 'bn' 
          ? 'সঠিক CID নম্বর দিন (যেমন: CID-1001, CID-1002)' 
          : 'Invalid CID Number. Try CID-1001'
      );
      return;
    }

    // Verify WhatsApp / Mobile number if supplied, or enforce match
    if (cleanPhoneInput) {
      const clientCleanPhone = foundByCid.phone.replace(/[^0-9]/g, '');
      if (!clientCleanPhone.includes(cleanPhoneInput) && !cleanPhoneInput.includes(clientCleanPhone)) {
        setLoginError(
          lang === 'bn' 
            ? `সিআইডি (${foundByCid.cid}) এর সাথে হোয়াটসঅ্যাপ নম্বর মেলেনি!` 
            : `WhatsApp number does not match for CID ${foundByCid.cid}`
        );
        return;
      }
    } else {
      setLoginError(
        lang === 'bn' 
          ? 'অনুগ্রহ করে আপনার রেজিস্টার্ড নম্বর দিন' 
          : 'Please enter your registered number'
      );
      return;
    }

    setLoginError('');
    onLogin(foundByCid.cid);
  };

  // If not logged in, show CID Login Portal Card
  if (!loggedInCid) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-grid-pattern">
        <div className="w-full max-w-lg bg-[#09090b] border border-[#27272a] p-6 sm:p-10 relative shadow-2xl font-mono text-[#e4e4e7]">
          
          {/* SECURE ACCESS Badge */}
          <div className="absolute -top-3 left-6 bg-[#111113] px-3 py-0.5 border border-[#27272a] text-[10px] font-bold text-[#10b981] tracking-widest uppercase">
            SECURE ACCESS • DELTA NOC
          </div>

          {/* Logo & Header */}
          <div className="flex flex-col items-start mb-8 pt-2">
            <DeltaLogo size="lg" theme="dark" showTagline={true} />
            <h2 className="text-3xl font-extrabold text-white mt-4 uppercase tracking-tight font-syne leading-none">
              Client<br />Portal
            </h2>
            <p className="text-xs text-zinc-400 mt-2 font-mono">
              {lang === 'bn' ? 'আপনার ইউনিক CID নম্বর ও ফোন নম্বর দিয়ে প্রসেস করুন' : 'Customer Authentication & Support Tracking'}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {/* CID Input */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                {lang === 'bn' ? 'গ্রাহক আইডি (CID Number)' : 'Customer Identifier (CID)'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={cidInput}
                  onChange={(e) => {
                    setCidInput(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="e.g. CID-1001"
                  className="w-full pl-10 pr-4 py-3 bg-[#18181b] border border-[#27272a] focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] text-white font-mono font-bold uppercase tracking-wider text-sm outline-none transition-all"
                />
              </div>
            </div>

            {/* WhatsApp Number Input */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                {lang === 'bn' ? 'হোয়াটসঅ্যাপ / মোবাইল নম্বর (Phone / WA)' : 'Registered Phone / WA'}
              </label>
              <div className="relative">
                <PhoneCall className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#10b981]" />
                <input
                  type="tel"
                  required
                  value={whatsappInput}
                  onChange={(e) => {
                    setWhatsappInput(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="e.g. 01712345678"
                  className="w-full pl-10 pr-4 py-3 bg-[#18181b] border border-[#27272a] focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] text-white font-mono font-bold tracking-wider text-sm outline-none transition-all"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/60 p-3 rounded-none flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{loginError}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#10b981] hover:bg-[#059669] text-[#09090b] font-syne font-extrabold text-base tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 active:scale-98"
            >
              <span>{lang === 'bn' ? 'লগইন প্রসেস করুন →' : 'Authenticate →'}</span>
            </button>
          </form>

          {/* Quick Demo Test Accounts */}
          <div className="mt-8 pt-6 border-t border-[#27272a]">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
              {lang === 'bn' ? 'টেস্ট গ্রাহক তথ্য (TEST VECTOR RECORDS):' : 'Test Vector Records (Quick Fill)'}
            </div>
            <div className="space-y-1.5">
              {clients.map((c) => (
                <button
                  key={c.cid}
                  type="button"
                  onClick={() => {
                    setCidInput(c.cid);
                    setWhatsappInput(c.phone.replace(/[^0-9]/g, ''));
                    setLoginError('');
                  }}
                  className="w-full grid grid-cols-12 items-center p-2.5 bg-[#18181b] hover:bg-[#10b981]/10 border border-[#27272a] hover:border-[#10b981] text-left transition-all text-xs font-mono group"
                >
                  <span className="col-span-3 font-bold text-[#10b981] group-hover:text-emerald-400">
                    {c.cid}
                  </span>
                  <span className="col-span-5 text-zinc-300 truncate font-semibold">
                    {c.name}
                  </span>
                  <span className="col-span-4 text-right text-zinc-500 text-[11px] font-mono">
                    {c.phone}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Client Logged In View
  const clientInfo = clients.find(c => c.cid === loggedInCid) || clients[0];
  const myTickets = tickets.filter(t => t.cid === loggedInCid);

  const handleSendComment = (ticketId: string) => {
    const text = commentTextMap[ticketId];
    if (!text || !text.trim()) return;
    onAddComment(ticketId, text);
    setCommentTextMap(prev => ({ ...prev, [ticketId]: '' }));
  };

  const handleRateSubmit = (ticketId: string) => {
    const star = ratingMap[ticketId] || 5;
    const fb = feedbackMap[ticketId] || '';
    onRateTicket(ticketId, star, fb);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6 text-slate-800">
      
      {/* Client Profile Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
              {clientInfo.cid}
            </span>
            <span className="text-xs text-emerald-400 font-bold">● {clientInfo.status} Client</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{clientInfo.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono">{clientInfo.phone}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-mono text-slate-200">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>{clientInfo.email}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>{clientInfo.area}</span>
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">{clientInfo.package}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/30">
              📧 Email & WA Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewTicketModal}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs md:text-sm transition-all shadow-lg flex items-center gap-2 active:scale-95 group"
            title={lang === 'bn' ? 'নতুন টিকেট খুলুন (ভয়েস ডিকটেশন সহ)' : 'Open Support Ticket (Voice Enabled)'}
          >
            <PlusCircle className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন টিকেট খুলুন' : 'Open Support Ticket'}</span>
            <span className="flex items-center gap-0.5 bg-emerald-600/30 px-1.5 py-0.5 rounded-md text-[10px] text-slate-950 font-mono font-bold">
              <Mic className="w-3 h-3 text-slate-950" />
              <span>Voice</span>
            </span>
          </button>

          <button
            onClick={onLogout}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Exit Client Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ticket Stream for Client */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-lg font-bold text-slate-900">
            {lang === 'bn' ? 'আমার সাপোর্ট টিকেটসমূহ' : 'My Support Tickets'}
          </h2>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            Total {myTickets.length} Tickets
          </span>
        </div>

        {myTickets.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-slate-900 text-base">
              {lang === 'bn' ? 'আপনার কোন একটিভ টিকেট নেই' : 'No active tickets currently'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {lang === 'bn' 
                ? 'আপনার ইন্টারনেট লাইনে কোন সমস্যা দেখা দিলে "নতুন টিকেট খুলুন" বাটনে ক্লিক করুন।' 
                : 'If you encounter internet issues, click "Open Support Ticket" above.'}
            </p>
          </div>
        ) : (
          myTickets.map((ticket) => {
            // Calculate step index
            let currentStep = 1;
            if (ticket.status === 'NOC_Assigned') currentStep = 2;
            if (ticket.status === 'In_Progress') currentStep = 3;
            if (ticket.status === 'Resolved' || ticket.status === 'Closed') currentStep = 4;

            return (
              <div key={ticket.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold bg-slate-900 text-indigo-300 px-2.5 py-0.5 rounded">
                        #{ticket.id}
                      </span>
                      <span className="text-xs font-bold text-slate-500">{ticket.category}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{ticket.title}</h3>
                  </div>

                  {/* Animated Ticket Status Badge */}
                  <TicketStatusBadge status={ticket.status} lang={lang} size="md" />
                </div>

                {/* VISUAL TIMELINE PROGRESS BAR */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-slate-700">
                      {lang === 'bn' ? 'টিকেট ট্র্যাকিং স্ট্যাটাস লাইভ টাইমলাইন:' : 'Ticket Resolution Timeline:'}
                    </p>
                    <span className="text-[11px] font-mono text-slate-500 font-medium">
                      {ticket.status === 'Resolved' || ticket.status === 'Closed' ? '✓ Completed' : '● Live Tracking'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 text-center text-[11px] relative">
                    {/* Step 1 */}
                    <div className="space-y-1">
                      <motion.div 
                        animate={currentStep >= 1 ? { scale: [1, 1.06, 1] } : {}}
                        transition={{ duration: 1.5, repeat: currentStep === 1 ? Infinity : 0, repeatDelay: 2 }}
                        className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs shadow-sm ${
                          currentStep >= 1 ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        1
                      </motion.div>
                      <p className="font-bold text-slate-800">{lang === 'bn' ? 'টিকেট জমা' : 'Received'}</p>
                    </div>

                    {/* Step 2 */}
                    <div className="space-y-1">
                      <motion.div 
                        animate={currentStep >= 2 ? { scale: [1, 1.06, 1] } : {}}
                        transition={{ duration: 1.5, repeat: currentStep === 2 ? Infinity : 0, repeatDelay: 2 }}
                        className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs shadow-sm ${
                          currentStep >= 2 ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        2
                      </motion.div>
                      <p className="font-bold text-slate-800">{lang === 'bn' ? 'নোক রিভিউ' : 'NOC Review'}</p>
                    </div>

                    {/* Step 3 */}
                    <div className="space-y-1">
                      <motion.div 
                        animate={currentStep >= 3 ? { scale: [1, 1.08, 1] } : {}}
                        transition={{ duration: 1.5, repeat: currentStep === 3 ? Infinity : 0, repeatDelay: 1.5 }}
                        className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs shadow-sm ${
                          currentStep >= 3 ? 'bg-amber-500 text-slate-950 font-extrabold shadow-amber-200' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        3
                      </motion.div>
                      <p className="font-bold text-slate-800">{lang === 'bn' ? 'কাজ চলছে' : 'In Progress'}</p>
                    </div>

                    {/* Step 4 */}
                    <div className="space-y-1">
                      <motion.div 
                        animate={currentStep >= 4 ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 1.2, repeat: 0 }}
                        className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs shadow-sm ${
                          currentStep >= 4 ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        4
                      </motion.div>
                      <p className="font-bold text-slate-800">{lang === 'bn' ? 'সমাধান' : 'Resolved'}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs md:text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {ticket.description}
                </p>

                {/* Conversation Updates */}
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <span>{lang === 'bn' ? 'নোক টিম বার্তা ও কমেন্ট থ্রেড:' : 'NOC Update Thread:'}</span>
                  </p>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {ticket.comments.map((comm) => (
                      <div
                        key={comm.id}
                        className={`p-3 rounded-xl text-xs space-y-1 ${
                          comm.role === 'Client'
                            ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 ml-6'
                            : 'bg-slate-100 border border-slate-200 text-slate-900 mr-6'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-[11px]">
                          <span>{comm.author} ({comm.role})</span>
                          <span className="text-slate-400 font-mono">
                            {new Date(comm.timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p>{comm.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Client Comment Box */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={lang === 'bn' ? 'আপনার মন্তব্য বা আপডেট লিখুন...' : 'Write message to NOC team...'}
                      value={commentTextMap[ticket.id] || ''}
                      onChange={(e) => setCommentTextMap(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 bg-slate-50"
                    />
                    <button
                      onClick={() => handleSendComment(ticket.id)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'পাঠান' : 'Send'}</span>
                    </button>
                  </div>
                </div>

                {/* Rating box for Resolved Tickets */}
                {ticket.status === 'Resolved' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <p className="text-xs font-bold text-emerald-900">
                        {lang === 'bn' ? 'টিকেট সমাধান ফিডব্যাক ও রেটিং দিন:' : 'Rate Delta Mithapukur Resolution:'}
                      </p>
                    </div>

                    {ticket.rating ? (
                      <div className="text-xs text-emerald-800">
                        <span className="font-bold">আপনার রেটিং: {ticket.rating} ⭐</span>
                        {ticket.feedback && <p className="italic mt-1">"{ticket.feedback}"</p>}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRatingMap(prev => ({ ...prev, [ticket.id]: star }))}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star className={`w-5 h-5 ${
                                (ratingMap[ticket.id] || 5) >= star 
                                  ? 'text-amber-500 fill-amber-500' 
                                  : 'text-slate-300'
                              }`} />
                            </button>
                          ))}
                        </div>

                        <input
                          type="text"
                          placeholder={lang === 'bn' ? 'সংক্ষিপ্ত ফিডব্যাক লিখুন...' : 'Write feedback...'}
                          value={feedbackMap[ticket.id] || ''}
                          onChange={(e) => setFeedbackMap(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                          className="w-full p-2 text-xs rounded-lg border border-emerald-300 bg-white"
                        />

                        <button
                          onClick={() => handleRateSubmit(ticket.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm"
                        >
                          {lang === 'bn' ? 'রেটিং জমা দিন' : 'Submit Rating'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
