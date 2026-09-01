import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, NocStaff, TicketStatus, TicketPriority, InventoryItem } from '../types';
import { DeltaLogo } from './DeltaLogo';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketPriorityBadge, getPriorityColorConfig } from './TicketPriorityBadge';
import { SlaTimer } from './SlaTimer';
import { 
  Cpu, 
  Activity, 
  Wifi, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Sparkles, 
  Send, 
  ChevronRight, 
  RefreshCw,
  Zap,
  Terminal,
  Server,
  Clock,
  PhoneCall,
  Radio,
  Layers,
  Filter,
  Check,
  Search,
  ArrowUpRight,
  Gauge,
  LogOut,
  CheckSquare,
  Square,
  ListChecks,
  X,
  Users,
  Package,
  Box,
  Truck
} from 'lucide-react';

interface NocPortalProps {
  tickets: Ticket[];
  nocStaff: NocStaff[];
  inventory?: InventoryItem[];
  inventoryLowStockCount?: number;
  onOpenInventory?: () => void;
  lang: 'bn' | 'en';
  onSelectTicket: (ticket: Ticket) => void;
  onUpdateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  onBulkUpdateTicketStatus?: (ticketIds: string[], status: TicketStatus, assignedNoc?: string) => void;
  onAddComment: (ticketId: string, text: string) => void;
  onTriggerAiDiagnosis: (ticket: Ticket) => Promise<void>;
  aiLoadingTicketId: string | null;
  currentUser?: { username: string; name: string } | null;
  onLogout?: () => void;
}

