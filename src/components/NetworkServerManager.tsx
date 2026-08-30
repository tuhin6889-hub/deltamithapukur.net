import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NetworkServer, NetworkServerType } from '../types';
import { 
  Server, 
  Router, 
  Cpu, 
  Activity, 
  Plus, 
  Search, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Terminal, 
  Download, 
  Trash2, 
  Edit3, 
  Wifi, 
  Layers, 
  Zap, 
  Clock, 
  HardDrive, 
  Gauge, 
  MapPin, 
  Globe, 
  ShieldCheck, 
  X,
  ExternalLink,
  ChevronRight,
  Filter,
  Key,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Sparkles,
  Shield,
  FileCode,
  Share2
} from 'lucide-react';

interface NetworkServerManagerProps {
  servers: NetworkServer[];
  popAreas: string[];
  lang: 'bn' | 'en';
  onAddServer: (newServer: NetworkServer) => void;
  onUpdateServer: (updatedServer: NetworkServer) => void;
  onDeleteServer: (serverId: string) => void;
}

export const NetworkServerManager: React.FC<NetworkServerManagerProps> = ({
  servers,
  popAreas,
  lang,
  onAddServer,
  onUpdateServer,
  onDeleteServer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterArea, setFilterArea] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Selected server for viewing / editing credentials
  const [credentialsServer, setCredentialsServer] = useState<NetworkServer | null>(null);
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editWinboxPort, setEditWinboxPort] = useState(8291);
  const [editApiPort, setEditApiPort] = useState(8728);
  const [editAdminGroup, setEditAdminGroup] = useState('full');
  const [editRadiusSecret, setEditRadiusSecret] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [authTestStatus, setAuthTestStatus] = useState<'IDLE' | 'TESTING' | 'SUCCESS' | 'FAILED'>('IDLE');

  // Ping Test State
  const [pingingServerId, setPingingServerId] = useState<string | null>(null);
  const [pingResults, setPingResults] = useState<Record<string, { rtt: number; loss: number; timestamp: string }>>({});

  // Terminal / Diagnostic Modal
  const [terminalServer, setTerminalServer] = useState<NetworkServer | null>(null);

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // New Server Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<NetworkServerType>('MikroTik');
  const [model, setModel] = useState('MikroTik CCR1036-8G-2S+ (36-Core Core)');
  const [customModel, setCustomModel] = useState('');
  const [ipAddress, setIpAddress] = useState('103.145.22.');
  const [port, setPort] = useState(8728);
  const [winboxPort, setWinboxPort] = useState(8291);
  const [apiPort, setApiPort] = useState(8729);
  const [username, setUsername] = useState('admin_noc');
  const [password, setPassword] = useState('Mpk@MikroTik2026!');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [adminGroup, setAdminGroup] = useState('full');
  const [radiusSecret, setRadiusSecret] = useState('DeltaRadius2026');
  const [locationArea, setLocationArea] = useState(popAreas[0] || 'মিঠাপুকুর সদর (Mithapukur Sadar)');
  const [vlan, setVlan] = useState('Trunk VLAN 10-500');
  const [totalPonPorts, setTotalPonPorts] = useState(8);
  const [activePonPorts, setActivePonPorts] = useState(6);
  const [notes, setNotes] = useState('');

  // Default models preset
  const PRESET_MODELS: Record<NetworkServerType, string[]> = {
    MikroTik: [
      'MikroTik CCR1036-8G-2S+ (36-Core Core)',
      'MikroTik CCR2004-16G-2S+ (16-Port 10G)',
      'MikroTik CCR2116-12G-4S+ (16-Core Flagship)',
      'MikroTik CCR1009-7G-1C-1S+',
      'MikroTik RB4011iGS+RM',
      'MikroTik RB1100AHx4 Dude Edition',
      'MikroTik RB5009UG+S+IN',
      'MikroTik Hex S (RB760iGS)',
      'MikroTik Cloud Hosted Router (CHR VM)',
      'Custom Model'
    ],
    OLT: [
      'Huawei SmartAX MA5608T GPON',
      'Huawei SmartAX MA5800-X7 10G PON',
      'V-SOL V1600D-EPON 8-Port',
      'V-SOL V1600G-GPON 8-Port',
      'BDCOM P3310C 4-Port EPON',
      'BDCOM GP3600-08 8-Port GPON',
      'ZTE ZXA10 C320 GPON Mini-Chassis',
      'Syrotech 8-Port EPON OLT',
      'Custom Model'
    ],
    Core_Router: [
      'Cisco ASR 1001-X Core Gateway',
      'Juniper MX204 Edge Router',
      'MikroTik CCR2216-1G-12XS-2XQ 100G Edge',
      'Custom Core Router'
    ],
    Switch: [
      'Cisco Catalyst 2960-X 24-Port SFP',
      'MikroTik CRS326-24G-2S+RM',
      'MikroTik CRS328-24P-4S+RM (PoE+)',
      'Huawei CloudEngine S5735-L24T4S',
      'Custom Managed Switch'
    ],
    Radius_Server: [
      'FreeRADIUS 3.2 Authentication Server',
      'MikroTik User Manager V7 VM',
      'Custom Radius/Billing Gateway'
    ]
  };

  const generateStrongPassword = () => {
    const specials = ['@', '#', '$', '!', '%', '&', '*'];
    const randomSpecial = specials[Math.floor(Math.random() * specials.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const prefixes = ['Mpk', 'Delta', 'Core', 'Router', 'Noc', 'MikroTik', 'Fiber'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return `${prefix}${randomSpecial}${randomNum}!2026`;
  };

  const handleTypeChange = (newType: NetworkServerType) => {
    setType(newType);
    const defaultModelList = PRESET_MODELS[newType];
    setModel(defaultModelList[0] || 'Custom Model');
    
    // Auto set typical default ports and credentials
    if (newType === 'MikroTik') {
      setPort(8728); // Winbox / API
      setWinboxPort(8291);
      setApiPort(8729); // API-SSL
      setUsername('delta_core_admin');
      setPassword(generateStrongPassword());
      setAdminGroup('full');
      setVlan('Trunk VLAN 10-500');
    } else if (newType === 'OLT') {
      setPort(23); // Telnet/CLI
      setWinboxPort(80);
      setApiPort(161); // SNMP
      setUsername('admin_olt');
      setPassword(generateStrongPassword());
      setAdminGroup('super_admin');
      setTotalPonPorts(8);
      setActivePonPorts(6);
      setVlan('VLAN-100, 200');
    } else if (newType === 'Switch') {
      setPort(80);
      setWinboxPort(80);
      setApiPort(161);
      setUsername('switch_admin');
    }
  };

  const handleCopyText = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const togglePasswordReveal = (srvId: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [srvId]: !prev[srvId]
    }));
  };

  const handleOpenCredentialsModal = (srv: NetworkServer) => {
    setCredentialsServer(srv);
    setEditUsername(srv.username || 'admin');
    setEditPassword(srv.password || 'MikroTik@2026');
    setEditWinboxPort(srv.winboxPort || (srv.type === 'MikroTik' ? 8291 : 80));
    setEditApiPort(srv.apiPort || 8728);
    setEditAdminGroup(srv.adminGroup || 'full');
    setEditRadiusSecret(srv.radiusSecret || '');
    setIsEditingCredentials(false);
    setAuthTestStatus('IDLE');
  };

  const handleSaveEditedCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentialsServer) return;

    const updated: NetworkServer = {
      ...credentialsServer,
      username: editUsername.trim() || 'admin',
      password: editPassword.trim() || 'MikroTik@2026',
      winboxPort: Number(editWinboxPort) || 8291,
      apiPort: Number(editApiPort) || 8728,
      adminGroup: editAdminGroup,
      radiusSecret: editRadiusSecret.trim() || undefined,
    };

    onUpdateServer(updated);
    setCredentialsServer(updated);
    setIsEditingCredentials(false);
    setAuthTestStatus('SUCCESS');
    setTimeout(() => setAuthTestStatus('IDLE'), 3000);
  };

  const handleRunAuthTest = () => {
    setAuthTestStatus('TESTING');
    setTimeout(() => {
      setAuthTestStatus('SUCCESS');
    }, 1200);
  };

  const handleAddServerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ipAddress.trim()) return;

    const finalModel = model === 'Custom Model' && customModel.trim() ? customModel.trim() : model;

    const newServerItem: NetworkServer = {
      id: `SRV-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      type,
      model: finalModel,
      ipAddress: ipAddress.trim(),
      port: Number(port) || (type === 'MikroTik' ? 8728 : 23),
      winboxPort: Number(winboxPort) || (type === 'MikroTik' ? 8291 : 80),
      apiPort: Number(apiPort) || 161,
      username: username.trim() || 'admin',
      password: password.trim() || 'MikroTik@2026',
      adminGroup: adminGroup || 'full',
      radiusSecret: radiusSecret.trim() || undefined,
      locationArea,
      vlan: vlan.trim() || 'VLAN-100',
      status: 'Online',
      uptime: '1 day, 02 hours',
      cpuUsage: Math.floor(Math.random() * 20) + 10,
      memoryUsage: Math.floor(Math.random() * 25) + 20,
      totalPonPorts: type === 'OLT' ? Number(totalPonPorts) : undefined,
      activePonPorts: type === 'OLT' ? Number(activePonPorts) : undefined,
      totalClientsOnline: type === 'OLT' ? (Number(activePonPorts) * 24) : 180,
      temperature: '39°C',
      firmwareVersion: type === 'MikroTik' ? 'RouterOS v7.14.2' : 'V2.1.0-Build2025',
      lastPingMs: Math.floor(Math.random() * 6) + 1,
      notes: notes.trim() || undefined,
      addedDate: new Date().toISOString(),
    };

    onAddServer(newServerItem);
    setIsAddModalOpen(false);
    
    // Reset form
    setName('');
    setCustomModel('');
    setNotes('');
  };

  const handleSimulatePing = (srv: NetworkServer) => {
    setPingingServerId(srv.id);
    setTimeout(() => {
      const isSuccess = srv.status !== 'Offline';
      const rtt = isSuccess ? Math.floor(Math.random() * 8) + 1 : 999;
      const loss = isSuccess ? 0 : 100;
      
      setPingResults(prev => ({
        ...prev,
        [srv.id]: {
          rtt,
          loss,
          timestamp: new Date().toLocaleTimeString(),
        }
      }));
      setPingingServerId(null);
    }, 1000);
  };

  // Filtered servers
  const filteredServers = servers.filter(srv => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      srv.name.toLowerCase().includes(q) ||
      srv.ipAddress.toLowerCase().includes(q) ||
      srv.model.toLowerCase().includes(q) ||
      srv.locationArea.toLowerCase().includes(q) ||
      (srv.username && srv.username.toLowerCase().includes(q)) ||
      srv.id.toLowerCase().includes(q);

    const matchesType = filterType === 'ALL' || srv.type === filterType;
    const matchesArea = filterArea === 'ALL' || srv.locationArea.includes(filterArea);

    return matchesSearch && matchesType && matchesArea;
  });

  // Aggregate Stats
  const totalOlts = servers.filter(s => s.type === 'OLT').length;
  const totalMikrotiks = servers.filter(s => s.type === 'MikroTik').length;
  const totalPonPortsCount = servers
    .filter(s => s.type === 'OLT')
    .reduce((acc, s) => acc + (s.totalPonPorts || 0), 0);
  const activePonPortsCount = servers
    .filter(s => s.type === 'OLT')
    .reduce((acc, s) => acc + (s.activePonPorts || 0), 0);
  const totalConnectedSubscribers = servers.reduce((acc, s) => acc + (s.totalClientsOnline || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 md:p-6 rounded-2xl border border-indigo-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-indigo-500/20 border border-indigo-500/40 rounded-2xl text-indigo-400 shadow-inner">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/40">
                  NETWORK INFRASTRUCTURE
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {servers.length} Hardware Nodes
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-white mt-1">
                {lang === 'bn' ? 'সার্ভার, ওএলটি ও মাইক্রোটিক ডিভাইস কন্ট্রোল' : 'Server, OLT & MikroTik Device Manager'}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {lang === 'bn' 
                  ? 'মাইক্রোটিক রাউটারওএস ইউজারনেম, পাসওয়ার্ড, উইনবক্স পোর্ট ও ওএলটি পিওএন পোর্ট মনিটরিং' 
                  : 'Manage RouterOS credentials, Winbox access, CLI API, and OLT PON port capacity'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                handleTypeChange('MikroTik');
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-lg flex items-center gap-2 active:scale-95 border border-indigo-400/40"
            >
              <Key className="w-4 h-4" />
              <span>{lang === 'bn' ? 'নতুন মাইক্রোটিক যোগ করুন' : 'Add New MikroTik'}</span>
            </button>

            <button
              onClick={() => {
                handleTypeChange('OLT');
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg flex items-center gap-2 active:scale-95 border border-teal-400/40"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'নতুন ওএলটি (OLT) যোগ' : 'Add New OLT'}</span>
            </button>
          </div>
        </div>

        {/* Quick Infrastructure KPI Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>{lang === 'bn' ? 'মোট ওএলটি (OLT) ও PON' : 'Total OLTs & PON'}</span>
              <Radio className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-teal-300 font-mono">{totalOlts}</span>
              <span className="text-[11px] text-slate-400 font-mono">({activePonPortsCount}/{totalPonPortsCount} PONs)</span>
            </div>
            <p className="text-[10px] text-teal-400/80 mt-0.5 font-mono">
              GPON / EPON Hubs
            </p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>{lang === 'bn' ? 'মাইক্রোটিক কোর রাউটার' : 'MikroTik Core Routers'}</span>
              <Router className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-indigo-300 font-mono">{totalMikrotiks}</span>
              <span className="text-[11px] text-slate-400">Nodes</span>
            </div>
            <p className="text-[10px] text-indigo-400/80 mt-0.5 font-mono">
              Winbox & RouterOS v7
            </p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>{lang === 'bn' ? 'লাইভ ক্লায়েন্ট ও ONU' : 'Connected Clients/ONUs'}</span>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-emerald-300 font-mono">{totalConnectedSubscribers.toLocaleString()}</span>
              <span className="text-[11px] text-slate-400">Sessions</span>
            </div>
            <p className="text-[10px] text-emerald-400/80 mt-0.5 font-mono">
              Live PPPoE & Fiber Drops
            </p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>{lang === 'bn' ? 'সার্ভার হেলথ রেটিং' : 'Network Health'}</span>
              <Activity className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-sky-300 font-mono">99.98%</span>
              <span className="text-[11px] text-emerald-400 font-bold">Stable</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
              Avg Latency: 3.2ms
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'bn' ? 'সার্ভার নাম, ইউজারনেম, IP বা মডেল খুঁজুন...' : 'Search by Name, Username, IP, Model or Area...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Type Filter Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {(['ALL', 'MikroTik', 'OLT', 'Core_Router', 'Switch'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filterType === t 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'ALL' ? (lang === 'bn' ? 'সকল' : 'All') : t}
              </button>
            ))}
          </div>

          {/* Location Area Selector */}
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-300 bg-slate-50 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">{lang === 'bn' ? 'সকল এরিয়া ও পপ (POP)' : 'All Areas & POPs'}</option>
            {popAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Server & Device Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServers.map((srv) => {
          const isOLT = srv.type === 'OLT';
          const isMikroTik = srv.type === 'MikroTik';
          const pingResult = pingResults[srv.id];
          const isPinging = pingingServerId === srv.id;
          const isRevealed = revealedPasswords[srv.id] || false;
          const winboxPortToUse = srv.winboxPort || (isMikroTik ? 8291 : 80);
          const usernameToUse = srv.username || 'admin';
          const passwordToUse = srv.password || 'MikroTik@2026';
          const winboxCmd = `winbox.exe ${srv.ipAddress}:${winboxPortToUse} ${usernameToUse} ${passwordToUse}`;

          return (
            <div 
              key={srv.id}
              className={`bg-slate-900 border rounded-2xl p-5 text-white transition-all hover:shadow-xl flex flex-col justify-between relative overflow-hidden ${
                srv.status === 'Warning' 
                  ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                  : srv.status === 'Offline'
                  ? 'border-rose-500/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Top Details */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2.5 rounded-xl border ${
                      isOLT 
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/40' 
                        : isMikroTik 
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' 
                        : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    }`}>
                      {isOLT ? <Radio className="w-5 h-5" /> : isMikroTik ? <Router className="w-5 h-5" /> : <Server className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md border uppercase ${
                          isOLT 
                            ? 'bg-teal-950 text-teal-300 border-teal-500/40' 
                            : isMikroTik 
                            ? 'bg-indigo-950 text-indigo-300 border-indigo-500/40' 
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {srv.type}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {srv.id}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-white mt-1 line-clamp-1" title={srv.name}>
                        {srv.name}
                      </h3>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 shrink-0 ${
                    srv.status === 'Online' 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                      : srv.status === 'Warning' 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' 
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      srv.status === 'Online' ? 'bg-emerald-400' : srv.status === 'Warning' ? 'bg-amber-400' : 'bg-rose-400'
                    }`} />
                    <span>{srv.status}</span>
                  </span>
                </div>

                {/* Model & IP Specs */}
                <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 mb-3 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">{lang === 'bn' ? 'মডেল:' : 'Model:'}</span>
                    <span className="font-bold text-slate-200 truncate max-w-[180px]" title={srv.model}>
                      {srv.model}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">IP & Port:</span>
                    <span className="font-bold text-indigo-300">
                      {srv.ipAddress}:{srv.port}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">{lang === 'bn' ? 'পপ লোকেশন:' : 'Location:'}</span>
                    <span className="text-emerald-400 flex items-center gap-1 truncate max-w-[170px]" title={srv.locationArea}>
                      <MapPin className="w-3 h-3 shrink-0" />
                      {srv.locationArea.split(' ')[0]}
                    </span>
                  </div>

                  {srv.vlan && (
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">VLANs:</span>
                      <span className="text-amber-300 font-bold truncate max-w-[180px]">{srv.vlan}</span>
                    </div>
                  )}
                </div>

                {/* DEDICATED MIKROTIK / DEVICE AUTH CREDENTIALS BOX */}
                <div className="mb-3 p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/30 text-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-indigo-500/20">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                      <Key className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{lang === 'bn' ? 'অথেনটিকেশন ও উইনবক্স এক্সেস' : 'Device Auth Credentials'}</span>
                    </div>
                    <button
                      onClick={() => handleOpenCredentialsModal(srv)}
                      className="px-2 py-0.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 rounded text-[10px] font-bold transition-colors border border-indigo-400/30 flex items-center gap-1"
                      title="Edit Login Credentials & Access Rules"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                      <span>{lang === 'bn' ? 'এডিট' : 'Edit'}</span>
                    </button>
                  </div>

                  {/* Username Row */}
                  <div className="flex items-center justify-between py-1 font-mono text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span>User:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                        {usernameToUse}
                      </span>
                      <button
                        onClick={() => handleCopyText(usernameToUse, `user-${srv.id}`)}
                        className="p-1 hover:bg-indigo-500/30 text-indigo-300 rounded transition-colors"
                        title="Copy Username"
                      >
                        {copiedKey === `user-${srv.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Row with Show/Hide & Copy */}
                  <div className="flex items-center justify-between py-1 font-mono text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Key className="w-3 h-3 text-slate-500" />
                      <span>Pass:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-emerald-300 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 select-all">
                        {isRevealed ? passwordToUse : '••••••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordReveal(srv.id)}
                        className="p-1 hover:bg-indigo-500/30 text-slate-300 rounded transition-colors"
                        title={isRevealed ? 'Hide Password' : 'Show Password'}
                      >
                        {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => handleCopyText(passwordToUse, `pass-${srv.id}`)}
                        className="p-1 hover:bg-indigo-500/30 text-indigo-300 rounded transition-colors"
                        title="Copy Password"
                      >
                        {copiedKey === `pass-${srv.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Winbox Quick Connect Bar */}
                  <div className="mt-2 pt-2 border-t border-indigo-500/20 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-indigo-300/80">
                      Winbox: <strong className="text-white">{srv.ipAddress}:{winboxPortToUse}</strong>
                    </span>
                    <button
                      onClick={() => handleCopyText(winboxCmd, `winbox-${srv.id}`)}
                      className="px-2 py-0.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 rounded font-bold transition-all border border-indigo-500/30 flex items-center gap-1 active:scale-95"
                      title="Copy Winbox One-Click Login Command"
                    >
                      {copiedKey === `winbox-${srv.id}` ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" />
                          <span>Winbox Cmd</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Metrics: CPU, Temperature & Capacity */}
                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                  <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">CPU</span>
                    <span className="font-mono font-bold text-xs text-white mt-0.5 block">
                      {srv.cpuUsage || 18}%
                    </span>
                  </div>

                  <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Temp</span>
                    <span className={`font-mono font-bold text-xs mt-0.5 block ${
                      parseInt(srv.temperature || '38') > 45 ? 'text-amber-400 font-extrabold' : 'text-slate-200'
                    }`}>
                      {srv.temperature || '38°C'}
                    </span>
                  </div>

                  <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {isOLT ? 'PON Ports' : 'Clients'}
                    </span>
                    <span className="font-mono font-bold text-xs text-teal-300 mt-0.5 block">
                      {isOLT ? `${srv.activePonPorts || 0}/${srv.totalPonPorts || 0}` : `${srv.totalClientsOnline || 0}`}
                    </span>
                  </div>
                </div>

                {/* Live Ping & Latency Status */}
                {pingResult && (
                  <div className="p-2 mb-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-slate-400">Ping RTT:</span>
                      <span className="text-emerald-300 font-bold">{pingResult.rtt} ms</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{pingResult.timestamp}</span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulatePing(srv)}
                  disabled={isPinging}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 border border-slate-700 active:scale-95 disabled:opacity-50"
                  title="Run ICMP Ping Diagnostics"
                >
                  <Activity className={`w-3.5 h-3.5 text-teal-400 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>{isPinging ? 'Pinging...' : 'Ping Test'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenCredentialsModal(srv)}
                    className="p-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-white rounded-xl text-xs transition-all border border-indigo-500/30"
                    title="Credentials & Winbox Setup"
                  >
                    <Key className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setTerminalServer(srv)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition-all border border-slate-700"
                    title="Open Device Terminal / CLI"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteServer(srv.id)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl text-xs transition-all border border-rose-500/20"
                    title="Delete Server Device"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredServers.length === 0 && (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 shadow-sm">
          <Server className="w-12 h-12 mx-auto text-slate-400 mb-3 opacity-60" />
          <h3 className="text-base font-bold text-slate-800 mb-1">
            {lang === 'bn' ? 'কোন সার্ভার বা ওএলটি পাওয়া যায়নি' : 'No Servers or OLTs Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {lang === 'bn' ? 'আপনার সার্চ বা ফিল্টারের সাথে মিলে এমন কোনো ডিভাইস নেই।' : 'No device matching your search query or filter.'}
          </p>
          <button
            onClick={() => { setSearchQuery(''); setFilterType('ALL'); setFilterArea('ALL'); }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            {lang === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
          </button>
        </div>
      )}

      {/* ADD SERVER / OLT / MIKROTIK MODAL WITH USERNAME & PASSWORD */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 sm:p-6 my-8 overflow-hidden relative"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                    <Router className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {lang === 'bn' ? 'নতুন মাইক্রোটিক / ওএলটি সার্ভার যুক্ত করুন' : 'Add New MikroTik / OLT Server'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {lang === 'bn' ? 'ইউজারনেম, পাসওয়ার্ড, উইনবক্স পোর্ট ও নেটওয়ার্ক কনফিগারেশন' : 'Register RouterOS credentials, Winbox access & network hardware'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddServerSubmit} className="mt-5 space-y-4 text-xs">
                
                {/* Device Type Selector */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {lang === 'bn' ? 'ডিভাইসের ধরন (Device Type)' : 'Device Type'} *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['MikroTik', 'OLT', 'Core_Router', 'Switch'] as NetworkServerType[]).map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => handleTypeChange(t)}
                        className={`p-2.5 rounded-xl border text-center font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          type === t
                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-md ring-2 ring-indigo-400/40'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {t === 'MikroTik' ? <Router className="w-4 h-4 text-indigo-300" /> : t === 'OLT' ? <Radio className="w-4 h-4 text-teal-300" /> : <Server className="w-4 h-4 text-sky-300" />}
                        <span>{t === 'MikroTik' ? 'MikroTik Router' : t === 'OLT' ? 'OLT (PON)' : t}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Server Name & Model */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      {lang === 'bn' ? 'ডিভাইস / সার্ভার নাম' : 'Server / Device Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mithapukur Sadar Core MikroTik CCR-01"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      {lang === 'bn' ? 'হার্ডওয়্যার মডেল' : 'Hardware Model'} *
                    </label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      {PRESET_MODELS[type]?.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {model === 'Custom Model' && (
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      {lang === 'bn' ? 'কাস্টম মডেল নাম' : 'Custom Model Name'} *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MikroTik CCR2216-1G-12XS-2XQ"
                      value={customModel}
                      onChange={(e) => setCustomModel(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                )}

                {/* USERNAME & PASSWORD CREDENTIALS SECTION */}
                <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/40 rounded-xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-indigo-500/20">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                      <Shield className="w-4 h-4 text-indigo-400" />
                      <span>{lang === 'bn' ? 'মাইক্রোটিক ইউজারনেম ও পাসওয়ার্ড (Authentication Credentials)' : 'MikroTik & Device Authentication Credentials'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPassword(generateStrongPassword())}
                      className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 rounded text-[11px] font-bold transition-colors border border-indigo-400/30"
                      title="Generate random secure password"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-300" />
                      <span>{lang === 'bn' ? 'পাসওয়ার্ড জেনারেট' : 'Auto Generate'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Username */}
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        {lang === 'bn' ? 'অ্যাডমিন ইউজারনেম (Username)' : 'Admin / NOC Username'} *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. delta_admin or noc_engineer"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </div>

                    {/* Password with Eye Toggle */}
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        {lang === 'bn' ? 'লগইন পাসওয়ার্ড (Password)' : 'RouterOS Password'} *
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          placeholder="e.g. MikroTik@2026!Mpk"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full p-2.5 pr-10 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                          title={showNewPassword ? 'Hide Password' : 'Show Password'}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Access Group & Radius Secret */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        {lang === 'bn' ? 'এক্সেস গ্রুপ (Group Privilege)' : 'MikroTik User Group'}
                      </label>
                      <select
                        value={adminGroup}
                        onChange={(e) => setAdminGroup(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 font-medium"
                      >
                        <option value="full">full (Super Admin - Read/Write/Policy)</option>
                        <option value="write">write (Read/Write Config)</option>
                        <option value="read">read (Monitoring & Status View)</option>
                        <option value="api_admin">api_admin (API / Radius / CRM Only)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        {lang === 'bn' ? 'RADIUS / PPPoE সিক্রেট কি (ঐচ্ছিক)' : 'PPPoE / RADIUS Secret (Optional)'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. DeltaRadius2026"
                        value={radiusSecret}
                        onChange={(e) => setRadiusSecret(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* IP Address, Ports & Winbox Port */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      IP Address *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="103.145.22.1"
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Winbox Port
                    </label>
                    <input
                      type="number"
                      value={winboxPort}
                      onChange={(e) => setWinboxPort(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      API / SSH Port
                    </label>
                    <input
                      type="number"
                      value={apiPort}
                      onChange={(e) => setApiPort(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>

                {/* POP Location & VLAN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      {lang === 'bn' ? 'পপ সাব-স্টেশন / এলাকা' : 'POP Substation / Location Area'} *
                    </label>
                    <select
                      value={locationArea}
                      onChange={(e) => setLocationArea(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      {popAreas.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      {lang === 'bn' ? 'ভিলেন (VLAN Tag / Range)' : 'VLAN Range'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. VLAN-100, 200, 300"
                      value={vlan}
                      onChange={(e) => setVlan(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>

                {/* OLT PON Port Capacity */}
                {type === 'OLT' && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Total PON Ports
                      </label>
                      <select
                        value={totalPonPorts}
                        onChange={(e) => setTotalPonPorts(Number(e.target.value))}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      >
                        <option value={4}>4 Ports (EPON/GPON)</option>
                        <option value={8}>8 Ports (EPON/GPON)</option>
                        <option value={16}>16 Ports (GPON Chassis)</option>
                        <option value={32}>32 Ports (High Capacity OLT)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Active PON Ports in Use
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={totalPonPorts}
                        value={activePonPorts}
                        onChange={(e) => setActivePonPorts(Number(e.target.value))}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {lang === 'bn' ? 'নোট বা মন্তব্য' : 'Rack Location & Deployment Notes'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Installed in Central NOC Rack-01, redundant power with 10G uplink."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 font-medium resize-none"
                  />
                </div>

                {/* Submit & Cancel Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-400 hover:to-teal-400 text-white font-extrabold rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'bn' ? '✓ ডিভাইস ও ক্রেডেনশিয়াল সংরক্ষণ' : '✓ Save Device & Credentials'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DEDICATED CREDENTIALS & WINBOX MANAGER MODAL */}
      <AnimatePresence>
        {credentialsServer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-indigo-500/40 text-white rounded-2xl shadow-2xl max-w-xl w-full p-5 sm:p-6 my-8 overflow-hidden relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/40">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      {credentialsServer.name}
                    </h3>
                    <p className="text-xs text-indigo-300 font-mono">
                      {credentialsServer.type} • {credentialsServer.ipAddress} • {credentialsServer.model}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setCredentialsServer(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* View / Edit Mode */}
              {!isEditingCredentials ? (
                <div className="mt-4 space-y-4 text-xs">
                  {/* Credentials Box */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Username:</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
                          {credentialsServer.username || 'admin'}
                        </span>
                        <button
                          onClick={() => handleCopyText(credentialsServer.username || 'admin', 'modal-user')}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded transition-colors"
                          title="Copy Username"
                        >
                          {copiedKey === 'modal-user' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Password:</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-700 select-all">
                          {showEditPassword ? (credentialsServer.password || 'MikroTik@2026') : '••••••••••••••••'}
                        </span>
                        <button
                          onClick={() => setShowEditPassword(!showEditPassword)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                          title={showEditPassword ? 'Hide Password' : 'Show Password'}
                        >
                          {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleCopyText(credentialsServer.password || 'MikroTik@2026', 'modal-pass')}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded transition-colors"
                          title="Copy Password"
                        >
                          {copiedKey === 'modal-pass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Winbox Port:</span>
                        <span className="text-indigo-300 font-bold">{credentialsServer.winboxPort || 8291}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">API / SSH Port:</span>
                        <span className="text-indigo-300 font-bold">{credentialsServer.apiPort || 8728}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">User Group:</span>
                        <span className="text-emerald-400 font-bold">{credentialsServer.adminGroup || 'full'}</span>
                      </div>
                      {credentialsServer.radiusSecret && (
                        <div>
                          <span className="text-slate-500 block">RADIUS Secret:</span>
                          <span className="text-amber-300 font-bold">{credentialsServer.radiusSecret}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Winbox Command Line Helper */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-indigo-500/30">
                    <div className="flex items-center justify-between text-[11px] font-mono text-indigo-300 mb-1">
                      <span>Winbox Direct Launch Command:</span>
                      <button
                        onClick={() => handleCopyText(
                          `winbox.exe ${credentialsServer.ipAddress}:${credentialsServer.winboxPort || 8291} ${credentialsServer.username || 'admin'} ${credentialsServer.password || 'MikroTik@2026'}`,
                          'modal-winbox-cmd'
                        )}
                        className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold"
                      >
                        {copiedKey === 'modal-winbox-cmd' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'modal-winbox-cmd' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <code className="block bg-slate-900 p-2 rounded text-[11px] font-mono text-slate-300 select-all overflow-x-auto">
                      winbox.exe {credentialsServer.ipAddress}:{credentialsServer.winboxPort || 8291} {credentialsServer.username || 'admin'} {credentialsServer.password || 'MikroTik@2026'}
                    </code>
                  </div>

                  {/* MikroTik User Add Terminal Script */}
                  {credentialsServer.type === 'MikroTik' && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                        <span>RouterOS CLI Script to configure user:</span>
                        <button
                          onClick={() => handleCopyText(
                            `/user add name="${credentialsServer.username || 'admin'}" password="${credentialsServer.password || 'MikroTik@2026'}" group=${credentialsServer.adminGroup || 'full'} comment="Delta ISP NOC"`,
                            'modal-ros-cmd'
                          )}
                          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold"
                        >
                          {copiedKey === 'modal-ros-cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>Copy Script</span>
                        </button>
                      </div>
                      <code className="block bg-slate-900 p-2 rounded text-[10px] font-mono text-emerald-400 select-all overflow-x-auto">
                        /user add name="{credentialsServer.username || 'admin'}" password="{credentialsServer.password || 'MikroTik@2026'}" group={credentialsServer.adminGroup || 'full'} comment="Delta ISP NOC"
                      </code>
                    </div>
                  )}

                  {/* Auth Test Status Box */}
                  {authTestStatus === 'SUCCESS' && (
                    <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>✓ {lang === 'bn' ? 'অথেনটিকেশন সফল: RouterOS v7 সেশন কানেক্টেড' : 'Auth Successful: RouterOS session verified as group: full'}</span>
                    </div>
                  )}

                  {/* Modal Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleRunAuthTest}
                      disabled={authTestStatus === 'TESTING'}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition-all flex items-center gap-1.5 border border-slate-700"
                    >
                      <ShieldCheck className={`w-4 h-4 text-teal-400 ${authTestStatus === 'TESTING' ? 'animate-spin' : ''}`} />
                      <span>{authTestStatus === 'TESTING' ? 'Testing...' : 'Test Auth Credentials'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsEditingCredentials(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'পাসওয়ার্ড ও পোর্ট পরিবর্তন করুন' : 'Edit Credentials'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* EDIT FORM */
                <form onSubmit={handleSaveEditedCredentials} className="mt-4 space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      {lang === 'bn' ? 'ইউজারনেম (Username)' : 'Username'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 font-bold">
                        {lang === 'bn' ? 'নতুন পাসওয়ার্ড (Password)' : 'Password'} *
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditPassword(generateStrongPassword())}
                        className="text-[11px] text-indigo-300 hover:text-indigo-200 font-bold flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Auto Generate</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        required
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        className="w-full p-2.5 pr-10 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Winbox Port
                      </label>
                      <input
                        type="number"
                        value={editWinboxPort}
                        onChange={(e) => setEditWinboxPort(Number(e.target.value))}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        API / SSH Port
                      </label>
                      <input
                        type="number"
                        value={editApiPort}
                        onChange={(e) => setEditApiPort(Number(e.target.value))}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Access Group
                      </label>
                      <select
                        value={editAdminGroup}
                        onChange={(e) => setEditAdminGroup(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 font-medium"
                      >
                        <option value="full">full (Super Admin)</option>
                        <option value="write">write (Config Admin)</option>
                        <option value="read">read (Monitoring View)</option>
                        <option value="api_admin">api_admin (API Only)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        RADIUS Secret (Optional)
                      </label>
                      <input
                        type="text"
                        value={editRadiusSecret}
                        onChange={(e) => setEditRadiusSecret(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsEditingCredentials(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all"
                    >
                      {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                    </button>

                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl shadow-lg transition-all"
                    >
                      {lang === 'bn' ? '✓ ক্রেডেনশিয়াল আপডেট করুন' : '✓ Update Credentials'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CLI / TERMINAL SIMULATION MODAL */}
      <AnimatePresence>
        {terminalServer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-800 text-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 font-mono text-xs overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-slate-200">
                    CLI Session: {terminalServer.name} ({terminalServer.ipAddress}:{terminalServer.port})
                  </span>
                </div>
                <button
                  onClick={() => setTerminalServer(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="bg-black/90 p-4 rounded-xl border border-slate-800 space-y-2 text-slate-300 h-64 overflow-y-auto">
                <div className="text-emerald-400 font-bold">
                  [Delta-ISP-Core] Authenticating as '{terminalServer.username || 'admin'}' to {terminalServer.ipAddress}:{terminalServer.port}... Connected!
                </div>
                <div>Device: {terminalServer.model}</div>
                <div>Uptime: {terminalServer.uptime || '45 days'}</div>
                <div>CPU Usage: {terminalServer.cpuUsage}% | Temp: {terminalServer.temperature}</div>
                <div className="text-indigo-300">
                  {terminalServer.type === 'OLT' 
                    ? `[OLT-CLI]# display ont info 0 all\nTotal Active ONUs: ${terminalServer.totalClientsOnline} | Signal: -18.5 dBm ~ -24.2 dBm`
                    : `[${terminalServer.username || 'admin'}@${terminalServer.name}] > /interface print\n10G-SFP1: Running | PPPoE Active Sessions: ${terminalServer.totalClientsOnline}`}
                </div>
                <div className="text-slate-500 animate-pulse">_</div>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => setTerminalServer(null)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-bold"
                >
                  Close Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
