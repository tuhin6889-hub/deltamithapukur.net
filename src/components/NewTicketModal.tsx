import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TicketCategory, TicketPriority, ClientInfo } from '../types';
import { VoiceDictationPanel } from './VoiceDictationPanel';
import { TicketPriorityBadge } from './TicketPriorityBadge';
import { 
  X, 
  Send, 
  AlertCircle, 
  PlusCircle, 
  Sparkles, 
  Mic, 
  Volume2, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Radio
} from 'lucide-react';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientInfo[];
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
  defaultCid?: string | null;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({
  isOpen,
  onClose,
  clients,
  onSubmitTicket,
  lang,
  defaultCid,
}) => {
  const [selectedCid, setSelectedCid] = useState(defaultCid || 'CID-1001');
  const [category, setCategory] = useState<TicketCategory>('রেড এলওএস বাতি (Red LOS Light)');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('High');
  const [showVoicePanel, setShowVoicePanel] = useState(true);
  const [voiceAppliedNotice, setVoiceAppliedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentClient = clients.find(c => c.cid === selectedCid) || clients[0];

  // Intelligent Category & Priority inference from speech
  const autoDetectCategory = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('los') || lower.includes('লাল') || lower.includes('red') || lower.includes('বাতি')) {
      setCategory('রেড এলওএস বাতি (Red LOS Light)');
      setPriority('Urgent');
    } else if (lower.includes('ফাইবার') || lower.includes('তার') || lower.includes('fiber') || lower.includes('cut') || lower.includes('ছিঁড়ে') || lower.includes('ছিড়ে')) {
      setCategory('ফাইবার সংযোগ বিচ্ছিন্ন (Fiber Line Down)');
      setPriority('Urgent');
    } else if (lower.includes('পিং') || lower.includes('ping') || lower.includes('slow') || lower.includes('ধীর') || lower.includes('স্পিড') || lower.includes('speed')) {
      setCategory('উচ্চ পিং ও স্লো স্পিড (High Ping / Slow Speed)');
    } else if (lower.includes('রাউটার') || lower.includes('router') || lower.includes('config') || lower.includes('পাসওয়ার্ড') || lower.includes('reset')) {
      setCategory('রাউটার ও কনফিগারেশন (Router / Config)');
    } else if (lower.includes('বিল') || lower.includes('পেমেন্ট') || lower.includes('bill') || lower.includes('bKash') || lower.includes('টাকা')) {
      setCategory('বিলিং ও পেমেন্ট (Billing & Payment)');
    }
  };

  // Handle Transcript updates from VoiceDictationPanel
  const handleTranscriptChange = (
    transcriptText: string, 
    isFinal: boolean, 
    targetField: 'description' | 'title' | 'both'
  ) => {
    if (!transcriptText) return;

    if (targetField === 'description') {
      setDescription(transcriptText);
      if (!title.trim()) {
        // Auto summarize first few words into title if title is empty
        const words = transcriptText.split(' ');
        const snippet = words.slice(0, 7).join(' ') + (words.length > 7 ? '...' : '');
        setTitle(snippet);
      }
    } else if (targetField === 'title') {
      setTitle(transcriptText);
    } else if (targetField === 'both') {
      setDescription(transcriptText);
      const words = transcriptText.split(' ');
      const snippet = words.slice(0, 7).join(' ') + (words.length > 7 ? '...' : '');
      setTitle(snippet);
    }

    autoDetectCategory(transcriptText);

    if (isFinal) {
      setVoiceAppliedNotice(
        lang === 'bn' 
          ? '✓ ভয়েস রেকর্ড সফলভাবে ফর্মটিতে টাইপ হয়েছে!' 
          : '✓ Voice transcript applied successfully!'
      );
      setTimeout(() => setVoiceAppliedNotice(null), 3500);
    }
  };

  const handleApplyPreset = (presetText: string) => {
    setDescription(presetText);
    const words = presetText.split(' ');
    const snippet = words.slice(0, 7).join(' ') + (words.length > 7 ? '...' : '');
    setTitle(snippet);
    autoDetectCategory(presetText);

    setVoiceAppliedNotice(
      lang === 'bn' ? '✓ প্রম্পট ফর্মটিতে যুক্ত হয়েছে' : '✓ Preset applied to form'
    );
    setTimeout(() => setVoiceAppliedNotice(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onSubmitTicket({
      cid: currentClient.cid,
      clientName: currentClient.name,
      clientPhone: currentClient.phone,
      clientAddress: currentClient.address,
      area: currentClient.area,
      packageSpeed: currentClient.package,
      category,
      title,
      description,
      priority,
    });

    // Reset and close
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-xl w-full shadow-2xl border border-slate-200 text-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-slate-900 text-base">
                  {lang === 'bn' ? 'নতুন সাপোর্ট টিকেট ক্রিয়েট' : 'Create New Support Ticket'}
                </h3>
                <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                  Voice Enabled 🎙️
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {lang === 'bn' ? 'ডেল্টা মিঠাপুকুর নোক টিমকে সরাসরি অবহিতকরণ' : 'Dispatch ticket to Delta Mithapukur NOC'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Voice Dictation Section Toggle Button */}
        <div className="bg-slate-50 rounded-2xl p-1 border border-slate-200">
          <div className="flex items-center justify-between px-3 py-2">
            <button
              type="button"
              onClick={() => setShowVoicePanel(!showVoicePanel)}
              className="flex items-center gap-2 text-xs font-extrabold text-slate-800 hover:text-emerald-600 transition-colors"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                <Mic className="w-3.5 h-3.5" />
              </div>
              <span>
                {lang === 'bn' ? 'ভয়েস রেকর্ডার ও ডিকটেশন প্যানেল' : 'Voice-to-Text Recording Panel'}
              </span>
              {showVoicePanel ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md font-semibold">
              বাংলা / English
            </span>
          </div>

          {/* Collapsible Voice Dictation Panel */}
          <AnimatePresence>
            {showVoicePanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden p-2 pt-0"
              >
                <VoiceDictationPanel
                  onTranscriptChange={handleTranscriptChange}
                  onApplyPreset={handleApplyPreset}
                  appLang={lang}
                  currentTitle={title}
                  currentDescription={description}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Transient Voice Applied Toast */}
        {voiceAppliedNotice && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{voiceAppliedNotice}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs md:text-sm">
          
          {/* Client Select */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {lang === 'bn' ? 'গ্রাহক সিআইডি (CID) নির্বাচন' : 'Client CID Selection'}
            </label>
            <select
              value={selectedCid}
              onChange={(e) => setSelectedCid(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              {clients.map(c => (
                <option key={c.cid} value={c.cid}>
                  {c.cid} - {c.name} ({c.area})
                </option>
              ))}
            </select>
            <div className="mt-1 text-[11px] text-slate-500 bg-slate-100 p-2 rounded-lg flex items-center justify-between">
              <span>ফোন: {currentClient.phone} • এলাকা: {currentClient.area}</span>
              <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-bold">{currentClient.package}</span>
            </div>
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700">
                {lang === 'bn' ? 'সমস্যার ক্যাটাগরি' : 'Problem Category'}
              </label>
              <span className="text-[10px] text-emerald-600 font-bold">
                {lang === 'bn' ? 'ভয়েস অনুযায়ী অটো-ডিটেক্টেড' : 'Auto-detected from Voice'}
              </span>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="রেড এলওএস বাতি (Red LOS Light)">রেড এলওএস বাতি (Red LOS Light)</option>
              <option value="ফাইবার সংযোগ বিচ্ছিন্ন (Fiber Line Down)">ফাইবার সংযোগ বিচ্ছিন্ন (Fiber Line Down)</option>
              <option value="উচ্চ পিং ও স্লো স্পিড (High Ping / Slow Speed)">উচ্চ পিং ও স্লো স্পিড (High Ping / Slow Speed)</option>
              <option value="রাউটার ও কনফিগারেশন (Router / Config)">রাউটার ও কনফিগারেশন (Router / Config)</option>
              <option value="বিলিং ও পেমেন্ট (Billing & Payment)">বিলিং ও পেমেন্ট (Billing & Payment)</option>
              <option value="সংযোগ স্থানান্তর (Shift Connection)">সংযোগ স্থানান্তর (Shift Connection)</option>
              <option value="অন্যান্য (Others)">অন্যান্য (Others)</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700">
                {lang === 'bn' ? 'সমস্যার প্রধান শিরোনাম' : 'Issue Summary Title'}
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {title.length}/100 chars
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                placeholder={lang === 'bn' ? 'যেমন: রাউটারে লাল আলো জ্বলছে, ইন্টারনেট সংযোগ বিচ্ছিন্ন' : 'e.g. Red light blinking on ONU'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-slate-900"
              />
              <button
                type="button"
                onClick={() => {
                  setShowVoicePanel(true);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-200 transition-colors"
                title={lang === 'bn' ? 'ভয়েস দিয়ে টাইপ করুন' : 'Dictate with Voice'}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700">
                {lang === 'bn' ? 'বিস্তারিত বর্ণনা (Bengali/English)' : 'Detailed Problem Description'}
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {description.length} chars
              </span>
            </div>
            <div className="relative">
              <textarea
                rows={3}
                required
                placeholder={lang === 'bn' ? 'কখন থেকে সমস্যা শুরু হয়েছে এবং রাউটার/ONU এর বর্তমান অবস্থা লিখুন...' : 'Describe when the problem started...'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-slate-900 leading-relaxed"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-bold text-slate-700">
                {lang === 'bn' ? 'জরুরি মাত্রা (Priority Level)' : 'Priority Severity'}
              </label>
              <TicketPriorityBadge priority={priority} lang={lang} size="xs" theme="light" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('Urgent')}
                className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  priority === 'Urgent'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-400/40 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-rose-300'
                }`}
              >
                <span className="text-sm">🚨</span>
                <span className="font-extrabold text-rose-700">{lang === 'bn' ? 'জরুরি (Urgent)' : 'Urgent (Red)'}</span>
                <span className="text-[10px] text-slate-400 font-normal">LOS / ফাইবার কাট</span>
              </button>

              <button
                type="button"
                onClick={() => setPriority('High')}
                className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  priority === 'High'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-400/40 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-amber-300'
                }`}
              >
                <span className="text-sm">🔥</span>
                <span className="font-extrabold text-amber-700">{lang === 'bn' ? 'উচ্চ (High)' : 'High (Orange)'}</span>
                <span className="text-[10px] text-slate-400 font-normal">হাই পিং / প্যাকেট লস</span>
              </button>

              <button
                type="button"
                onClick={() => setPriority('Medium')}
                className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  priority === 'Medium' || priority === 'Low'
                    ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-400/40 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-300'
                }`}
              >
                <span className="text-sm">ℹ️</span>
                <span className="font-extrabold text-blue-700">{lang === 'bn' ? 'স্বাভাবিক (Normal)' : 'Normal (Blue)'}</span>
                <span className="text-[10px] text-slate-400 font-normal">বিলিং / কনফিগ</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{lang === 'bn' ? 'টিকেট সাবমিট করুন' : 'Submit Ticket Now'}</span>
          </button>

        </form>

      </div>
    </div>
  );
};

