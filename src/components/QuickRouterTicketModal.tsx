import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Flame, 
  Wifi, 
  Activity, 
  Phone, 
  MessageCircle, 
  Sparkles, 
  Mic, 
  ShieldCheck, 
  Clock, 
  User, 
  MapPin, 
  Cpu, 
  Zap, 
  Check 
} from 'lucide-react';
import { ClientInfo, TicketCategory, TicketPriority } from '../types';
import { VoiceDictationPanel } from './VoiceDictationPanel';

interface QuickRouterTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientInfo | null;
  onSubmitTicket: (data: {
    cid: string;
    clientName: string;
    clientPhone: string;
    clientAddress: string;
    area: string;
    packageSpeed: string;
    category: TicketCategory;
    title: string;
    description: string;
    priority: TicketPriority;
  }) => void;
  lang: 'bn' | 'en';
}

interface IssuePreset {
  id: string;
  category: TicketCategory;
  title: string;
  priority: TicketPriority;
  icon: string;
  descriptionSnippet: string;
  badgeColor: string;
}

export const QuickRouterTicketModal: React.FC<QuickRouterTicketModalProps> = ({
  isOpen,
  onClose,
  client,
  onSubmitTicket,
  lang,
}) => {
  const [selectedIssueId, setSelectedIssueId] = useState<string>('los');
  const [customNote, setCustomNote] = useState('');
  const [showVoice, setShowVoice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  if (!isOpen || !client) return null;

  const issuePresets: IssuePreset[] = [
    {
      id: 'los',
      category: 'রেড এলওএস বাতি (Red LOS Light)',
      title: lang === 'bn' ? 'রাউটার/ওএনইউ তে রেড এলওএস (LOS) বাতি জ্বলছে' : 'Red LOS Light Blinking on ONU/Router',
      priority: 'Urgent',
      icon: '🔴',
      descriptionSnippet: lang === 'bn' 
        ? 'আমার রাউটার/ওএনইউ বক্সে লাল রঙের LOS বাতি জ্বলছে এবং ইন্টারনেট কানেকশন পাওয়া যাচ্ছে না। অনুগ্রহ করে লাইন চেক করুন।' 
        : 'Red LOS optical alarm blinking on ONU device. Fiber signal is interrupted. Please dispatch technician.',
      badgeColor: 'border-rose-500/60 bg-rose-500/10 text-rose-300',
    },
    {
      id: 'fiber_down',
      category: 'ফাইবার সংযোগ বিচ্ছিন্ন (Fiber Line Down)',
      title: lang === 'bn' ? 'ইন্টারনেট সম্পূর্ণ বন্ধ / ফাইবার সংযোগ বিচ্ছিন্ন' : 'Total Internet Outage / Fiber Line Down',
      priority: 'Urgent',
      icon: '⚡',
      descriptionSnippet: lang === 'bn'
        ? 'ইন্টারনেট সম্পূর্ণভাবে বন্ধ হয়ে গেছে। রাউটার রিস্টার্ট দিয়েও সংযোগ আসছে না।'
        : 'Total connection outage. Router rebooted but optical signal is not reaching the device.',
      badgeColor: 'border-amber-500/60 bg-amber-500/10 text-amber-300',
    },
    {
      id: 'slow_ping',
      category: 'উচ্চ পিং ও স্লো স্পিড (High Ping / Slow Speed)',
      title: lang === 'bn' ? 'ইন্টারনেট অত্যন্ত স্লো ও হাই পিং সমস্যা' : 'Severe Speed Drop & High Latency/Ping',
      priority: 'High',
      icon: '🐢',
      descriptionSnippet: lang === 'bn'
        ? 'প্যাকেজ অনুযায়ী স্পিড পাওয়া যাচ্ছে না এবং ব্রাউজিংয়ে অনেক লোডিং হচ্ছে ও পিং বেশি।'
        : 'Bandwidth is severely throttled with high latency spikes and packet drop.',
      badgeColor: 'border-yellow-500/60 bg-yellow-500/10 text-yellow-300',
    },
    {
      id: 'router_wifi',
      category: 'রাউটার ও কনফিগারেশন (Router / Config)',
      title: lang === 'bn' ? 'রাউটার ওয়াইফাই সিগন্যাল ও পাসওয়ার্ড সমস্যা' : 'WiFi Signal & Router Configuration Issue',
      priority: 'Medium',
      icon: '📶',
      descriptionSnippet: lang === 'bn'
        ? 'রাউটার ওয়াইফাই সিগন্যাল ঠিকমতো ছড়াচ্ছে না বা কনফিগারেশন রিস্টোর করতে হবে।'
        : 'WiFi range degraded or router settings require NOC reset/reconfiguration.',
      badgeColor: 'border-teal-500/60 bg-teal-500/10 text-teal-300',
    },
    {
      id: 'billing',
      category: 'বিলিং ও পেমেন্ট (Billing & Payment)',
      title: lang === 'bn' ? 'বিল পরিশোধ বা প্যাকেজ আপগ্রেড সংক্রান্ত' : 'Billing Verification or Package Upgrade',
      priority: 'Low',
      icon: '💳',
      descriptionSnippet: lang === 'bn'
        ? 'বিল পরিশোধ সংক্রান্ত নিশ্চিতকরণ বা প্যাকেজ পরিবর্তনের জন্য আবেদন।'
        : 'Billing payment acknowledgment or monthly package change request.',
      badgeColor: 'border-indigo-500/60 bg-indigo-500/10 text-indigo-300',
    },
    {
      id: 'others',
      category: 'অন্যান্য (Others)',
      title: lang === 'bn' ? 'অন্যান্য নেটওয়ার্ক সমস্যা' : 'Other Network / Line Issue',
      priority: 'High',
      icon: '🛠️',
      descriptionSnippet: lang === 'bn'
        ? 'জরুরি কারিগরি সহায়তা প্রয়োজন।'
        : 'Requires immediate technical inspection.',
      badgeColor: 'border-sky-500/60 bg-sky-500/10 text-sky-300',
    }
  ];

  const currentPreset = issuePresets.find(p => p.id === selectedIssueId) || issuePresets[0];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const fullDescription = customNote.trim() 
      ? `${currentPreset.descriptionSnippet}\n\n[অতিরিক্ত তথ্য / নোট]: ${customNote.trim()}\n(Auto-reported via Physical Router Support QR Sticker)`
      : `${currentPreset.descriptionSnippet}\n(Auto-reported via Physical Router Support QR Sticker)`;

    setTimeout(() => {
      onSubmitTicket({
        cid: client.cid,
        clientName: client.name,
        clientPhone: client.phone,
        clientAddress: client.address,
        area: client.area,
        packageSpeed: client.package,
        category: currentPreset.category,
        title: currentPreset.title,
        description: fullDescription,
        priority: currentPreset.priority,
      });

      setIsSubmitting(false);
      setIsSubmittedSuccess(true);
      setTimeout(() => {
        setIsSubmittedSuccess(false);
        onClose();
      }, 1800);
    }, 400);
  };

  // WhatsApp 1-Click Direct Chat with pre-formatted diagnostic payload
  const handleOpenWhatsApp = () => {
    const message = encodeURIComponent(
      `🚨 [DELTA NOC SUPPORT TICKET]\n\n` +
      `👤 Client: ${client.name} (${client.cid})\n` +
      `📍 Area: ${client.area}\n` +
      `📦 Package: ${client.package}\n` +
      `🌐 IP: ${client.ipAddress} | ONU: ${client.onuMac}\n` +
      `📊 Optical Power: ${client.opticalPower}\n` +
      `⚠️ Issue: ${currentPreset.title}\n` +
      (customNote.trim() ? `📝 Note: ${customNote.trim()}\n` : '') +
      `\n(Scanned via Physical Router QR Sticker)`
    );

    window.open(`https://wa.me/8801719394430?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans overflow-y-auto">
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-syne">
                  {lang === 'bn' ? 'রাউটার কিউআর তাৎক্ষণিক টিকেট' : 'Quick Router QR Support Ticket'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                  AUTO-MATCHED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {lang === 'bn' 
                  ? 'আপনার রাউটারের কিউআর কোড স্ক্যান সফল হয়েছে। সমস্যা বাছাই করে ১-ক্লিকে সাবমিট করুন।' 
                  : 'Router QR successfully scanned. Pick your issue and submit ticket in 1-click.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {isSubmittedSuccess ? (
            <div className="py-10 text-center space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500/50 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-white font-syne">
                {lang === 'bn' ? 'সাপোর্ট টিকেট সফলভাবে তৈরি হয়েছে!' : 'Support Ticket Created Successfully!'}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {lang === 'bn' 
                  ? `টিকেটটি নোক সেন্টারে পৌঁছানো হয়েছে। ইঞ্জিনিয়ার দ্রুত আপনার সংযোগটি পরীক্ষা করে সমাধান করবেন।` 
                  : `Your ticket has been dispatched to Delta NOC engineers. We are investigating your line.`}
              </p>
            </div>
          ) : (
            <>
              {/* Client Diagnostics Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {lang === 'bn' ? 'শনাক্তকৃত গ্রাহক ও রাউটার তথ্য' : 'Verified Subscriber & Device'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-emerald-400 font-mono font-bold text-xs border border-slate-800">
                    {client.cid}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Subscriber</span>
                    <span className="font-bold text-white truncate block">{client.name}</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Area / POP</span>
                    <span className="font-bold text-slate-300 truncate block">{client.area}</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Package</span>
                    <span className="font-bold text-emerald-400 truncate block">{client.package}</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Optical Power</span>
                    <span className="font-mono font-bold text-amber-400 truncate block">{client.opticalPower}</span>
                  </div>
                </div>
              </div>

              {/* 1-Tap Quick Issue Selector */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>{lang === 'bn' ? '১. আপনার সমস্যা বাছাই করুন (1-Tap Selection)' : '1. Select Your Issue'}</span>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    Priority: <strong>{currentPreset.priority}</strong>
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {issuePresets.map(preset => {
                    const isSelected = selectedIssueId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedIssueId(preset.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer relative ${
                          isSelected
                            ? 'bg-slate-800/95 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500/40'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <span className="text-lg flex-shrink-0 mt-0.5">{preset.icon}</span>
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-xs font-bold leading-tight">{preset.title}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{preset.category}</p>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center flex-shrink-0 absolute right-2.5 top-3">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Custom Note / Voice Dictation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {lang === 'bn' ? '২. অতিরিক্ত কোনো মন্তব্য বা লক্ষণ (ঐচ্ছিক)' : '2. Additional Notes (Optional)'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowVoice(!showVoice)}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{showVoice ? (lang === 'bn' ? 'ভয়েস প্যানেল বন্ধ' : 'Hide Voice') : (lang === 'bn' ? 'মুখে বাংলায় বলুন' : 'Voice Input')}</span>
                  </button>
                </div>

                {showVoice && (
                  <div className="mb-2">
                    <VoiceDictationPanel
                      lang={lang}
                      onTranscriptUpdate={(text) => setCustomNote(prev => prev ? `${prev} ${text}` : text)}
                      targetField="description"
                    />
                  </div>
                )}

                <textarea
                  rows={2}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: সকাল ১০টা থেকে লাইন বন্ধ, রাউটার লাল বাতি জ্বলছে...' : 'e.g. Red light started at 10 AM, rebooted twice...'}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* 1-Click Ticket Submit */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmitting 
                      ? (lang === 'bn' ? 'টিকেট সাবমিট হচ্ছে...' : 'Submitting Ticket...') 
                      : (lang === 'bn' ? 'তাৎক্ষণিক সাপোর্ট টিকেট ওপেন করুন' : 'Submit Support Ticket (1-Click)')}
                  </span>
                </button>

                {/* Direct WhatsApp Support */}
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="w-full py-3 px-4 bg-emerald-950/80 hover:bg-[#25D366]/20 text-[#25D366] font-bold rounded-xl text-xs border border-emerald-800/80 hover:border-[#25D366]/60 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>
                    {lang === 'bn' ? 'হোয়াটসঅ্যাপে সরাসরি পাঠান' : 'Send via WhatsApp (01719394430)'}
                  </span>
                </button>

              </div>
            </>
          )}

        </div>

        {/* Modal Footer Info */}
        <div className="px-5 py-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>NOC SLA Response Time: &lt; 15 Mins</span>
          </div>
          <span>24/7 Helpline: 01719394430</span>
        </div>

      </div>
    </div>
  );
};
