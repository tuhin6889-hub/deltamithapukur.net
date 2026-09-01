import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  QrCode, 
  Wifi, 
  Phone, 
  ShieldCheck, 
  Layers, 
  ExternalLink, 
  Sparkles,
  Search,
  CheckCircle2,
  Share2,
  FileText,
  User,
  MapPin,
  Cpu,
  MessageCircle,
  Play
} from 'lucide-react';
import { ClientInfo } from '../types';
import { DeltaLogo } from './DeltaLogo';

interface RouterQrStickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientInfo[];
  lang: 'bn' | 'en';
  defaultCid?: string | null;
  onSimulateScan?: (cid: string) => void;
}

export const RouterQrStickerModal: React.FC<RouterQrStickerModalProps> = ({
  isOpen,
  onClose,
  clients,
  lang,
  defaultCid,
  onSimulateScan,
}) => {
  const [selectedCid, setSelectedCid] = useState<string>(defaultCid || (clients[0]?.cid || 'CID-1001'));
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [stickerMode, setStickerMode] = useState<'SINGLE' | 'BATCH'>('SINGLE');
  const [batchAreaFilter, setBatchAreaFilter] = useState<string>('ALL');
  const [batchQrMap, setBatchQrMap] = useState<{ [cid: string]: string }>({});

  const stickerRef = useRef<HTMLDivElement>(null);

  // Sync default CID if changed
  useEffect(() => {
    if (defaultCid) {
      setSelectedCid(defaultCid);
    }
  }, [defaultCid]);

  const selectedClient = clients.find(c => c.cid === selectedCid) || clients[0];

  // Helper to generate quick ticket URL for a given CID
  const getTicketUrlForClient = (cid: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://deltabroadband.bd';
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    return `${origin}${path}?action=quick-ticket&cid=${encodeURIComponent(cid)}&source=router_qr`;
  };

  // Generate QR Code for Single Client
  useEffect(() => {
    if (!selectedClient) return;
    const url = getTicketUrlForClient(selectedClient.cid);
    
    QRCode.toDataURL(url, {
      width: 400,
      margin: 1.5,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#020617', // Deep slate/black
        light: '#ffffff',
      }
    })
      .then(dataUrl => {
        setQrDataUrl(dataUrl);
      })
      .catch(err => {
        console.error('Error generating QR code:', err);
      });
  }, [selectedClient]);

  // Generate Batch QR codes when switching to BATCH mode
  useEffect(() => {
    if (stickerMode !== 'BATCH') return;

    const filtered = clients.filter(c => batchAreaFilter === 'ALL' || c.area === batchAreaFilter);
    const map: { [cid: string]: string } = {};

    Promise.all(
      filtered.map(async (client) => {
        const url = getTicketUrlForClient(client.cid);
        try {
          const dataUrl = await QRCode.toDataURL(url, {
            width: 260,
            margin: 1,
            errorCorrectionLevel: 'M',
            color: { dark: '#020617', light: '#ffffff' }
          });
          map[client.cid] = dataUrl;
        } catch (e) {
          console.error(e);
        }
      })
    ).then(() => {
      setBatchQrMap(map);
    });
  }, [stickerMode, batchAreaFilter, clients]);

  if (!isOpen || !selectedClient) return null;

  const currentUrl = getTicketUrlForClient(selectedClient.cid);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `Delta_Router_QR_${selectedClient.cid}_${selectedClient.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter clients for dropdown/list
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.cid.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.phone.includes(searchFilter) ||
    c.area.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const areas = ['ALL', ...Array.from(new Set(clients.map(c => c.area)))];
  const batchClients = clients.filter(c => batchAreaFilter === 'ALL' || c.area === batchAreaFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans overflow-y-auto">
      
      {/* CSS For Direct Sticker Printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .printable-router-sticker, .printable-router-sticker * {
            visibility: visible !important;
          }
          .printable-router-sticker {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10px !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-syne">
                  {lang === 'bn' ? 'রাউটার সাপোর্ট কিউআর স্টিকার জেনারেটর' : 'Physical Router Support QR Sticker'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                  SCAN-TO-TICKET
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {lang === 'bn' 
                  ? 'রাউটারে লাগানোর কিউআর স্টিকার প্রিন্ট করুন। গ্রাহক ক্যামেরা দিয়ে স্ক্যান করলে স্বয়ংক্রিয়ভাবে টিকেট তৈরি হবে।' 
                  : 'Generate router QR tags. Clients scan with their smartphone camera to instantly report issues.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Single vs Batch Switcher */}
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setStickerMode('SINGLE')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  stickerMode === 'SINGLE' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'bn' ? 'সিঙ্গেল স্টিকার' : 'Single Sticker'}
              </button>
              <button
                onClick={() => setStickerMode('BATCH')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  stickerMode === 'BATCH' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'bn' ? 'ব্যাচ শিট (সব গ্রাহক)' : 'Batch Sheet'}
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {stickerMode === 'SINGLE' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Client Selector & Actions */}
              <div className="lg:col-span-5 space-y-4 no-print">
                
                {/* Search & Select Client */}
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>{lang === 'bn' ? 'গ্রাহক নির্বাচন করুন' : 'Select Subscriber'}</span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">{selectedClient.cid}</span>
                  </label>

                  {/* Search box */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder={lang === 'bn' ? 'নাম, সিআইডি বা ফোন দিয়ে খুঁজুন...' : 'Search by CID, name, phone...'}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:border-emerald-500 outline-none"
                    />
                  </div>

                  {/* Dropdown list */}
                  <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-slate-800/40 pr-1 no-scrollbar">
                    {filteredClients.map(c => (
                      <button
                        key={c.cid}
                        onClick={() => setSelectedCid(c.cid)}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                          selectedCid === c.cid 
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' 
                            : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold truncate">{c.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{c.area} • {c.phone}</p>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono font-bold">
                          {c.cid}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {lang === 'bn' ? 'স্টিকার অ্যাকশন' : 'Sticker Actions'}
                  </h4>

                  {/* Print Sticker Button */}
                  <button
                    onClick={handlePrint}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'স্টিকার প্রিন্ট করুন (Print 3x2")' : 'Print Router Sticker (3x2")'}</span>
                  </button>

                  {/* Download QR Image */}
                  <button
                    onClick={handleDownloadQr}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === 'bn' ? 'কিউআর ইমেজ ডাউনলোড (PNG)' : 'Download QR Image (PNG)'}</span>
                  </button>

                  {/* Simulate / Test Scan Live */}
                  <button
                    onClick={() => {
                      if (onSimulateScan) {
                        onSimulateScan(selectedClient.cid);
                      } else {
                        window.open(currentUrl, '_blank');
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-300 font-semibold rounded-xl text-xs border border-indigo-700/50 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{lang === 'bn' ? 'স্ক্যান টেস্ট করুন (Open Quick Ticket)' : 'Simulate Camera Scan Now'}</span>
                  </button>

                  {/* Copy Direct Link */}
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-medium rounded-xl text-xs border border-slate-700/60 transition-all cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? (lang === 'bn' ? 'লিংক কপি হয়েছে!' : 'Link Copied!') : (lang === 'bn' ? 'ডাইরেক্ট সাপোর্ট লিংক কপি' : 'Copy Direct Ticket Link')}</span>
                  </button>
                </div>

                {/* How It Works Explainer */}
                <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300/90 leading-relaxed space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    {lang === 'bn' ? 'কিভাবে কাজ করে?' : 'How It Works'}
                  </p>
                  <p>
                    {lang === 'bn'
                      ? '১. এই স্টিকারটি প্রিন্ট করে গ্রাহকের রাউটার বা ওএনইউ (ONU) ডিভাইসের গায়ে লাগিয়ে দিন।'
                      : '1. Print and stick this label directly on the client router or ONU box.'}
                  </p>
                  <p>
                    {lang === 'bn'
                      ? '২. লাইনে সমস্যা হলে গ্রাহক মোবাইলের ক্যামেরা বা স্ক্যানার দিয়ে স্ক্যান করলেই ১-ক্লিকে সাপোর্ট টিকেট ওপেন হবে।'
                      : '2. When line is down, client scans QR with their phone to instantly auto-create a support ticket with CID.'}
                  </p>
                </div>

              </div>

              {/* Right Column: High-Res Physical Router Sticker Preview */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center">
                
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 self-start flex items-center gap-2 no-print">
                  <span>{lang === 'bn' ? 'স্টিকার লাইভ প্রিভিউ (3x2.5 ইঞ্চি সাইজ)' : 'Physical Sticker Preview (3x2.5" Label)'}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">READY TO STICK</span>
                </div>

                {/* The Physical Sticker Box (Printable) */}
                <div 
                  ref={stickerRef}
                  className="printable-router-sticker w-full max-w-md bg-white text-slate-900 rounded-2xl p-5 shadow-2xl border-2 border-slate-900 relative overflow-hidden font-sans select-text"
                  style={{
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  {/* Top Branding Strip */}
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-slate-950 text-white rounded-lg flex items-center justify-center font-black text-sm tracking-tighter">
                        Δ
                      </div>
                      <div>
                        <h3 className="text-sm font-black tracking-tight text-slate-950 uppercase leading-none font-syne">
                          DELTA BROADBAND
                        </h3>
                        <p className="text-[9px] font-mono font-bold text-emerald-700 tracking-wider">
                          MITHAPUKUR 24/7 FIBER NOC
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 bg-slate-900 text-white text-[9px] font-black rounded tracking-widest uppercase">
                        ROUTER TAG
                      </span>
                    </div>
                  </div>

                  {/* Main Grid: QR Code + Subscriber Specs */}
                  <div className="grid grid-cols-12 gap-3 items-center">
                    
                    {/* Left: High-Contrast QR Code */}
                    <div className="col-span-5 flex flex-col items-center justify-center">
                      <div className="p-1.5 bg-white border-2 border-slate-900 rounded-xl shadow-inner relative group">
                        {qrDataUrl ? (
                          <img 
                            src={qrDataUrl} 
                            alt={`QR for ${selectedClient.cid}`} 
                            className="w-32 h-32 object-contain"
                          />
                        ) : (
                          <div className="w-32 h-32 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                            Loading...
                          </div>
                        )}
                        {/* Center Delta Mini Stamp */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-6 h-6 bg-slate-950 text-emerald-400 rounded-md flex items-center justify-center text-[10px] font-black border border-white shadow">
                            Δ
                          </div>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono font-black text-slate-700 tracking-tighter uppercase mt-1">
                        SCAN WITH CAMERA
                      </span>
                    </div>

                    {/* Right: Client Details & Helpline */}
                    <div className="col-span-7 space-y-1.5 text-xs">
                      
                      <div className="bg-slate-100 p-1.5 rounded-lg border border-slate-300">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">
                          CUSTOMER ID (CID)
                        </span>
                        <p className="text-sm font-black text-slate-950 font-mono tracking-tight">
                          {selectedClient.cid}
                        </p>
                      </div>

                      <div>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">
                          SUBSCRIBER NAME
                        </span>
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {selectedClient.name}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <div>
                          <span className="text-[7px] font-bold text-slate-500 uppercase block">PACKAGE</span>
                          <span className="font-bold text-slate-800">{selectedClient.package}</span>
                        </div>
                        <div>
                          <span className="text-[7px] font-bold text-slate-500 uppercase block">AREA</span>
                          <span className="font-bold text-slate-800 truncate block">{selectedClient.area}</span>
                        </div>
                      </div>

                      <div className="text-[9px] font-mono text-slate-600 bg-slate-50 p-1 rounded border border-slate-200">
                        <span>IP: {selectedClient.ipAddress}</span>
                        <span className="mx-1">•</span>
                        <span>ONU: {selectedClient.onuMac}</span>
                      </div>

                    </div>

                  </div>

                  {/* Bottom Scan Instructions & 24/7 Helpline */}
                  <div className="mt-3 pt-2 border-t-2 border-slate-900 flex items-center justify-between text-slate-950">
                    <div className="text-[8.5px] leading-tight font-medium text-slate-800 pr-2">
                      <p className="font-bold text-slate-950">
                        ⚠️ সমস্যা হলে ফোনে স্ক্যান করুন — সাথে সাথে টিকেট ওপেন হবে।
                      </p>
                      <p className="text-[7.5px] text-slate-600">
                        Fast 1-tap support ticket dispatch & live NOC status.
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0 bg-slate-950 text-white px-2 py-1 rounded-lg">
                      <span className="text-[7px] font-mono text-emerald-400 block font-bold uppercase">
                        24/7 HELPLINE / WA
                      </span>
                      <span className="text-xs font-black font-mono tracking-tight">
                        01719394430
                      </span>
                    </div>
                  </div>

                </div>

                <p className="text-[11px] text-slate-500 mt-3 text-center no-print">
                  {lang === 'bn' 
                    ? 'প্রিন্ট করার জন্য আপনার ব্রাউজারের প্রিন্ট ডায়ালগে "Background Graphics" অন রাখুন।' 
                    : 'Tip: Keep "Background Graphics" checked in your browser print settings for best sticker quality.'}
                </p>

              </div>

            </div>
          ) : (
            /* Batch Sheet Mode */
            <div className="space-y-4">
              
              {/* Batch Controls Bar */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 no-print">
                <div className="flex items-center gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">
                      {lang === 'bn' ? 'এরিয়া অনুযায়ী ফিল্টার' : 'Filter by POP Area'}
                    </label>
                    <select
                      value={batchAreaFilter}
                      onChange={(e) => setBatchAreaFilter(e.target.value)}
                      className="mt-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:border-emerald-500"
                    >
                      {areas.map(area => (
                        <option key={area} value={area}>
                          {area === 'ALL' ? (lang === 'bn' ? 'সকল এরিয়া (All Areas)' : 'All Areas') : area}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 text-xs text-slate-400">
                    <span>{lang === 'bn' ? 'মোট স্টিকার:' : 'Total Stickers:'} </span>
                    <strong className="text-emerald-400 font-mono text-sm">{batchClients.length}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'সম্পূর্ণ শিট প্রিন্ট করুন' : 'Print Entire Sheet'}</span>
                  </button>
                </div>
              </div>

              {/* Printable Grid of Stickers */}
              <div className="printable-router-sticker grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {batchClients.map(client => {
                  const qr = batchQrMap[client.cid];
                  return (
                    <div 
                      key={client.cid}
                      className="bg-white text-slate-900 rounded-xl p-3.5 border-2 border-slate-900 shadow-md font-sans text-xs flex flex-col justify-between"
                      style={{ minHeight: '220px' }}
                    >
                      {/* Top Header */}
                      <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 bg-slate-950 text-white rounded font-black text-xs flex items-center justify-center">
                            Δ
                          </span>
                          <span className="font-black text-xs uppercase tracking-tight font-syne">
                            DELTA NOC
                          </span>
                        </div>
                        <span className="font-mono font-black text-[11px] bg-slate-950 text-white px-1.5 py-0.5 rounded">
                          {client.cid}
                        </span>
                      </div>

                      {/* Middle Body */}
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5 flex flex-col items-center">
                          {qr ? (
                            <img src={qr} alt={client.cid} className="w-24 h-24 object-contain border border-slate-800 rounded p-0.5" />
                          ) : (
                            <div className="w-24 h-24 bg-slate-100 animate-pulse rounded" />
                          )}
                          <span className="text-[7px] font-bold text-slate-700 mt-0.5">SCAN FOR SUPPORT</span>
                        </div>

                        <div className="col-span-7 space-y-1 text-[10px]">
                          <p className="font-bold text-slate-950 truncate">{client.name}</p>
                          <p className="text-slate-600 text-[9px]">{client.package}</p>
                          <p className="text-slate-600 text-[9px] truncate">{client.area}</p>
                          <p className="font-mono text-[8px] text-slate-500 bg-slate-100 p-0.5 rounded">
                            {client.ipAddress}
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-2 pt-1 border-t border-slate-800 flex items-center justify-between text-[8px] font-bold">
                        <span>Helpline: 01719394430</span>
                        <span className="text-emerald-700">24/7 FIBER TICKET</span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Delta Mithapukur Smart NOC Infrastructure • Router QR Automation</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold transition-all cursor-pointer"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
