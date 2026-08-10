import React, { useState } from 'react';
import { TicketCategory, TicketPriority, ClientInfo } from '../types';
import { X, Send, AlertCircle, PlusCircle, Sparkles } from 'lucide-react';

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

  if (!isOpen) return null;

  const currentClient = clients.find(c => c.cid === selectedCid) || clients[0];

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
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {lang === 'bn' ? 'নতুন সাপোর্ট টিকেট ক্রিয়েট' : 'Create New Support Ticket'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'bn' ? 'ডেল্টা মিঠাপুকুর নোক টিমকে অবহিতকরণ' : 'Dispatch ticket to Delta Mithapukur NOC'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

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
            <div className="mt-1 text-[11px] text-slate-500 bg-slate-100 p-2 rounded-lg">
              <span>ফোন: {currentClient.phone} • এলাকা: {currentClient.area}</span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {lang === 'bn' ? 'সমস্যার ক্যাটাগরি' : 'Problem Category'}
            </label>
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
            <label className="block font-bold text-slate-700 mb-1">
              {lang === 'bn' ? 'সমস্যার প্রধান শিরোনাম' : 'Issue Summary Title'}
            </label>
            <input
              type="text"
              required
              placeholder={lang === 'bn' ? 'যেমন: রাউটারে লাল আলো জ্বলছে, ইন্টারনেট সংযোগ বিচ্ছিন্ন' : 'e.g. Red light blinking on ONU'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {lang === 'bn' ? 'বিস্তারিত বর্ণনা (Bengali/English)' : 'Detailed Problem Description'}
            </label>
            <textarea
              rows={3}
              required
              placeholder={lang === 'bn' ? 'কখন থেকে সমস্যা শুরু হয়েছে এবং রাউটার/ONU এর বর্তমান অবস্থা লিখুন...' : 'Describe when the problem started...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {lang === 'bn' ? 'জরুরি মাত্রা (Priority Level)' : 'Priority Severity'}
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Urgent">🚨 Urgent (জরুরি - LOS/Fiber Cut)</option>
              <option value="High">⚠️ High (উচ্চ)</option>
              <option value="Medium">⚡ Medium (সাধারণ)</option>
              <option value="Low">🟢 Low (কম)</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{lang === 'bn' ? 'টিকেট সাবমিট করুন' : 'Submit Ticket Now'}</span>
          </button>

        </form>

      </div>
    </div>
  );
};
