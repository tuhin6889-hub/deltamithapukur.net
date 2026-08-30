import React from 'react';
import { UserRole, DeviceMode, Ticket, ClientInfo, NetworkServer } from '../types';
import { DeltaLogo } from './DeltaLogo';
import { OfflineSyncBar } from './OfflineSyncBar';
import { 
  ShieldCheck, 
  Cpu, 
  User, 
  Smartphone, 
  Monitor, 
  BellRing, 
  PlusCircle, 
  Globe,
  LogOut,
  Mail,
  Bot,
  Database,
  UserPlus,
  Mic,
  Activity,
  Zap,
  Sparkles
} from 'lucide-react';

interface StaffUser {
  username: string;
  name: string;
  role: 'MANAGER' | 'NOC';
}

interface NavbarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;
  lang: 'bn' | 'en';
  setLang: (lang: 'bn' | 'en') => void;
  onOpenNewTicketModal: () => void;
  onOpenNotificationsModal: () => void;
  unreadNotifsCount: number;
  loggedInCid: string | null;
  onClientLogout: () => void;
  managerUser: StaffUser | null;
  nocUser: StaffUser | null;
  onStaffLogout: (role: 'MANAGER' | 'NOC') => void;
  onOpenEmailCenter?: () => void;
  onOpenWhatsAppCenter?: () => void;
  onOpenClientDatabase?: () => void;
  onOpenAddNewClient?: () => void;
  onGoHome?: () => void;
  onOpenAndroidInstall?: () => void;
  // Offline Cache & Sync Props
  isOnline?: boolean;
  isSimulatedOffline?: boolean;
  onToggleSimulateOffline?: () => void;
  onManualSync?: () => void;
  queuedActionsCount?: number;
  tickets?: Ticket[];
  clients?: ClientInfo[];
  servers?: NetworkServer[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  setCurrentRole,
  deviceMode,
  setDeviceMode,
  lang,
  setLang,
  onOpenNewTicketModal,
  onOpenNotificationsModal,
  unreadNotifsCount,
  loggedInCid,
  onClientLogout,
  managerUser,
  nocUser,
  onStaffLogout,
  onOpenEmailCenter,
  onOpenWhatsAppCenter,
  onOpenClientDatabase,
  onOpenAddNewClient,
  onGoHome,
  onOpenAndroidInstall,
  isOnline = true,
  isSimulatedOffline = false,
  onToggleSimulateOffline = () => {},
  onManualSync = () => {},
  queuedActionsCount = 0,
  tickets = [],
  clients = [],
  servers = [],
}) => {
  const activeStaff = currentRole === 'MANAGER' ? managerUser : currentRole === 'NOC' ? nocUser : null;

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      
      {/* 1. Main Primary Header Bar */}
      <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Company Brand Logo & Backlink Home Button */}
          <div className="flex items-center gap-2 sm:gap-3 -ml-1 flex-shrink-0">
            <button 
              onClick={onGoHome}
              className="group flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl p-0.5 transition-all active:scale-95 text-left"
              title={lang === 'bn' ? 'হোম পেজে ফিরে যান' : 'Back to Home Page'}
            >
              <DeltaLogo size="md" theme="dark" showSubtitle={true} />
            </button>
          </div>

          {/* Right Header Controls & Status */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            {/* Offline Cache & Real-Time Sync Badge */}
            <OfflineSyncBar
              isOnline={isOnline}
              isSimulatedOffline={isSimulatedOffline}
              tickets={tickets}
              clients={clients}
              servers={servers}
              lang={lang}
              onToggleSimulateOffline={onToggleSimulateOffline}
              onManualSync={onManualSync}
              queuedActionsCount={queuedActionsCount}
            />

            {/* Logged in Staff Badge */}
            {activeStaff && (
              <div className="flex items-center gap-2 bg-slate-800/90 px-2.5 py-1.5 rounded-xl border border-slate-700 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200 truncate max-w-[130px] hidden sm:inline">
                  {activeStaff.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  {activeStaff.role}
                </span>
              </div>
            )}

            {/* Logged in Client Badge */}
            {loggedInCid && (
              <div className="flex items-center gap-2 bg-slate-800/90 px-2.5 py-1.5 rounded-xl border border-slate-700 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-indigo-300">
                  {loggedInCid}
                </span>
              </div>
            )}

            {/* Icon-Only Logout Button in Right Header */}
            {(activeStaff || loggedInCid) && (
              <button
                onClick={() => {
                  if (activeStaff) onStaffLogout(activeStaff.role);
                  else if (loggedInCid) onClientLogout();
                }}
                className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 rounded-lg border border-slate-700 hover:border-rose-500/40 transition-colors cursor-pointer active:scale-95 flex items-center justify-center"
                title={lang === 'bn' ? 'লগআউট' : 'Logout'}
                aria-label={lang === 'bn' ? 'লগআউট' : 'Logout'}
              >
                <LogOut className="w-4 h-4 text-rose-400" />
              </button>
            )}

            {/* Mobile View Toggle */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setDeviceMode('DESKTOP')}
                title="Desktop Web Dashboard"
                className={`p-1.5 rounded-md transition-all ${
                  deviceMode === 'DESKTOP' ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceMode('ANDROID')}
                title="Android App Preview Mode"
                className={`p-1.5 rounded-md transition-all ${
                  deviceMode === 'ANDROID' ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 border border-slate-700 cursor-pointer active:scale-95 transition-all"
              title="Language / ভাষা পরিবর্তন"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold">{lang === 'bn' ? 'EN' : 'বাংলা'}</span>
            </button>

            {/* Outbound WhatsApp & Email Notification Drawer Button */}
            <button
              onClick={onOpenNotificationsModal}
              className="relative p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors cursor-pointer active:scale-95"
              title="WhatsApp & Email Dispatch Log"
            >
              <BellRing className="w-4 h-4 text-amber-400" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Submit Ticket Action Button with Voice indicator */}
            <button
              onClick={onOpenNewTicketModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md active:scale-95 group cursor-pointer"
              title={lang === 'bn' ? 'নতুন টিকেট খুলুন (ভয়েস ডিকটেশন সহ)' : 'Create New Ticket (Voice Enabled)'}
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'নতুন টিকেট' : 'New Ticket'}</span>
              <span className="flex items-center gap-0.5 bg-emerald-600/30 px-1 py-0.5 rounded text-[10px] text-slate-950 font-mono">
                <Mic className="w-3 h-3 text-slate-950" />
              </span>
            </button>

          </div>
        </div>
      </div>

      {/* 2. Dedicated New Sub-Header Menu Bar */}
      <div className="w-full bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-md">
        <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6 py-2">
          <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
            
            {/* Left: Role Navigation Tabs Menu */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex-shrink-0 shadow-inner">
              <button
                onClick={() => setCurrentRole('MANAGER')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  currentRole === 'MANAGER'
                    ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ব্রাঞ্চ ম্যানেজার' : 'Manager'}</span>
                {managerUser && <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />}
              </button>

              <button
                onClick={() => setCurrentRole('NOC')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  currentRole === 'NOC'
                    ? 'bg-teal-600 text-white shadow-md ring-1 ring-teal-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'নোক পোর্টাল' : 'NOC Portal'}</span>
                {nocUser && <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse" />}
              </button>

              <button
                onClick={() => setCurrentRole('CLIENT')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  currentRole === 'CLIENT'
                    ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>
                  {lang === 'bn' ? 'গ্রাহক পোর্টাল' : 'Client Portal'}
                  {loggedInCid && ` (${loggedInCid})`}
                </span>
              </button>
            </div>

            {/* Middle: Quick Action & Service Tool Buttons Strip */}
            <div className="flex items-center gap-2 flex-shrink-0">
              
              {/* Register New Client Button */}
              {onOpenAddNewClient && (
                <button
                  onClick={onOpenAddNewClient}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-sm active:scale-95 border border-sky-400/50 cursor-pointer whitespace-nowrap"
                  title="Register New ISP Client Subscriber"
                >
                  <UserPlus className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                  <span>{lang === 'bn' ? 'নতুন গ্রাহক যোগ' : 'Add Client'}</span>
                </button>
              )}

              {/* Client Database Button */}
              {onOpenClientDatabase && (
                <button
                  onClick={onOpenClientDatabase}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-sky-300 rounded-xl border border-sky-500/30 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap hover:border-sky-500/60"
                  title="ISP Client Database & Subscriber Directory"
                >
                  <Database className="w-3.5 h-3.5 text-sky-400" />
                  <span>{lang === 'bn' ? 'ক্লায়েন্ট ডাটাবেজ' : 'Client Database'}</span>
                  <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono border border-sky-500/30">DB</span>
                </button>
              )}

              {/* WhatsApp Server API Center Button */}
              {onOpenWhatsAppCenter && (
                <button
                  onClick={onOpenWhatsAppCenter}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-300 rounded-xl border border-emerald-500/30 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap hover:border-emerald-500/60"
                  title="WhatsApp Business API Server Setup & Portal Control"
                >
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপ এপিআই' : 'WhatsApp API'}</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">v19.0</span>
                </button>
              )}

              {/* Email Center Button */}
              {onOpenEmailCenter && (
                <button
                  onClick={onOpenEmailCenter}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-xl border border-amber-500/30 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap hover:border-amber-500/60"
                  title="Outbound Email Logs & SMTP Dispatch Center"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'bn' ? 'ইমেইল সেন্টার' : 'Email Center'}</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">SMTP</span>
                </button>
              )}

              {/* Dedicated Android APK Install Modal Trigger Button */}
              {onOpenAndroidInstall && (
                <button
                  onClick={onOpenAndroidInstall}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-300 rounded-xl border border-emerald-500/30 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap hover:border-emerald-500/60"
                  title="Download Android APK & Install Mobile App"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                  <span className="font-mono">{lang === 'bn' ? 'অ্যান্ড্রয়েড এপিকে' : 'Android APK'}</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/30 text-slate-950 font-black text-[10px] font-mono bg-emerald-400">APK</span>
                </button>
              )}

            </div>

            {/* Right: Live Core SLA Network Status Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-900/80 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400 flex-shrink-0">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-bold">99.98% SLA</span>
              <span className="text-slate-600">|</span>
              <span>{lang === 'bn' ? 'নোক কোর অ্যাক্টিভ' : 'NOC Core Active'}</span>
            </div>

          </div>
        </div>
      </div>

    </header>
  );
};


