import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClientInfo } from '../types';
import { 
  User, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  PhoneCall, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Globe,
  Radio,
  Terminal,
  Activity,
  Zap,
  QrCode,
  Camera,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface UnifiedLoginPageProps {
  clients: ClientInfo[];
  onClientLogin: (cid: string) => void;
  onStaffLogin: (user: { role: 'MANAGER' | 'NOC'; username: string; name: string }) => void;
  lang: 'bn' | 'en';
  onToggleLang: () => void;
  onOpenRouterQrScanner?: () => void;
}

const STAFF_DEMO_ACCOUNTS = [
  {
    role: 'MANAGER' as const,
    username: 'manager',
    password: '123',
    pin: '2026',
    name: 'ব্রাঞ্চ ম্যানেজার (Mithapukur HQ)',
    titleBn: 'ব্রাঞ্চ ম্যানেজার',
    titleEn: 'Branch Manager',
    descBn: 'টিকিট পর্যবেক্ষণ ও ফিল্ড ডিসপ্যাচ',
    descEn: 'Operations & Field Dispatch'
  },
  {
    role: 'NOC' as const,
    username: 'noc',
    password: '123',
    pin: '2026',
    name: 'ইঞ্জি: তানজিম আহমেদ (NOC Core)',
    titleBn: 'নোক ইঞ্জিনিয়ার',
    titleEn: 'NOC Core Engineer',
    descBn: 'অপটিক্যাল ডায়াগনস্টিক ও ট্রাবলশুটিং',
    descEn: 'Optical Diagnostics & AI Fixes'
  },
];

export const UnifiedLoginPage: React.FC<UnifiedLoginPageProps> = ({
  clients,
  onClientLogin,
  onStaffLogin,
  lang,
  onToggleLang,
  onOpenRouterQrScanner,
}) => {
  // Mode: 'CLIENT' | 'STAFF'
  const [loginPortalType, setLoginPortalType] = useState<'CLIENT' | 'STAFF'>('CLIENT');
  
  // Client Form State (CID or WhatsApp/Phone)
  const [clientIdentifier, setClientIdentifier] = useState('');
  const [clientError, setClientError] = useState<string | null>(null);

  // Staff Form State
  const [staffRole, setStaffRole] = useState<'MANAGER' | 'NOC'>('NOC');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [staffLoginMode, setStaffLoginMode] = useState<'PASSWORD' | 'PIN'>('PASSWORD');
  const [showPassword, setShowPassword] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen event listener
  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
        setIsFullscreen(true);
      } else {
        document.exitFullscreen?.().catch(() => {});
        setIsFullscreen(false);
      }
    } catch (e) {
      console.warn('Fullscreen error:', e);
    }
  };

  // Client Login Submit (Either CID or WhatsApp/Phone)
  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    const cleanInput = clientIdentifier.trim();

    if (!cleanInput) {
      setClientError(
        lang === 'bn' 
          ? 'অনুগ্রহ করে আপনার CID নম্বর অথবা হোয়াটসঅ্যাপ/মোবাইল নম্বর লিখুন' 
          : 'Please enter your CID Number or WhatsApp / Phone number'
      );
      return;
    }

    const cleanUpper = cleanInput.toUpperCase();
    const cleanDigits = cleanInput.replace(/[^0-9]/g, '');

    // Search by CID (e.g. "CID-1001", "1001") or by Phone/WhatsApp number
    const foundClient = clients.find(c => {
      const cidUpper = c.cid.toUpperCase();
      const matchCid = cidUpper === cleanUpper || 
                       (cleanDigits.length >= 3 && cidUpper.replace(/[^0-9]/g, '') === cleanDigits);
      
      const cPhoneDigits = c.phone.replace(/[^0-9]/g, '');
      const matchPhone = cleanDigits.length >= 6 && (cPhoneDigits.includes(cleanDigits) || cleanDigits.includes(cPhoneDigits));

      return matchCid || matchPhone;
    });

    if (!foundClient) {
      setClientError(
        lang === 'bn' 
          ? 'গ্রাহক তথ্য পাওয়া যায়নি! আপনার সঠিক CID নম্বর অথবা রেজিস্টার্ড ফোন নম্বর দিন।' 
          : 'Account not found! Please check your CID or registered phone number.'
      );
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onClientLogin(foundClient.cid);
    }, 250);
  };

  // Staff Login Submit
  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setStaffError(lang === 'bn' ? 'ইউজারনেম লিখুন' : 'Please enter username');
      return;
    }
    if (!cleanPass) {
      setStaffError(lang === 'bn' ? 'পাসওয়ার্ড লিখুন' : 'Please enter password');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (
        (staffRole === 'MANAGER' && (cleanUser === 'manager' || cleanUser === 'admin') && (cleanPass === '123' || cleanPass === 'admin' || cleanPass === 'delta2026')) ||
        (staffRole === 'NOC' && (cleanUser === 'noc' || cleanUser === 'tanjim' || cleanUser === 'admin') && (cleanPass === '123' || cleanPass === 'admin' || cleanPass === 'delta2026')) ||
        cleanPass === '123' || cleanPass === 'admin'
      ) {
        onStaffLogin({
          role: staffRole,
          username: cleanUser,
          name: staffRole === 'MANAGER' ? 'ব্রাঞ্চ ম্যানেজার (Mithapukur HQ)' : 'ইঞ্জি: তানজিম আহমেদ (NOC Core)',
        });
      } else {
        setStaffError(
          lang === 'bn' 
            ? 'ভুল তথ্য! নিচে ডেমো একাউন্টে ১-ক্লিক করুন।' 
            : 'Invalid credentials! Use demo buttons below.'
        );
      }
    }, 250);
  };

  // Staff PIN Numpad
  const handlePinPress = (num: string) => {
    setStaffError(null);
    if (pinCode.length < 4) {
      const newPin = pinCode + num;
      setPinCode(newPin);
      if (newPin.length === 4) {
        if (newPin === '2026' || newPin === '1234' || newPin === '0000') {
          onStaffLogin({
            role: staffRole,
            username: staffRole === 'MANAGER' ? 'manager' : 'noc',
            name: staffRole === 'MANAGER' ? 'ব্রাঞ্চ ম্যানেজার (Mithapukur HQ)' : 'ইঞ্জি: তানজিম আহমেদ (NOC Core)',
          });
        } else {
          setTimeout(() => {
            setStaffError(lang === 'bn' ? 'ভুল পিন! সঠিক: 2026' : 'Invalid PIN! Use: 2026');
            setPinCode('');
          }, 200);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] celestial-bg text-[#f0f0f5] flex flex-col justify-between relative overflow-x-hidden font-sans selection:bg-[#6366f1] selection:text-white">
      
      {/* Subtle Star & Nebula Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-25 pointer-events-none" />

      {/* Navigation Header */}
      <nav className="relative z-10 px-6 sm:px-12 pt-8 pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="brand-cluster">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6366f1] font-medium block mb-1">
            {lang === 'bn' ? 'সিস্টেমেটিক অপারেশন্স' : 'Systematic Operations'}
          </span>
          <h1 className="font-syne font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-[-0.04em] leading-[1.05] uppercase text-[#f0f0f5] my-2">
            Delta <br />
            Mithapukur
          </h1>
        </div>

        <div className="flex items-center gap-2.5 sm:mt-3 self-end sm:self-start">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#6366f1] font-medium hidden md:block">
            NOC Portal // v.2.4
          </div>

          <button
            onClick={handleToggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white/[0.03] hover:bg-white/[0.08] border border-[rgba(240,240,245,0.12)] font-mono text-[11px] font-bold text-[#f0f0f5] transition-all cursor-pointer"
            title={isFullscreen ? (lang === 'bn' ? 'ফুলস্ক্রিন বন্ধ' : 'Exit Fullscreen') : (lang === 'bn' ? 'ডেস্কটপ ফুলস্ক্রিন' : 'Fullscreen')}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-emerald-400" /> : <Maximize2 className="w-3.5 h-3.5 text-[#6366f1]" />}
            <span className="hidden sm:inline">{isFullscreen ? (lang === 'bn' ? 'স্বাভাবিক' : 'Exit') : (lang === 'bn' ? 'ফুলস্ক্রিন' : 'Fullscreen')}</span>
          </button>
          
          <button
            onClick={onToggleLang}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-white/[0.03] hover:bg-white/[0.08] border border-[rgba(240,240,245,0.12)] font-mono text-[11px] font-bold text-[#f0f0f5] transition-all cursor-pointer"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#6366f1]" />
            <span>{lang === 'bn' ? 'ENG' : 'বাং'}</span>
          </button>
        </div>
      </nav>

      {/* Main Composition: 2-Column Desktop Grid */}
      <main className="relative z-10 flex-1 px-6 sm:px-12 py-6 grid grid-cols-1 lg:grid-cols-[1fr_450px] xl:grid-cols-[1fr_480px] gap-8 lg:gap-16 items-center max-w-7xl mx-auto w-full">
        
        {/* Left Column: Visual Anchor & Orbital Telemetry */}
        <div className="relative border-l border-[rgba(240,240,245,0.1)] pl-6 sm:pl-10 py-6 flex flex-col justify-center">
          {/* Accent square at top left border corner */}
          <div className="absolute -left-[5px] top-0 w-[9px] height-[9px] h-[9px] bg-[#6366f1] shadow-[0_0_12px_#6366f1]" />
          <div className="absolute -left-[3px] bottom-0 w-[5px] h-[5px] bg-[#6366f1]/50" />

          {/* Telemetry Tele-text */}
          <div className="font-mono text-xs sm:text-[13px] leading-[2.1] text-[#f0f0f5]/60 tracking-wider">
            <span className="text-[#6366f1] font-bold">[ COORDINATES ]</span> 25.5794° N, 89.2647° E<br />
            <span className="text-emerald-400 font-bold">[ STATUS ]</span> OPTIC_LINK: ACTIVE // GIGABIT_FIBER<br />
            <span className="text-[#6366f1] font-bold">[ UPTIME ]</span> 99.9997% TIER-3 REDUNDANCY<br />
            <span className="text-amber-400 font-bold">[ SIGNAL ]</span> LOW_LATENCY_CORE_GRID • MITHAPUKUR<br />
            <span className="text-[#f0f0f5]/30">--------------------------------------------------</span><br />
            <span className="animate-pulse text-[#6366f1] font-bold tracking-widest">
              CONNECTING TO DELTA MITHAPUKUR NOC GATEWAY...
            </span>
          </div>

          {/* Rotating Celestial Radar Telemetry SVG */}
          <div className="mt-8 relative w-32 h-32 opacity-40 hover:opacity-80 transition-opacity hidden sm:block">
            <svg className="w-full h-full text-[#f0f0f5] animate-[spin_40s_linear_infinite]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="#6366f1" strokeWidth="1" />
              <circle cx="50" cy="50" r="14" fill="none" stroke="#6366f1" strokeWidth="0.5" strokeDasharray="2 2" />
              <path d="M50 0 L50 100 M0 50 L100 50" stroke="currentColor" strokeWidth="0.3" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-2 h-2 rounded-full bg-[#6366f1] animate-ping" />
            </div>
          </div>
        </div>

        {/* Right Column: Celestial Auth Card */}
        <div className="auth-card bg-white/[0.03] backdrop-blur-2xl border border-[rgba(240,240,245,0.08)] p-6 sm:p-10 rounded-[4px] shadow-2xl relative">
          
          {/* Header row in Auth Card */}
          <div className="font-mono text-xs tracking-[0.18em] uppercase text-[#f0f0f5]/80 flex justify-between items-center mb-6 pb-3 border-b border-[rgba(240,240,245,0.08)]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6366f1] animate-pulse" />
              <span>AUTH_REQUIRED</span>
            </div>
            <span className="text-[#6366f1] font-bold">[{loginPortalType === 'CLIENT' ? '01_CID' : '02_STAFF'}]</span>
          </div>

          {/* Portal Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-6 font-mono text-[11px] uppercase tracking-wider">
            <button
              type="button"
              onClick={() => {
                setLoginPortalType('CLIENT');
                setClientError(null);
              }}
              className={`py-2 px-3 border transition-all cursor-pointer ${
                loginPortalType === 'CLIENT'
                  ? 'bg-[#6366f1] text-white border-[#6366f1] font-bold'
                  : 'bg-transparent text-[#f0f0f5]/60 border-[rgba(240,240,245,0.1)] hover:border-[#6366f1]/50 hover:text-white'
              }`}
            >
              {lang === 'bn' ? 'গ্রাহক সিআইডি' : 'Client CID'}
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginPortalType('STAFF');
                setStaffError(null);
              }}
              className={`py-2 px-3 border transition-all cursor-pointer ${
                loginPortalType === 'STAFF'
                  ? 'bg-[#6366f1] text-white border-[#6366f1] font-bold'
                  : 'bg-transparent text-[#f0f0f5]/60 border-[rgba(240,240,245,0.1)] hover:border-[#6366f1]/50 hover:text-white'
              }`}
            >
              {lang === 'bn' ? 'স্টাফ / নোক' : 'Staff / NOC'}
            </button>
          </div>

          {/* TAB 1: CLIENT LOGIN */}
          {loginPortalType === 'CLIENT' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <form onSubmit={handleClientSubmit} className="space-y-5">
                <div className="input-group">
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6366f1] font-medium">
                      {lang === 'bn' ? 'গ্রাহক CID অথবা মোবাইল নম্বর' : 'CLIENT CID OR PHONE NUMBER'}
                    </label>
                    <span className="font-mono text-[9px] text-[#f0f0f5]/40 tracking-wider">
                      {lang === 'bn' ? '[যেকোনো ১টি]' : '[EITHER ONE]'}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={clientIdentifier}
                    onChange={(e) => {
                      setClientIdentifier(e.target.value);
                      setClientError(null);
                    }}
                    placeholder={lang === 'bn' ? 'যেমন: CID-1001 বা 01711XXXXXX' : 'e.g. CID-1001 or 01711XXXXXX'}
                    className="w-full bg-transparent border-b border-[rgba(240,240,245,0.15)] focus:border-b-[#6366f1] py-2.5 text-[#f0f0f5] font-mono text-base outline-none tracking-wider transition-colors placeholder:text-[#f0f0f5]/30 uppercase"
                  />
                  <p className="text-[11px] font-mono text-[#f0f0f5]/40 mt-2">
                    {lang === 'bn' 
                      ? '💡 আপনার গ্রাহক আইডি (CID) অথবা রেজিস্টার্ড হোয়াটসঅ্যাপ/মোবাইল নম্বর লিখুন' 
                      : '💡 Enter your unique CID number or registered WhatsApp/Mobile phone'}
                  </p>
                </div>

                {clientError && (
                  <div className="p-2.5 bg-rose-950/40 border border-rose-500/40 text-rose-300 font-mono text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{clientError}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="celestial-btn w-full py-3.5 px-4 bg-[#6366f1] text-white border border-[#6366f1] font-bold text-xs hover:bg-[#f0f0f5] hover:text-[#0a0a0c] hover:border-[#f0f0f5] cursor-pointer"
                  >
                    {isLoading ? (lang === 'bn' ? 'যাচাই হচ্ছে...' : 'AUTHENTICATING...') : (lang === 'bn' ? 'ACCESS GATEWAY' : 'ACCESS GATEWAY')}
                  </button>

                  {onOpenRouterQrScanner && (
                    <button
                      type="button"
                      onClick={onOpenRouterQrScanner}
                      className="celestial-btn w-full py-3 px-4 bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 font-bold text-xs hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500 cursor-pointer flex items-center justify-center gap-2 transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? '📷 রাউটার কিউআর স্ক্যান করুন' : '📷 SCAN PHYSICAL ROUTER QR'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setLoginPortalType('STAFF');
                      setStaffError(null);
                    }}
                    className="celestial-btn w-full py-2.5 px-4 bg-transparent text-[#f0f0f5]/70 border border-[rgba(240,240,245,0.15)] font-bold text-xs hover:bg-[#f0f0f5] hover:text-[#0a0a0c] hover:border-[#f0f0f5] cursor-pointer"
                  >
                    {lang === 'bn' ? 'স্টাফ লগইন ইন্টারফেস' : 'STAFF LOGIN INTERFACE'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* TAB 2: STAFF / NOC LOGIN */}
          {loginPortalType === 'STAFF' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* Staff Role Switcher */}
              <div className="grid grid-cols-2 gap-2 font-mono text-[10px] uppercase">
                <button
                  type="button"
                  onClick={() => setStaffRole('NOC')}
                  className={`py-1.5 border transition-all cursor-pointer ${
                    staffRole === 'NOC' 
                      ? 'border-[#6366f1] bg-[#6366f1]/20 text-[#6366f1] font-bold' 
                      : 'border-[rgba(240,240,245,0.08)] text-[#f0f0f5]/50 hover:text-white'
                  }`}
                >
                  NOC CORE [ENG]
                </button>
                <button
                  type="button"
                  onClick={() => setStaffRole('MANAGER')}
                  className={`py-1.5 border transition-all cursor-pointer ${
                    staffRole === 'MANAGER' 
                      ? 'border-[#6366f1] bg-[#6366f1]/20 text-[#6366f1] font-bold' 
                      : 'border-[rgba(240,240,245,0.08)] text-[#f0f0f5]/50 hover:text-white'
                  }`}
                >
                  BRANCH MANAGER
                </button>
              </div>

              {/* Password vs PIN */}
              <div className="flex justify-between items-center font-mono text-[10px] text-[#f0f0f5]/50 uppercase pb-1">
                <span>METHOD:</span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStaffLoginMode('PASSWORD')}
                    className={`cursor-pointer ${staffLoginMode === 'PASSWORD' ? 'text-[#6366f1] font-bold underline' : 'hover:text-white'}`}
                  >
                    PASSWORD
                  </button>
                  <button
                    type="button"
                    onClick={() => setStaffLoginMode('PIN')}
                    className={`cursor-pointer ${staffLoginMode === 'PIN' ? 'text-[#6366f1] font-bold underline' : 'hover:text-white'}`}
                  >
                    4-DIGIT PIN
                  </button>
                </div>
              </div>

              {staffLoginMode === 'PASSWORD' ? (
                <form onSubmit={handleStaffSubmit} className="space-y-4">
                  <div className="input-group">
                    <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-[#6366f1] mb-1.5 font-medium">
                      OPERATOR_HANDLE (USERNAME)
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setStaffError(null);
                      }}
                      placeholder={staffRole === 'MANAGER' ? 'manager / admin' : 'noc / tanjim'}
                      className="w-full bg-transparent border-b border-[rgba(240,240,245,0.15)] focus:border-b-[#6366f1] py-2 text-[#f0f0f5] font-mono text-sm outline-none transition-colors placeholder:text-[#f0f0f5]/20"
                    />
                  </div>

                  <div className="input-group">
                    <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-[#6366f1] mb-1.5 font-medium">
                      SECURITY_KEY (PASSWORD)
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setStaffError(null);
                        }}
                        placeholder="••••••••"
                        className="w-full bg-transparent border-b border-[rgba(240,240,245,0.15)] focus:border-b-[#6366f1] py-2 pr-8 text-[#f0f0f5] font-mono text-sm outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-[#f0f0f5]/40 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {staffError && (
                    <div className="p-2 bg-rose-950/40 border border-rose-500/40 text-rose-300 font-mono text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{staffError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="celestial-btn w-full py-3.5 px-4 bg-[#6366f1] text-white border border-[#6366f1] font-bold text-xs hover:bg-[#f0f0f5] hover:text-[#0a0a0c] hover:border-[#f0f0f5] cursor-pointer"
                  >
                    {isLoading ? 'AUTHENTICATING...' : 'AUTHORIZE ACCESS'}
                  </button>
                </form>
              ) : (
                /* PIN Mode */
                <div className="space-y-3">
                  <div className="flex justify-center gap-3 py-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`w-10 h-10 border flex items-center justify-center font-mono text-sm font-bold transition-all ${
                          pinCode[i]
                            ? 'border-[#6366f1] bg-[#6366f1]/20 text-white'
                            : 'border-[rgba(240,240,245,0.1)] text-[#f0f0f5]/20'
                        }`}
                      >
                        {pinCode[i] ? '●' : '—'}
                      </div>
                    ))}
                  </div>

                  {staffError && (
                    <p className="text-center font-mono text-xs text-rose-400">{staffError}</p>
                  )}

                  <div className="grid grid-cols-3 gap-1.5 max-w-[220px] mx-auto pt-1">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => {
                          if (k === 'C') setPinCode('');
                          else if (k === '⌫') setPinCode(prev => prev.slice(0, -1));
                          else handlePinPress(k);
                        }}
                        className="py-2.5 border border-[rgba(240,240,245,0.1)] hover:border-[#6366f1] hover:bg-white/[0.05] font-mono text-xs font-bold text-[#f0f0f5] active:scale-95 transition-all cursor-pointer"
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 1-Click Fast Staff Buttons */}
              <div className="pt-3 border-t border-[rgba(240,240,245,0.08)]">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#f0f0f5]/40 block mb-2 font-medium">
                  // 1-CLICK DEMO STAFF CREDENTIALS:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {STAFF_DEMO_ACCOUNTS.map((acc, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onStaffLogin({ role: acc.role, username: acc.username, name: acc.name })}
                      className="p-2.5 bg-white/[0.02] hover:bg-white/[0.06] border border-[rgba(240,240,245,0.08)] hover:border-[#6366f1]/50 text-left transition-all group cursor-pointer"
                    >
                      <div className="flex justify-between items-center font-mono text-[10px] mb-1">
                        <span className="text-[#6366f1] font-bold">[{acc.role}]</span>
                        <span className="text-[#f0f0f5]/50 group-hover:text-white">LOGIN →</span>
                      </div>
                      <span className="text-xs text-[#f0f0f5] font-bold block truncate">
                        {lang === 'bn' ? acc.titleBn : acc.titleEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </div>

      </main>

      {/* 3-Column Telemetry Footer */}
      <footer className="relative z-10 px-6 sm:px-12 py-5 border-t border-[rgba(240,240,245,0.08)] grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px] text-[#f0f0f5]/40 uppercase tracking-wider items-center">
        <div className="text-left flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>NETWORK STATUS: NOMINAL // ALL SYSTEMS GO</span>
        </div>
        <div className="text-left sm:text-center text-[#f0f0f5]/60 font-medium">
          HELPLINE: 01719394430 (24/7 NOC)
        </div>
        <div className="text-left sm:text-right">
          © 2026 DELTA MITHAPUKUR NOC
        </div>
      </footer>

    </div>
  );
};
