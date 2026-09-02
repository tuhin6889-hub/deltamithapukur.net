import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, NocStaff, TicketStatus, TicketPriority } from '../types';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketPriorityBadge, getPriorityColorConfig } from './TicketPriorityBadge';
import { SlaTimer } from './SlaTimer';
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
  Check,
  AlertOctagon,
  Flame,
  Info,
  Printer
} from 'lucide-react';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  nocStaff: NocStaff[];
  onUpdateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  onAssignNocStaff: (ticketId: string, staffName: string) => void;
  onAddComment: (ticketId: string, text: string) => void;
  onSendManualNotification: (
    ticketId: string, 
    cid: string, 
    message: string, 
    channel: 'WhatsApp' | 'Email' | 'SMS',
    options?: {
      simulateFailure?: boolean;
      isEmergencyFallback?: boolean;
      customRecipientPhone?: string;
    }
  ) => void;
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

  const priorityConfig = getPriorityColorConfig(ticket.priority);

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

  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div 
        className={`bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 text-slate-800 max-h-[90vh] overflow-y-auto relative overflow-hidden ${
          ticket.priority === 'Urgent' 
            ? 'border-l-[6px] border-l-rose-500 shadow-rose-500/10 ring-1 ring-rose-500/20' 
            : ticket.priority === 'High' 
            ? 'border-l-[6px] border-l-yellow-400 shadow-yellow-500/10 ring-1 ring-yellow-400/20' 
            : 'border-l-[6px] border-l-blue-500 shadow-blue-500/10 ring-1 ring-blue-500/20'
        }`}
      >
        {/* Subtle Top Priority Color-Coded Header Bar (Red / Yellow / Blue) */}
        <div 
          className={`h-1.5 w-full ${
            ticket.priority === 'Urgent'
              ? 'bg-gradient-to-r from-rose-500 via-rose-400 to-rose-600'
              : ticket.priority === 'High'
              ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500'
              : 'bg-gradient-to-r from-blue-500 via-sky-400 to-blue-600'
          }`} 
        />

        <div className="p-6 space-y-5">
          {/* Subtle Priority Status Scan Banner for NOC Staff */}
          <div 
            className={`p-3 rounded-2xl flex items-center justify-between gap-3 text-xs font-mono border ${
              ticket.priority === 'Urgent'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : ticket.priority === 'High'
                ? 'bg-yellow-50 border-yellow-200 text-yellow-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${priorityConfig.dotColor} ${priorityConfig.isPulsing ? 'animate-ping' : ''}`} />
              <span className="font-bold">
                {lang === 'bn' ? 'নোক ভিজ্যুয়াল স্ট্যাটাস:' : 'NOC Visual Priority:'}{' '}
                <strong className="underline decoration-current">
                  {priorityConfig.name === 'Urgent' ? '🔴 RED / URGENT (২-ঘণ্টা SLA)' : priorityConfig.name === 'High' ? '🟡 YELLOW / HIGH (৪-ঘণ্টা SLA)' : '🔵 BLUE / NORMAL (স্ট্যান্ডার্ড SLA)'}
                </strong>
              </span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/80 border border-current/20">
              {ticket.priority.toUpperCase()} PRIORITY
            </span>
          </div>

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

                {/* Priority & Status Indicator Badges */}
                <TicketPriorityBadge priority={ticket.priority} lang={lang} size="xs" theme="light" />
                <TicketStatusBadge status={ticket.status} lang={lang} size="sm" />
              </div>

              <h2 className="text-xl font-extrabold text-slate-900">{ticket.title}</h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Print Ticket Button for Physical Office Archive */}
              <button
                onClick={handlePrintTicket}
                className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-xl border border-sky-200 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm cursor-pointer"
                title={lang === 'bn' ? 'অফিস আর্কাইভের জন্য প্রিন্ট করুন' : 'Print for Office Physical Archive'}
              >
                <Printer className="w-3.5 h-3.5 text-sky-600" />
                <span>{lang === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
              </button>

              <button
                onClick={onClose}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                title="Return to Home Page"
              >
                <Home className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">{lang === 'bn' ? 'হোম পেজ' : 'Home Page'}</span>
              </button>

              <button 
                onClick={onClose}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full cursor-pointer"
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
              <span className={`font-mono font-bold ${
                ticket.opticalPower?.includes('LOS') || ticket.opticalPower?.includes('-32')
                  ? 'text-rose-600 font-extrabold'
                  : 'text-emerald-700'
              }`}>
                {ticket.opticalPower || '-22.4 dBm'}
              </span>
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

          {/* Priority-Based Service Level Agreement (SLA) Live Timer */}
          <SlaTimer ticket={ticket} lang={lang} variant="card" />

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

          {/* Action Buttons: WhatsApp Alert Dispatch, AI Diagnostics & Print Archive */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTriggerWhatsApp}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <BellRing className="w-4 h-4" />
              <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপ অ্যালার্ট পাঠাও' : 'Send WhatsApp Alert'}</span>
            </button>

            <button
              onClick={() => onTriggerAiDiagnosis(ticket)}
              disabled={aiLoading}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              <span>{aiLoading ? 'Generating AI Guide...' : 'AI NOC Analysis'}</span>
            </button>

            <button
              onClick={handlePrintTicket}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-500/40 hover:border-sky-400 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              title={lang === 'bn' ? 'অফিস আর্কাইভের জন্য প্রিন্ট করুন' : 'Print for Office Physical Archive'}
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>{lang === 'bn' ? 'অফিস আর্কাইভ প্রিন্ট' : 'Print Docket'}</span>
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
                className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* =========================================================================
          PRINTER-FRIENDLY PHYSICAL OFFICE ARCHIVE DOCKET (VISIBLE ON PRINT ONLY)
          ========================================================================= */}
      <div id="printable-ticket-archive" className="hidden print:block font-sans text-black p-6 max-w-4xl mx-auto bg-white">
        {/* Header Strip with Branding & Document Classification */}
        <div className="border-b-2 border-black pb-4 mb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black uppercase tracking-wider text-black">
                Delta Internet Service
              </h1>
              <span className="text-xs font-bold border border-black px-2 py-0.5 rounded">
                Mithapukur NOC
              </span>
            </div>
            <p className="text-xs font-bold text-gray-700 mt-0.5">
              Network Operations & Field Technical Support Center • Mithapukur, Rangpur
            </p>
            <p className="text-[11px] text-gray-600">
              Hotline: +880 1711-000000 | Email: noc@deltamithapukur.net | Web: portal.deltamithapukur.net
            </p>
          </div>
          <div className="text-right border border-black p-2 rounded bg-gray-50 min-w-[200px]">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-700">
              Official Physical Archive
            </span>
            <span className="block text-base font-black font-mono">
              WORK ORDER #{ticket.id}
            </span>
            <span className="block text-[10px] font-mono text-gray-600">
              Print Date: {new Date().toLocaleString('en-GB')}
            </span>
          </div>
        </div>

        {/* Status & Priority Badge Banner */}
        <div className="border border-black bg-gray-100 p-2.5 rounded mb-4 flex items-center justify-between text-xs font-bold font-mono">
          <div>
            <span>PRIORITY: </span>
            <strong className="text-sm underline">
              {ticket.priority.toUpperCase()} ({ticket.priority === 'Urgent' ? '2-Hour Emergency SLA' : ticket.priority === 'High' ? '4-Hour High SLA' : 'Standard SLA'})
            </strong>
          </div>
          <div>
            <span>CURRENT STATUS: </span>
            <strong className="text-sm uppercase border-b-2 border-black pb-0.5">
              {ticket.status}
            </strong>
          </div>
          <div>
            <span>CREATED: </span>
            <span>{ticket.createdDate || new Date().toISOString().split('T')[0]}</span>
          </div>
        </div>

        {/* Core Matrix: Client & Technical Parameters */}
        <div className="mb-4">
          <h2 className="text-xs font-black uppercase tracking-wider bg-black text-white px-2 py-1 mb-1">
            Section 1: Customer & Connection Parameters
          </h2>
          <table className="w-full border-collapse border border-black text-xs">
            <tbody>
              <tr className="border-b border-black">
                <td className="border-r border-black p-2 font-bold bg-gray-100 w-1/4">Customer Name</td>
                <td className="border-r border-black p-2 font-semibold w-1/4">{ticket.clientName}</td>
                <td className="border-r border-black p-2 font-bold bg-gray-100 w-1/4">Customer ID (CID)</td>
                <td className="p-2 font-mono font-bold w-1/4">{ticket.cid}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-2 font-bold bg-gray-100">Contact Number</td>
                <td className="border-r border-black p-2 font-mono">{ticket.clientPhone}</td>
                <td className="border-r border-black p-2 font-bold bg-gray-100">Subscribed Package</td>
                <td className="p-2 font-semibold">{ticket.packageSpeed}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black p-2 font-bold bg-gray-100">Service Area / Node</td>
                <td className="border-r border-black p-2">{ticket.area}</td>
                <td className="border-r border-black p-2 font-bold bg-gray-100">Client Address</td>
                <td className="p-2">{ticket.clientAddress || ticket.area}</td>
              </tr>
              <tr>
                <td className="border-r border-black p-2 font-bold bg-gray-100">Optical Rx Power</td>
                <td className="border-r border-black p-2 font-mono font-bold">
                  {ticket.opticalPower || '-22.4 dBm'}
                </td>
                <td className="border-r border-black p-2 font-bold bg-gray-100">Gateway Latency / Ping</td>
                <td className="p-2 font-mono">
                  {ticket.pingMs ? `${ticket.pingMs} ms` : '18 ms'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Ticket Description & Fault Details */}
        <div className="mb-4 print-avoid-break">
          <h2 className="text-xs font-black uppercase tracking-wider bg-black text-white px-2 py-1 mb-1">
            Section 2: Reported Issue & Incident Details
          </h2>
          <div className="border border-black p-3 rounded text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-gray-300 pb-1.5">
              <span className="font-bold">
                Category: <span className="font-mono">{ticket.category}</span>
              </span>
              <span className="font-bold">
                Assigned NOC Staff: <span className="font-mono">{ticket.assignedNoc || 'Field Tech Roster'}</span>
              </span>
            </div>
            <div>
              <p className="font-bold text-xs">Problem Title: {ticket.title}</p>
              <p className="text-xs text-gray-800 mt-1 whitespace-pre-wrap bg-gray-50 p-2 border border-gray-200 rounded">
                {ticket.description}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Diagnostic & Troubleshooting Guidance (if available) */}
        {ticket.aiDiagnosis && (
          <div className="mb-4 print-avoid-break">
            <h2 className="text-xs font-black uppercase tracking-wider bg-black text-white px-2 py-1 mb-1">
              Section 3: NOC Diagnostic & Field Guidelines
            </h2>
            <div className="border border-black p-3 rounded text-xs space-y-2 bg-gray-50">
              <p className="font-bold">
                Summary: <span className="font-normal">{ticket.aiDiagnosis.summaryBengali}</span>
              </p>
              <div className="border-t border-gray-300 pt-1.5">
                <p className="font-bold mb-1">Field Splicing & Testing Steps:</p>
                <ol className="list-decimal list-inside space-y-0.5 pl-1">
                  {ticket.aiDiagnosis.nocSteps.map((step, idx) => (
                    <li key={idx} className="text-gray-800">{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Communication & Activity History */}
        {ticket.comments.length > 0 && (
          <div className="mb-4 print-avoid-break">
            <h2 className="text-xs font-black uppercase tracking-wider bg-black text-white px-2 py-1 mb-1">
              Section 4: Support Activity & Comments Log
            </h2>
            <table className="w-full border-collapse border border-black text-[11px]">
              <thead>
                <tr className="bg-gray-100 border-b border-black">
                  <th className="border-r border-black p-1 text-left w-24">Timestamp</th>
                  <th className="border-r border-black p-1 text-left w-32">Staff / Role</th>
                  <th className="p-1 text-left">Note / Comment</th>
                </tr>
              </thead>
              <tbody>
                {ticket.comments.map((comm) => (
                  <tr key={comm.id} className="border-b border-black">
                    <td className="border-r border-black p-1 font-mono">{new Date(comm.timestamp).toLocaleString('en-GB')}</td>
                    <td className="border-r border-black p-1 font-bold">{comm.author} ({comm.role})</td>
                    <td className="p-1">{comm.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section 5: Field Resolution & Physical Sign-off Block */}
        <div className="border border-black p-3 rounded mt-4 print-avoid-break bg-gray-50">
          <h2 className="text-xs font-black uppercase tracking-wider border-b border-black pb-1 mb-2">
            Section 5: Physical Field Resolution & Office Sign-Off
          </h2>
          
          <div className="grid grid-cols-2 gap-4 text-xs mb-3">
            <div>
              <p className="font-bold mb-1">Hardware / Equipment Replaced:</p>
              <div className="space-y-1 text-[11px]">
                <label className="flex items-center gap-1.5">
                  <span className="inline-block w-3.5 h-3.5 border border-black" /> [ ] Drop Cable / Fiber Core
                </label>
                <label className="flex items-center gap-1.5">
                  <span className="inline-block w-3.5 h-3.5 border border-black" /> [ ] Optical Network Unit (ONU) - Serial: __________________
                </label>
                <label className="flex items-center gap-1.5">
                  <span className="inline-block w-3.5 h-3.5 border border-black" /> [ ] Patch Cord / Fast Connector / Adapter
                </label>
              </div>
            </div>

            <div>
              <p className="font-bold mb-1">Post-Repair Optical Verification:</p>
              <p className="text-[11px] mb-1">Measured Rx Signal Power: ____________ dBm (Target: -18 to -24 dBm)</p>
              <p className="text-[11px]">Speedtest Verified: ____________ Mbps Download / Upload</p>
            </div>
          </div>

          {/* Signatures Row */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-black text-center text-xs">
            <div>
              <div className="border-b border-black pb-1 mb-1 font-mono">____________________________</div>
              <p className="font-bold">Field Technician Signature</p>
              <p className="text-[10px] text-gray-600">Date: ____/____/2026</p>
            </div>

            <div>
              <div className="border-b border-black pb-1 mb-1 font-mono">____________________________</div>
              <p className="font-bold">NOC Supervisor Seal / Sign</p>
              <p className="text-[10px] text-gray-600">Verified & Approved</p>
            </div>

            <div>
              <div className="border-b border-black pb-1 mb-1 font-mono">____________________________</div>
              <p className="font-bold">Customer Acknowledgment</p>
              <p className="text-[10px] text-gray-600">Service Restored Satisfactorily</p>
            </div>
          </div>
        </div>

        {/* Footer Audit Notice */}
        <div className="mt-4 pt-2 border-t border-gray-300 text-[10px] text-gray-500 flex justify-between">
          <span>Delta Internet Service Mithapukur NOC • Official Physical Archive Record</span>
          <span>Confidential Support Work Order Document</span>
        </div>
      </div>
    </div>
  );
};

