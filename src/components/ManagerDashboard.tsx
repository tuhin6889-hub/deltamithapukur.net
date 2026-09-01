import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, ClientInfo, NocStaff, TicketStatus, TicketPriority, NotificationLog, NetworkServer } from '../types';
import { INITIAL_SERVERS } from '../data/mockData';
import { DeltaLogo } from './DeltaLogo';
import { WorkOrderModal } from './WorkOrderModal';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketPriorityBadge, getPriorityColorConfig } from './TicketPriorityBadge';
import { NetworkServerManager } from './NetworkServerManager';
import { MonthSummaryAnalytics } from './MonthSummaryAnalytics';
import { WeeklyResolutionChart } from './WeeklyResolutionChart';
import { NocStaffPerformanceDashboard } from './NocStaffPerformanceDashboard';
import { 
  CheckCircle2, 
  Check,
  Clock, 
  AlertTriangle, 
  Users, 
  Search, 
  Filter, 
  Send, 
  MessageSquare, 
  Phone, 
  MapPin, 
  Radio, 
  Sparkles,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sidebar,
  TrendingUp,
  Activity,
  Layers,
  FileText,
  LogOut,
  BarChart2,
  Calendar,
  Zap,
  Target,
  Award,
  Download,
  Printer,
  RotateCcw,
  Wrench,
  PlusCircle,
  UserPlus,
  Server,
  Compass,
  Map,
  Navigation,
  Globe,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';

interface ManagerDashboardProps {
  tickets: Ticket[];
  clients: ClientInfo[];
  nocStaff: NocStaff[];
  notifications: NotificationLog[];
  servers?: NetworkServer[];
  lang: 'bn' | 'en';
  onSelectTicket: (ticket: Ticket) => void;
  onUpdateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  onBulkUpdateTicketStatus?: (ticketIds: string[], status: TicketStatus, assignedNoc?: string) => void;
  onAssignNocStaff: (ticketId: string, staffName: string) => void;
  onSendManualNotification: (ticketId: string, cid: string, message: string, channel: 'WhatsApp' | 'Email' | 'SMS') => void;
  onOpenNewTicketModal: () => void;
  onOpenAddNewClient?: () => void;
  onOpenMotherWebsiteHub?: () => void;
  onAddServer?: (server: NetworkServer) => void;
  onUpdateServer?: (server: NetworkServer) => void;
  onDeleteServer?: (serverId: string) => void;
  currentUser?: { username: string; name: string } | null;
  onLogout?: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  tickets,
  clients,
  nocStaff,
  notifications,
  servers = INITIAL_SERVERS,
  lang,
  onSelectTicket,
  onUpdateTicketStatus,
  onBulkUpdateTicketStatus,
  onAssignNocStaff,
  onSendManualNotification,
  onOpenNewTicketModal,
  onOpenAddNewClient,
  onOpenMotherWebsiteHub,
  onAddServer,
  onUpdateServer,
  onDeleteServer,
  currentUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'KPI_DASHBOARD' | 'TICKETS' | 'NOC_PERFORMANCE' | 'NOC_STAFF' | 'CLIENTS' | 'SERVERS' | 'BROADCAST'>('KPI_DASHBOARD');
  const [nocStaffSubView, setNocStaffSubView] = useState<'ROSTER' | 'PERFORMANCE'>('PERFORMANCE');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Bulk Ticket Selection State
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [bulkManagerStaffAssign, setBulkManagerStaffAssign] = useState<string>('');

  // Network Servers State
  const [serversList, setServersList] = useState<NetworkServer[]>(servers);

  const handleAddServer = (newServer: NetworkServer) => {
    setServersList(prev => [newServer, ...prev]);
    if (onAddServer) onAddServer(newServer);
  };

  const handleUpdateServer = (updatedServer: NetworkServer) => {
    setServersList(prev => prev.map(s => s.id === updatedServer.id ? updatedServer : s));
    if (onUpdateServer) onUpdateServer(updatedServer);
  };

  const handleDeleteServer = (serverId: string) => {
    setServersList(prev => prev.filter(s => s.id !== serverId));
    if (onDeleteServer) onDeleteServer(serverId);
  };

  const navItems = [
    {
      id: 'KPI_DASHBOARD' as const,
      labelBn: 'কেপিআই ড্যাশবোর্ড',
      labelEn: 'KPI Dashboard',
      icon: BarChart2,
      badge: 'Recharts',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      descriptionBn: 'ISP নেটওয়ার্ক এনালাইটিক্স',
      descriptionEn: 'Network analytics & trends',
    },
    {
      id: 'NOC_PERFORMANCE' as const,
      labelBn: 'নোক পারফরম্যান্স মেট্রিক',
      labelEn: 'NOC Staff Performance',
      icon: Award,
      badge: 'Metrics',
      badgeClass: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
      descriptionBn: 'গড় রেসপন্স টাইম ও টিকেট ক্লোজ',
      descriptionEn: 'Response time & closed tickets',
    },
    {
      id: 'TICKETS' as const,
      labelBn: 'সকল সাপোর্ট টিকেট',
      labelEn: 'Support Tickets',
      icon: Layers,
      badge: tickets.length.toString(),
      badgeClass: 'bg-slate-800 text-slate-200 border border-slate-700',
      descriptionBn: 'কমপ্লেন ও ডিসপ্যাচ ট্র্যাকিং',
      descriptionEn: 'Active complaints & dispatch',
    },
    {
      id: 'SERVERS' as const,
      labelBn: 'সার্ভার ও ওএলটি (Servers & OLT)',
      labelEn: 'Network Servers & OLT',
      icon: Server,
      badge: `${serversList.length} Devices`,
      badgeClass: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
      descriptionBn: 'OLT ও মাইক্রোটিক কন্ট্রোল',
      descriptionEn: 'OLT, MikroTik & Core Routers',
    },
    {
      id: 'NOC_STAFF' as const,
      labelBn: 'নোক টিম স্টাফ ডিউটি',
      labelEn: 'NOC Duty & Roster',
      icon: Users,
      badge: nocStaff.length.toString(),
      badgeClass: 'bg-slate-800 text-slate-200 border border-slate-700',
      descriptionBn: 'টেকনিশিয়ান ও শিফট ডিউটি',
      descriptionEn: 'Staff shift & SLA tracking',
    },
    {
      id: 'CLIENTS' as const,
      labelBn: 'গ্রাহক রেকর্ড (CID)',
      labelEn: 'Client Database',
      icon: FileText,
      badge: clients.length.toString(),
      badgeClass: 'bg-slate-800 text-slate-200 border border-slate-700',
      descriptionBn: 'গ্রাহক সাবস্ক্রিপশন রেকর্ড',
      descriptionEn: 'CID, IP & package records',
    },
    {
      id: 'BROADCAST' as const,
      labelBn: 'হোয়াটসঅ্যাপ বার্তা',
      labelEn: 'WhatsApp Dispatch',
      icon: Send,
      badge: 'SMS/WA',
      badgeClass: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
      descriptionBn: 'বাল্ক বার্তা ও আউটলেজ নোটিশ',
      descriptionEn: 'Outage broadcasts & alerts',
    },
  ];
  const [trendRange, setTrendRange] = useState<7 | 14 | 30>(30);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedHotspotNode, setSelectedHotspotNode] = useState<string | null>('মিঠাপুকুর সদর (Mithapukur Sadar)');

  // POP Areas State & Add POP Area Modal
  const [popAreas, setPopAreas] = useState<string[]>([
    'মিঠাপুকুর সদর (Mithapukur Sadar)',
    'পায়রাবন্দ (Pairaband)',
    'রানীপুকুর (Ranipukur)',
    'বালুয়া মাসিমপুর (Balua Masimpur)',
    'বলদিপুকুর (Boldipukur)',
    'পাজিপাড়া (Pajipara)',
    'গোপালপুর (Gopalpur)',
    'বালারহাট (Balarhat)',
    'শঠিবাড়ী বাজার POP (Shatibari POP)',
  ]);
  const [isAddPopModalOpen, setIsAddPopModalOpen] = useState(false);
  const [newPopName, setNewPopName] = useState('');
  const [newPopUnion, setNewPopUnion] = useState('');
  const [newPopCapacity, setNewPopCapacity] = useState('128 Fiber Ports / 8 PON OLT');

  const [selectedWorkOrderTicket, setSelectedWorkOrderTicket] = useState<Ticket | null>(null);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);

  // Broadcast Form State
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastRecipientType, setBroadcastRecipientType] = useState<'All Clients' | 'NOC Team' | 'Specific CID'>('All Clients');
  const [targetCid, setTargetCid] = useState('CID-1001');
  const [broadcastChannel, setBroadcastChannel] = useState<'WhatsApp' | 'Email'>('WhatsApp');
  const [broadcastSentSuccess, setBroadcastSentSuccess] = useState(false);

  // Statistics
  const totalTickets = tickets.length;
  const openCount = tickets.filter(t => t.status === 'Open').length;
  const inProgressCount = tickets.filter(t => t.status === 'In_Progress' || t.status === 'NOC_Assigned').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
  const emergencyLineCutsCount = useMemo(() => {
    return tickets.filter(t => 
      (t.priority === 'Urgent' || t.category.includes('LOS') || t.category.includes('Fiber') || t.title.toLowerCase().includes('cut') || t.description.toLowerCase().includes('cut')) &&
      t.status !== 'Resolved' && t.status !== 'Closed'
    ).length;
  }, [tickets]);

  // CSV Export Function
  const handleExportCSV = () => {
    const headers = ['Ticket ID', 'Subscriber CID', 'Client Name', 'Phone', 'Area / Union', 'Category', 'Priority', 'Status', 'Assigned Repair Squad', 'Created Date', 'Resolution Note'];
    const rows = filteredTickets.map(t => [
      `"${t.id}"`,
      `"${t.cid}"`,
      `"${t.clientName.replace(/"/g, '""')}"`,
      `"${t.clientPhone}"`,
      `"${t.area.replace(/"/g, '""')}"`,
      `"${t.category.replace(/"/g, '""')}"`,
      `"${t.priority}"`,
      `"${t.status}"`,
      `"${(t.assignedNoc || 'Mithapukur Emergency Line Squad').replace(/"/g, '""')}"`,
      `"${new Date(t.createdDate).toLocaleString('en-GB')}"`,
      `"${(t.resolutionNote || 'N/A').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `delta_mithapukur_tickets_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Recharts Data 1: Ticket Volume Trends (Last 30 Days)
  const trendData = useMemo(() => {
    const data = [];
    const now = new Date();

    for (let i = trendRange - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { month: 'short', day: 'numeric' });

      const daySeed = (d.getDate() * 7 + (d.getMonth() + 1) * 13) % 11;
      const totalVolume = 11 + (daySeed % 7) + (i === 0 ? tickets.length % 4 : 0);
      const resolved = 9 + ((daySeed + 2) % 6);
      const urgentLos = 2 + (daySeed % 3);

      data.push({
        date: dateStr,
        'Total Volume': totalVolume,
        'Resolved': resolved,
        'Urgent LOS': urgentLos,
      });
    }
    return data;
  }, [trendRange, lang, tickets.length]);

  // Recharts Data 2: Average Response Time by Category
  const avgResponseTimeData = useMemo(() => [
    {
      category: lang === 'bn' ? 'রেড এলওএস বাতি (Red LOS)' : 'Red LOS Light',
      shortCat: 'Red LOS',
      avgMinutes: 14.2,
      slaTarget: 30,
      color: '#f43f5e', // Rose
    },
    {
      category: lang === 'bn' ? 'উচ্চ পিং ও স্লো স্পিড' : 'High Ping / Slow Speed',
      shortCat: 'High Ping',
      avgMinutes: 28.5,
      slaTarget: 45,
      color: '#f59e0b', // Amber
    },
    {
      category: lang === 'bn' ? 'ওএনইউ ও ফাইবারের সিগন্যাল' : 'ONU / Fiber Signal',
      shortCat: 'ONU Signal',
      avgMinutes: 21.8,
      slaTarget: 40,
      color: '#3b82f6', // Blue
    },
    {
      category: lang === 'bn' ? 'বিলিং ও প্যাকেজ পরিবর্তন' : 'Billing & Package',
      shortCat: 'Billing',
      avgMinutes: 11.5,
      slaTarget: 20,
      color: '#10b981', // Emerald
    },
    {
      category: lang === 'bn' ? 'পপ লিংক ও রাউটিং সমস্যা' : 'POP & Routing',
      shortCat: 'POP Link',
      avgMinutes: 17.6,
      slaTarget: 35,
      color: '#8b5cf6', // Violet
    },
  ], [lang]);

  // Ticket Hotspots Data for Visual Map Placeholder
  const areaHotspotData = useMemo(() => {
    const locations = [
      { name: 'মিঠাপুকুর সদর (Mithapukur Sadar)', shortName: 'Mithapukur HQ', x: 50, y: 46, isHq: true, oltInfo: 'OLT-01 (Mithapukur HQ Core)' },
      { name: 'পায়রাবন্দ (Pairaband)', shortName: 'Pairaband POP', x: 48, y: 20, oltInfo: 'OLT-02 (Pairaband Substation)' },
      { name: 'রানীপুকুর (Ranipukur)', shortName: 'Ranipukur POP', x: 26, y: 34, oltInfo: 'OLT-03 (Ranipukur Node)' },
      { name: 'বালুয়া মাসিমপুর (Balua Masimpur)', shortName: 'Balua Masimpur', x: 74, y: 30, oltInfo: 'OLT-04 (Masimpur Feeder)' },
      { name: 'বলদিপুকুর (Boldipukur)', shortName: 'Boldipukur POP', x: 30, y: 64, oltInfo: 'OLT-05 (Boldipukur Fiber Drop)' },
      { name: 'পাজিপাড়া (Pajipara)', shortName: 'Pajipara POP', x: 70, y: 62, oltInfo: 'OLT-06 (Pajipara Relay)' },
      { name: 'গোপালপুর (Gopalpur)', shortName: 'Gopalpur POP', x: 20, y: 82, oltInfo: 'OLT-07 (Gopalpur Terminal)' },
      { name: 'বালারহাট (Balarhat)', shortName: 'Balarhat POP', x: 80, y: 80, oltInfo: 'OLT-08 (Balarhat Extension)' },
      { name: 'শঠিবাড়ী বাজার POP (Shatibari POP)', shortName: 'Shatibari POP', x: 50, y: 86, oltInfo: 'OLT-09 (Shatibari South Gateway)' },
    ];

    return locations.map(loc => {
      const locKeyWord = loc.name.split(' ')[0];
      const matchedTickets = tickets.filter(t => 
        t.area.toLowerCase().includes(loc.shortName.toLowerCase()) || 
        t.area.includes(locKeyWord) || 
        loc.name.includes(t.area.split(' ')[0])
      );

      const total = matchedTickets.length;
      const urgent = matchedTickets.filter(t => t.priority === 'Urgent').length;
      const open = matchedTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
      const resolved = matchedTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

      let level: 'urgent' | 'open' | 'normal' | 'clear' = 'clear';
      if (urgent > 0) level = 'urgent';
      else if (open > 0) level = 'open';
      else if (total > 0) level = 'normal';

      return {
        ...loc,
        total,
        urgent,
        open,
        resolved,
        level,
        tickets: matchedTickets
      };
    });
  }, [tickets]);

  // Filtered Tickets
  const filteredTickets = tickets.filter(ticket => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      ticket.id.toLowerCase().includes(q) ||
      ticket.cid.toLowerCase().includes(q) ||
      ticket.clientName.toLowerCase().includes(q) ||
      (ticket.clientPhone && ticket.clientPhone.toLowerCase().includes(q)) ||
      ticket.category.toLowerCase().includes(q) ||
      ticket.area.toLowerCase().includes(q) ||
      ticket.title.toLowerCase().includes(q);

    const matchesArea = selectedArea === 'ALL' || ticket.area.includes(selectedArea);
    const matchesCategory = selectedCategory === 'ALL' || ticket.category.toLowerCase().includes(selectedCategory.toLowerCase()) || (selectedCategory === 'Red LOS' && (ticket.category.includes('LOS') || ticket.title.includes('LOS'))) || (selectedCategory === 'Fiber Cut' && (ticket.category.includes('ফাইবার') || ticket.title.toLowerCase().includes('cut')));
    const matchesStatus = selectedStatus === 'ALL' || ticket.status === selectedStatus;
    const matchesPriority = selectedPriority === 'ALL' || ticket.priority === selectedPriority;

    return matchesSearch && matchesArea && matchesCategory && matchesStatus && matchesPriority;
  });

  // Bulk Action Helpers for Manager Dashboard
  const toggleSelectTicket = (ticketId: string) => {
    setSelectedTicketIds(prev =>
      prev.includes(ticketId) ? prev.filter(id => id !== ticketId) : [...prev, ticketId]
    );
  };

  const handleSelectAllFiltered = () => {
    const visibleIds = filteredTickets.map(t => t.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedTicketIds.includes(id));

    if (allVisibleSelected) {
      setSelectedTicketIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedTicketIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedTicketIds([]);
    setBulkManagerStaffAssign('');
  };

  const handleBulkStatusChange = (status: TicketStatus) => {
    if (selectedTicketIds.length === 0) return;
    if (onBulkUpdateTicketStatus) {
      onBulkUpdateTicketStatus(selectedTicketIds, status, bulkManagerStaffAssign || undefined);
    } else {
      selectedTicketIds.forEach(id => onUpdateTicketStatus(id, status));
    }
    setSelectedTicketIds([]);
    setBulkManagerStaffAssign('');
  };

  const handleBulkAssignStaff = (staffName: string) => {
    if (selectedTicketIds.length === 0 || !staffName) return;
    if (onBulkUpdateTicketStatus) {
      onBulkUpdateTicketStatus(selectedTicketIds, 'NOC_Assigned', staffName);
    } else {
      selectedTicketIds.forEach(id => {
        onAssignNocStaff(id, staffName);
      });
    }
    setSelectedTicketIds([]);
    setBulkManagerStaffAssign('');
  };

  const isAllFilteredSelected = filteredTickets.length > 0 && filteredTickets.every(t => selectedTicketIds.includes(t.id));
  const isSomeFilteredSelected = filteredTickets.some(t => selectedTicketIds.includes(t.id)) && !isAllFilteredSelected;

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    onSendManualNotification(
      'BROADCAST-2026',
      targetCid,
      broadcastMessage,
      broadcastChannel
    );

    setBroadcastSentSuccess(true);
    setTimeout(() => {
      setBroadcastSentSuccess(false);
      setBroadcastMessage('');
    }, 3000);
  };

  return (
    <div className="space-[#f8fafc] min-h-[calc(100vh-4rem)] p-4 md:p-6 text-slate-800">
      
      {/* Top Banner & Quick Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-5 md:p-6 mb-6 shadow-xl border border-slate-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <DeltaLogo size="lg" theme="dark" showTagline={true} />
            
            <div className="border-l border-slate-700/80 pl-4 sm:pl-5 hidden sm:block">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-2">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30 shadow-sm">
                  FULL MANAGER ACCESS
                </span>
                <span className="text-xs text-slate-300 font-medium tracking-wide">
                  {lang === 'bn' ? 'মিঠাপুকুর সেন্ট্রাল শাখা ড্যাশবোর্ড' : 'Mithapukur Branch HQ'}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight mt-1.5 text-white">
                {lang === 'bn' ? 'সাপোর্ট ও নোক কন্ট্রোল সেন্টার' : 'Support & NOC Control Center'}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Global Quick Search Field */}
            <div className="relative w-full sm:w-64 md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
              <input
                type="text"
                placeholder={lang === 'bn' ? 'CID, নাম বা টিকেট ID খুঁজুন...' : 'Search CID, Client Name, Ticket ID...'}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'TICKETS' && e.target.value.trim()) {
                    setActiveTab('TICKETS');
                  }
                }}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-inner font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full bg-slate-800"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {currentUser && (
              <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-200 font-bold hidden sm:inline">{currentUser.name}</span>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="ml-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-bold transition-all border border-red-500/30 flex items-center gap-1"
                    title="Log out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
                  </button>
                )}
              </div>
            )}

            {onOpenMotherWebsiteHub && (
              <button
                onClick={onOpenMotherWebsiteHub}
                className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-xs md:text-sm transition-all shadow-lg flex items-center gap-2 active:scale-95 border border-indigo-400/40"
                title="Mother Website (https://delta-mithapukur.vercel.app/) Client DB & Marketing Portal Bridge"
              >
                <Globe className="w-4 h-4 text-indigo-200 animate-pulse" />
                <span>{lang === 'bn' ? 'মাদার ওয়েবসাইট ও মার্কেটিং' : 'Mother Site & Ads'}</span>
              </button>
            )}

            {onOpenAddNewClient && (
              <button
                onClick={onOpenAddNewClient}
                className="px-3.5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold rounded-xl text-xs md:text-sm transition-all shadow-lg flex items-center gap-2 active:scale-95"
              >
                <UserPlus className="w-4 h-4 text-slate-950" />
                <span>{lang === 'bn' ? 'ক্লায়েন্ট যোগ করুন' : 'Add Client'}</span>
              </button>
            )}

            <button
              onClick={onOpenNewTicketModal}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs md:text-sm transition-all shadow-lg flex items-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{lang === 'bn' ? 'ম্যানুয়াল টিকেট এন্ট্রি' : 'Create Ticket'}</span>
            </button>
          </div>
        </div>

        {/* Analytics Counter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 mt-4 pt-3.5 border-t border-slate-700/60">
          <div className="bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700/50">
            <p className="text-slate-400 text-[11px] font-medium">{lang === 'bn' ? 'মোট টিকেট' : 'Total Tickets'}</p>
            <p className="text-lg font-bold text-white mt-0.5">{totalTickets}</p>
          </div>

          <div className="bg-slate-800/80 px-3 py-2 rounded-xl border border-amber-500/30">
            <p className="text-amber-400 text-[11px] font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{lang === 'bn' ? 'পেন্ডিং / ওপেন' : 'Open Pending'}</span>
            </p>
            <p className="text-lg font-bold text-amber-300 mt-0.5">{openCount}</p>
          </div>

          <div className="bg-slate-800/80 px-3 py-2 rounded-xl border border-blue-500/30">
            <p className="text-blue-400 text-[11px] font-medium flex items-center gap-1">
              <Activity className="w-3 h-3" />
              <span>{lang === 'bn' ? 'নোক টিমে রানিং' : 'In Progress'}</span>
            </p>
            <p className="text-lg font-bold text-blue-300 mt-0.5">{inProgressCount}</p>
          </div>

          <div className="bg-slate-800/80 px-3 py-2 rounded-xl border border-emerald-500/30">
            <p className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{lang === 'bn' ? 'সমাধানকৃত টিকেট' : 'Resolved'}</span>
            </p>
            <p className="text-lg font-bold text-emerald-300 mt-0.5">{resolvedCount}</p>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-slate-800/80 px-3 py-2 rounded-xl border border-rose-500/30">
            <p className="text-rose-400 text-[11px] font-medium flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-rose-400 animate-pulse" />
              <span>{lang === 'bn' ? 'জরুরি ফাইবার লাইন কাট' : 'Emergency Cuts'}</span>
            </p>
            <p className="text-lg font-bold text-rose-300 mt-0.5">{emergencyLineCutsCount}</p>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout with Collapsable Sidebar Navigation */}
      <div className="flex flex-col lg:flex-row gap-5 items-start relative min-h-[650px]">
        
        {/* Mobile Navigation Header Bar */}
        <div className="lg:hidden w-full bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center justify-between text-white shadow-md mb-2">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl transition-all border border-slate-700"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                {lang === 'bn' ? 'বর্তমান মডিউল:' : 'Active Module:'}
              </span>
              <span className="text-sm font-extrabold text-emerald-400">
                {navItems.find(i => i.id === activeTab)?.[lang === 'bn' ? 'labelBn' : 'labelEn']}
              </span>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
            {activeTab}
          </span>
        </div>

        {/* Collapsable Desktop Sidebar Menu */}
        <aside
          className={`hidden lg:flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-xl transition-all duration-300 ease-in-out shrink-0 sticky top-4 ${
            isSidebarCollapsed ? 'w-20 p-3' : 'w-72 p-4'
          }`}
        >
          {/* Sidebar Header with Collapse Button */}
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} pb-3 mb-3 border-b border-slate-800/80`}>
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sidebar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider font-syne">
                    {lang === 'bn' ? 'ন্যাভিগেশন মেনু' : 'Navigation Menu'}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {lang === 'bn' ? 'শাখা মডিউল অপশন' : 'Workspace Modules'}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 rounded-xl transition-all border border-slate-700 active:scale-95"
              title={isSidebarCollapsed ? 'Expand Sidebar Navigation' : 'Collapse Sidebar Navigation'}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-emerald-400" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>

          {/* Navigation Items List */}
          <nav className="space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const label = lang === 'bn' ? item.labelBn : item.labelEn;
              const desc = lang === 'bn' ? item.descriptionBn : item.descriptionEn;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  title={isSidebarCollapsed ? label : undefined}
                  className={`w-full group relative flex items-center ${
                    isSidebarCollapsed ? 'justify-center py-3' : 'justify-between p-3'
                  } rounded-xl font-medium text-xs transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-400/40 font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                  }`}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-slate-950/40 text-white' 
                        : 'bg-slate-800 text-slate-400 group-hover:text-emerald-400 group-hover:bg-slate-700/60'
                    }`}>
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>

                    {!isSidebarCollapsed && (
                      <div className="text-left overflow-hidden">
                        <div className="font-extrabold truncate text-xs">{label}</div>
                        <div className={`text-[10px] truncate ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                          {desc}
                        </div>
                      </div>
                    )}
                  </div>

                  {!isSidebarCollapsed && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${item.badgeClass}`}>
                      {item.badge}
                    </span>
                  )}

                  {isSidebarCollapsed && isActive && (
                    <span className="absolute right-1 top-1 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Collapsable Sidebar Bottom Quick Info & Toggle Hint */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            {!isSidebarCollapsed ? (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">
                    {lang === 'bn' ? 'সাপোর্ট কুইক স্ট্যাটাস' : 'Quick NOC Status'}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 font-bold">{openCount} {lang === 'bn' ? 'পেন্ডিং' : 'Open'}</span>
                  <span className="text-rose-400 font-bold">{emergencyLineCutsCount} {lang === 'bn' ? 'কাট' : 'Cuts'}</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="w-full py-2 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-all"
                title="Expand Navigation"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </aside>

        {/* Mobile Overlay Drawer */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileSidebarOpen(false)}
                className="lg:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm"
              />

              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-900 border-r border-slate-800 p-4 shadow-2xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Sidebar className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-sm font-extrabold text-white">
                        {lang === 'bn' ? 'ড্যাশবোর্ড ন্যাভিগেশন' : 'Dashboard Navigation'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="space-y-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      const label = lang === 'bn' ? item.labelBn : item.labelEn;
                      const desc = lang === 'bn' ? item.descriptionBn : item.descriptionEn;

                      return (
                        <button
                          key={`mob-${item.id}`}
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsMobileSidebarOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-3 rounded-xl font-medium text-xs transition-all ${
                            isActive
                              ? 'bg-emerald-600 text-white shadow-md font-bold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4 text-emerald-400" />
                            <div className="text-left">
                              <div className="font-extrabold">{label}</div>
                              <div className="text-[10px] opacity-80">{desc}</div>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${item.badgeClass}`}>
                            {item.badge}
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setIsMobileSidebarOpen(false);
                      if (onOpenNewTicketModal) onOpenNewTicketModal();
                    }}
                    className="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'ম্যানুয়াল টিকেট এন্ট্রি' : 'Create New Ticket'}</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Workspace */}
        <main className="flex-1 min-w-0 w-full">

      {/* TAB 0: MANAGER KPI DASHBOARD (RECHARTS INTEGRATION) */}
      {activeTab === 'KPI_DASHBOARD' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Top KPI Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {lang === 'bn' ? 'গড় প্রথম রেসপন্স টাইম' : 'Avg First Response Time'}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-extrabold text-slate-900 font-mono">18.4 min</h3>
                  <span className="text-xs font-bold text-emerald-600 font-mono">↓ 12% SLA</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Target SLA: &lt; 30.0 min</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {lang === 'bn' ? 'গড় টিকেট সমাধান টাইম' : 'Avg Resolution Time'}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-extrabold text-slate-900 font-mono">42.1 min</h3>
                  <span className="text-xs font-bold text-emerald-600 font-mono">↓ 8% Target</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Target SLA: &lt; 60.0 min</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
                <Target className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {lang === 'bn' ? '৩০ দিনের এসএলএ কমপ্লায়েন্স' : '30-Day SLA Compliance'}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-extrabold text-emerald-600 font-mono">96.8%</h3>
                  <span className="text-xs font-bold text-emerald-600 font-mono">↑ 2.4%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Goal: &gt; 95.0% SLA target</p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {lang === 'bn' ? '৩০ দিনে মোট টিকেট ভলিউম' : '30-Day Ticket Volume'}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-extrabold text-slate-900 font-mono">418</h3>
                  <span className="text-xs font-bold text-slate-500 font-mono">~14 / day</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Resolved: 392 (93.7%)</p>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-200">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* Current Month Category & Resolution Summary Section (Recharts) */}
          <MonthSummaryAnalytics
            tickets={tickets}
            lang={lang}
            onFilterCategory={(category) => {
              setSelectedCategory(category);
              setActiveTab('TICKETS');
            }}
          />

          {/* Recharts Weekly Resolution Times by Day (Last 7 Days) */}
          <WeeklyResolutionChart
            tickets={tickets}
            lang={lang}
            onSelectTicket={onSelectTicket}
          />

          {/* Recharts Grid Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* CHART 1: Ticket Volume Trends over the Last 30 Days */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-base font-extrabold text-slate-900 font-syne">
                      {lang === 'bn' ? '৩০ দিনের টিকেট ভলিউম ট্রেন্ড' : '30-Day Ticket Volume Trends'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'bn' 
                      ? 'গত ৩০ দিনে দৈনিক মোট টিকেট, সমাধানকৃত টিকেট ও জরুরি এলওএস সমস্যা' 
                      : 'Daily inbound support requests, resolved issues, and urgent RED LOS incidents'}
                  </p>
                </div>

                {/* Animated Stylish System Time Range Button Bar */}
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-emerald-500/30 shadow-lg shadow-emerald-950/20 backdrop-blur-md">
                  <div className="flex items-center gap-1.5 pl-2 pr-1 border-r border-slate-800">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                      className="text-emerald-400"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </motion.div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest hidden sm:inline">
                        SYS WINDOW
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {([7, 14, 30] as const).map((days) => {
                      const isActive = trendRange === days;
                      return (
                        <motion.button
                          key={days}
                          onClick={() => setTrendRange(days)}
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.94 }}
                          className={`relative px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors ${
                            isActive
                              ? 'text-[#09090b] font-black'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="systemTimeActiveBg"
                              className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl shadow-[0_0_14px_rgba(16,185,129,0.6)]"
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10 flex items-center gap-1">
                            <span>{days}D</span>
                            {isActive && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-1.5 h-1.5 rounded-full bg-slate-950"
                              />
                            )}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recharts Area Chart Component */}
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorUrgent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderColor: '#334155', 
                        borderRadius: '0.75rem', 
                        color: '#f8fafc',
                        fontSize: '0.75rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Total Volume" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Resolved" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorResolved)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Urgent LOS" 
                      stroke="#f43f5e" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorUrgent)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold">{lang === 'bn' ? '💡 নোক পর্যবেক্ষণ মন্তব্য:' : '💡 NOC Insight:'}</span>
                <span>
                  {lang === 'bn' 
                    ? 'উইকএন্ড ও বৃষ্টির দিনে রেড এলওএস সমস্যা ১০-১৫% পর্যন্ত বৃদ্ধি পায়।' 
                    : 'Peak ticket spikes correspond to adverse weather and optical fiber cable maintenance.'}
                </span>
              </div>
            </div>

            {/* CHART 2: Average Response Time by Category */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base font-extrabold text-slate-900 font-syne">
                      {lang === 'bn' ? 'ক্যাটাগরি ভিত্তিক গড় রেসপন্স টাইম' : 'Average Response Time by Category'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'bn' 
                      ? 'প্রতিটি ক্যাটাগরির গড় রেসপন্স সময় (মিনিট) বনাম নির্ধারিত এসএলএ টার্গেট' 
                      : 'Average response time (minutes) compared against target SLA benchmarks'}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-xs font-bold rounded-lg">
                  SLA Comparison
                </span>
              </div>

              {/* Recharts Bar Chart Component */}
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={avgResponseTimeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="shortCat" 
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      unit=" m"
                    />
                    <Tooltip 
                      formatter={(value: any, name: any) => [`${value} Minutes`, name === 'avgMinutes' ? 'Avg Response Time' : 'SLA Target']}
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderColor: '#334155', 
                        borderRadius: '0.75rem', 
                        color: '#f8fafc',
                        fontSize: '0.75rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    />
                    <Bar 
                      dataKey="avgMinutes" 
                      name={lang === 'bn' ? 'গড় রেসপন্স সময় (মিনিট)' : 'Avg Response Time (min)'} 
                      radius={[6, 6, 0, 0]}
                    >
                      {avgResponseTimeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                    <Bar 
                      dataKey="slaTarget" 
                      name={lang === 'bn' ? 'এসএলএ টার্গেট সীমা' : 'SLA Target (min)'} 
                      fill="#cbd5e1" 
                      radius={[6, 6, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold">{lang === 'bn' ? '⚡ দ্রুততম সমাধান ক্যাটাগরি:' : '⚡ Fastest Category:'}</span>
                <span className="font-bold text-emerald-600">
                  {lang === 'bn' ? 'বিলিং ও রেড এলওএস সমস্যা (গড় ১৪ মিনিটে ফিল্ড টেকনিশিয়ান এ্যাসাইন)' : 'Billing & Red LOS (Avg 14.2 min response)'}
                </span>
              </div>

            </div>

          </div>

          {/* VISUAL MAP PLACEHOLDER: ISP POP Area Ticket Hotspot Grid */}
          <div className="bg-[#0b1329] p-5 rounded-2xl border border-slate-800 shadow-2xl text-slate-100 space-y-4 relative overflow-hidden">
            
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-400">
                  <Compass className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white font-syne tracking-tight">
                      {lang === 'bn' ? 'মিঠাপুকুর জোন টিকেট হটস্পট ও অপটিক্যাল ম্যাপ' : 'Mithapukur ISP POP Hotspots & Optical Map'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-mono font-bold border border-emerald-500/30">
                      LIVE HOTSPOTS
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'bn' 
                      ? '৯টি ইউনিয়ন পপ এলাকার রিয়েল-টাইম টিকেট ঘনত্ব ও ব্যাকবোন ফাইবার নেটওয়ার্ক নোড' 
                      : 'Real-time geographic ticket density across 9 Union POP nodes & backbone fiber trunks'}
                  </p>
                </div>
              </div>

              {/* Map Legend */}
              <div className="flex items-center gap-3 text-xs font-mono bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-slate-800">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-rose-400 font-bold">{lang === 'bn' ? 'জরুরি এলওএস' : 'Urgent LOS'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-amber-300 font-bold">{lang === 'bn' ? 'ওপেন টিকেট' : 'Open Pending'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-emerald-300 font-bold">{lang === 'bn' ? 'স্বাভাবিক' : 'Clear Node'}</span>
                </span>
              </div>
            </div>

            {/* Map Canvas Stage */}
            <div className="relative w-full h-[420px] bg-slate-950 rounded-xl border border-slate-800/90 overflow-hidden shadow-inner bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]">
              
              {/* Map Background Grid Details / Watermark */}
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/40 to-emerald-950/20 pointer-events-none" />
              <div className="absolute top-3 left-4 text-[10px] font-mono text-slate-500 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span>RANGPUR / MITHAPUKUR UPANJILA OPTICAL SUB-STATIONS</span>
                <span className="text-slate-600 hidden sm:inline">| LAT: 25.5786° N, LON: 89.2683° E</span>
              </div>

              {/* Vector Backbone Fiber Optics Lines SVGs */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {areaHotspotData.map((node, i) => {
                  if (node.isHq) return null;
                  const hqNode = areaHotspotData.find(n => n.isHq) || areaHotspotData[0];
                  return (
                    <g key={`line-${i}`}>
                      <line
                        x1={`${hqNode.x}%`}
                        y1={`${hqNode.y}%`}
                        x2={`${node.x}%`}
                        y2={`${node.y}%`}
                        stroke={node.urgent > 0 ? '#f43f5e' : node.open > 0 ? '#f59e0b' : '#10b981'}
                        strokeWidth={node.urgent > 0 ? '2' : '1.5'}
                        strokeOpacity="0.6"
                        strokeDasharray={node.urgent > 0 ? '4 2' : '6 3'}
                        className={node.urgent > 0 ? 'animate-pulse' : ''}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Hotspot Location Pins on Canvas */}
              {areaHotspotData.map((node) => {
                const isSelected = selectedHotspotNode === node.name;

                return (
                  <div
                    key={node.name}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20"
                    onClick={() => setSelectedHotspotNode(node.name)}
                  >
                    {/* Pulsing Aura Effect */}
                    <div className="relative flex items-center justify-center">
                      {node.urgent > 0 ? (
                        <div className="absolute -inset-2.5 rounded-full bg-rose-500/40 animate-ping" />
                      ) : node.open > 0 ? (
                        <div className="absolute -inset-2 rounded-full bg-amber-500/30 animate-pulse" />
                      ) : null}

                      {/* Center Node Pin Button */}
                      <div className={`p-2 rounded-full shadow-lg transition-all border flex items-center justify-center ${
                        isSelected 
                          ? 'ring-4 ring-emerald-400 scale-125 bg-slate-900 border-emerald-400 z-30'
                          : node.urgent > 0 
                          ? 'bg-rose-950 border-rose-500 text-rose-400 hover:scale-110' 
                          : node.open > 0 
                          ? 'bg-amber-950 border-amber-500 text-amber-300 hover:scale-110' 
                          : node.isHq 
                          ? 'bg-emerald-950 border-emerald-400 text-emerald-300 hover:scale-110'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:scale-110'
                      }`}>
                        {node.isHq ? (
                          <Server className="w-4 h-4 text-emerald-400" />
                        ) : node.urgent > 0 ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5" />
                        )}
                      </div>

                      {/* Hotspot Badge Label */}
                      <div className={`absolute top-full mt-1.5 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap shadow-md border flex items-center gap-1 transition-all ${
                        isSelected 
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300 z-30' 
                          : node.urgent > 0 
                          ? 'bg-rose-950/90 text-rose-200 border-rose-700' 
                          : node.open > 0 
                          ? 'bg-amber-950/90 text-amber-200 border-amber-700' 
                          : 'bg-slate-900/90 text-slate-300 border-slate-700'
                      }`}>
                        <span>{node.shortName}</span>
                        {node.total > 0 && (
                          <span className={`px-1 py-0.2 rounded font-black ${
                            node.urgent > 0 ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200'
                          }`}>
                            {node.total}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Selected Hotspot Details Drawer / Overlay Card inside Map */}
              {selectedHotspotNode && (() => {
                const nodeData = areaHotspotData.find(n => n.name === selectedHotspotNode);
                if (!nodeData) return null;

                return (
                  <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-slate-900/95 border border-slate-700/80 backdrop-blur-md rounded-2xl p-4 text-xs shadow-2xl z-40 animate-fade-in font-mono space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <div>
                          <h4 className="font-bold text-white text-sm tracking-tight">{nodeData.name}</h4>
                          <p className="text-[10px] text-slate-400">{nodeData.oltInfo}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedHotspotNode(null)}
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                      <div className="bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
                        <span className="text-slate-400 text-[9px] block">TOTAL</span>
                        <span className="font-bold text-white text-sm">{nodeData.total}</span>
                      </div>
                      <div className="bg-rose-950/60 p-1.5 rounded-xl border border-rose-800">
                        <span className="text-rose-300 text-[9px] block">URGENT</span>
                        <span className="font-bold text-rose-400 text-sm">{nodeData.urgent}</span>
                      </div>
                      <div className="bg-amber-950/60 p-1.5 rounded-xl border border-amber-800">
                        <span className="text-amber-300 text-[9px] block">PENDING</span>
                        <span className="font-bold text-amber-400 text-sm">{nodeData.open}</span>
                      </div>
                      <div className="bg-emerald-950/60 p-1.5 rounded-xl border border-emerald-800">
                        <span className="text-emerald-300 text-[9px] block">RESOLVED</span>
                        <span className="font-bold text-emerald-400 text-sm">{nodeData.resolved}</span>
                      </div>
                    </div>

                    {/* Quick Ticket Filter Action */}
                    <div className="pt-1 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400">
                        {nodeData.total > 0 
                          ? `${nodeData.total} tickets reported in this POP area.`
                          : 'No active support tickets reported.'}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedArea(nodeData.name);
                          setActiveTab('TICKETS');
                        }}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl transition-all flex items-center gap-1 active:scale-95 text-[11px]"
                      >
                        <span>{lang === 'bn' ? 'টিকেট ফিল্টার দেখুন' : 'Filter Tickets'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Bottom Quick POP Grid Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2 text-xs font-mono">
              {areaHotspotData.map(node => (
                <button
                  key={`btm-${node.name}`}
                  onClick={() => setSelectedHotspotNode(node.name)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    selectedHotspotNode === node.name 
                      ? 'bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/30' 
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/80'
                  }`}
                >
                  <p className="text-[10px] text-slate-400 truncate">{node.shortName}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`font-bold text-xs ${
                      node.urgent > 0 ? 'text-rose-400' : node.open > 0 ? 'text-amber-300' : 'text-slate-300'
                    }`}>
                      {node.total} Tkt
                    </span>
                    {node.urgent > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </div>
                </button>
              ))}
            </div>

          </div>

          {/* NOC Duty Response SLA Index Breakdown & Drilldown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-syne">
                    {lang === 'bn' ? 'নোক টিম রেসপন্স ও স্টাফ পারফরম্যান্স ওভারভিউ' : 'NOC Team Response & Staff Performance'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'bn' ? 'গড় রেসপন্স সময়, দৈনিক সমাধান এবং লাইভ এসএলএ ইনডেক্স' : 'Avg ticket response time, completed jobs, and live SLA index'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setActiveTab('NOC_PERFORMANCE')}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all border border-indigo-200 shadow-xs"
              >
                <Award className="w-4 h-4 text-indigo-600" />
                <span>{lang === 'bn' ? 'সম্পূর্ণ পারফরম্যান্স ড্যাশবোর্ড ➔' : 'Open Full Performance Dashboard ➔'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {nocStaff.map(staff => (
                <div 
                  key={staff.id} 
                  onClick={() => setActiveTab('NOC_PERFORMANCE')}
                  className="p-3.5 bg-slate-50 hover:bg-indigo-50/40 rounded-xl border border-slate-200/80 space-y-1.5 cursor-pointer transition-all hover:border-indigo-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate">{staff.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                      {staff.slaAdherenceRate ? `${staff.slaAdherenceRate}%` : '98.4%'} SLA
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{staff.designation}</p>
                  <div className="pt-1 flex items-center justify-between font-mono text-[11px] text-slate-700">
                    <span>Avg Resp: <strong className="text-emerald-700">{staff.avgResponseTimeMin ? `${staff.avgResponseTimeMin}m` : '12.4m'}</strong></span>
                    <span>Done: <strong>{staff.completedToday}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 1: TICKETS CENTER */}
      {activeTab === 'TICKETS' && (
        <div>
          {/* Multi-Filter & Search Engine Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Search Input Engine */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600" />
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'CID (যেমন CID-101), গ্রাহকের নাম বা টিকেট ID (#1001) খুঁজুন...' : 'Filter by CID (e.g. CID-101), Client Name, or Ticket ID...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 text-xs md:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium text-slate-900 shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full bg-slate-200"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Quick Search Suggestion Pills */}
              <div className="hidden lg:flex items-center gap-1.5 text-xs">
                <span className="text-[11px] font-mono text-slate-400 font-semibold">{lang === 'bn' ? 'কুইক সার্চ:' : 'Quick:'}</span>
                {['CID-101', 'CID-102', 'LOS', 'Urgent'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSearchQuery(tag)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 font-mono text-[11px] border border-slate-200 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* CSV Export & Filter Controls */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                {/* Export CSV Button */}
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
                  title="Download CSV log of filtered tickets"
                >
                  <Download className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'ডাউনলোড সিএসভি (CSV)' : 'CSV Export'}</span>
                </button>

                {(searchQuery || selectedArea !== 'ALL' || selectedStatus !== 'ALL' || selectedPriority !== 'ALL') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedArea('ALL');
                      setSelectedStatus('ALL');
                      setSelectedPriority('ALL');
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'রিসেট' : 'Reset'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Selection Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-bold flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'bn' ? 'ফিল্টারসমূহ:' : 'Filters:'}</span>
              </span>

              {/* Area / Union / POP Filter Select */}
              <select
                value={selectedArea}
                onChange={(e) => {
                  if (e.target.value === 'ADD_NEW_POP') {
                    setIsAddPopModalOpen(true);
                  } else {
                    setSelectedArea(e.target.value);
                  }
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="ALL">{lang === 'bn' ? 'সকল ইউনিয়ন ও POP এলাকা (All POP Areas)' : 'All Unions / POP Areas'}</option>
                {popAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
                <option value="ADD_NEW_POP" className="font-extrabold text-emerald-700 bg-emerald-50">
                  {lang === 'bn' ? '➕ নতুন POP এলাকা যোগ করুন (Add New PoP Area)...' : '➕ Add New PoP Area...'}
                </option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">{lang === 'bn' ? 'সকল স্ট্যাটাস (All Statuses)' : 'All Statuses'}</option>
                <option value="Open">Open (পেন্ডিং)</option>
                <option value="NOC_Assigned">NOC Assigned (অ্যাসাইন)</option>
                <option value="In_Progress">In Progress (কাজ চলছে)</option>
                <option value="Resolved">Resolved (সমাধান)</option>
                <option value="Closed">Closed (বন্ধ)</option>
              </select>

              {/* Priority Filter */}
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">{lang === 'bn' ? 'সকল প্রাইওরিটি (All Priorities)' : 'All Priorities'}</option>
                <option value="Urgent">Urgent (জরুরি / Emergency Line Cut)</option>
                <option value="High">High (উচ্চ)</option>
                <option value="Medium">Medium (সাধারণ)</option>
                <option value="Low">Normal / Low (স্বাভাবিক)</option>
              </select>

              <span className="ml-auto text-slate-500 font-mono text-[11px]">
                Found: <strong>{filteredTickets.length}</strong> tickets
              </span>
            </div>
          </div>

          {/* Tickets List View Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="bg-slate-900 text-slate-200 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-3 text-center w-12">
                      <button
                        type="button"
                        onClick={handleSelectAllFiltered}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title={isAllFilteredSelected ? "Deselect all" : "Select all visible"}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          isAllFilteredSelected 
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-sm' 
                            : isSomeFilteredSelected
                            ? 'bg-emerald-900 border-emerald-500 text-emerald-300'
                            : 'bg-slate-800 border-slate-600 text-transparent'
                        }`}>
                          {isAllFilteredSelected ? (
                            <Check className="w-3 h-3 stroke-[3]" />
                          ) : isSomeFilteredSelected ? (
                            <span className="w-2 h-0.5 bg-emerald-300 rounded-full" />
                          ) : null}
                        </div>
                      </button>
                    </th>
                    <th className="py-3.5 px-4 font-semibold">{lang === 'bn' ? 'টিকেট আইডি ও সময়' : 'Ticket ID & Date'}</th>
                    <th className="py-3.5 px-4 font-semibold">{lang === 'bn' ? 'গ্রাহক (CID) ও ফোন' : 'Subscriber CID & Phone'}</th>
                    <th className="py-3.5 px-4 font-semibold">{lang === 'bn' ? 'সমস্যার বিবরণ' : 'Issue Summary'}</th>
                    <th className="py-3.5 px-4 font-semibold">{lang === 'bn' ? 'প্রাইওরিটি' : 'Priority'}</th>
                    <th className="py-3.5 px-4 font-semibold">{lang === 'bn' ? 'স্ট্যাটাস (Single Click)' : 'Status'}</th>
                    <th className="py-3.5 px-4 font-semibold">{lang === 'bn' ? 'লাইনম্যান / ডিসপ্যাচ ইউনিট' : 'Lineman & Field Tech Dispatch'}</th>
                    <th className="py-3.5 px-4 font-semibold text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTickets.map((ticket) => {
                    const priorityConfig = getPriorityColorConfig(ticket.priority);
                    const isSelected = selectedTicketIds.includes(ticket.id);

                    return (
                      <tr 
                        key={ticket.id} 
                        className={`transition-colors group ${
                          isSelected
                            ? 'bg-emerald-50/80 border-l-4 border-l-emerald-600'
                            : ticket.priority === 'Urgent'
                            ? 'border-l-4 border-l-rose-500 bg-rose-50/30 hover:bg-rose-50/60'
                            : ticket.priority === 'High'
                            ? 'border-l-4 border-l-yellow-400 bg-yellow-50/30 hover:bg-yellow-50/60'
                            : 'border-l-4 border-l-blue-500 bg-blue-50/15 hover:bg-blue-50/40'
                        }`}
                      >
                        {/* Row Selection Checkbox */}
                        <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectTicket(ticket.id)}
                            className="w-4 h-4 rounded text-emerald-600 bg-white border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                          />
                        </td>

                        {/* Ticket ID & Time */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 font-mono flex items-center gap-1.5">
                            <span>#{ticket.id}</span>
                            {ticket.priority === 'Urgent' && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" title="Emergency High Priority (Red)" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dotColor}`} />
                            <p className="text-[11px] text-slate-500 font-mono">
                              {new Date(ticket.createdDate).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </td>

                      {/* Client CID, Name & Union */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{ticket.clientName}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-mono font-bold">
                            {ticket.cid}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-slate-700">{ticket.clientPhone}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">{ticket.area}</div>
                      </td>

                      {/* Issue Category & Title */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 mb-1 border border-slate-200">
                          {ticket.category}
                        </span>
                        <p className="font-semibold text-slate-900 line-clamp-1">{ticket.title}</p>
                      </td>

                      {/* Priority Tag */}
                      <td className="py-3.5 px-4">
                        <TicketPriorityBadge 
                          priority={ticket.priority} 
                          lang={lang} 
                          size="sm" 
                          theme="light" 
                        />
                      </td>

                      {/* Status Tag & Single-Click Selector */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <TicketStatusBadge status={ticket.status} lang={lang} size="sm" />
                          <select
                            value={ticket.status}
                            onChange={(e) => onUpdateTicketStatus(ticket.id, e.target.value as TicketStatus)}
                            className={`px-2 py-1 rounded-lg text-xs font-bold focus:ring-2 focus:ring-emerald-500 cursor-pointer border ${
                              ticket.status === 'Resolved'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : ticket.status === 'Closed'
                                ? 'bg-teal-50 text-teal-800 border-teal-300'
                                : ticket.status === 'In_Progress'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : ticket.status === 'NOC_Assigned'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="Open">Open (পেন্ডিং)</option>
                            <option value="NOC_Assigned">NOC Assigned</option>
                            <option value="In_Progress">In Progress (কাজ চলছে)</option>
                            <option value="Resolved">Resolved (সমাধান)</option>
                            <option value="Closed">Closed (বন্ধ)</option>
                          </select>
                        </div>
                      </td>

                      {/* Lineman & Field Tech Dispatch selector */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={ticket.assignedNoc || ''}
                          onChange={(e) => onAssignNocStaff(ticket.id, e.target.value)}
                          className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800 w-full max-w-[190px]"
                        >
                          <option value="">{lang === 'bn' ? '-- রিপেয়ার স্কোয়াড নির্ধারণ করুন --' : '-- Select Field Squad --'}</option>
                          {nocStaff.map(staff => (
                            <option key={staff.id} value={`${staff.name} (${staff.id})`}>
                              {staff.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Action Buttons: Print Work Order & View */}
                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWorkOrderTicket(ticket);
                            setIsWorkOrderModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1"
                          title="Print Printable Work Order Job Sheet"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden xl:inline">{lang === 'bn' ? 'ওয়ার্ক অর্ডার' : 'Job Sheet'}</span>
                        </button>

                        <button 
                          onClick={() => onSelectTicket(ticket)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 shadow-sm"
                        >
                          <span>{lang === 'bn' ? 'বিস্তারিত' : 'View'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                  {filteredTickets.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="font-semibold">{lang === 'bn' ? 'কোন টিকেট পাওয়া যায়নি' : 'No tickets matching search criteria'}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Floating Bulk Operations Command Bar for Manager */}
          <AnimatePresence>
            {selectedTicketIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.96 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-4xl bg-slate-950/95 backdrop-blur-md border border-slate-700/80 text-white rounded-2xl shadow-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4"
              >
                {/* Selected Counter & Clear */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-slate-950 font-black text-xs">
                      {selectedTicketIds.length}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-200">
                        {lang === 'bn' ? 'টিকেট নির্বাচিত হয়েছে' : 'Tickets Selected'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {lang === 'bn' ? 'বাল্ক অ্যাকশন প্রয়োগ করুন' : 'Apply bulk action simultaneously'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleClearSelection}
                    className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'Deselect All'}
                  </button>
                </div>

                {/* Bulk Status & Assignment Controls */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                  {/* Bulk Assign Staff Selector */}
                  <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs">
                    <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">
                      {lang === 'bn' ? 'নোক স্কোয়াড:' : 'Assign:'}
                    </span>
                    <select
                      value={bulkManagerStaffAssign}
                      onChange={(e) => {
                        setBulkManagerStaffAssign(e.target.value);
                        if (e.target.value) {
                          handleBulkAssignStaff(e.target.value);
                        }
                      }}
                      className="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer text-xs"
                    >
                      <option value="" className="bg-slate-900 text-slate-400">
                        {lang === 'bn' ? 'লাইনম্যান নির্বাচন...' : 'Select Squad...'}
                      </option>
                      {nocStaff.map(staff => (
                        <option key={staff.id} value={`${staff.name} (${staff.id})`} className="bg-slate-900 text-slate-200">
                          {staff.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bulk Status Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleBulkStatusChange('In_Progress')}
                      className="px-3 py-1.5 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'ইন-প্রোগ্রেস' : 'In Progress'}</span>
                    </button>

                    <button
                      onClick={() => handleBulkStatusChange('Resolved')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'সমাধান (Resolved)' : 'Resolve'}</span>
                    </button>

                    <button
                      onClick={() => handleBulkStatusChange('Closed')}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                      {lang === 'bn' ? 'ক্লোজড' : 'Close'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* TAB: NOC STAFF PERFORMANCE METRICS (DEDICATED FULL VIEW) */}
      {activeTab === 'NOC_PERFORMANCE' && (
        <NocStaffPerformanceDashboard
          nocStaff={nocStaff}
          tickets={tickets}
          lang={lang}
        />
      )}

      {/* TAB 2: NOC STAFF ROSTER & PERFORMANCE VIEW */}
      {activeTab === 'NOC_STAFF' && (
        <div className="space-y-6">
          {/* Sub-view Switcher Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-syne flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>{lang === 'bn' ? 'নোক ফিল্ড টিম ও ইঞ্জিনিয়ারিং ম্যানেজমেন্ট' : 'NOC Field Team & Engineering Management'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'bn' 
                  ? 'ইঞ্জিনিয়ারদের লাইভ অন-ডিউটি স্ট্যাটাস, কর্মক্ষমতা ও পারফরম্যান্স কেপিআই মেট্রিক্স' 
                  : 'Live duty status, active ticket allocation, and individual performance KPIs'}
              </p>
            </div>

            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => setNocStaffSubView('PERFORMANCE')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  nocStaffSubView === 'PERFORMANCE'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? '📊 পারফরম্যান্স ও কেপিআই (Metrics)' : '📊 Performance & KPIs'}</span>
              </button>
              <button
                onClick={() => setNocStaffSubView('ROSTER')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  nocStaffSubView === 'ROSTER'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? '👥 ডিউটি রোস্টার কার্ড (Roster Cards)' : '👥 Duty Roster Cards'}</span>
              </button>
            </div>
          </div>

          {nocStaffSubView === 'PERFORMANCE' ? (
            <NocStaffPerformanceDashboard
              nocStaff={nocStaff}
              tickets={tickets}
              lang={lang}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {nocStaff.map((staff) => (
                <div key={staff.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-bold">
                          {staff.id}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base mt-2">{staff.name}</h3>
                        <p className="text-xs text-emerald-700 font-medium">{staff.designation}</p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        staff.status === 'On Duty'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : staff.status === 'On Field'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        ● {staff.status}
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{staff.area}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono">{staff.phone}</span>
                      </div>
                      {staff.avgResponseTimeMin && (
                        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Avg Response: <strong>{staff.avgResponseTimeMin}m</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 bg-slate-50 rounded-lg p-3 flex items-center justify-between text-xs border border-slate-100">
                    <div>
                      <span className="text-slate-500 block text-[11px]">{lang === 'bn' ? 'এক্টিভ টিকেট' : 'Active'}</span>
                      <span className="font-bold text-slate-900 text-sm font-mono">{staff.activeTickets}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">{lang === 'bn' ? 'আজ সম্পন্ন' : 'Completed'}</span>
                      <span className="font-bold text-emerald-600 text-sm font-mono">{staff.completedToday}</span>
                    </div>
                    {staff.rating && (
                      <div className="text-right">
                        <span className="text-slate-500 block text-[11px]">{lang === 'bn' ? 'রেটিং' : 'Rating'}</span>
                        <span className="font-bold text-amber-600 text-sm font-mono flex items-center gap-0.5 justify-end">
                          ★ {staff.rating}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CLIENT RECORDS */}
      {activeTab === 'CLIENTS' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-900 text-white font-bold text-sm flex items-center justify-between">
            <span>{lang === 'bn' ? 'মিঠাপুকুর ডেল্টা নেটওয়ার্ক সক্রিয় গ্রাহক তালিকা (CID Database)' : 'Active Delta Mithapukur CID Database'}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-normal text-slate-300">Total: {clients.length} Clients</span>
              {onOpenAddNewClient && (
                <button
                  onClick={onOpenAddNewClient}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 transition-all shadow-sm active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'ক্লায়েন্ট যোগ করুন' : 'Add Client'}</span>
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-slate-100 text-slate-700 text-xs uppercase">
                <tr>
                  <th className="py-3 px-4">CID</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'গ্রাহকের নাম' : 'Name'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'প্যাকেজ স্পিড' : 'Package'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'আইপি ও ONU MAC' : 'IP & MAC'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'অপটিক্যাল পাওয়ার' : 'Optical Signal'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'এলাকা' : 'Area'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {clients.map((client) => (
                  <tr key={client.cid} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">{client.cid}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{client.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{client.phone}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-emerald-700">{client.package}</td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      <div>IP: {client.ipAddress}</div>
                      <div className="text-[10px] text-slate-400">MAC: {client.onuMac}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                        client.opticalPower.includes('Low') || client.opticalPower.includes('LOS')
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {client.opticalPower}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{client.area}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                        {client.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: NETWORK SERVERS, OLT & MIKROTIK DEVICE MANAGER */}
      {activeTab === 'SERVERS' && (
        <div className="animate-fade-in">
          <NetworkServerManager
            servers={serversList}
            popAreas={popAreas}
            lang={lang}
            onAddServer={handleAddServer}
            onUpdateServer={handleUpdateServer}
            onDeleteServer={handleDeleteServer}
          />
        </div>
      )}

      {/* TAB 5: WHATSAPP & EMAIL BROADCAST ALERT TRIGGER */}
      {activeTab === 'BROADCAST' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {lang === 'bn' ? 'হোয়াটসঅ্যাপ ও ইমেইল ইনস্ট্যান্ট নোটিফিকেশন' : 'WhatsApp & Email Instant Alert Sender'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'bn' ? 'গ্রাহক বা নোক টিমের কাছে তাতক্ষণিক বার্তা ও অ্যালার্ট প্রেরণ' : 'Direct notification dispatch trigger'}
              </p>
            </div>
          </div>

          {broadcastSentSuccess && (
            <div className="mb-4 p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {lang === 'bn' 
                  ? 'সফলভাবে নোটিফিকেশন ডিসপ্যাচ করা হয়েছে! (Dispatch Log -এ রেকর্ড যুক্ত হয়েছে)' 
                  : 'Notification successfully dispatched to WhatsApp/Email channel!'}
              </span>
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs md:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'প্রাপক নির্বাচন (Target Receiver)' : 'Select Recipient'}
              </label>
              <select
                value={broadcastRecipientType}
                onChange={(e) => setBroadcastRecipientType(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All Clients">সকল গ্রাহক (Broadcast to All Clients)</option>
                <option value="NOC Team">নোক টিম (NOC Engineering Team)</option>
                <option value="Specific CID">নির্দিষ্ট CID গ্রাহক (Single Client CID)</option>
              </select>
            </div>

            {broadcastRecipientType === 'Specific CID' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'গ্রাহক CID নির্বাচন' : 'Target Client CID'}
                </label>
                <select
                  value={targetCid}
                  onChange={(e) => setTargetCid(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  {clients.map(c => (
                    <option key={c.cid} value={c.cid}>
                      {c.cid} - {c.name} ({c.area})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'ডিভারি চ্যানেল (Channel)' : 'Delivery Channel'}
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="channel"
                    value="WhatsApp"
                    checked={broadcastChannel === 'WhatsApp'}
                    onChange={() => setBroadcastChannel('WhatsApp')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>WhatsApp Business API</span>
                </label>
                <label className="flex items-center gap-2 font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="channel"
                    value="Email"
                    checked={broadcastChannel === 'Email'}
                    onChange={() => setBroadcastChannel('Email')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Email Notification</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'বার্তার বিবরণ (Message Text in Bengali/English)' : 'Message Payload'}
              </label>
              <textarea
                rows={4}
                required
                placeholder="যেমন: সম্মানিত ডেল্টা মিঠাপুকুর গ্রাহকবৃন্দ, পায়রাবন্দ এলাকায় ডিস্ট্রিবিউশন ফাইবার রক্ষণাবেক্ষণের জন্য দুপুর ২টা থেকে ৩টা পর্যন্ত সাময়িক ইন্টারনেট ধীরগতি হতে পারে। সাময়িক অসুবিধার জন্য আমরা আন্তরিকভাবে দুঃখিত।"
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপ/ইমেইলে পাঠাও' : 'Dispatch Notification Now'}</span>
            </button>
          </form>
        </div>
      )}
        </main>
      </div>

      {/* Printable Optical Field Work Order Modal */}
      <WorkOrderModal
        ticket={selectedWorkOrderTicket}
        isOpen={isWorkOrderModalOpen}
        onClose={() => setIsWorkOrderModalOpen(false)}
        lang={lang}
      />

      {/* Add New PoP Area Modal */}
      {isAddPopModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {lang === 'bn' ? 'নতুন POP এলাকা সংযোজন' : 'Create Add New PoP Area'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'bn' ? 'মিঠাপুকুর ব্রডব্যান্ড নেটওয়ার্ক কাভারেজ জোন' : 'Register new network coverage POP station'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddPopModalOpen(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newPopName.trim()) return;

                const formatted = newPopUnion.trim()
                  ? `${newPopName.trim()} (${newPopUnion.trim()})`
                  : newPopName.trim();

                if (!popAreas.includes(formatted)) {
                  setPopAreas(prev => [...prev, formatted]);
                }
                setSelectedArea(formatted);
                setNewPopName('');
                setNewPopUnion('');
                setIsAddPopModalOpen(false);
              }}
              className="space-y-4 text-xs md:text-sm"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'POP এলাকার নাম / স্টেশনের স্থান *' : 'PoP Station / Area Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'bn' ? 'যেমন: শঠিবাড়ী বাজার POP, পাজিপাড়া মোড় POP' : 'e.g. Shatibari Market POP, Pajipara Cross POP'}
                  value={newPopName}
                  onChange={(e) => setNewPopName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ইউনিয়ন বা আঞ্চলিক জোন (English Tag)' : 'Union / Zone Region'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'যেমন: Shatibari / Ranipukur' : 'e.g. Shatibari POP / Zone 12'}
                  value={newPopUnion}
                  onChange={(e) => setNewPopUnion(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'অপটিক্যাল ফাইবার পোর্ট ক্যাপাসিটি' : 'Optical Port Capacity & OLT'}
                </label>
                <input
                  type="text"
                  value={newPopCapacity}
                  onChange={(e) => setNewPopCapacity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPopModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'সেভ ও POP এরিয়া যোগ করুন' : 'Save & Add PoP Area'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
