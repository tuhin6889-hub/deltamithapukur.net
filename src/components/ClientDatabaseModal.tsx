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
  Home
} from 'lucide-react';
import { ClientInfo } from '../types';

interface ClientDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientInfo[];
  lang: 'bn' | 'en';
  onOpenAddNewClient?: () => void;
}

export const ClientDatabaseModal: React.FC<ClientDatabaseModalProps> = ({
  isOpen,
  onClose,
  clients,
  lang,
  onOpenAddNewClient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  if (!isOpen) return null;

  // Filter Clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.cid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      client.ipAddress.includes(searchQuery) ||
      client.onuMac.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesArea = selectedArea === 'ALL' || client.area === selectedArea;
    const matchesStatus = selectedStatus === 'ALL' || client.status === selectedStatus;

    return matchesSearch && matchesArea && matchesStatus;
  });

  const totalClients = clients.length;
  const activeCount = clients.filter(c => c.status === 'Active').length;
  const suspendedCount = clients.filter(c => c.status === 'Suspended').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400">
              <Database className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight font-syne uppercase">
                  {lang === 'bn' ? 'গ্রাহক ডাটাবেজ সেন্টার' : 'ISP Client Database Center'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-mono text-[10px] border border-sky-500/30 font-bold">
                  DELTA MITHAPUKUR POP
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {lang === 'bn' 
                  ? 'মিঠাপুকুর জোনের সকল সক্রিয় ইন্টারনেট গ্রাহক, আইপি এ্যাসাইনমেন্ট ও অপটিক্যাল লেভেল' 
                  : 'Centralized subscriber database, ONU signal status, IP allocations & billing records'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAddNewClient && (
              <button
                onClick={onOpenAddNewClient}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <UserPlus className="w-4 h-4 text-slate-950" />
                <span className="hidden sm:inline">{lang === 'bn' ? 'নতুন ক্লায়েন্ট যোগ করুন' : 'Add New Client'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 active:scale-95"
              title="Return to Home Page"
            >
              <Home className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'হোম পেজ' : 'Home Page'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-900/60 border-b border-slate-800 p-3 gap-3 text-xs font-mono">
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
            <span className="text-lg font-extrabold text-sky-300">5 POP Zones</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-slate-900/40 border-b border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'নাম, CID, মোবাইল বা আইপি দিয়ে খুঁজুন...' : 'Search by Name, CID, Phone, IP or ONU MAC...'}
              className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 focus:border-sky-500 rounded-xl text-xs text-white font-mono outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-3 py-2 bg-slate-800/90 border border-slate-700 text-slate-200 text-xs rounded-xl font-mono outline-none"
            >
              <option value="ALL">All POP Areas</option>
              <option value="Mithapukur Sadar">Mithapukur Sadar</option>
              <option value="Ranipukur">Ranipukur</option>
              <option value="Pajipara">Pajipara</option>
              <option value="Gopalpur">Gopalpur</option>
              <option value="Balarhat">Balarhat</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-800/90 border border-slate-700 text-slate-200 text-xs rounded-xl font-mono outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Client Records Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                  <th className="p-3">Client / CID</th>
                  <th className="p-3">Contact & Area</th>
                  <th className="p-3">Package / Speed</th>
                  <th className="p-3">IP & ONU Optical Power</th>
                  <th className="p-3">Balance Status</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No client matching query "{searchQuery}"
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.cid} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-white text-sm">{client.name}</div>
                        <div className="text-sky-400 text-[11px] font-bold">{client.cid}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-slate-200">
                          <PhoneCall className="w-3 h-3 text-slate-400" />
                          <span>{client.phone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-[11px] mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{client.area}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 font-bold">
                          {client.package}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-300 font-bold">{client.ipAddress}</div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>ONU: {client.onuMac}</span>
                          <span className="text-emerald-400 font-bold">({client.opticalPower})</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`font-bold ${client.balance <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {client.balance <= 0 ? 'Paid (৳ 0)' : `Due: ৳ ${client.balance}`}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          client.status === 'Active'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {client.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{client.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div>
            Showing <strong className="text-white">{filteredClients.length}</strong> of <strong className="text-white">{totalClients}</strong> ISP Client Records
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg border border-slate-700 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
