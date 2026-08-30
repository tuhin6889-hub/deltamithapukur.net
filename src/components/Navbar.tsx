import React, { useState, useEffect, useRef, useMemo } from 'react';
import { UserRole, DeviceMode, Ticket, ClientInfo, NetworkServer } from '../types';
import { DeltaLogo } from './DeltaLogo';
import { OfflineSyncBar } from './OfflineSyncBar';
import { 
  Home,
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
  Sparkles,
  Search,
  X,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Hash,
  PhoneCall,
  Flame
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
  onSelectTicket?: (ticket: Ticket) => void;
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
  onSelectTicket,
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

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Keyboard Shortcut: Ctrl+K / Cmd+K / "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Client map lookup for fast subscriber name resolution
  const clientMap = useMemo(() => {
    const map = new Map<string, ClientInfo>();
    clients.forEach(c => map.set(c.cid.toLowerCase(), c));
    return map;
  }, [clients]);

  // Filtered tickets based on search query (CID, Ticket ID, Client Name, phone, issue)
  const filteredSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return tickets.filter(ticket => {
      const cidMatch = ticket.cid?.toLowerCase().includes(q);
      const idMatch = ticket.id?.toLowerCase().includes(q);
      const subscriberDirectMatch = ticket.subscriberName?.toLowerCase().includes(q);
      const phoneMatch = ticket.contactPhone?.toLowerCase().includes(q);
      const issueMatch = ticket.issueSummary?.toLowerCase().includes(q) || ticket.issueDescription?.toLowerCase().includes(q);
      
      // Also match subscriber name via client database
      const client = clientMap.get(ticket.cid?.toLowerCase());
      const clientNameMatch = client?.name?.toLowerCase().includes(q);
      const clientPhoneMatch = client?.phone?.toLowerCase().includes(q);

      return cidMatch || idMatch || subscriberDirectMatch || phoneMatch || issueMatch || clientNameMatch || clientPhoneMatch;
    });
  }, [tickets, searchQuery, clientMap]);

  const handleSelectSearchResult = (ticket: Ticket) => {
    if (onSelectTicket) {
      onSelectTicket(ticket);
    }
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'High':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Medium':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'In_Progress':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Closed':
        return 'bg-slate-700 text-slate-300 border-slate-600';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

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

            {/* Dedicated Home Icon & Text Button */}
            <button
              onClick={onGoHome}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700/80 transition-all cursor-pointer active:scale-95 text-xs font-semibold shadow-sm"
              title={lang === 'bn' ? 'হোম পেজে যান' : 'Go to Home Page'}
              aria-label={lang === 'bn' ? 'হোম পেজ' : 'Home'}
            >
              <Home className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'হোম' : 'Home'}</span>
            </button>
          </div>

          {/* Global Search Bar (CID, Ticket ID, Client Name Lookup) */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-lg mx-2 sm:mx-4 z-50">
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4 text-emerald-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder={
                  lang === 'bn' 
                    ? 'টিকেট সার্চ করুন (CID, টিকেট আইডি, গ্রাহকের নাম)...' 
                    : 'Search tickets by CID, Ticket ID, Client Name...'
                }
                className="w-full pl-9 pr-20 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-inner transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1.5">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="p-1 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400 bg-slate-800/90 px-1.5 py-0.5 rounded border border-slate-700 select-none">
                    <span>⌘</span>
                    <span>K</span>
                  </div>
                )}
              </div>
            </div>

            {/* Instant Search Results Floating Dropdown */}
            {isSearchOpen && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[80vh] flex flex-col ring-1 ring-black/40 animate-in fade-in-50 zoom-in-95 duration-100">
                {/* Search Results Header */}
                <div className="px-3.5 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">
                      {lang === 'bn' ? 'সার্চ ফলাফল' : 'Search Results'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30">
                      {filteredSearchResults.length} {lang === 'bn' ? 'টিকেট' : 'tickets'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {lang === 'bn' ? 'কীওয়ার্ড:' : 'Query:'} &ldquo;<span className="text-emerald-400 font-semibold">{searchQuery}</span>&rdquo;
                  </span>
                </div>

                {/* Results List */}
                <div className="overflow-y-auto divide-y divide-slate-800/80 max-h-[380px] no-scrollbar">
                  {filteredSearchResults.length > 0 ? (
                    filteredSearchResults.map((ticket) => {
                      const client = clientMap.get(ticket.cid?.toLowerCase());
                      const displayName = ticket.subscriberName || client?.name || (lang === 'bn' ? 'নামহীন গ্রাহক' : 'Unnamed Subscriber');
                      const displayPhone = ticket.contactPhone || client?.phone;

                      return (
                        <button
                          key={ticket.id}
                          type="button"
                          onClick={() => handleSelectSearchResult(ticket)}
                          className="w-full text-left p-3 hover:bg-slate-800/90 transition-all flex items-start gap-3 group cursor-pointer focus:bg-slate-800 focus:outline-none"
                        >
                          {/* Priority Indicator Pill / Icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            <span className={`inline-flex items-center justify-center px-2 py-1 rounded-lg text-[10px] font-bold border ${getPriorityStyle(ticket.priority)}`}>
                              {ticket.priority === 'Urgent' && <Flame className="w-3 h-3 mr-1 text-rose-400 animate-pulse" />}
                              {ticket.priority}
                            </span>
                          </div>

                          {/* Ticket Meta & Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-mono font-bold text-white group-hover:text-emerald-400 transition-colors">
                                  #{ticket.id}
                                </span>
                                <span className="text-slate-600">•</span>
                                <span className="text-xs font-bold text-slate-200 truncate flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-400" />
                                  {displayName}
                                </span>
                                <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] border border-indigo-500/30">
                                  {ticket.cid}
                                </span>
                              </div>

                              {/* Status Badge */}
                              <span className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(ticket.status)}`}>
                                {ticket.status.replace('_', ' ')}
                              </span>
                            </div>

                            {/* Issue Summary */}
                            <p className="text-xs text-slate-300 font-medium line-clamp-1 mt-1 group-hover:text-white transition-colors">
                              {ticket.issueSummary || ticket.issueDescription}
                            </p>

                            {/* Details Row: Phone, Assigned Staff, Category */}
                            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 flex-wrap">
                              {displayPhone && (
                                <span className="flex items-center gap-1">
                                  <PhoneCall className="w-3 h-3 text-slate-500" />
                                  {displayPhone}
                                </span>
                              )}
                              {ticket.category && (
                                <span className="flex items-center gap-1">
                                  <span className="text-slate-600">/</span>
                                  <span className="text-slate-400">{ticket.category}</span>
                                </span>
                              )}
                              {ticket.assignedNocStaffName && (
                                <span className="flex items-center gap-1 text-emerald-400/90 font-medium">
                                  <span>👤</span>
                                  <span>{ticket.assignedNocStaffName}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Arrow Indicator */}
                          <div className="self-center pl-1 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-slate-400">
                      <AlertCircle className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                      <p className="text-xs font-semibold text-slate-300">
                        {lang === 'bn' ? 'কোনো টিকেট পাওয়া যায়নি' : 'No tickets matching your search'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                        {lang === 'bn' 
                          ? 'গ্রাহকের CID (যেমন: 1002), টিকেট আইডি (যেমন: 8021) অথবা নাম লিখে চেষ্টা করুন।' 
                          : 'Try searching with client CID (e.g. 1002), ticket # (e.g. 8021), or subscriber name.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Search Footer info */}
                <div className="px-3 py-2 bg-slate-950/90 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>
                    {lang === 'bn' ? 'ক্লিক করে তাৎক্ষণিক টিকেট ওপেন করুন' : 'Click any ticket to open details directly'}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    [Esc] {lang === 'bn' ? 'বন্ধ করুন' : 'to close'}
                  </span>
                </div>
              </div>
            )}
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

      {/* 2. Dedicated Sub-Header Menu Bar (Hidden for Client view / Login) */}
      {currentRole !== 'CLIENT' && (
        <div className="w-full bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-md">
          <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6 py-2">
            <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
              
              {/* Left: Role Navigation Tabs Menu */}
              <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex-shrink-0 shadow-inner">
                <button
                  onClick={onGoHome}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                  title={lang === 'bn' ? 'হোম পেজে ফিরে যান' : 'Go to Home'}
                >
                  <Home className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'bn' ? 'হোম' : 'Home'}</span>
                </button>

                <div className="h-4 w-px bg-slate-800 mx-0.5" />

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
      )}

    </header>
  );
};


