import React, { useState } from 'react';
import { X, UserPlus, ShieldCheck, MapPin, Phone, Wifi, DollarSign, Cpu, CheckCircle2 } from 'lucide-react';
import { ClientInfo } from '../types';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: (newClient: ClientInfo) => void;
  clientsCount: number;
  lang: 'bn' | 'en';
}

export const NewClientModal: React.FC<NewClientModalProps> = ({
  isOpen,
  onClose,
  onAddClient,
  clientsCount,
  lang,
}) => {
  const defaultCid = `CID-${1001 + clientsCount}`;
  const defaultIp = `103.145.28.${15 + clientsCount}`;

  const [name, setName] = useState('');
  const [cid, setCid] = useState(defaultCid);
  const [phone, setPhone] = useState('01711-00');
  const [area, setArea] = useState('মিঠাপুকুর সদর (Mithapukur Sadar)');
  const [pkg, setPkg] = useState('15 Mbps Dedicated (৳800)');
  const [ipAddress, setIpAddress] = useState(defaultIp);
  const [onuMac, setOnuMac] = useState('48:57:02:8A:');
  const [opticalPower, setOpticalPower] = useState('-19.8 dBm');
  const [monthlyFee, setMonthlyFee] = useState('800');
  const [status, setStatus] = useState<'Active' | 'Suspended'>('Active');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newClient: ClientInfo = {
      cid: cid.trim() || defaultCid,
      name: name.trim(),
      phone: phone.trim(),
      email: `${cid.toLowerCase()}@deltamb.net`,
      address: `${area}, Mithapukur, Rangpur`,
      area: area,
      package: pkg,
      ipAddress: ipAddress.trim(),
      onuMac: onuMac.trim() || '48:57:02:8A:FC:01',
      opticalPower: opticalPower.trim() || '-19.5 dBm',
      status: status,
      balance: 0,
    };

    onAddClient(newClient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight uppercase font-mono">
                {lang === 'bn' ? 'নতুন গ্রাহক যোগ করুন (Add New Client)' : 'Add New ISP Client'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'bn' 
                  ? 'মিঠাপুকুর ব্রডব্যান্ড ডাটাবেজে নতুন সাবস্ক্রাইবার রেজিস্ট্রেশন' 
                  : 'Register a new optical fiber internet subscriber'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-mono">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {lang === 'bn' ? 'গ্রাহকের পূর্ণ নাম *' : 'Subscriber Name *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. মোঃ শফিকুল ইসলাম"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-sans focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {lang === 'bn' ? 'গ্রাহক আইডি (CID) *' : 'Client ID (CID) *'}
              </label>
              <input
                type="text"
                required
                value={cid}
                onChange={(e) => setCid(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-bold focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {lang === 'bn' ? 'মোবাইল নম্বর *' : 'Phone Number *'}
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01711-xxxxxx"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {lang === 'bn' ? 'ইউনিয়ন ও POP এলাকা' : 'Union & POP Area'}
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 outline-none"
              >
                <option value="মিঠাপুকুর সদর (Mithapukur Sadar)">মিঠাপুকুর সদর (Mithapukur Sadar)</option>
                <option value="পায়রাবন্দ (Pairaband)">পায়রাবন্দ (Pairaband)</option>
                <option value="রানীপুকুর (Ranipukur)">রানীপুকুর (Ranipukur)</option>
                <option value="বালুয়া মাসিমপুর (Balua Masimpur)">বালুয়া মাসিমপুর (Balua Masimpur)</option>
                <option value="বলদিপুকুর (Boldipukur)">বলদিপুকুর (Boldipukur)</option>
                <option value="পাজিপাড়া (Pajipara)">পাজিপাড়া (Pajipara)</option>
                <option value="গোপালপুর (Gopalpur)">গোপালপুর (Gopalpur)</option>
                <option value="বালারহাট (Balarhat)">বালারহাট (Balarhat)</option>
                <option value="শঠিবাড়ী বাজার POP (Shatibari POP)">শঠিবাড়ী বাজার POP (Shatibari POP)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {lang === 'bn' ? 'ইন্টারনেট প্যাকেজ' : 'Internet Package'}
              </label>
              <input
                type="text"
                value={pkg}
                onChange={(e) => setPkg(e.target.value)}
                placeholder="15 Mbps Dedicated"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {lang === 'bn' ? 'মাসিক বিল (টাকা)' : 'Monthly Bill (BDT)'}
              </label>
              <input
                type="number"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-bold focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {lang === 'bn' ? 'অ্যাসাইনকৃত IP' : 'Assigned IP'}
              </label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {lang === 'bn' ? 'ONU MAC ঠিকানা' : 'ONU MAC Address'}
              </label>
              <input
                type="text"
                value={onuMac}
                onChange={(e) => setOnuMac(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {lang === 'bn' ? 'অপটিক্যাল সংকেত (Power)' : 'Optical Rx Power'}
              </label>
              <input
                type="text"
                value={opticalPower}
                onChange={(e) => setOpticalPower(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">Status:</span>
              <button
                type="button"
                onClick={() => setStatus(status === 'Active' ? 'Suspended' : 'Active')}
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}
              >
                {status}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'bn' ? 'গ্রাহক সংরক্ষণ করুন' : 'Save Subscriber'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
