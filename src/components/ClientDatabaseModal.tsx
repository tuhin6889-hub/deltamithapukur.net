import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Users, 
  Database, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  PhoneCall, 
  MapPin, 
  Wifi, 
  ShieldCheck, 
  Download, 
  RefreshCw, 
  Filter,
  DollarSign,
  Cpu,
  Mail,
  UserPlus,
  Home,
  QrCode,
  Printer,
  Eye,
  Key,
  Lock,
  Server,
  Navigation,
  FileText,
  CreditCard,
  Laptop,
  Radio,
  FileCheck,
  FileSpreadsheet,
  UploadCloud,
  ChevronDown
} from 'lucide-react';
import { ClientInfo } from '../types';
import { 
  exportClientsToExcel, 
  downloadClientExcelTemplate, 
  downloadClientCsvTemplate 
} from '../utils/excelHelper';
import { ClientExcelImportModal } from './ClientExcelImportModal';

interface ClientDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientInfo[];
  lang: 'bn' | 'en';
  onOpenAddNewClient?: () => void;
  onOpenRouterQrStickerForClient?: (cid: string) => void;
  onOpenBatchRouterQrStickers?: () => void;
  onBatchImportClients?: (importedClients: ClientInfo[], mode: 'UPSERT' | 'APPEND' | 'OVERWRITE') => void;
}