export const NocPortal: React.FC<NocPortalProps> = ({
  tickets,
  nocStaff,
  inventory = [],
  inventoryLowStockCount = 0,
  onOpenInventory,
  lang,
  onSelectTicket,
  onUpdateTicketStatus,
  onBulkUpdateTicketStatus,
  onAddComment,
  onTriggerAiDiagnosis,
  aiLoadingTicketId,
  currentUser,
  onLogout,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>('NOC-101');
  const [activeNocFilter, setActiveNocFilter] = useState<'ALL' | 'MINE' | 'URGENT' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPonPort, setSelectedPonPort] = useState<number | null>(null);

  // Bulk Ticket Selection State
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [bulkStaffAssign, setBulkStaffAssign] = useState<string>('');

  // Live Clock
  const [timeString, setTimeString] = useState('');
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // ONU Diagnostics Tool State
  const [diagCid, setDiagCid] = useState('CID-1003');
  const [diagRunning, setDiagRunning] = useState(false);
  const [diagResult, setDiagResult] = useState<{
    ip: string;
    rxPower: string;
    rxValue: number;
    pingMs: number;
    packetLoss: number;
    vlan: number;
    oltPort: string;
    distanceKm: string;
    status: 'ONLINE' | 'WARNING' | 'CRITICAL_LOS';
  } | null>(null);

  // Quick Comment Input State
  const [commentTextMap, setCommentTextMap] = useState<{ [ticketId: string]: string }>({});

  const currentStaff = nocStaff.find(s => s.id === selectedStaffId) || nocStaff[0];

  // Run Simulated Ping / ONU Diagnostic Test
  const handleRunDiagnostic = (cidToTest?: string) => {
    const cid = cidToTest || diagCid;
    setDiagCid(cid);
    setDiagRunning(true);
    setDiagResult(null);

    setTimeout(() => {
      setDiagRunning(false);
      if (cid === 'CID-1003') {
        setDiagResult({
          ip: '103.145.23.44',
          rxPower: '-32.1 dBm (High Optical Attenuation)',
          rxValue: -32.1,
          pingMs: 0,
          packetLoss: 100,
          vlan: 104,
          oltPort: 'OLT-2 / PON 2',
          distanceKm: '1.25 km from POP Splitter 4',
          status: 'CRITICAL_LOS',
        });
      } else if (cid === 'CID-1001') {
        setDiagResult({
          ip: '103.145.22.102',
          rxPower: '-26.8 dBm (Low Optical Margin)',
          rxValue: -26.8,
          pingMs: 145,
          packetLoss: 8,
          vlan: 102,
          oltPort: 'OLT-1 / PON 1',
          distanceKm: '0.85 km from College Rd POP',
          status: 'WARNING',
        });
      } else {
        setDiagResult({
          ip: '103.145.22.115',
          rxPower: '-20.5 dBm (Optimal Fiber Link)',
          rxValue: -20.5,
          pingMs: 14,
          packetLoss: 0,
          vlan: 101,
          oltPort: 'OLT-1 / PON 3',
          distanceKm: '0.42 km from Main Splitter',
          status: 'ONLINE',
        });
      }
    }, 1000);
  };

  const filteredTickets = tickets.filter(t => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matches = t.id.toLowerCase().includes(q) || 
                      t.cid.toLowerCase().includes(q) || 
                      t.clientName.toLowerCase().includes(q) || 
                      (t.clientPhone && t.clientPhone.toLowerCase().includes(q)) ||
                      t.area.toLowerCase().includes(q) ||
                      t.category.toLowerCase().includes(q) ||
                      t.title.toLowerCase().includes(q);
      if (!matches) return false;
    }

    if (activeNocFilter === 'URGENT') {
      return t.priority === 'Urgent' || t.category.includes('LOS') || t.category.includes('ফাইবার');
    }
    if (activeNocFilter === 'IN_PROGRESS') {
      return t.status === 'In_Progress' || t.status === 'NOC_Assigned';
    }
    if (activeNocFilter === 'RESOLVED') {
      return t.status === 'Resolved' || t.status === 'Closed';
    }
    if (activeNocFilter === 'MINE') {
      return t.assignedNoc && t.assignedNoc.includes(currentStaff.name.split(' ')[0]);
    }
    return true;
  });

  // Bulk Action Helpers
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
    setBulkStaffAssign('');
  };

  const handleBulkStatusChange = (status: TicketStatus) => {
    if (selectedTicketIds.length === 0) return;
    if (onBulkUpdateTicketStatus) {
      onBulkUpdateTicketStatus(selectedTicketIds, status, bulkStaffAssign || undefined);
    } else {
      selectedTicketIds.forEach(id => onUpdateTicketStatus(id, status));
    }
    setSelectedTicketIds([]);
    setBulkStaffAssign('');
  };

  const handleBulkAssignStaff = (staffName: string) => {
    if (selectedTicketIds.length === 0 || !staffName) return;
    if (onBulkUpdateTicketStatus) {
      onBulkUpdateTicketStatus(selectedTicketIds, 'NOC_Assigned', staffName);
    } else {
      selectedTicketIds.forEach(id => onUpdateTicketStatus(id, 'NOC_Assigned'));
    }
    setSelectedTicketIds([]);
    setBulkStaffAssign('');
  };

  const isAllFilteredSelected = filteredTickets.length > 0 && filteredTickets.every(t => selectedTicketIds.includes(t.id));
  const isSomeFilteredSelected = filteredTickets.some(t => selectedTicketIds.includes(t.id)) && !isAllFilteredSelected;

  const handleSendComment = (ticketId: string) => {
    const text = commentTextMap[ticketId];
    if (!text || !text.trim()) return;
    onAddComment(ticketId, text);
    setCommentTextMap(prev => ({ ...prev, [ticketId]: '' }));
  };

  // PON Port Mock Data
  const ponPorts = [
    { id: 1, name: 'PON 1', olt: 'OLT-1 Central', activeOnus: 28, status: 'OK', rxAvg: '-20.2 dBm' },
    { id: 2, name: 'PON 2', olt: 'OLT-2 Mirzapur', activeOnus: 14, status: 'LOS_ALERT', rxAvg: '-32.1 dBm' },
    { id: 3, name: 'PON 3', olt: 'OLT-1 Central', activeOnus: 32, status: 'OK', rxAvg: '-19.8 dBm' },
    { id: 4, name: 'PON 4', olt: 'OLT-1 Central', activeOnus: 24, status: 'OK', rxAvg: '-21.5 dBm' },
    { id: 5, name: 'PON 5', olt: 'OLT-3 Ranipukur', activeOnus: 18, status: 'WARNING', rxAvg: '-27.4 dBm' },
    { id: 6, name: 'PON 6', olt: 'OLT-3 Ranipukur', activeOnus: 30, status: 'OK', rxAvg: '-20.0 dBm' },
    { id: 7, name: 'PON 7', olt: 'OLT-2 Mirzapur', activeOnus: 22, status: 'OK', rxAvg: '-22.1 dBm' },
    { id: 8, name: 'PON 8', olt: 'OLT-1 Central', activeOnus: 26, status: 'OK', rxAvg: '-21.0 dBm' },
  ];

  const totalTickets = tickets.length;
  const urgentCount = tickets.filter(t => t.priority === 'Urgent' || t.category.includes('LOS')).length;
  const inProgressCount = tickets.filter(t => t.status === 'In_Progress' || t.status === 'NOC_Assigned').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 lg:p-8 font-sans space-y-6">
      
      {/* ==========================================
          BENTO HEADER BAR
         ========================================== */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl backdrop-blur-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Brand & Command Center Title */}
        <div className="flex items-center gap-4">
          <DeltaLogo size="lg" theme="dark" showTagline={true} />

          <div className="border-l border-slate-800 pl-4 sm:pl-5 hidden md:block">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap mb-2">
              <span className="font-mono text-[11px] uppercase tracking-wider font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                NOC PRO COMMAND CENTER
              </span>
              <span className="text-xs text-slate-300 font-mono tracking-wide">Delta Mithapukur Central POP</span>
            </div>
            
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight mt-1.5 bg-gradient-to-r from-white via-slate-200 to-teal-300 bg-clip-text text-transparent">
              {lang === 'bn' ? 'নেটওয়ার্ক অপারেশনস সেন্টার (নোক প্রোল পোর্টাল)' : 'Network Operations Center Portal'}
            </h1>
          </div>
        </div>

        {/* Live Metrics Quick Badges & Technician Selector */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          
          {/* Header Quick Ticket Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-teal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === 'bn' ? 'CID, নাম বা টিকেট ID খুঁজুন...' : 'Search CID, Name, Ticket ID...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-inner font-medium"
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

          {/* Live Clock */}
          <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl flex items-center gap-2 font-mono text-xs text-slate-300">
            <Clock className="w-4 h-4 text-teal-400" />
            <div>
              <span className="text-[10px] text-slate-500 block">SYSTEM TIME</span>
              <span className="font-bold text-teal-300">{timeString || '18:26:37 BST'}</span>
            </div>
          </div>

          {/* Active Technician Profile Selector & Logout */}
          <div className="flex items-center gap-3 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
            <div className="text-right text-xs">
              <p className="text-slate-500 text-[10px] uppercase font-mono">{lang === 'bn' ? 'অন-ডিউটি ইঞ্জিনিয়ার' : 'Active Technician'}</p>
              <p className="font-bold text-teal-300">{currentStaff.name}</p>
            </div>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-900 text-slate-200 rounded-lg border border-slate-700 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {nocStaff.map(staff => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} ({staff.designation})
                </option>
              ))}
            </select>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg border border-red-500/30 transition-all flex items-center gap-1 text-xs font-bold"
                title="Sign out of NOC Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* ==========================================
          BENTO STATS OVERVIEW ROW
         ========================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Stat 1: Total Queue */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-slate-400 text-xs font-mono uppercase">{lang === 'bn' ? 'মোট সাপোর্ট টিকেট' : 'Total Queue'}</p>
            <p className="text-2xl md:text-3xl font-extrabold text-white mt-1">{totalTickets}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        {/* Stat 2: Urgent LOS */}
        <div className={`border rounded-2xl p-4 flex items-center justify-between shadow-lg transition-all ${
          urgentCount > 0 ? 'bg-rose-950/30 border-rose-800/60 text-rose-300' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div>
            <p className="text-slate-400 text-xs font-mono uppercase">{lang === 'bn' ? 'জরুরি রেড LOS' : 'Urgent LOS Outages'}</p>
            <p className={`text-2xl md:text-3xl font-extrabold mt-1 ${urgentCount > 0 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
              {urgentCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 3: In Progress */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-slate-400 text-xs font-mono uppercase">{lang === 'bn' ? 'মাঠে কাজ চলছে' : 'In Progress'}</p>
            <p className="text-2xl md:text-3xl font-extrabold text-amber-400 mt-1">{inProgressCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 4: Resolved */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-slate-400 text-xs font-mono uppercase">{lang === 'bn' ? 'সম্পন্ন টিকেট' : 'Resolved'}</p>
            <p className="text-2xl md:text-3xl font-extrabold text-emerald-400 mt-1">{resolvedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* ==========================================
          MAIN BENTO GRID CORE (3 COLUMNS)
         ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ==================== LEFT COLUMN: DIAGNOSTICS & OLT TELEMETRY (4 SPAN) ==================== */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* BENTO CARD 1: Live ONU & Fiber Diagnostic Terminal Console */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-teal-400" />
                <h3 className="font-mono font-bold text-sm text-teal-300">
                  {lang === 'bn' ? 'ONU ও পিং ডায়াগনস্টিক কন্সোল' : 'ONU & Ping Diagnostic Console'}
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                REALTIME
              </span>
            </div>

            <p className="text-xs text-slate-400">
              {lang === 'bn' 
                ? 'গ্রাহক CID দিয়ে POP OLT থেকে সরাসরি লেজার অপটিক্যাল সিগন্যাল (dBm) ও পিং রেসপন্স পরীক্ষা করুন।' 
                : 'Run laser optical attenuation & Gateway loop test via OLT PON slot.'}
            </p>

            {/* Input & Quick Select buttons */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  {lang === 'bn' ? 'গ্রাহক CID নির্বাচন বা ইনপুট দিন' : 'Select Client CID'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={diagCid}
                    onChange={(e) => setDiagCid(e.target.value)}
                    placeholder="e.g. CID-1003"
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    onClick={() => handleRunDiagnostic()}
                    disabled={diagRunning}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-xl text-xs font-mono flex items-center gap-1.5 disabled:opacity-50 transition-all shadow-md active:scale-95"
                  >
                    {diagRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{diagRunning ? 'Testing...' : 'Test Link'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons for testing */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 font-mono py-0.5">Presets:</span>
                {['CID-1003', 'CID-1001', 'CID-1002'].map(cid => (
                  <button
                    key={cid}
                    onClick={() => handleRunDiagnostic(cid)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
                      diagCid === cid ? 'bg-teal-500/20 text-teal-300 border-teal-500/50' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {cid}
                  </button>
                ))}
              </div>

              {/* Terminal Log Output Window */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs space-y-2.5 shadow-inner">
                <div className="text-slate-500 text-[10px] font-bold border-b border-slate-800 pb-1 flex justify-between">
                  <span>[DELTA-POP-ROUTER# test-onu {diagCid}]</span>
                  <span>STATUS: {diagResult ? diagResult.status : 'IDLE'}</span>
                </div>

                {diagRunning && (
                  <div className="text-teal-400 animate-pulse text-[11px] space-y-1">
                    <p>&gt; Connecting to OLT Slot 2/PON MAC...</p>
                    <p>&gt; Polling ONU Tx/Rx attenuation power...</p>
                    <p>&gt; Sending ICMP echo packets (64 bytes)...</p>
                  </div>
                )}

                {diagResult && (
                  <div className="space-y-2 text-slate-300 pt-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">IP Binding:</span>
                      <span className="text-white font-bold">{diagResult.ip}</span>
                    </div>

                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">OLT Location:</span>
                      <span className="text-slate-300">{diagResult.oltPort}</span>
                    </div>

                    {/* Rx Power Bar Indicator */}
                    <div className="space-y-1 bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Optical Signal (Rx):</span>
                        <span className={`font-bold ${
                          diagResult.status === 'CRITICAL_LOS' ? 'text-rose-400' : diagResult.status === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {diagResult.rxPower}
                        </span>
                      </div>
                      
                      {/* Gauge bar */}
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 flex">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            diagResult.status === 'CRITICAL_LOS' ? 'bg-rose-500 w-[15%]' : diagResult.status === 'WARNING' ? 'bg-amber-500 w-[60%]' : 'bg-emerald-500 w-[90%]'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Gateway Latency:</span>
                      <span className={`font-bold ${diagResult.pingMs === 0 ? 'text-rose-400' : diagResult.pingMs > 100 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {diagResult.pingMs === 0 ? 'TIMED OUT (0 ms)' : `${diagResult.pingMs} ms`}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Packet Loss Rate:</span>
                      <span className={`font-bold ${diagResult.packetLoss > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {diagResult.packetLoss}%
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px]">
                      <span className="text-slate-400 font-semibold">Diagnostic Report: </span>
                      {diagResult.status === 'CRITICAL_LOS' ? (
                        <span className="text-rose-400 font-bold block mt-1">
                          🚨 Critical Fiber Breakage detected ({diagResult.distanceKm}). Immediate splicing team required.
                        </span>
                      ) : diagResult.status === 'WARNING' ? (
                        <span className="text-amber-400 font-bold block mt-1">
                          ⚠️ Connector Bending Loss / High Attenuation. Check drop wire join at client premises.
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-bold block mt-1">
                          ✓ Optical Fiber Link Optimal & Latency Normal.
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {!diagRunning && !diagResult && (
                  <p className="text-slate-600 italic text-[11px]">
                    Click "Test Link" to fetch laser optical attenuation & latency metrics.
                  </p>
                )}
              </div>

            </div>

          </div>

          {/* BENTO CARD 2: OLT PON Port Optical Attenuation Heatmap */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-indigo-400" />
                <h3 className="font-mono font-bold text-sm text-indigo-300">
                  {lang === 'bn' ? 'OLT পন পোর্ট অপটিক্যাল স্ট্যাটাস' : 'OLT PON Port Health Heatmap'}
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">8 PORTS</span>
            </div>

            <p className="text-xs text-slate-400">
              {lang === 'bn' ? 'পপ ওএলটি পোর্টের বর্তমান সিগন্যাল সামারি:' : 'Active OLT PON ports optical level snapshot:'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              {ponPorts.map((pon) => (
                <button
                  key={pon.id}
                  onClick={() => setSelectedPonPort(selectedPonPort === pon.id ? null : pon.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedPonPort === pon.id ? 'ring-2 ring-indigo-500' : ''
                  } ${
                    pon.status === 'LOS_ALERT'
                      ? 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                      : pon.status === 'WARNING'
                      ? 'bg-amber-950/30 border-amber-800/60 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-white">{pon.name}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      pon.status === 'LOS_ALERT' ? 'bg-rose-500 animate-ping' : pon.status === 'WARNING' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{pon.activeOnus} ONUs</p>
                  <p className="text-[10px] font-bold mt-0.5">{pon.rxAvg}</p>
                </button>
              ))}
            </div>

            {selectedPonPort && (
              <div className="p-3 bg-indigo-950/40 border border-indigo-800/50 rounded-xl text-xs space-y-1">
                <p className="font-bold text-indigo-300">
                  📍 Selected PON Port #{selectedPonPort}: {ponPorts.find(p => p.id === selectedPonPort)?.olt}
                </p>
                <p className="text-slate-300 text-[11px]">
                  Average Signal: {ponPorts.find(p => p.id === selectedPonPort)?.rxAvg} • Active Clients: {ponPorts.find(p => p.id === selectedPonPort)?.activeOnus}
                </p>
              </div>
            )}
          </div>

          {/* BENTO CARD 3: NOC Engineers On-Duty Roster */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-emerald-400" />
                <h3 className="font-mono font-bold text-sm text-emerald-300">
                  {lang === 'bn' ? 'নোক ফিল্ড টেকনিশিয়ান রোস্টার' : 'NOC Engineers Field Roster'}
                </h3>
              </div>
            </div>

            <div className="space-y-2.5">
              {nocStaff.map((staff) => (
                <div 
                  key={staff.id} 
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs text-white">{staff.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        staff.status === 'On Duty' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        staff.status === 'On Field' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {staff.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{staff.designation} • {staff.area}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-teal-400 font-mono font-bold">{staff.activeTickets} Active</p>
                    <a 
                      href={`tel:${staff.phone}`}
                      className="text-[10px] text-slate-400 hover:text-white underline font-mono block mt-0.5"
                    >
                      {staff.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BENTO CARD 4: NOC Spares & Hardware Inventory Quick Alert Widget */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <h3 className="font-mono font-bold text-sm text-emerald-300">
                  {lang === 'bn' ? 'NOC হার্ডওয়্যার ও স্পেয়ার্স স্টক' : 'Hardware & Spares Stock'}
                </h3>
              </div>
              {inventoryLowStockCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold animate-pulse">
                  {inventoryLowStockCount} {lang === 'bn' ? 'অ্যালার্ট' : 'LOW'}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/30">
                  HEALTHY
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              {lang === 'bn' 
                ? 'রাউটার, ওএনইউ ও ফাইবার ড্রপ ক্যাবল স্টক লেভেল। প্রয়োজনমতো ডিসপ্যাচ বা রিস্টক করুন।' 
                : 'Live available stocks of routers, ONUs & optical fiber drop cables for installations.'}
            </p>

            {/* Quick Stock List */}
            <div className="space-y-2">
              {inventory.slice(0, 4).map((item) => {
                const isLow = item.availableStock <= item.minThreshold;
                return (
                  <div 
                    key={item.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                      isLow 
                        ? 'bg-rose-950/30 border-rose-800/60 text-rose-200' 
                        : 'bg-slate-950 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white truncate text-[11px]">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{item.brand} • {item.location.split('(')[0]}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`font-mono font-bold ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {item.availableStock} {item.unit}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Min: {item.minThreshold}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {onOpenInventory && (
              <button
                onClick={onOpenInventory}
                className="w-full py-2.5 bg-slate-800 hover:bg-emerald-600/30 hover:text-emerald-200 text-slate-300 border border-slate-700 hover:border-emerald-500/40 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Package className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'bn' ? 'সম্পূর্ণ ইনভেন্টরি ট্র্যাকার খুলুন' : 'Open Hardware Inventory Tracker'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* ==================== RIGHT COLUMN: ACTIVE NOC WORKSTREAM QUEUE (8 SPAN) ==================== */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* BENTO CARD 4: NOC Support Queue Header & Search Filter Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {lang === 'bn' ? 'নোক লাইভ সাপোর্ট কিউ' : 'NOC Support Queue & Workstream'}
                  </h2>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-slate-700">
                    {filteredTickets.length} ITEMS
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'bn' ? 'মিঠাপুকুর পপ ফিল্ড ইঞ্জিনিয়ারদের কাজের তালিকা ও কুইক একশন কন্সোল' : 'Manage active fiber outages, AI diagnostics, and client updates'}
                </p>
              </div>

              {/* Ticket Search Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-teal-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder={lang === 'bn' ? 'CID (যেমন CID-101), নাম বা টিকেট ID খুঁজুন...' : 'Filter by CID (e.g. CID-101), Client Name, or Ticket ID...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-inner font-medium"
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

                {/* Quick Search Chips */}
                <div className="hidden xl:flex items-center gap-1 text-xs">
                  {['CID-101', 'CID-102', 'LOS', 'Urgent'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSearchQuery(tag)}
                      className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-teal-950 text-slate-400 hover:text-teal-300 font-mono text-[11px] border border-slate-800 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveNocFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeNocFilter === 'ALL' 
                    ? 'bg-teal-500 text-slate-950 shadow-md' 
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {lang === 'bn' ? 'সকল টিকেট' : 'All Queue'} ({tickets.length})
              </button>

              <button
                onClick={() => setActiveNocFilter('URGENT')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeNocFilter === 'URGENT' 
                    ? 'bg-rose-600 text-white shadow-md' 
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>🚨</span>
                <span>{lang === 'bn' ? 'জরুরি LOS' : 'Urgent LOS'}</span>
                {urgentCount > 0 && <span className="bg-rose-950 px-1.5 py-0.2 rounded text-[10px]">{urgentCount}</span>}
              </button>

              <button
                onClick={() => setActiveNocFilter('IN_PROGRESS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeNocFilter === 'IN_PROGRESS' 
                    ? 'bg-amber-500 text-slate-950 shadow-md' 
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>⚡</span>
                <span>{lang === 'bn' ? 'কাজ চলছে' : 'In Progress'}</span>
                {inProgressCount > 0 && <span className="bg-amber-950/60 text-amber-200 px-1.5 py-0.2 rounded text-[10px]">{inProgressCount}</span>}
              </button>

              <button
                onClick={() => setActiveNocFilter('MINE')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeNocFilter === 'MINE' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {lang === 'bn' ? 'আমার অ্যাসাইনকৃত' : 'Assigned to Me'}
              </button>

              <button
                onClick={() => setActiveNocFilter('RESOLVED')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeNocFilter === 'RESOLVED' 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {lang === 'bn' ? 'সম্পন্ন' : 'Resolved'}
              </button>
            </div>

            {/* Bulk Selection Master Bar */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer select-none group"
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    isAllFilteredSelected 
                      ? 'bg-teal-500 border-teal-400 text-slate-950 shadow-sm' 
                      : isSomeFilteredSelected
                      ? 'bg-teal-900 border-teal-500 text-teal-300'
                      : 'bg-slate-900 border-slate-700 text-transparent group-hover:border-slate-500'
                  }`}>
                    {isAllFilteredSelected ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : isSomeFilteredSelected ? (
                      <span className="w-2 h-0.5 bg-teal-300 rounded-full" />
                    ) : null}
                  </div>
                  <span>
                    {isAllFilteredSelected 
                      ? (lang === 'bn' ? 'সব আনসিলেক্ট করুন' : 'Deselect All') 
                      : (lang === 'bn' ? `বর্তমান তালিকার সব সিলেক্ট (${filteredTickets.length})` : `Select All Visible (${filteredTickets.length})`)}
                  </span>
                </button>

                {selectedTicketIds.length > 0 && (
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 animate-pulse">
                    {selectedTicketIds.length} {lang === 'bn' ? 'টিকেট নির্বাচিত' : 'Selected'}
                  </span>
                )}
              </div>

              {selectedTicketIds.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                    {lang === 'bn' ? 'একযোগে আপডেট:' : 'Bulk Action:'}
                  </span>
                  
                  <button
                    onClick={() => handleBulkStatusChange('In_Progress')}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                    title="Set status to In Progress for all selected"
                  >
                    <span>⚡</span>
                    <span>{lang === 'bn' ? 'কাজ চলছে' : 'In Progress'}</span>
                  </button>

                  <button
                    onClick={() => handleBulkStatusChange('Resolved')}
                    className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                    title="Set status to Resolved for all selected"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'সমাধান' : 'Resolve'}</span>
                  </button>

                  <button
                    onClick={() => handleBulkStatusChange('Closed')}
                    className="px-2.5 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                    title="Set status to Closed for all selected"
                  >
                    <span>🔒</span>
                    <span>{lang === 'bn' ? 'বন্ধ' : 'Close'}</span>
                  </button>

                  <button
                    onClick={handleClearSelection}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                    title="Clear Selection"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{lang === 'bn' ? 'মুছুন' : 'Clear'}</span>
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-slate-500 font-mono italic">
                  {lang === 'bn' ? 'চেকবক্সে ক্লিক করে একসাথে একাধিক টিকেট আপডেট করুন' : 'Select tickets to perform bulk status updates'}
                </span>
              )}
            </div>

          </div>

          {/* Ticket Stream List */}
          <div className="space-y-4">
            {urgentCount > 0 && (activeNocFilter === 'URGENT' || activeNocFilter === 'ALL') && (
              <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/40 border border-rose-800/80 rounded-2xl p-4 flex items-center justify-between text-xs text-rose-200 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5 animate-pulse text-rose-400" />
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-white flex items-center gap-2">
                      <span>{lang === 'bn' ? 'জরুরি সার্ভিস লেভেল এগ্রিমেন্ট (SLA) লাইভ ট্র্যাক' : 'Urgent Service Level Agreement (SLA) Live Tracker'}</span>
                      <span className="text-[10px] bg-rose-600 text-white font-mono px-2 py-0.5 rounded-full font-bold">
                        {urgentCount} URGENT
                      </span>
                    </p>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      {lang === 'bn' 
                        ? 'রেড এলওএস ও ফাইবার সংযোগ বিচ্ছিন্ন টিকেটে ২-ঘণ্টা সার্ভিস লেভেল সমাধান সময় গণনা করা হচ্ছে।' 
                        : 'Critical fiber cut outages carry a strict 2-Hour SLA resolution window. Countdown timers update in real time.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {filteredTickets.length === 0 ? (
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
                <p className="text-sm font-mono">{lang === 'bn' ? 'কোন টিকেট পাওয়া যায়নি।' : 'No tickets match the selected filter.'}</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isLos = ticket.priority === 'Urgent' || ticket.category.includes('LOS') || ticket.category.includes('ফাইবার');
                const priorityConfig = getPriorityColorConfig(ticket.priority);
                const isSelected = selectedTicketIds.includes(ticket.id);

                return (
                  <div 
                    key={ticket.id} 
                    className={`bg-slate-900/90 rounded-3xl p-5 md:p-6 border shadow-xl transition-all relative overflow-hidden space-y-4 ${
                      isSelected
                        ? 'ring-2 ring-teal-400 border-teal-500/80 bg-gradient-to-br from-slate-900 via-teal-950/20 to-slate-900 shadow-[0_0_30px_rgba(20,184,166,0.2)]'
                        : ticket.priority === 'Urgent' 
                        ? 'border-l-[6px] border-l-rose-500 border-rose-800/50 bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/20 shadow-[inset_4px_0_20px_rgba(244,63,94,0.08)]' 
                        : ticket.priority === 'High' 
                        ? 'border-l-[6px] border-l-yellow-400 border-yellow-800/40 bg-gradient-to-br from-slate-900 via-slate-900 to-yellow-950/15 shadow-[inset_4px_0_20px_rgba(234,179,8,0.06)]' 
                        : 'border-l-[6px] border-l-blue-500 border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/15 shadow-[inset_4px_0_20px_rgba(59,130,246,0.06)]'
                    }`}
                  >
                    {/* Top Priority Visual Indicator & Selection Checkbox Strip */}
                    <div className="flex items-center justify-between text-[11px] font-mono pb-2 border-b border-slate-800/60">
                      <div className="flex items-center gap-3">
                        {/* Interactive Bulk Select Checkbox */}
                        <label 
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 cursor-pointer select-none group/check"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectTicket(ticket.id)}
                            className="w-4 h-4 rounded text-teal-500 bg-slate-950 border-slate-700 focus:ring-teal-500 cursor-pointer accent-teal-500"
                          />
                          <span className={`text-[11px] font-bold transition-colors ${isSelected ? 'text-teal-300' : 'text-slate-400 group-hover/check:text-slate-200'}`}>
                            {isSelected ? (lang === 'bn' ? '✓ নির্বাচিত' : '✓ Selected') : (lang === 'bn' ? 'সিলেক্ট' : 'Select')}
                          </span>
                        </label>

                        <span className="text-slate-700">|</span>

                        <span className={`w-2 h-2 rounded-full ${priorityConfig.dotColor} ${priorityConfig.isPulsing ? 'animate-ping' : ''}`} />
                        <span className={`font-bold px-2 py-0.5 rounded-md ${priorityConfig.pillColorDark}`}>
                          {priorityConfig.name === 'Urgent' ? '🔴 RED / URGENT' : priorityConfig.name === 'High' ? '🟡 YELLOW / HIGH' : '🔵 BLUE / NORMAL'}
                        </span>
                        <span className="text-slate-400 hidden sm:inline">• {ticket.category}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {lang === 'bn' ? 'তৈরি:' : 'Logged:'} {new Date(ticket.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Top Row: Badges & Status Selector */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs bg-slate-950 text-teal-300 px-3 py-1 rounded-xl border border-slate-800">
                          #{ticket.id}
                        </span>

                        <button
                          onClick={() => handleRunDiagnostic(ticket.cid)}
                          className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all flex items-center gap-1"
                          title="Run ONU Diagnostic for this CID"
                        >
                          <span>{ticket.cid}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>

                        <span className="text-xs text-slate-400 font-mono">
                          📍 {ticket.area}
                        </span>

                        {ticket.opticalPower && (
                          <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg ${
                            ticket.opticalPower.includes('LOS') || ticket.opticalPower.includes('-32') 
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            ⚡ {ticket.opticalPower}
                          </span>
                        )}
                      </div>

                      {/* Interactive Status Selector & Animated Badge */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <TicketStatusBadge status={ticket.status} lang={lang} size="sm" />

                        <div className="relative">
                          <select
                            value={ticket.status}
                            onChange={(e) => onUpdateTicketStatus(ticket.id, e.target.value as TicketStatus)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl border focus:ring-2 focus:ring-teal-500 focus:outline-none cursor-pointer transition-all ${
                              ticket.status === 'Resolved' 
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                                : ticket.status === 'Closed'
                                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                                : ticket.status === 'In_Progress' 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                                : 'bg-slate-950 text-slate-200 border-slate-700'
                            }`}
                          >
                            <option value="Open">Open (পেন্ডিং)</option>
                            <option value="NOC_Assigned">NOC Assigned</option>
                            <option value="In_Progress">In Progress (কাজ চলছে)</option>
                            <option value="Resolved">Resolved (সম্পন্ন)</option>
                            <option value="Closed">Closed (বন্ধ)</option>
                          </select>
                        </div>

                        <button
                          onClick={() => onSelectTicket(ticket)}
                          className="px-3 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                          title="Open Ticket Detail Modal"
                        >
                          <span>{lang === 'bn' ? 'ডিটেইলস' : 'Details'}</span>
                          <ChevronRight className="w-4 h-4 text-teal-400" />
                        </button>
                      </div>
                    </div>

                    {/* Main Issue Header */}
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div 
                          onClick={() => onSelectTicket(ticket)}
                          className="cursor-pointer group"
                        >
                          <h3 className="font-extrabold text-white text-base md:text-lg tracking-tight group-hover:text-teal-300 transition-colors flex items-center gap-2">
                            <span>{ticket.title}</span>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-300 group-hover:translate-x-0.5 transition-all" />
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Client: <span className="text-slate-200 font-semibold">{ticket.clientName}</span> ({ticket.clientPhone}) • Package: {ticket.packageSpeed}
                          </p>
                        </div>

                        <TicketPriorityBadge
                          priority={ticket.priority}
                          lang={lang}
                          size="sm"
                          theme="dark"
                        />
                      </div>

                      <p className="text-xs text-slate-300 mt-2 bg-slate-950 p-3 rounded-2xl border border-slate-800/80 leading-relaxed">
                        {ticket.description}
                      </p>
                    </div>

                    {/* Visual SLA Countdown Timer based on ticket priority */}
                    <SlaTimer
                      ticket={ticket}
                      lang={lang}
                      variant="card"
                    />

                    {/* AI NOC Diagnostics Assistant Widget Trigger */}
                    <div className="p-3.5 bg-slate-950/90 border border-teal-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-teal-300">
                            {lang === 'bn' ? 'এআই নোক ট্রাবলশুটিং সহকারী' : 'AI NOC Troubleshooting Assistant'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {lang === 'bn' ? 'বাংলা কারিগরি বিশ্লেষণ ও ক্লায়েন্ট হোয়াটসঅ্যাপ ড্রাফট তৈরি করুন' : 'Generate Bengali diagnostic solution & client reply'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onTriggerAiDiagnosis(ticket)}
                        disabled={aiLoadingTicketId === ticket.id}
                        className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {aiLoadingTicketId === ticket.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5" />
                        )}
                        <span>{aiLoadingTicketId === ticket.id ? 'Analyzing...' : 'AI Diagnose'}</span>
                      </button>
                    </div>

                    {/* Display AI Diagnostic Report if Available */}
                    {ticket.aiDiagnosis && (
                      <div className="p-4 bg-slate-950 rounded-2xl text-xs space-y-3 border border-teal-500/50 shadow-lg">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="font-bold text-teal-400 flex items-center gap-1.5 font-mono">
                            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                            {lang === 'bn' ? 'এআই ডায়াগনস্টিক রিপোর্ট' : 'AI Diagnostic Report'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">RECOMMENDED PRIORITY: {ticket.aiDiagnosis.recommendedPriority}</span>
                        </div>

                        <p className="text-slate-200 leading-relaxed font-sans">{ticket.aiDiagnosis.summaryBengali}</p>

                        <div className="space-y-1 pt-1 bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <p className="font-bold text-amber-300 text-[11px] font-mono">🛠️ NOC Technical Field Checklist:</p>
                          {ticket.aiDiagnosis.nocSteps.map((step, idx) => (
                            <p key={idx} className="text-slate-300 pl-2 text-[11px]">● {step}</p>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-slate-800">
                          <p className="font-bold text-emerald-400 text-[11px] font-mono mb-1">📲 WhatsApp Client Draft:</p>
                          <p className="text-slate-300 italic bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                            "{ticket.aiDiagnosis.clientReplyBengali}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Recent Comments Log */}
                    {ticket.comments.length > 0 && (
                      <div className="space-y-2 pt-1 border-t border-slate-800/80">
                        <p className="text-[10px] text-slate-500 font-mono uppercase">{lang === 'bn' ? 'সর্বশেষ টেকনিশিয়ান নোটস:' : 'Recent Technician Log:'}</p>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto">
                          {ticket.comments.slice(-2).map((comm) => (
                            <div key={comm.id} className="text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800/60 flex justify-between gap-2">
                              <div>
                                <span className="font-bold text-teal-300">{comm.author} ({comm.role}): </span>
                                <span className="text-slate-300">{comm.text}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                                {new Date(comm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Reply & Post Field Update Input */}
                    <div className="pt-2 flex gap-2">
                      <input
                        type="text"
                        placeholder={lang === 'bn' ? 'নোক ফিল্ড আপডেট কমেন্ট লিখুন...' : 'Add NOC progress comment...'}
                        value={commentTextMap[ticket.id] || ''}
                        onChange={(e) => setCommentTextMap(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                        className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-800 focus:ring-2 focus:ring-teal-500 bg-slate-950 text-white placeholder-slate-500"
                      />
                      <button
                        onClick={() => handleSendComment(ticket.id)}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post</span>
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

      {/* Floating Bulk Operations Command Bar */}
      <AnimatePresence>
        {selectedTicketIds.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl bg-slate-900/95 border-2 border-teal-500/70 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(20,184,166,0.35)] backdrop-blur-2xl rounded-2xl p-3.5 md:p-4 text-white flex flex-col md:flex-row items-center justify-between gap-3"
          >
            {/* Left Info & Counter */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center font-bold">
                  <ListChecks className="w-4 h-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white">
                      {selectedTicketIds.length} {lang === 'bn' ? 'টিকেট নির্বাচিত' : 'Tickets Selected'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                      NOC Bulk Action
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'bn' ? 'এক ক্লিকে সকল নির্বাচিত টিকেটে কার্যকর করুন' : 'Simultaneous action for all selected queue items'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleClearSelection}
                className="md:hidden p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Cancel selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Middle & Right Controls */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              {/* Fast Status Update Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => handleBulkStatusChange('In_Progress')}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <span>⚡</span>
                  <span>{lang === 'bn' ? 'কাজ চলছে' : 'In Progress'}</span>
                </button>

                <button
                  onClick={() => handleBulkStatusChange('Resolved')}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{lang === 'bn' ? 'সমাধান (Resolve All)' : 'Resolve All'}</span>
                </button>

                <button
                  onClick={() => handleBulkStatusChange('Closed')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <span>🔒</span>
                  <span>{lang === 'bn' ? 'বন্ধ (Close)' : 'Close'}</span>
                </button>

                <button
                  onClick={() => handleBulkStatusChange('Open')}
                  className="px-2.5 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  title="Reopen all selected"
                >
                  <span>🔄 Open</span>
                </button>
              </div>

              {/* Lineman / Staff Dispatch Selector */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                <select
                  value={bulkStaffAssign}
                  onChange={(e) => {
                    const staff = e.target.value;
                    setBulkStaffAssign(staff);
                    if (staff) {
                      handleBulkAssignStaff(staff);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-700 bg-slate-950 text-teal-300 focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="">{lang === 'bn' ? '👥 টেকনিশিয়ান অ্যাসাইন...' : '👥 Bulk Assign Staff...'}</option>
                  {nocStaff.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.zone}) {s.onDuty ? '🟢 On-Duty' : '⚪ Off-Duty'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Desktop Clear button */}
              <button
                onClick={handleClearSelection}
                className="hidden md:flex p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors items-center justify-center ml-1 cursor-pointer"
                title={lang === 'bn' ? 'সিলেকশন বাতিল করুন' : 'Clear selection'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
