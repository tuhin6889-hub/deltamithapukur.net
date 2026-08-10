import React, { useState, useEffect } from 'react';
import { Ticket, NotificationLog, UserRole } from '../types';
import { DeltaLogo } from './DeltaLogo';
import { 
  Mail, 
  Send, 
  Inbox, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  Sparkles, 
  User, 
  Clock, 
  ArrowRight, 
  Sliders, 
  ExternalLink,
  ShieldAlert,
  FileText,
  Copy,
  Check
} from 'lucide-react';

interface EmailCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: Ticket[];
  notifications: NotificationLog[];
  currentRole: UserRole;
  lang: 'bn' | 'en';
  onSendEmailNotification: (
    ticketId: string, 
    cid: string, 
    message: string, 
    channel: 'Email'
  ) => Promise<void>;
  onCreateInboundEmailTicket: (emailData: {
    fromEmail: string;
    fromName: string;
    subject: string;
    body: string;
    area: string;
  }) => void;
}

export const EmailCenterModal: React.FC<EmailCenterModalProps> = ({
  isOpen,
  onClose,
  tickets,
  notifications,
  currentRole,
  lang,
  onSendEmailNotification,
  onCreateInboundEmailTicket,
}) => {
  const [activeTab, setActiveTab] = useState<'INBOX' | 'COMPOSE' | 'SIMULATE' | 'SETTINGS'>('INBOX');

  // Filter Email Notifications Log
  const emailLogs = notifications.filter(n => n.channel === 'Email');

  // Compose State
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [customBody, setCustomBody] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState<string>('rafiq.mithapukur@gmail.com');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendSuccessMsg, setSendSuccessMsg] = useState<string | null>(null);

  // Inbound Email Simulation State
  const [simEmail, setSimEmail] = useState('latif.balua@gmail.com');
  const [simName, setSimName] = useState('আব্দুল লতিফ (Balua Client)');
  const [simSubject, setSimSubject] = useState('রেড এলওএস বাতি জ্বলছে এবং ইন্টারনেট পুরোপুরি বন্ধ');
  const [simBody, setSimBody] = useState('আমাদের বালুয়া বাজারের ব্রডব্যান্ড অনুতে আজ সকাল ১০টা থেকে লাল বাতি জ্বলছে। অনুগ্রহ করে দ্রুত টেকনিশিয়ান পাঠান।');
  const [simArea, setSimArea] = useState('বালুয়া মাসিমপুর (Balua Masimpur)');
  const [simulating, setSimulating] = useState(false);
  const [simSuccessMsg, setSimSuccessMsg] = useState<string | null>(null);

  // Settings State
  const [smtpSettings, setSmtpSettings] = useState({
    smtpHost: 'smtp.deltamithapukur.com',
    smtpPort: '587',
    smtpUser: 'noc-alerts@deltamithapukur.com',
    senderName: 'Delta Mithapukur ISP NOC Desk',
    supportEmail: 'support@deltamithapukur.com',
    nocEmail: 'noc@deltamithapukur.com',
    managerEmail: 'manager@deltamithapukur.com',
    autoNotifyClientOnTicket: true,
    autoNotifyNocOnTicket: true,
    autoNotifyManagerOnUrgent: true,
    status: 'Connected (SMTP 587)',
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Fetch email settings from server on mount
  useEffect(() => {
    if (isOpen) {
      fetch('/api/email/settings')
        .then(res => res.json())
        .then(data => {
          if (data.settings) setSmtpSettings(data.settings);
        })
        .catch(err => console.error('Failed to load email config:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Selected Ticket for Compose
  const currentComposeTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];

  const handleSendCustomEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !customBody) return;

    setIsSending(true);
    setSendSuccessMsg(null);

    try {
      await onSendEmailNotification(
        currentComposeTicket?.id || 'T-GENERAL',
        currentComposeTicket?.cid || 'CID-1001',
        customBody,
        'Email'
      );
      setSendSuccessMsg(
        lang === 'bn' 
          ? `ইমেইল সফলভাবে পাঠানো হয়েছে: ${recipientEmail}` 
          : `Email successfully dispatched to ${recipientEmail}`
      );
      setCustomBody('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const handleSimulateInboundEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    setSimSuccessMsg(null);

    try {
      const res = await fetch('/api/email/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromEmail: simEmail,
          fromName: simName,
          subject: simSubject,
          body: simBody,
          area: simArea,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onCreateInboundEmailTicket({
          fromEmail: simEmail,
          fromName: simName,
          subject: simSubject,
          body: simBody,
          area: simArea,
        });
        setSimSuccessMsg(
          lang === 'bn'
            ? `ইমেইল গ্রহণ করা হয়েছে এবং নতুন টিকেট #${data.ticket.id} তৈরি হয়েছে!`
            : `Client email received and new ticket #${data.ticket.id} generated!`
        );
      }
    } catch (e) {
      console.error('Failed to simulate inbound email:', e);
    } finally {
      setSimulating(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSavedMsg(null);

    try {
      const res = await fetch('/api/email/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpSettings),
      });
      const data = await res.json();
      if (data.success) {
        setSettingsSavedMsg(
          lang === 'bn' 
            ? 'ইমেইল সার্ভার কনফিগারেশন আপডেট হয়েছে!' 
            : 'SMTP & Email Configuration updated successfully!'
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 my-auto overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-5 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>{lang === 'bn' ? 'ইমেইল সাপোর্ট ও অ্যাকশন সেন্টার' : 'Email Support & Action Center'}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {smtpSettings.status}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'bn' 
                  ? 'ইমেইলের মাধ্যমে ক্লায়েন্ট সাপোর্ট রিসিভ করা ও ট্র্যাক করার সিস্টেম' 
                  : 'Receive, track & dispatch client ticket updates via Email'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('INBOX')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'INBOX'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ইনবক্স ও নোটিফিকেশন লগ' : 'Email Logs & Tracking'}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-blue-300">
              {emailLogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('COMPOSE')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'COMPOSE'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ইমেইল ডিসপ্যাচ / রিপ্লাই' : 'Dispatch Email Update'}</span>
          </button>

          <button
            onClick={() => setActiveTab('SIMULATE')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'SIMULATE'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{lang === 'bn' ? 'ইনবাউন্ড ইমেইল রিসিভ টেস্ট' : 'Simulate Client Email'}</span>
          </button>

          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'SETTINGS'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>{lang === 'bn' ? 'সার্ভার ও SMTP সেটিংস' : 'SMTP Configuration'}</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          
          {/* TAB 1: EMAIL INBOX & LOGS */}
          {activeTab === 'INBOX' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span>{lang === 'bn' ? 'ইমেইল নোটিফিকেশন ও অ্যাকশন ট্র্যাকার' : 'Tracked Email Notifications'}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn' 
                      ? 'পোর্টাল থেকে পাঠানো বা প্রাপ্ত সকল ইমেইল মেসেজের রিয়েলটাইম রেকর্ড' 
                      : 'All automated and manual email notifications logged in real-time'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    Official Support Email: support@deltamithapukur.com
                  </span>
                </div>
              </div>

              {emailLogs.length === 0 ? (
                <div className="p-12 text-center bg-slate-950/60 rounded-2xl border border-slate-800">
                  <Mail className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">
                    {lang === 'bn' ? 'এখনো কোনো ইমেইল পাঠানো হয়নি।' : 'No email alerts logged yet.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('SIMULATE')}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'টেস্ট ইমেইল পাঠিয়ে ইমেইল রিসিভ টেস্ট করুন' : 'Test Inbound Email Trigger'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {emailLogs.map((log, idx) => (
                    <div 
                      key={log.id || idx}
                      className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold border border-blue-500/30">
                            EMAIL ALERT
                          </span>
                          <span className="text-xs font-bold text-slate-200">
                            Ticket #{log.ticketId} ({log.cid})
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Delivered via SMTP</span>
                        </span>
                      </div>

                      <div className="text-xs font-bold text-white">
                        {log.title}
                      </div>

                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
                        {log.message}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span className="font-mono">
                          Recipient: <strong className="text-slate-200">{log.recipient}</strong> ({log.recipientType})
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`Ticket #${log.ticketId}\n${log.title}\n${log.message}`);
                            setCopiedIndex(idx);
                            setTimeout(() => setCopiedIndex(null), 2000);
                          }}
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedIndex === idx ? 'Copied' : 'Copy Email Log'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COMPOSE / DISPATCH CUSTOM EMAIL */}
          {activeTab === 'COMPOSE' && (
            <form onSubmit={handleSendCustomEmail} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'bn' ? 'ক্লায়েন্ট বা টিমকে সরাসরি ইমেইল পাঠান' : 'Dispatch Email Update'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'bn' 
                    ? 'ডেল্টা মিঠাপুকুর সাপোর্ট টিম থেকে সরাসরি ইমেইল নোটিফিকেশন পাঠান' 
                    : 'Send branded support updates via Delta Mithapukur official SMTP server'}
                </p>
              </div>

              {sendSuccessMsg && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{sendSuccessMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Select Ticket */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'সংশ্লিষ্ট টিকেট পছন্দ করুন' : 'Select Ticket Context'}
                  </label>
                  <select
                    value={selectedTicketId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedTicketId(id);
                      const t = tickets.find(x => x.id === id);
                      if (t) {
                        setCustomSubject(`[Delta Mithapukur ISP] Action Update on Ticket #${t.id} - ${t.title}`);
                      }
                    }}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {tickets.map(t => (
                      <option key={t.id} value={t.id}>
                        #{t.id} - {t.clientName} ({t.cid}) - {t.title.slice(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recipient Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'গ্রাহকের ইমেইল ঠিকানা (Recipient Email)' : 'Recipient Email Address'}
                  </label>
                  <input
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="e.g. rafiq.mithapukur@gmail.com"
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Email Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'bn' ? 'ইমেইল সাবজেক্ট (Subject)' : 'Email Subject'}
                </label>
                <input
                  type="text"
                  required
                  value={customSubject || `[Delta Mithapukur ISP] Support Ticket #${currentComposeTicket?.id} Update`}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              {/* Email Body */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'bn' ? 'ইমেইল বিবরণী ও অ্যাকশন মেসেজ (Message Body)' : 'Message Body & Action Details'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  placeholder={lang === 'bn' ? 'ইমেইলের মূল বিষয়বস্তু ও দিকনির্দেশনা লিখুন...' : 'Type your email response or status notification here...'}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                />
              </div>

              {/* Live Branded HTML Email Preview */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    {lang === 'bn' ? 'ব্র্যান্ডেড ইমেইল প্রিভিউ (Branded HTML Template)' : 'Branded HTML Email Preview:'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">From: support@deltamithapukur.com</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-slate-200 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-extrabold text-blue-400">📡 Delta Mithapukur ISP & NOC Support Desk</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono">Official Email</span>
                  </div>
                  <p className="text-slate-300">
                    <strong>To:</strong> {recipientEmail} | <strong>Ticket context:</strong> #{currentComposeTicket?.id} ({currentComposeTicket?.cid})
                  </p>
                  <p className="text-slate-100 font-bold">{customSubject || 'Ticket Status Notification'}</p>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 italic">
                    {customBody || 'your update message will appear here in clean formatted HTML...'}
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1">
                    Mithapukur Sadar, Rangpur | NOC Hotline: +880 1700-000000 | support@deltamithapukur.com
                  </div>
                </div>
              </div>

              {/* Submit Dispatch Button */}
              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 active:scale-98"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'ইমেইল সেন্ড করুন' : 'Dispatch Email Now'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: SIMULATE INBOUND CLIENT EMAIL */}
          {activeTab === 'SIMULATE' && (
            <form onSubmit={handleSimulateInboundEmail} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'bn' ? 'ক্লায়েন্টের ইমেইল প্রাপ্তি সিমুলেশন' : 'Simulate Incoming Client Email'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'bn' 
                    ? 'গ্রাহক যখন support@deltamithapukur.com এ ইমেইল পাঠায়, সেটি স্বয়ংক্রিয়ভাবে টিকেটে রূপান্তরিত হয়' 
                    : 'Test how client emails sent to support@deltamithapukur.com convert automatically into trackable tickets'}
                </p>
              </div>

              {simSuccessMsg && (
                <div className="p-3.5 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center gap-2 text-amber-300 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{simSuccessMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'প্রেরকের নাম (Sender Name)' : 'Client Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'প্রেরকের ইমেইল (Client Email)' : 'Client Email Address'}
                  </label>
                  <input
                    type="email"
                    required
                    value={simEmail}
                    onChange={(e) => setSimEmail(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'এলাকা (Client Area)' : 'Client Location / Area'}
                  </label>
                  <input
                    type="text"
                    required
                    value={simArea}
                    onChange={(e) => setSimArea(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'ইমেইল বিষয় (Email Subject)' : 'Email Subject Line'}
                  </label>
                  <input
                    type="text"
                    required
                    value={simSubject}
                    onChange={(e) => setSimSubject(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {lang === 'bn' ? 'ইমেইল বার্তা বিবরণী (Email Body Content)' : 'Email Body / Issue Description'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={simBody}
                  onChange={(e) => setSimBody(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={simulating}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 active:scale-98"
              >
                {simulating ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'ইনবাউন্ড ইমেইল টিকেট টেস্ট করুন' : 'Simulate Receiving Inbound Email'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 4: SMTP & SERVER CONFIGURATION */}
          {activeTab === 'SETTINGS' && (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                  <Server className="w-4 h-4 text-indigo-400" />
                  <span>{lang === 'bn' ? 'ইমেইল সার্ভার ও অটোনটিফিকেশন সেটিংস' : 'SMTP Server & Automated Triggers'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'bn' 
                    ? 'ডেল্টা মিঠাপুকুর নেটওয়ার্ক এর জন্য ইমেইল সার্ভার কনফিগারেশন' 
                    : 'Manage SMTP credentials, support mailboxes & automated triggers'}
                </p>
              </div>

              {settingsSavedMsg && (
                <div className="p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center gap-2 text-indigo-300 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span>{settingsSavedMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">SMTP Host</label>
                  <input
                    type="text"
                    value={smtpSettings.smtpHost}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpHost: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">SMTP Port</label>
                  <input
                    type="text"
                    value={smtpSettings.smtpPort}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpPort: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Support Desk Email</label>
                  <input
                    type="email"
                    value={smtpSettings.supportEmail}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, supportEmail: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">NOC Team Alert Email</label>
                  <input
                    type="email"
                    value={smtpSettings.nocEmail}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, nocEmail: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Switches / Triggers */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  {lang === 'bn' ? 'স্বয়ংক্রিয় ইমেইল ট্রিগার (Automated Triggers):' : 'Automated Trigger Rules:'}
                </span>

                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                  <span>{lang === 'bn' ? 'টিকেট ক্রিয়েট বা আপডেট হলে গ্রাহককে অটো ইমেইল পাঠান' : 'Auto-email Client when ticket is created/updated'}</span>
                  <input
                    type="checkbox"
                    checked={smtpSettings.autoNotifyClientOnTicket}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, autoNotifyClientOnTicket: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-500 focus:ring-0 bg-slate-900 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                  <span>{lang === 'bn' ? 'নতুন টিকেট তৈরি হলে নোক টিমকে ইমেইল অ্যালার্ট পাঠান' : 'Auto-alert NOC Team via Email on new tickets'}</span>
                  <input
                    type="checkbox"
                    checked={smtpSettings.autoNotifyNocOnTicket}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, autoNotifyNocOnTicket: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-500 focus:ring-0 bg-slate-900 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                  <span>{lang === 'bn' ? 'জরুরি (Urgent) টিকেটে ব্রাঞ্চ ম্যানেজারকে কপি ইমেইল পাঠান' : 'Copy Branch Manager on Urgent ticket escalations'}</span>
                  <input
                    type="checkbox"
                    checked={smtpSettings.autoNotifyManagerOnUrgent}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, autoNotifyManagerOnUrgent: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-500 focus:ring-0 bg-slate-900 border-slate-700"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {savingSettings ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{lang === 'bn' ? 'সেটিংস সংরক্ষণ করুন' : 'Save Email Configuration'}</span>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Delta Mithapukur NOC Support Mailer v2.4</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close Window'}
          </button>
        </div>

      </div>
    </div>
  );
};
