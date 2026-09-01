import React, { useState } from 'react';
import { 
  Wifi, 
  BatteryMedium, 
  Signal, 
  Download, 
  Smartphone, 
  Home, 
  Ticket as TicketIcon, 
  User, 
  Bell, 
  CheckCircle2, 
  ArrowLeft,
  Monitor
} from 'lucide-react';

interface AndroidAppFrameProps {
  children: React.ReactNode;
  activeRole: 'MANAGER' | 'NOC' | 'CLIENT';
  onSwitchRole: (role: 'MANAGER' | 'NOC' | 'CLIENT') => void;
  lang: 'bn' | 'en';
  onSwitchToDesktop?: () => void;
}

export const AndroidAppFrame: React.FC<AndroidAppFrameProps> = ({
  children,
  activeRole,
  onSwitchRole,
  lang,
  onSwitchToDesktop,
}) => {
  const [showApkModal, setShowApkModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  const handleDownloadApk = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloadComplete(true);
    }, 2000);
  };

  return (
    <div className="py-2 sm:py-6 px-0 sm:px-2 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-950 w-full">
      
      {/* Top Android App Mode Notice & Controls */}
      <div className="mb-3 px-3 w-full max-w-[430px] flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold">
          <Smartphone className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'স্মার্টফোন মোবাইল স্ক্রিন' : 'Smartphone View'}</span>
        </div>

        <div className="flex items-center gap-2">
          {onSwitchToDesktop && (
            <button
              onClick={onSwitchToDesktop}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-full text-xs transition-all border border-slate-700 flex items-center gap-1 shadow-sm cursor-pointer"
              title={lang === 'bn' ? 'ডেস্কটপ ফুল স্ক্রিন মোডে যান' : 'Switch to Desktop Full Screen'}
            >
              <Monitor className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'bn' ? 'ডেস্কটপ' : 'Desktop'}</span>
            </button>
          )}

          <button
            onClick={() => setShowApkModal(true)}
            className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold rounded-full text-xs shadow-md hover:brightness-110 transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'APK' : 'APK'}</span>
          </button>
        </div>
      </div>

      {/* Realistic Mobile Phone Mockup Outer Frame (Full-width on mobile screen, Mockup on desktop screen) */}
      <div className="w-full sm:max-w-[420px] h-[calc(100dvh-6rem)] sm:h-[840px] bg-slate-900 rounded-none sm:rounded-[48px] p-0 sm:p-3 shadow-2xl border-0 sm:border-4 border-slate-700 relative flex flex-col overflow-hidden shadow-emerald-950/20">
        
        {/* Phone Camera Hole/Notch (Desktop preview only) */}
        <div className="hidden sm:flex absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-full z-50 items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700" />
        </div>

        {/* Top Android Status Bar */}
        <div className="bg-slate-950 text-slate-200 px-4 sm:px-6 pt-2 pb-1.5 flex items-center justify-between text-[11px] font-mono z-40 select-none border-b border-slate-800/60">
          <span>05:42 PM</span>
          <div className="flex items-center gap-2 text-slate-400">
            <Signal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400">5G</span>
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <BatteryMedium className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Android App Internal Viewport */}
        <div className="flex-1 bg-slate-100 overflow-y-auto relative scrollbar-thin">
          {children}
        </div>

        {/* Bottom Android Navigation Bar */}
        <div className="bg-slate-900 text-slate-300 py-2.5 px-4 border-t border-slate-800 flex items-center justify-around z-40">
          <button
            onClick={() => onSwitchRole('MANAGER')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-all cursor-pointer ${
              activeRole === 'MANAGER' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ম্যানেজার' : 'Manager'}</span>
          </button>

          <button
            onClick={() => onSwitchRole('NOC')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-all cursor-pointer ${
              activeRole === 'NOC' ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TicketIcon className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নোক পপ' : 'NOC'}</span>
          </button>

          <button
            onClick={() => onSwitchRole('CLIENT')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-all cursor-pointer ${
              activeRole === 'CLIENT' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{lang === 'bn' ? 'গ্রাহক CID' : 'Client'}</span>
          </button>
        </div>

        {/* Android Home Bar gesture line */}
        <div className="bg-slate-900 pb-1.5 flex justify-center">
          <div className="w-28 h-1 bg-slate-600 rounded-full" />
        </div>

      </div>

      {/* APK Download Simulation Modal */}
      {showApkModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-slate-800 text-center space-y-4">
            
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto flex items-center justify-center">
              <Smartphone className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                {lang === 'bn' ? 'ব্রাঞ্চ ম্যানেজার অ্যান্ড্রয়েড অ্যাপস (APK)' : 'Manager App Android APK (v2.4.0)'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                DeltaManager_v2.4.0.apk • Build 2026.08 • 18.5 MB
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 text-left space-y-1.5 border border-slate-200 font-medium">
              <p className="font-bold text-slate-800 border-b border-slate-200 pb-1">
                📱 {lang === 'bn' ? 'ম্যানেজার অ্যাপের সুবিধাসমূহ:' : 'Manager App Key Features:'}
              </p>
              <p>✓ {lang === 'bn' ? 'নতুন ক্লায়েন্ট যোগ ও POP এলাকা ফিল্টারিং' : 'Add New Client CID & POP Area Control'}</p>
              <p>✓ {lang === 'bn' ? 'হোয়াটসঅ্যাপ বিটিআরসি ওয়ার্ক অর্ডার ও অটো রিসিট' : 'WhatsApp BTRC Work Order Generator'}</p>
              <p>✓ {lang === 'bn' ? 'লাইভ ২-ঘণ্টা জরুরি SLA রেড এলওএস অ্যালার্ট' : 'Live 2-Hour SLA Urgent LOS Countdowns'}</p>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-left text-[11px] text-emerald-900 space-y-1">
              <p className="font-bold text-emerald-950 flex items-center gap-1">
                <span>💡 {lang === 'bn' ? 'অ্যান্ড্রয়েড ফোনে হোমস্ক্রিনে ইনস্টল নিয়ম:' : 'Direct Android Install (PWA):'}</span>
              </p>
              <p>{lang === 'bn' ? '১. ফোনে গুগল ক্রোম ব্রাউজারে অ্যাপের লিংকটি খুলুন।' : '1. Open this app URL in Google Chrome on Android.'}</p>
              <p>{lang === 'bn' ? '২. ক্রোম মেনু (⋮) ক্লিক করে "Add to Home screen" বা "Install App" নির্বাচন করুন।' : '2. Tap Chrome Menu (⋮) -> Select "Add to Home screen" or "Install App".'}</p>
            </div>

            {downloadComplete ? (
              <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>DeltaManager_v2.4.apk Saved!</span>
              </div>
            ) : (
              <button
                onClick={handleDownloadApk}
                disabled={downloading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Preparing Manager APK Package...' : 'Download Manager APK (v2.4)'}</span>
              </button>
            )}

            <button
              onClick={() => {
                setShowApkModal(false);
                setDownloadComplete(false);
              }}
              className="text-xs text-slate-500 font-semibold hover:text-slate-800 block w-full pt-2"
            >
              {lang === 'bn' ? 'বন্ধ করুন' : 'Close Modal'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
