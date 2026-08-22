import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, NocStaff, TicketStatus, TicketPriority } from '../types';
import { TicketStatusBadge } from './TicketStatusBadge';
import { 
  X, 
  Send, 
  Sparkles, 
  MessageSquare, 
  User, 
  Phone, 
  MapPin, 
  Activity, 
  CheckCircle2, 
  Zap, 
  Share2, 
  BellRing,
  Clock,
  ShieldCheck,
  RefreshCw,
  Home,
  Check
} from 'lucide-react';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  nocStaff: NocStaff[];
  onUpdateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  onAssignNocStaff: (ticketId: string, staffName: string) => void;
  onAddComment: (ticketId: string, text: string) => void;
  onSendManualNotification: (ticketId: string, cid: string, message: string, channel: 'WhatsApp' | 'Email' | 'SMS') => void;
  onTriggerAiDiagnosis: (ticket: Ticket) => Promise<void>;
  aiLoading: boolean;
  lang: 'bn' | 'en';
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  onClose,
  nocStaff,
  onUpdateTicketStatus,
  onAssignNocStaff,
  onAddComment,
  onSendManualNotification,
  onTriggerAiDiagnosis,
  aiLoading,
  lang,
}) => {
  const [commentText, setCommentText] = useState('');
  const [notifSuccessMsg, setNotifSuccessMsg] = useState('');

  if (!ticket) return null;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(ticket.id, commentText);
    setCommentText('');
  };

  const handleTriggerWhatsApp = () => {
    const msg = `[Delta Mithapukur Alert] Ticket #${ticket.id} (${ticket.cid}) status is now ${ticket.status}. Customer: ${ticket.clientName}. Issue: ${ticket.title}`;
    onSendManualNotification(ticket.id, ticket.cid, msg, 'WhatsApp');
    setNotifSuccessMsg('WhatsApp alert dispatched to Manager & Client!');
    setTimeout(() => setNotifSuccessMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 text-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-xs font-bold bg-slate-900 text-teal-300 px-2.5 py-0.5 rounded">
                #{ticket.id}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800 font-mono">
                {ticket.cid}
              </span>
              <span className="text-xs font-semibold text-slate-500">• {ticket.area}</span>

              {/* Animated Status Indicator Badge */}
              <TicketStatusBadge status={ticket.status} lang={lang} size="sm" />
            </div>

            <h2 className="text-xl font-extrabold text-slate-900">{ticket.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 active:scale-95"
              title="Return to Home Page"
            >
              <Home className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'হোম পেজ' : 'Home Page'}</span>
            </button>

            <button 
              onClick={onClose}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Client & Connection Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <span className="text-slate-400 block">{lang === 'bn' ? 'গ্রাহক' : 'Client'}</span>
            <span className="font-bold text-slate-900">{ticket.clientName}</span>
          </div>

          <div>
            <span className="text-slate-400 block">{lang === 'bn' ? 'ফোন' : 'Phone'}</span>
            <span className="font-mono font-bold text-slate-900">{ticket.clientPhone}</span>
          </div>

          <div>
            <span className="text-slate-400 block">{lang === 'bn' ? 'প্যাকেজ' : 'Package'}</span>
            <span className="font-semibold text-emerald-700">{ticket.packageSpeed}</span>
          </div>

          <div>
            <span className="text-slate-400 block">{lang === 'bn' ? 'অপটিক্যাল পাওয়ার' : 'Rx Power'}</span>
            <span className="font-mono font-bold text-rose-600">{ticket.opticalPower || '-22.4 dBm'}</span>
          </div>

          <div>
            <span className="text-slate-400 block">{lang === 'bn' ? 'গেটওয়ে পিং' : 'Ping Latency'}</span>
            <span className="font-mono font-bold text-slate-900">{ticket.pingMs ? `${ticket.pingMs} ms` : '18 ms'}</span>
          </div>

          <div>
            <span className="text-slate-400 block">{lang === 'bn' ? 'এলাকা' : 'Area'}</span>
            <span className="font-semibold text-slate-800">{ticket.area}</span>
          </div>
        </div>

        {/* Controls Bar: Status & Assignee */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900 text-white rounded-2xl text-xs border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">{lang === 'bn' ? 'স্ট্যাটাস পরিবর্তন:' : 'Update Status:'}</span>
            <select
              value={ticket.status}
              onChange={(e) => onUpdateTicketStatus(ticket.id, e.target.value as TicketStatus)}
              className="px-2.5 py-1.5 font-bold rounded-xl bg-slate-800 border border-slate-700 text-teal-300 focus:ring-2 focus:ring-teal-500 cursor-pointer text-xs"
            >
              <option value="Open">Open (পেন্ডিং)</option>
              <option value="NOC_Assigned">NOC Assigned</option>
              <option value="In_Progress">In Progress (কাজ চলছে)</option>
              <option value="Resolved">Resolved (সমাধান)</option>
              <option value="Closed">Closed (টিকেট বন্ধ)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">{lang === 'bn' ? 'নোক ইঞ্জিনিয়ার:' : 'NOC Assign:'}</span>
            <select
              value={ticket.assignedNoc || ''}
              onChange={(e) => onAssignNocStaff(ticket.id, e.target.value)}
              className="px-2.5 py-1 font-bold rounded-lg bg-slate-800 border border-slate-700 text-teal-300 focus:ring-2 focus:ring-teal-500"
            >
              <option value="">-- Assign NOC --</option>
              {nocStaff.map(staff => (
                <option key={staff.id} value={`${staff.id} (${staff.name.split(' ')[0]})`}>
                  {staff.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-700">{lang === 'bn' ? 'সমস্যার বিস্তারিত বিবরণ:' : 'Problem Details:'}</p>
          <p className="text-xs md:text-sm text-slate-800 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {ticket.description}
          </p>
        </div>

        {/* Action Buttons: WhatsApp Alert Dispatch & AI Diagnostics */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleTriggerWhatsApp}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm"
          >
            <BellRing className="w-4 h-4" />
            <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপ অ্যালার্ট পাঠাও' : 'Send WhatsApp Alert'}</span>
          </button>

          <button
            onClick={() => onTriggerAiDiagnosis(ticket)}
            disabled={aiLoading}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            <span>{aiLoading ? 'Generating AI Guide...' : 'AI NOC Analysis'}</span>
          </button>
        </div>

        {notifSuccessMsg && (
          <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
            ✓ {notifSuccessMsg}
          </p>
        )}

        {/* Display AI Diagnostic Output if present */}
        {ticket.aiDiagnosis && (
          <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl text-xs space-y-2 border border-teal-500/40">
            <div className="flex items-center gap-1.5 text-teal-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>এআই নোক ট্রাবলশুটিং ডায়াগনস্টিক রিপোর্ট:</span>
            </div>
            <p className="text-slate-300">{ticket.aiDiagnosis.summaryBengali}</p>

            <div className="space-y-1 pt-2 border-t border-slate-800">
              <p className="font-bold text-amber-300">🛠️ টেকনিশিয়ান স্প্লাইসিং ও টেস্ট গাইড:</p>
              {ticket.aiDiagnosis.nocSteps.map((s, i) => (
                <p key={i} className="text-slate-300 pl-2">● {s}</p>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800">
              <p className="font-bold text-emerald-400">📲 গ্রাহক হোয়াটসঅ্যাপ ড্রাফট:</p>
              <p className="text-slate-300 italic bg-slate-950 p-2 rounded border border-slate-800">
                "{ticket.aiDiagnosis.clientReplyBengali}"
              </p>
            </div>
          </div>
        )}

        {/* Conversation Thread */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'bn' ? 'যোগাযোগ ও আপডেট থ্রেড:' : 'Ticket Comments Thread:'}</span>
          </p>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {ticket.comments.map((comm) => (
              <div
                key={comm.id}
                className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-200"
              >
                <div className="flex items-center justify-between font-bold text-[11px]">
                  <span className="text-slate-900">{comm.author} ({comm.role})</span>
                  <span className="text-slate-400 font-mono">
                    {new Date(comm.timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-700">{comm.text}</p>
              </div>
            ))}
          </div>

          {/* Add Comment Input */}
          <form onSubmit={handleSendComment} className="flex gap-2">
            <input
              type="text"
              placeholder={lang === 'bn' ? 'কমেন্ট বা আপডেট লিখুন...' : 'Add comment or update...'}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
