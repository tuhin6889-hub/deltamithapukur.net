import React from 'react';
import { UserRole, DeviceMode } from '../types';
import { DeltaLogo } from './DeltaLogo';
import { 
  ShieldCheck, 
  Cpu, 
  User, 
  Smartphone, 
  Monitor, 
  BellRing, 
  PlusCircle, 
  Wifi, 
  Sparkles,
  Globe,
  LogOut,
  Mail,
  Bot,
  MessageSquare,
  Database,
  UserPlus,
  Home,
  ArrowLeft
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
}) => {
  const activeStaff = currentRole === 'MANAGER' ? managerUser : currentRole === 'NOC' ? nocUser : null;

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Company Brand Logo & Backlink Home Button */}
          <div className="flex items-center gap-2 sm:gap-3 -ml-1">
            <button 
              onClick={onGoHome}
              className="group flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl p-0.5 transition-all active:scale-95 text-left"
              title={lang === 'bn' ? 'হোম পেজে ফিরে যান' : 'Back to Home Page'}
            >
              <DeltaLogo size="md" theme="dark" showSubtitle={true} />
            </button>
          </div>

          {/* Role Switcher Pills */}
          <div className="hidden md:flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setCurrentRole('MANAGER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentRole === 'MANAGER'
                  ? 'bg-emerald-600 text-white shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'ব্রাঞ্চ ম্যানেজার' : 'Manager'}</span>
              {managerUser && <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />}
            </button>

            <button
              onClick={() => setCurrentRole('NOC')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentRole === 'NOC'
                  ? 'bg-teal-600 text-white shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'নোক পোর্টাল' : 'NOC Portal'}</span>
              {nocUser && <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse" />}
            </button>

            <button
              onClick={() => setCurrentRole('CLIENT')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentRole === 'CLIENT'
                  ? 'bg-indigo-600 text-white shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>
                {lang === 'bn' ? 'গ্রাহক (CID)' : 'Client Portal'}
                {loggedInCid && ` (${loggedInCid})`}
              </span>
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Logged in Staff Badge & Logout Button */}
            {activeStaff && (
              <div className="hidden xl:flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200 truncate max-w-[140px]">
                  {activeStaff.name}
                </span>
                <button
                  onClick={() => onStaffLogout(activeStaff.role)}
                  className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Mobile View Toggle & APK Download Modal */}
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

            {/* Dedicated Android APK Install Modal Trigger Button */}
            {onOpenAndroidInstall && (
              <button
                onClick={onOpenAndroidInstall}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg border border-emerald-500/40 text-xs font-bold transition-all shadow-sm active:scale-95"
                title="Download Android APK & Install Mobile App"
              >
                <Smartphone className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span className="hidden sm:inline font-mono">{lang === 'bn' ? 'অ্যান্ড্রয়েড এপিকে' : 'Android APK'}</span>
                <span className="px-1 py-0.2 rounded bg-emerald-500/40 text-slate-950 font-black text-[9px] font-mono">APK</span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 border border-slate-700"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'bn' ? 'EN' : 'বাংলা'}</span>
            </button>

            {/* Client Database Button in Top Menu Bar */}
            {onOpenClientDatabase && (
              <button
                onClick={onOpenClientDatabase}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 rounded-lg border border-sky-500/40 text-xs font-bold transition-all shadow-sm active:scale-95"
                title="ISP Client Database & Subscriber Directory"
              >
                <Database className="w-4 h-4 text-sky-400 animate-pulse" />
                <span className="hidden lg:inline font-mono">{lang === 'bn' ? 'ক্লায়েন্ট ডাটাবেজ' : 'Client Database'}</span>
                <span className="px-1 py-0.2 rounded bg-sky-500/30 text-sky-200 text-[9px] font-mono">DB</span>
              </button>
            )}

            {/* Add Client Button */}
            {onOpenAddNewClient && (
              <button
                onClick={onOpenAddNewClient}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md active:scale-95 border border-sky-400/40"
                title="Register New ISP Client Subscriber"
              >
                <UserPlus className="w-4 h-4 text-slate-950" />
                <span className="hidden sm:inline font-mono">{lang === 'bn' ? 'ক্লায়েন্ট যোগ' : 'Add Client'}</span>
              </button>
            )}

            {/* Dedicated WhatsApp Business API Server Setup & Portal Control Button */}
            {onOpenWhatsAppCenter && (
              <button
                onClick={onOpenWhatsAppCenter}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg border border-emerald-500/40 text-xs font-bold transition-all shadow-sm active:scale-95"
                title="WhatsApp Business API Server Setup & Portal Control"
              >
                <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="hidden md:inline font-mono">{lang === 'bn' ? 'হোয়াটসঅ্যাপ এপিআই' : 'WA Server API'}</span>
                <span className="px-1 py-0.2 rounded bg-emerald-500/30 text-emerald-200 text-[9px] font-mono">v19.0</span>
              </button>
            )}

            {/* Outbound WhatsApp & Email Notification Drawer Button */}
            <button
              onClick={onOpenNotificationsModal}
              className="relative p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
              title="WhatsApp & Email Dispatch Log"
            >
              <BellRing className="w-4 h-4 text-amber-400" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Submit Ticket Action Button */}
            <button
              onClick={onOpenNewTicketModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'নতুন টিকেট' : 'New Ticket'}</span>
            </button>

          </div>
        </div>

        {/* Mobile Sub-Navigation Bar for Role Switcher */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setCurrentRole('MANAGER')}
            className={`px-3 py-1 rounded-md ${currentRole === 'MANAGER' ? 'bg-emerald-600 font-bold text-white' : 'text-slate-400'}`}
          >
            {lang === 'bn' ? 'ম্যানেজার' : 'Manager'}
          </button>
          <button
            onClick={() => setCurrentRole('NOC')}
            className={`px-3 py-1 rounded-md ${currentRole === 'NOC' ? 'bg-teal-600 font-bold text-white' : 'text-slate-400'}`}
          >
            {lang === 'bn' ? 'নোক' : 'NOC'}
          </button>
          <button
            onClick={() => setCurrentRole('CLIENT')}
            className={`px-3 py-1 rounded-md ${currentRole === 'CLIENT' ? 'bg-indigo-600 font-bold text-white' : 'text-slate-400'}`}
          >
            {lang === 'bn' ? 'গ্রাহক' : 'Client'} {loggedInCid && `(${loggedInCid})`}
          </button>
        </div>

      </div>
    </header>
  );
};