export const ClientDatabaseModal: React.FC<ClientDatabaseModalProps> = ({
  isOpen,
  onClose,
  clients,
  lang,
  onOpenAddNewClient,
  onOpenRouterQrStickerForClient,
  onOpenBatchRouterQrStickers,
  onBatchImportClients,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [inspectClient, setInspectClient] = useState<ClientInfo | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  if (!isOpen) return null;

  // Filter Clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.cid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      client.ipAddress.includes(searchQuery) ||
      client.onuMac.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.userName && client.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (client.popName && client.popName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (client.zoneName && client.zoneName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesArea = selectedArea === 'ALL' || client.area === selectedArea;
    const matchesStatus = selectedStatus === 'ALL' || client.status === selectedStatus;

    return matchesSearch && matchesArea && matchesStatus;
  });

  const handleExportExcel = () => {
    if (filteredClients.length === 0) return;
    exportClientsToExcel(filteredClients, 'Delta_ISP_Clients_Filtered');
    setShowExportMenu(false);
  };

  const handleExportAllExcel = () => {
    if (clients.length === 0) return;
    exportClientsToExcel(clients, 'Delta_ISP_All_Subscribers_Master');
    setShowExportMenu(false);
  };

  const handleDownloadCSV = () => {
    if (filteredClients.length === 0) return;

    const headers = [
      'CID', 
      'Name', 
      'User Name',
      'Password',
      'Phone', 
      'Area', 
      'Zone Name',
      'PoP Name',
      'Package', 
      'Monthly Bill',
      'Bill Type',
      'IP Address', 
      'IP Type',
      'ONU MAC', 
      'Router MAC',
      'ONU Owner',
      'Optical Power', 
      'NID Number',
      'GPS Coordinates',
      'Remote User',
      'Remarks',
      'Status'
    ];
    
    const csvRows = [
      headers.join(','),
      ...filteredClients.map(client => {
        const escape = (str: string | number | undefined) => `"${String(str || '').replace(/"/g, '""')}"`;
        return [
          escape(client.cid),
          escape(client.name),
          escape(client.userName),
          escape(client.password),
          escape(client.phone),
          escape(client.area),
          escape(client.zoneName),
          escape(client.popName),
          escape(client.package),
          escape(client.monthlyBill || client.balance),
          escape(client.billType),
          escape(client.ipAddress),
          escape(client.ipType),
          escape(client.onuMac),
          escape(client.routerMac),
          escape(client.onuOwner),
          escape(client.opticalPower),
          escape(client.nidNumber),
          escape(client.gpsCoordinates),
          escape(client.remoteUserName),
          escape(client.remarks),
          escape(client.status),
        ].join(',');
      })
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Delta_ISP_Clients_Detailed_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const totalClients = clients.length;
  const activeCount = clients.filter(c => c.status === 'Active').length;
  const suspendedCount = clients.filter(c => c.status === 'Suspended').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/20 border border-sky-500/30 text-sky-400">
              <Database className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight font-mono uppercase">
                  {lang === 'bn' ? 'গ্রাহক ডাটাবেজ সেন্টার' : 'ISP Client Database Center'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-mono text-[10px] border border-sky-500/30 font-bold">
                  DELTA MITHAPUKUR POP
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {lang === 'bn' 
                  ? 'মিঠাপুকুর জোনের সকল সক্রিয় ইন্টারনেট গ্রাহক, আইপি এ্যাসাইনমেন্ট ও অপটিক্যাল লেভেল' 
                  : 'Centralized subscriber database, PPPoE credentials, ONU/Router MAC, PoP/Zone & Billing records'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download Excel Template Button */}
            <button
              onClick={downloadClientExcelTemplate}
              className="px-3 py-1.5 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title="Download official bulk import Excel template (.xlsx) with CID, Name, Phone, Address, Area, Package, Email"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>{lang === 'bn' ? 'এক্সেল টেমপ্লেট ডাউনলোড' : 'Download Excel Template'}</span>
            </button>

            {/* Excel Import Button */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title="Import Subscribers from Excel (.xlsx, .xls, .csv)"
            >
              <UploadCloud className="w-4 h-4 text-emerald-100" />
              <span>{lang === 'bn' ? 'এক্সেল ইমপোর্ট' : 'Excel Import'}</span>
            </button>

            {/* Excel Export Button */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                title="Export Subscriber Database to Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'bn' ? 'এক্সেল এক্সপোর্ট' : 'Excel Export'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-1.5 z-50 text-xs font-mono">
                  <button
                    onClick={handleExportExcel}
                    className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-800 hover:text-emerald-300 flex items-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export Filtered ({filteredClients.length}) to .xlsx</span>
                  </button>
                  <button
                    onClick={handleExportAllExcel}
                    className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-800 hover:text-emerald-300 flex items-center gap-2 cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5 text-sky-400" />
                    <span>Export All ({clients.length}) to .xlsx</span>
                  </button>
                  <button
                    onClick={handleDownloadCSV}
                    className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-800 hover:text-amber-300 flex items-center gap-2 cursor-pointer border-t border-slate-800"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Export as CSV (.csv)</span>
                  </button>
                  <button
                    onClick={() => {
                      downloadClientExcelTemplate();
                      setShowExportMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sky-300 hover:bg-slate-800 flex items-center gap-2 cursor-pointer border-t border-slate-800"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>Download Excel Template (.xlsx)</span>
                  </button>
                  <button
                    onClick={() => {
                      downloadClientCsvTemplate();
                      setShowExportMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-slate-400 hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Download CSV Template (.csv)</span>
                  </button>
                </div>
              )}
            </div>

            {onOpenAddNewClient && (
              <button
                onClick={onOpenAddNewClient}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-slate-950" />
                <span className="hidden sm:inline">{lang === 'bn' ? 'নতুন ক্লায়েন্ট' : 'Add Client'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title="Return to Home Page"
            >
              <Home className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'হোম' : 'Home'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-900/60 border-b border-slate-800 p-3 gap-3 text-xs font-mono flex-shrink-0">
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Subscribers</span>
            <span className="text-lg font-extrabold text-white">{totalClients}</span>
          </div>
          <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
            <span className="text-emerald-400 block text-[10px] uppercase font-bold">Active Connections</span>
            <span className="text-lg font-extrabold text-emerald-300">{activeCount}</span>
          </div>
          <div className="bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30">
            <span className="text-rose-400 block text-[10px] uppercase font-bold">Suspended / Due</span>
            <span className="text-lg font-extrabold text-rose-300">{suspendedCount}</span>
          </div>
          <div className="bg-sky-950/40 p-2.5 rounded-xl border border-sky-500/30">
            <span className="text-sky-400 block text-[10px] uppercase font-bold">POP Fiber Coverage</span>
            <span className="text-lg font-extrabold text-sky-300">5 Active POPs</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-slate-900/40 border-b border-slate-800 flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'নাম, CID, ইউজারনেম, মোবাইল, PoP বা আইপি দিয়ে খুঁজুন...' : 'Search by Name, CID, User Name, Phone, PoP, Zone, IP, MAC...'}
              className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 focus:border-sky-500 rounded-xl text-xs text-white font-mono outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-3 py-2 bg-slate-800/90 border border-slate-700 text-slate-200 text-xs rounded-xl font-mono outline-none cursor-pointer"
            >
              <option value="ALL">All Areas / Unions</option>
              <option value="মিঠাপুকুর সদর (Mithapukur Sadar)">মিঠাপুকুর সদর</option>
              <option value="পায়রাবন্দ (Pairaband)">পায়রাবন্দ</option>
              <option value="রানীপুকুর (Ranipukur)">রানীপুকুর</option>
              <option value="বালুয়া মাসিমপুর (Balua Masimpur)">বালুয়া মাসিমপুর</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-800/90 border border-slate-700 text-slate-200 text-xs rounded-xl font-mono outline-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>

            {/* Download Excel Template */}
            <button
              onClick={downloadClientExcelTemplate}
              className="px-3 py-2 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 font-bold text-xs rounded-xl border border-sky-500/40 flex items-center gap-1.5 transition-all shadow-sm active:scale-95 whitespace-nowrap cursor-pointer"
              title="Download Excel / CSV template for bulk importing clients (CID, Name, Phone, Address, Area, Package, Email)"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>{lang === 'bn' ? 'টেমপ্লেট (.xlsx)' : 'Download Excel Template'}</span>
            </button>

            {/* Excel Export (.xlsx) */}
            <button
              onClick={handleExportExcel}
              disabled={filteredClients.length === 0}
              className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/40 flex items-center gap-1.5 transition-all shadow-sm active:scale-95 whitespace-nowrap cursor-pointer"
              title="Export filtered subscriber database to Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'bn' ? 'এক্সেল (.xlsx)' : 'Excel (.xlsx)'}</span>
            </button>

            {/* Excel Import */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl border border-emerald-400/40 flex items-center gap-1.5 transition-all shadow-sm active:scale-95 whitespace-nowrap cursor-pointer"
              title="Batch import subscribers from Excel (.xlsx, .csv)"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-950" />
              <span>{lang === 'bn' ? 'ইমপোর্ট' : 'Import'}</span>
            </button>

            {/* CSV Export */}
            <button
              onClick={handleDownloadCSV}
              disabled={filteredClients.length === 0}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm active:scale-95 whitespace-nowrap cursor-pointer"
              title="Download current client list as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>{lang === 'bn' ? 'CSV' : 'CSV'}</span>
            </button>

            {onOpenBatchRouterQrStickers && (
              <button
                onClick={onOpenBatchRouterQrStickers}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm active:scale-95 whitespace-nowrap cursor-pointer"
                title="Generate & Print Physical Router Support QR Stickers for Clients"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span className="hidden md:inline">{lang === 'bn' ? 'স্টিকার' : 'Stickers'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Client Records Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                  <th className="p-3">Client / User / CID</th>
                  <th className="p-3">PoP & Zone / Area</th>
                  <th className="p-3">Package & Monthly Bill</th>
                  <th className="p-3">IP Type & MACs</th>
                  <th className="p-3">Bill Type & Balance</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No client matching query "{searchQuery}"
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.cid} className="hover:bg-slate-800/50 transition-colors">
                      {/* Name / CID / User */}
                      <td className="p-3">
                        <div className="font-bold text-white text-sm">{client.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sky-400 text-[11px] font-bold">{client.cid}</span>
                          {client.userName && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700 flex items-center gap-0.5">
                              <Key className="w-2.5 h-2.5 text-sky-400" />
                              {client.userName}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* PoP, Zone, Area */}
                      <td className="p-3">
                        <div className="text-slate-200 font-bold text-[11px] flex items-center gap-1">
                          <Server className="w-3 h-3 text-indigo-400" />
                          <span>{client.popName || 'Central POP'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-slate-500" />
                          <span>{client.zoneName || client.area}</span>
                        </div>
                      </td>

                      {/* Package & Monthly Bill */}
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 font-bold text-[11px] block w-fit">
                          {client.package}
                        </span>
                        <div className="text-emerald-400 text-[11px] font-bold mt-1">
                          ৳ {client.monthlyBill || 800} / mo
                        </div>
                      </td>

                      {/* IP, IP Type & MACs */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-200 font-bold">{client.ipAddress}</span>
                          <span className="px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-500/30 text-[9px] font-bold">
                            {client.ipType || 'Real IP'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>ONU: {client.onuMac}</span>
                          <span className="text-emerald-400 font-bold">({client.opticalPower})</span>
                        </div>
                      </td>

                      {/* Bill Type & Balance */}
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            client.billType === 'bKash' 
                              ? 'bg-pink-950/60 text-pink-300 border-pink-500/30'
                              : client.billType === 'Nagad'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                              : client.billType === 'Bank'
                              ? 'bg-blue-950/60 text-blue-300 border-blue-500/30'
                              : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {client.billType || 'bKash'}
                          </span>
                        </div>
                        <div className={`text-[11px] font-bold mt-1 ${client.balance <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {client.balance <= 0 ? 'Paid (৳ 0)' : `Due: ৳ ${client.balance}`}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          client.status === 'Active'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {client.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{client.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectClient(client)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 border border-slate-700 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-all shadow-sm active:scale-95 cursor-pointer"
                            title="Inspect complete technical profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>

                          {onOpenRouterQrStickerForClient && (
                            <button
                              onClick={() => onOpenRouterQrStickerForClient(client.cid)}
                              className="px-2 py-1 bg-slate-900 hover:bg-emerald-950 text-emerald-400 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/60 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-all shadow-sm active:scale-95 cursor-pointer"
                              title={`Print Router QR Sticker for ${client.name}`}
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>QR</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400 flex-shrink-0">
          <div>
            Showing <strong className="text-white">{filteredClients.length}</strong> of <strong className="text-white">{totalClients}</strong> Full ISP Subscriber Profiles
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              disabled={filteredClients.length === 0}
              className="px-3.5 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 font-bold rounded-xl border border-sky-500/30 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'CSV এক্সপোর্ট' : 'Export Full CSV'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>

      {/* Individual Client Details Inspector Drawer / Dialog */}
      {inspectClient && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
          <div className="bg-[#0b1120] border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200 font-mono text-xs">
            
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl border border-sky-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">{inspectClient.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sky-400 font-bold">{inspectClient.cid}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400 font-bold">{inspectClient.status}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setInspectClient(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inspector Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Account & Credentials */}
              <div className="p-3.5 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-sky-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>Subscriber Authentication (PPPoE / Login)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">User Name:</span>
                    <span className="font-bold text-sky-300">{inspectClient.userName || inspectClient.cid.toLowerCase()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Password:</span>
                    <span className="font-bold text-slate-200">{inspectClient.password || '••••••••'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Phone Number:</span>
                    <span className="font-bold text-slate-200">{inspectClient.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Email:</span>
                    <span className="text-slate-300">{inspectClient.email}</span>
                  </div>
                </div>
              </div>

              {/* PoP, Zone, Package & Billing */}
              <div className="p-3.5 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-indigo-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5" />
                  <span>Network Topology & Billing</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">PoP Name:</span>
                    <span className="font-bold text-indigo-300">{inspectClient.popName || 'Central POP-01'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Zone Name:</span>
                    <span className="font-bold text-slate-200">{inspectClient.zoneName || inspectClient.area}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Area / Union:</span>
                    <span className="font-bold text-slate-200">{inspectClient.area}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Package:</span>
                    <span className="font-bold text-emerald-400">{inspectClient.package}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Monthly Bill:</span>
                    <span className="font-bold text-emerald-400">৳ {inspectClient.monthlyBill || 800}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Bill Type:</span>
                    <span className="font-bold text-amber-400">{inspectClient.billType || 'bKash'}</span>
                  </div>
                </div>
              </div>

              {/* Hardware & Network */}
              <div className="p-3.5 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Hardware & Optical Specs</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">ONU Owner:</span>
                    <span className="font-bold text-sky-400">{inspectClient.onuOwner || 'Client'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">ONU MAC:</span>
                    <span className="font-bold text-slate-200">{inspectClient.onuMac}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Router MAC:</span>
                    <span className="font-bold text-slate-200">{inspectClient.routerMac || 'C8:3A:35:12:44:90'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Assigned IP:</span>
                    <span className="font-bold text-white">{inspectClient.ipAddress}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">IP Type:</span>
                    <span className="font-bold text-sky-300">{inspectClient.ipType || 'Real IP'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Optical Power:</span>
                    <span className="font-bold text-emerald-400">{inspectClient.opticalPower}</span>
                  </div>
                </div>
              </div>

              {/* KYC, NID & GPS Location */}
              <div className="p-3.5 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-amber-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>NID KYC & Geographic Coordinates</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">NID Number:</span>
                    <span className="font-bold text-slate-200">{inspectClient.nidNumber || '19884512984512001'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">NID Document:</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <FileCheck className="w-3 h-3" />
                      {inspectClient.nidDocument || 'nid_smartcard.jpg'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block text-[10px]">GPS Coordinates (Lat-Lng):</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-300">{inspectClient.gpsCoordinates || '25.5782, 89.2844'}</span>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(inspectClient.gpsCoordinates || '25.5782,89.2844')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px] font-bold border border-amber-500/30 cursor-pointer"
                      >
                        View On Map ↗
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remote Management & Remarks */}
              <div className="p-3.5 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-purple-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Remote Management Login & Installation Remarks</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Remote User:</span>
                    <span className="font-bold text-purple-300">{inspectClient.remoteUserName || 'admin'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Remote Password:</span>
                    <span className="font-bold text-slate-200">{inspectClient.remotePassword || '••••••••'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block text-[10px]">Installation Remarks / Cable:</span>
                    <p className="text-slate-300 text-xs font-sans mt-0.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      {inspectClient.remarks || 'Standard optical fiber subscriber drop line.'}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Inspector Footer */}
            <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <div className="text-slate-400 text-[11px]">
                Address: <span className="text-slate-300 font-sans">{inspectClient.address}</span>
              </div>
              <button
                onClick={() => setInspectClient(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl cursor-pointer"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Excel Batch Import Modal */}
      <ClientExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        existingClients={clients}
        onConfirmImport={(importedList, mode) => {
          if (onBatchImportClients) {
            onBatchImportClients(importedList, mode);
          }
          setIsImportModalOpen(false);
        }}
        lang={lang}
      />

    </div>
  );
};

