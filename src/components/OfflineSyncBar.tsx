import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Download, 
  Trash2, 
  ShieldCheck, 
  X, 
  Radio, 
  HardDrive,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { 
  getCacheMetadata, 
  loadOfflineQueue, 
  clearOfflineQueue, 
  saveCachedTickets, 
  saveCachedClients, 
  saveCachedServers,
  OfflineAction 
} from '../utils/offlineStorage';
import { Ticket, ClientInfo, NetworkServer } from '../types';

interface OfflineSyncBarProps {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  tickets: Ticket[];
  clients: ClientInfo[];
  servers: NetworkServer[];
  lang: 'bn' | 'en';
  onToggleSimulateOffline: () => void;
  onManualSync: () => void;
  queuedActionsCount: number;
}

export const OfflineSyncBar: React.FC<OfflineSyncBarProps> = ({
  isOnline,
  isSimulatedOffline,
  tickets,
  clients,
  servers,
  lang,
  onToggleSimulateOffline,
  onManualSync,
  queuedActionsCount,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>([]);
  const [cacheStats, setCacheStats] = useState(getCacheMetadata());

  const effectiveOnline = isOnline && !isSimulatedOffline;

  useEffect(() => {
    setOfflineQueue(loadOfflineQueue());
    setCacheStats(getCacheMetadata());
  }, [tickets, queuedActionsCount, isModalOpen]);

  const handleSyncTrigger = () => {
    setIsSyncing(true);
    setTimeout(() => {
      saveCachedTickets(tickets);
      saveCachedClients(clients);
      saveCachedServers(servers);
      clearOfflineQueue();
      setOfflineQueue([]);
      setCacheStats(getCacheMetadata());
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setIsSyncing(false);
      onManualSync();
    }, 800);
  };

  const handleExportOfflineJson = () => {
    const exportData = {
      meta: {
        exportedAt: new Date().toISOString(),
        system: 'Delta Mithapukur ISP Offline Cache',
        version: '2.4.0-offline',
      },
      tickets,
      clients,
      servers,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delta-isp-offline-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Persisted Offline Header Pill / Status Badge */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer ${
            !effectiveOnline
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30 animate-pulse'
              : queuedActionsCount > 0
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
              : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
          }`}
          title={lang === 'bn' ? 'অফলাইন ক্যাশ ও সিঙ্ক কন্ট্রোল প্যানেল' : 'Offline Cache & Sync Control Panel'}
        >
          {effectiveOnline ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline text-[11px] text-emerald-300">
                {lang === 'bn' ? 'অনলাইন (ক্যাশ সিঙ্কড)' : 'Online (Synced)'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[11px] text-rose-200 font-extrabold">
                {isSimulatedOffline 
                  ? (lang === 'bn' ? 'অফলাইন টেস্ট মোড' : 'Offline Test Mode') 
                  : (lang === 'bn' ? 'অফলাইন মোড সক্রিয়' : 'Offline Mode Active')}
              </span>
            </div>
          )}

          {/* Cached Count Counter */}
          <span className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] text-slate-300 border border-slate-700">
            {tickets.length} {lang === 'bn' ? 'টিকেট ক্যাশ' : 'Cached'}
          </span>

          {queuedActionsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px]">
              {queuedActionsCount} Pending
            </span>
          )}
        </button>
      </div>

      {/* OFFLINE SYNC MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl max-w-xl w-full p-5 sm:p-6 overflow-hidden relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    effectiveOnline 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  }`}>
                    {effectiveOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">
                        {lang === 'bn' ? 'অফলাইন ডেটা ও লোকাল ক্যাশ ম্যানেজার' : 'Offline Cache & Sync Engine'}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        effectiveOnline 
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' 
                          : 'bg-rose-950 text-rose-300 border-rose-500/40'
                      }`}>
                        {effectiveOnline ? 'CONNECTED' : 'OFFLINE MODE'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {lang === 'bn' 
                        ? 'নেটওয়ার্ক ড্রপ বা সংযোগ বিচ্ছিন্ন থাকলেও টেকনিশিয়ানরা সাম্প্রতিক সকল টিকেট দেখতে ও আপডেট করতে পারবেন।' 
                        : 'Staff can view and work with recent tickets seamlessly even when fiber/mobile internet drops.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cache Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">Cached Tickets</span>
                  <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                    {tickets.length}
                  </span>
                  <span className="text-[10px] text-slate-500">Auto-saved locally</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">Subscribers</span>
                  <span className="text-xl font-bold font-mono text-teal-400 mt-1 block">
                    {clients.length}
                  </span>
                  <span className="text-[10px] text-slate-500">Client Directory</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">OLT & Servers</span>
                  <span className="text-xl font-bold font-mono text-indigo-400 mt-1 block">
                    {servers.length}
                  </span>
                  <span className="text-[10px] text-slate-500">Hardware Nodes</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">Local Storage</span>
                  <span className="text-xl font-bold font-mono text-sky-400 mt-1 block">
                    {cacheStats.approxSizeKb} KB
                  </span>
                  <span className="text-[10px] text-slate-500">Instant Access</span>
                </div>
              </div>

              {/* Field Drill / Offline Simulation Toggle */}
              <div className="mt-4 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${
                    isSimulatedOffline 
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">
                      {lang === 'bn' ? 'ফিল্ড ড্রিল: অফলাইন মোড সিমুলেশন' : 'Field Drill: Simulate Offline State'}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {lang === 'bn' 
                        ? 'ইন্টারনেট বিচ্ছিন্ন করার প্রয়োজন ছাড়াই অফলাইন ক্যাশ টেস্ট করুন।' 
                        : 'Test offline behavior and local cache fallback without turning off your Wi-Fi.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onToggleSimulateOffline}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all border ${
                    isSimulatedOffline
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  {isSimulatedOffline ? 'Simulating Offline 🔴' : 'Simulate Offline ⚪'}
                </button>
              </div>

              {/* Queued Actions List */}
              {offlineQueue.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'bn' ? 'অফলাইনে করা পরিবর্তনসমূহ (Sync Queue)' : 'Pending Offline Changes'}</span>
                    </span>
                    <span className="font-mono text-[11px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300 border border-amber-500/30">
                      {offlineQueue.length} Actions
                    </span>
                  </div>

                  <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                    {offlineQueue.map((act) => (
                      <div 
                        key={act.id} 
                        className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-xs font-mono flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span className="text-slate-200">{act.description}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportOfflineJson}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 font-bold flex items-center gap-1.5 transition-all"
                    title="Export offline JSON dump"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>{lang === 'bn' ? 'ক্যাশ ব্যাকআপ' : 'Export JSON'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSyncTrigger}
                    disabled={isSyncing}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 stroke-[3] ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : (lang === 'bn' ? '✓ ক্যাশ রিফ্রেশ ও সিঙ্ক' : '✓ Sync Cache Now')}</span>
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
