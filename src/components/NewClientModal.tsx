import React, { useState, useRef } from 'react';
import { 
  X, 
  UserPlus, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Wifi, 
  DollarSign, 
  Cpu, 
  CheckCircle2,
  Key,
  Lock,
  Eye,
  EyeOff,
  Server,
  CreditCard,
  FileText,
  Upload,
  Navigation,
  Globe,
  Radio,
  FileCheck,
  Tag,
  Laptop
} from 'lucide-react';
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
  const defaultUserName = `user_${1001 + clientsCount}`;

  // Form States
  const [name, setName] = useState('');
  const [cid, setCid] = useState(defaultCid);
  const [phone, setPhone] = useState('01711-00');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  
  // User Credentials
  const [userName, setUserName] = useState(defaultUserName);
  const [password, setPassword] = useState('DeltaPass#2026');
  const [showPassword, setShowPassword] = useState(false);

  // Network & POP / Zone
  const [popName, setPopName] = useState('Mithapukur Central POP-01');
  const [zoneName, setZoneName] = useState('Zone-A (Hospital & College Road)');
  const [area, setArea] = useState('মিঠাপুকুর সদর (Mithapukur Sadar)');
  const [pkg, setPkg] = useState('15 Mbps Dedicated (৳800)');
  const [opticalPower, setOpticalPower] = useState('-19.8 dBm');

  // Billing
  const [monthlyBill, setMonthlyBill] = useState('800');
  const [billType, setBillType] = useState<'bKash' | 'Nagad' | 'Cash' | 'Bank'>('bKash');

  // Hardware & IP
  const [onuOwner, setOnuOwner] = useState<'Client' | 'Office'>('Client');
  const [onuMac, setOnuMac] = useState('48:57:02:8A:');
  const [routerMac, setRouterMac] = useState('C8:3A:35:12:');
  const [ipAddress, setIpAddress] = useState(defaultIp);
  const [ipType, setIpType] = useState<'Real IP' | 'Shared IP' | 'Static IP'>('Real IP');

  // KYC & Location
  const [nidNumber, setNidNumber] = useState('');
  const [nidDocument, setNidDocument] = useState<string>('');
  const [gpsCoordinates, setGpsCoordinates] = useState('25.5782, 89.2844');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Remote Management & Remarks
  const [remoteUserName, setRemoteUserName] = useState('admin');
  const [remotePassword, setRemotePassword] = useState('Delta@Remote2026');
  const [showRemotePassword, setShowRemotePassword] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState<'Active' | 'Suspended'>('Active');

  if (!isOpen) return null;

  const handleDetectGps = () => {
    setIsDetectingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
          setGpsCoordinates(coords);
          setIsDetectingGps(false);
        },
        () => {
          // Fallback demo coordinates for Mithapukur zone
          setGpsCoordinates('25.578235, 89.284412');
          setIsDetectingGps(false);
        },
        { timeout: 5000 }
      );
    } else {
      setGpsCoordinates('25.578235, 89.284412');
      setIsDetectingGps(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNidDocument(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newClient: ClientInfo = {
      cid: cid.trim() || defaultCid,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || `${cid.toLowerCase()}@deltamb.net`,
      address: address.trim() || `${area}, Mithapukur, Rangpur`,
      area: area,
      package: pkg,
      ipAddress: ipAddress.trim() || defaultIp,
      onuMac: onuMac.trim() || '48:57:02:8A:FC:01',
      opticalPower: opticalPower.trim() || '-19.5 dBm',
      status: status,
      balance: 0,
      userName: userName.trim() || cid.toLowerCase(),
      password: password.trim() || 'Delta123',
      onuOwner: onuOwner,
      popName: popName,
      zoneName: zoneName,
      monthlyBill: parseFloat(monthlyBill) || 800,
      billType: billType,
      routerMac: routerMac.trim() || 'C8:3A:35:12:44:90',
      ipType: ipType,
      nidNumber: nidNumber.trim() || 'N/A',
      nidDocument: nidDocument || 'NID_Card_Uploaded.pdf',
      gpsCoordinates: gpsCoordinates.trim() || '25.5782, 89.2844',
      remoteUserName: remoteUserName.trim() || 'admin',
      remotePassword: remotePassword.trim() || 'Delta@Remote2026',
      remarks: remarks.trim() || 'Standard optical fiber installation.',
    };

    onAddClient(newClient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight uppercase font-mono flex items-center gap-2">
                <span>{lang === 'bn' ? 'নতুন গ্রাহক প্রোফাইল তৈরি (New Client Form)' : 'Add New ISP Client'}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  FULL PROFILE
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {lang === 'bn' 
                  ? 'ইউজারনেম, পাসওয়ার্ড, ONU ও রাউটার ম্যাক, PoP, জোন, বিলিং মেথড, NID ও GPS কোঅর্ডিনেটস' 
                  : 'Complete client registration: PPPoE, ONU/Router MAC, PoP/Zone, Billing, NID KYC & GPS'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs font-mono">
          
          {/* 1. Basic Client Information & User Credentials */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-slate-800 pb-2">
              <UserPlus className="w-4 h-4" />
              <span className="uppercase text-[11px] tracking-wider">
                {lang === 'bn' ? '১. মৌলিক তথ্য ও ইউজার লগইন (Basic Info & Credentials)' : '1. Basic Info & User Login'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="group/field">
                <label className="block text-slate-400 font-bold mb-1 transition-all duration-200 group-focus-within/field:text-emerald-400 group-focus-within/field:translate-x-0.5 relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-emerald-400 after:transition-all after:duration-200 group-focus-within/field:after:w-full">
                  {lang === 'bn' ? 'গ্রাহকের নাম (Client Name) *' : 'Client Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. মোঃ মোস্তাফিজুর রহমান"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-sans focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              <div className="group/field">
                <label className="block text-slate-400 font-bold mb-1 transition-all duration-200 group-focus-within/field:text-emerald-400 group-focus-within/field:translate-x-0.5 relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-emerald-400 after:transition-all after:duration-200 group-focus-within/field:after:w-full">
                  {lang === 'bn' ? 'গ্রাহক আইডি (CID) *' : 'Client ID (CID) *'}
                </label>
                <input
                  type="text"
                  required
                  value={cid}
                  onChange={(e) => setCid(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-bold focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              <div className="group/field">
                <label className="block text-slate-400 font-bold mb-1 transition-all duration-200 group-focus-within/field:text-emerald-400 group-focus-within/field:translate-x-0.5 relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-emerald-400 after:transition-all after:duration-200 group-focus-within/field:after:w-full">
                  {lang === 'bn' ? 'মোবাইল নম্বর (Phone) *' : 'Phone Number *'}
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01711-xxxxxx"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="group/field">
                <label className="block text-slate-400 font-bold mb-1 transition-all duration-200 group-focus-within/field:text-sky-300 group-focus-within/field:translate-x-0.5 relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-sky-400 after:transition-all after:duration-200 group-focus-within/field:after:w-full">
                  {lang === 'bn' ? 'ইউজারনেম (User Name / PPPoE) *' : 'User Name (PPPoE/Login) *'}
                </label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="username_fiber"
                    className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sky-300 font-bold focus:border-sky-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="group/field">
                <label className="block text-slate-400 font-bold mb-1 transition-all duration-200 group-focus-within/field:text-emerald-400 group-focus-within/field:translate-x-0.5 relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-emerald-400 after:transition-all after:duration-200 group-focus-within/field:after:w-full">
                  {lang === 'bn' ? 'পাসওয়ার্ড (Password) *' : 'Password *'}
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-8 pr-9 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="group/field">
                <label className="block text-slate-400 font-bold mb-1 transition-all duration-200 group-focus-within/field:text-emerald-400 group-focus-within/field:translate-x-0.5 relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-emerald-400 after:transition-all after:duration-200 group-focus-within/field:after:w-full">
                  {lang === 'bn' ? 'ইমেইল (Email Address)' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@mail.com"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 2. Network, PoP, Zone & Package */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold border-b border-slate-800 pb-2">
              <Server className="w-4 h-4" />
              <span className="uppercase text-[11px] tracking-wider">
                {lang === 'bn' ? '২. নেটওয়ার্ক, PoP ও জোন (PoP Name, Zone, Package & Area)' : '2. PoP Name, Zone, Package & Area'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'PoP Name (পপ নাম) *' : 'PoP Name *'}
                </label>
                <select
                  value={popName}
                  onChange={(e) => setPopName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:border-indigo-500 outline-none"
                >
                  <option value="Mithapukur Central POP-01">Mithapukur Central POP-01</option>
                  <option value="Pairaband Memorial POP-02">Pairaband Memorial POP-02</option>
                  <option value="Ranipukur Sub-POP-03">Ranipukur Sub-POP-03</option>
                  <option value="Balua Masimpur Node-04">Balua Masimpur Node-04</option>
                  <option value="Shatibari High-Speed POP-05">Shatibari High-Speed POP-05</option>
                  <option value="Gopalpur Sub-Station-06">Gopalpur Sub-Station-06</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'Zone Name (জোন নাম) *' : 'Zone Name *'}
                </label>
                <input
                  type="text"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="e.g. Zone-A (Hospital Road)"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'Area (এলাকা / ইউনিয়ন) *' : 'Area / Union *'}
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:border-indigo-500 outline-none"
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

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'Package (ইন্টারনেট প্যাকেজ) *' : 'Package *'}
                </label>
                <input
                  type="text"
                  value={pkg}
                  onChange={(e) => setPkg(e.target.value)}
                  placeholder="20 Mbps Fiber Freedom"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {lang === 'bn' ? 'বিস্তারিত ঠিকানা (Detailed Address)' : 'Detailed Physical Address'}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="বাসা/দোকান নং, রোড, পোস্ট অফিস, থানা"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* 3. Hardware, IP & Optical Power */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-bold border-b border-slate-800 pb-2">
              <Cpu className="w-4 h-4" />
              <span className="uppercase text-[11px] tracking-wider">
                {lang === 'bn' ? '৩. হার্ডওয়্যার, ম্যাক ও আইপি এড্রেস (ONU/Router MAC & IP)' : '3. Hardware, MAC, Optical & IP'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* ONU Owner */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'ONU Owner (ONU মালিকানা) *' : 'ONU Owner *'}
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-800 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setOnuOwner('Client')}
                    className={`py-1.5 rounded-lg font-bold text-center transition-all ${
                      onuOwner === 'Client'
                        ? 'bg-sky-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnuOwner('Office')}
                    className={`py-1.5 rounded-lg font-bold text-center transition-all ${
                      onuOwner === 'Office'
                        ? 'bg-sky-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Office
                  </button>
                </div>
              </div>

              {/* ONU MAC */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'ONU MAC Address *' : 'ONU MAC Address *'}
                </label>
                <input
                  type="text"
                  value={onuMac}
                  onChange={(e) => setOnuMac(e.target.value)}
                  placeholder="48:57:02:8A:FC:01"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sky-300 font-mono focus:border-sky-500 outline-none"
                />
              </div>

              {/* Router MAC */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'Router MAC Address *' : 'Router MAC Address *'}
                </label>
                <input
                  type="text"
                  value={routerMac}
                  onChange={(e) => setRouterMac(e.target.value)}
                  placeholder="C8:3A:35:12:44:90"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sky-300 font-mono focus:border-sky-500 outline-none"
                />
              </div>

              {/* Optical Power */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'Optical Power (Rx dBm)' : 'Optical Power (Rx)'}
                </label>
                <input
                  type="text"
                  value={opticalPower}
                  onChange={(e) => setOpticalPower(e.target.value)}
                  placeholder="-19.8 dBm"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-bold focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'IP Address (আইপি এড্রেস) *' : 'IP Address *'}
                </label>
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="103.145.28.15"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'IP Type (আইপি টাইপ) *' : 'IP Type (Real / Shared / Static) *'}
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-800 rounded-xl border border-slate-700">
                  {(['Real IP', 'Shared IP', 'Static IP'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setIpType(t)}
                      className={`py-1.5 rounded-lg font-bold text-center transition-all ${
                        ipType === t
                          ? 'bg-sky-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Billing, Monthly Bill & Bill Type */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-slate-800 pb-2">
              <DollarSign className="w-4 h-4" />
              <span className="uppercase text-[11px] tracking-wider">
                {lang === 'bn' ? '৪. বিলিং ও পেমেন্ট টাইপ (Monthly Bill & Bill Type)' : '4. Billing & Payment Gateway'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'Monthly Bill (মাসিক বিল টাকা) *' : 'Monthly Bill (BDT) *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    required
                    value={monthlyBill}
                    onChange={(e) => setMonthlyBill(e.target.value)}
                    placeholder="800"
                    className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-bold focus:border-emerald-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'Bill Type (পেমেন্ট মেথড) *' : 'Bill Type: BKash / Nagad / Cash / Bank *'}
                </label>
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-800 rounded-xl border border-slate-700">
                  {(['bKash', 'Nagad', 'Cash', 'Bank'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBillType(b)}
                      className={`py-1.5 rounded-lg font-bold text-center transition-all ${
                        billType === b
                          ? b === 'bKash'
                            ? 'bg-pink-600 text-white shadow-sm'
                            : b === 'Nagad'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : b === 'Bank'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 5. NID KYC, NID Upload & GPS Coordinates */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold border-b border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="uppercase text-[11px] tracking-wider">
                {lang === 'bn' ? '৫. NID যাচাই ও GPS লোকেশন (NID KYC, NID Upload & GPS)' : '5. NID Number, NID Upload & GPS Coordinates'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'NID Number (জাতীয় পরিচয়পত্র নং)' : 'NID Number'}
                </label>
                <input
                  type="text"
                  value={nidNumber}
                  onChange={(e) => setNidNumber(e.target.value)}
                  placeholder="10 / 13 / 17 Digit Smart NID"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'NID Upload (এনআইডি ফাইল আপলোড)' : 'NID Upload (Card Photo/PDF)'}
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,.pdf"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-dashed border-slate-600 hover:border-amber-500 rounded-xl text-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {nidDocument ? (
                    <>
                      <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 truncate max-w-[150px]">{nidDocument}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'bn' ? 'ফাইল সিলেক্ট করুন' : 'Select NID File'}</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'GPS Coordinates (Lat-Lng)' : 'GPS Coordinates (Lat-Lng)'}
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={gpsCoordinates}
                    onChange={(e) => setGpsCoordinates(e.target.value)}
                    placeholder="25.5782, 89.2844"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-mono focus:border-amber-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleDetectGps}
                    disabled={isDetectingGps}
                    className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                    title="Auto-detect current GPS Coordinates"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">{lang === 'bn' ? 'GPS' : 'GPS'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Remote Management Login & Remarks */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-bold border-b border-slate-800 pb-2">
              <Laptop className="w-4 h-4" />
              <span className="uppercase text-[11px] tracking-wider">
                {lang === 'bn' ? '৬. রিমোট ম্যানেজমেন্ট ও রিমার্কস (Remote Login & Remarks)' : '6. Remote Management Login & Remarks'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'Remote User Name (রিমোট ইউজার)' : 'Remote Management User Name'}
                </label>
                <input
                  type="text"
                  value={remoteUserName}
                  onChange={(e) => setRemoteUserName(e.target.value)}
                  placeholder="admin"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {lang === 'bn' ? 'Remote Password (রিমোট পাসওয়ার্ড)' : 'Remote Management Password'}
                </label>
                <div className="relative">
                  <input
                    type={showRemotePassword ? 'text' : 'password'}
                    value={remotePassword}
                    onChange={(e) => setRemotePassword(e.target.value)}
                    placeholder="Router@Remote2026"
                    className="w-full px-3 pr-9 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:border-purple-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRemotePassword(!showRemotePassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showRemotePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {lang === 'bn' ? 'Remarks (মন্তব্য / ফাইবার মিটার / TJ Box নং)' : 'Remarks / Cable Meters / Notes'}
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Fiber Drop Cable 150m from TJ Box-02 to subscriber home. Spliced on port 4."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:border-purple-500 outline-none resize-none font-sans"
              />
            </div>
          </div>

          {/* Bottom Bar: Status & Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">Account Status:</span>
              <button
                type="button"
                onClick={() => setStatus(status === 'Active' ? 'Suspended' : 'Active')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  status === 'Active' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm' 
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                }`}
              >
                {status === 'Active' ? 'Active (সক্রিয়)' : 'Suspended (স্থগিত)'}
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>{lang === 'bn' ? 'সম্পূর্ণ গ্রাহক তথ্য সংরক্ষণ করুন' : 'Save Full Client Profile'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

