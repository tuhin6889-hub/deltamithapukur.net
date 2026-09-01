import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Camera, 
  QrCode, 
  Upload, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles,
  User,
  Search
} from 'lucide-react';
import { ClientInfo } from '../types';

interface RouterQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientInfo[];
  onScanSuccess: (cid: string) => void;
  lang: 'bn' | 'en';
}

export const RouterQrScannerModal: React.FC<RouterQrScannerModalProps> = ({
  isOpen,
  onClose,
  clients,
  onScanSuccess,
  lang,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCid, setManualCid] = useState('');
  const [scanFilter, setScanFilter] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
      } else {
        setCameraError(
          lang === 'bn' 
            ? 'এই ব্রাউজারে সরাসরি ক্যামেরা সাপোর্ট নেই। নিচে সিমুলেশন বা ম্যানুয়ালি CID নির্বাচন করুন।' 
            : 'Camera API not available in this environment. Use the quick selector below.'
        );
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        lang === 'bn'
          ? 'ক্যামেরা পারমিশন পাওয়া যায়নি বা ক্যামেরা ইন-ইউজ আছে। নিচে থাকা গ্রাহক তালিকা থেকে সরাসরি টেস্ট করুন।'
          : 'Camera permission denied or not available. Please select a subscriber below to simulate scanning.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  if (!isOpen) return null;

  const handleSelectClient = (cid: string) => {
    stopCamera();
    onScanSuccess(cid);
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualCid.trim().toUpperCase();
    const found = clients.find(c => c.cid.toUpperCase() === clean);
    if (found) {
      handleSelectClient(found.cid);
    } else {
      // If starts with number like 1001, try prepending CID-
      const matchNumber = clients.find(c => c.cid.toUpperCase().includes(clean));
      if (matchNumber) {
        handleSelectClient(matchNumber.cid);
      } else {
        alert(lang === 'bn' ? 'সঠিক CID নম্বর লিখুন (যেমন: CID-1001)' : 'Invalid CID. Try CID-1001');
      }
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(scanFilter.toLowerCase()) ||
    c.cid.toLowerCase().includes(scanFilter.toLowerCase()) ||
    c.phone.includes(scanFilter) ||
    c.area.toLowerCase().includes(scanFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans overflow-y-auto">
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight font-syne">
                {lang === 'bn' ? 'রাউটার কিউআর কোড স্ক্যানার' : 'Router QR Code Scanner'}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {lang === 'bn' ? 'রাউটারের স্টিকারে ক্যামেরা তাক করুন' : 'Point camera at the router sticker'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Camera Box */}
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-inner flex items-center justify-center">
            {cameraActive ? (
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover" 
                playsInline 
                muted 
              />
            ) : (
              <div className="p-6 text-center text-slate-400 space-y-2">
                <QrCode className="w-12 h-12 mx-auto text-emerald-400/60 animate-pulse" />
                <p className="text-xs font-semibold text-slate-300">
                  {cameraError || (lang === 'bn' ? 'ক্যামেরা স্ক্যানার প্রস্তুত হচ্ছে...' : 'Initializing camera scanner...')}
                </p>
              </div>
            )}

            {/* Futuristic Viewfinder Target Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
              <div className="w-48 h-48 border-2 border-emerald-400/80 rounded-2xl relative">
                {/* Corner Accents */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                
                {/* Laser Scanning Bar */}
                <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_12px_#10b981] animate-bounce mt-20" />
              </div>
            </div>

            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-emerald-400 bg-slate-950/80 px-3 py-1 rounded-lg border border-emerald-500/30">
              <span>SCANNER: ACTIVE</span>
              <span>AUTO-FOCUS: ON</span>
            </div>
          </div>

          {/* Manual CID Input */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualCid}
              onChange={(e) => setManualCid(e.target.value)}
              placeholder={lang === 'bn' ? 'অথবা CID লিখুন (যেমন: CID-1001)...' : 'Or type CID (e.g. CID-1001)...'}
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white uppercase font-mono placeholder-slate-500 focus:border-emerald-500 outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              {lang === 'bn' ? 'ওপেন করুন' : 'Open'}
            </button>
          </form>

          {/* Quick Simulation Subscriber Selector */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'bn' ? '১-ক্লিকে গ্রাহক স্টিকার টেস্ট করুন' : '1-Click Scan Simulator'}</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">{filteredClients.length} subscribers</span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={scanFilter}
                onChange={(e) => setScanFilter(e.target.value)}
                placeholder={lang === 'bn' ? 'গ্রাহক খুঁজুন...' : 'Filter subscribers...'}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            {/* List */}
            <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-slate-800/40 pr-1 no-scrollbar">
              {filteredClients.slice(0, 8).map(c => (
                <button
                  key={c.cid}
                  type="button"
                  onClick={() => handleSelectClient(c.cid)}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-800/90 text-xs transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                      {c.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">{c.area} • {c.package}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-[10px] font-bold group-hover:border-emerald-500">
                    Scan {c.cid}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Delta Mithapukur QR Support Dispatch Engine</span>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
          >
            {lang === 'bn' ? 'বাতিল' : 'Cancel'}
          </button>
        </div>

      </div>
    </div>
  );
};
