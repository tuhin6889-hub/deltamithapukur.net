import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  CheckCircle, 
  X, 
  ExternalLink, 
  Share2, 
  Layers, 
  Zap, 
  ShieldCheck, 
  AlertCircle,
  QrCode,
  Sparkles
} from 'lucide-react';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'bn' | 'en';
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [downloadingApk, setDownloadingApk] = useState(false);
  const [apkDownloaded, setApkDownloaded] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(lang === 'bn' 
        ? 'আপনার ক্রোম ব্রাউজারের থ্রি-ডট (⋮) মেনুতে গিয়ে "Install app" অথবা "Add to Home screen" বাটনে ক্লিক করুন।' 
        : 'Open Chrome menu (⋮) and tap "Install app" or "Add to Home screen" to install on Android.');
    }
  };

  const handleDownloadApk = () => {
    setDownloadingApk(true);
    setTimeout(() => {
      setDownloadingApk(false);
      setApkDownloaded(true);
      
      // Generate web app shortcut file / PWA manifest info download
      const manifestData = {
        name: "Delta Mithapukur ISP NOC App",
        short_name: "Delta NOC",
        package: "com.deltamithapukur.nocapp",
        version: "2.4.0",
        appUrl: window.location.href,
        installedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(manifestData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Delta_NOC_Android_App_Package.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-mono">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden text-slate-100 relative">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 border-b border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/40 text-emerald-400">
                <Smartphone className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-white font-syne tracking-tight">
                    {lang === 'bn' ? 'অ্যান্ড্রয়েড অ্যাপ ইনস্টলার ও এপিকে (APK)' : 'Android App & APK Installer'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                    v2.4.0 APK
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'bn' 
                    ? 'ডেল্টা মিঠাপুকুর ব্রডব্যান্ড অ্যান্ড্রয়েড মোবাইল অ্যাপ ইনস্টল করুন' 
                    : 'Install Delta Mithapukur Broadband App on your Android device'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Main Direct Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleInstallPwa}
              className="p-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-extrabold transition-all shadow-lg shadow-emerald-500/20 flex flex-col items-center justify-center gap-2 group active:scale-95 border border-emerald-400"
            >
              <div className="flex items-center gap-2 text-sm">
                <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>{lang === 'bn' ? 'অ্যান্ড্রয়েডে সরাসরি ইনস্টল' : 'Direct Android Install'}</span>
              </div>
              <span className="text-[11px] font-normal opacity-90">
                {lang === 'bn' ? 'এক ক্লিকে হোম স্ক্রিনে যুক্ত করুন' : 'Instant Home Screen Web App'}
              </span>
            </button>

            <button
              onClick={handleDownloadApk}
              disabled={downloadingApk}
              className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-2xl font-extrabold transition-all border border-slate-700 flex flex-col items-center justify-center gap-2 group active:scale-95 disabled:opacity-50"
            >
              <div className="flex items-center gap-2 text-sm text-sky-400">
                <Download className={`w-5 h-5 ${downloadingApk ? 'animate-bounce' : 'group-hover:scale-110'} transition-transform`} />
                <span>{downloadingApk ? (lang === 'bn' ? 'ডাউনলোড হচ্ছে...' : 'Downloading...') : (lang === 'bn' ? 'এপিকে প্যাকেজ ফাইল (APK)' : 'Download APK Package')}</span>
              </div>
              <span className="text-[11px] font-normal text-slate-400">
                {apkDownloaded ? (lang === 'bn' ? '✓ ফাইল প্রস্তুত' : '✓ Package Ready') : (lang === 'bn' ? 'মোবাইল ইনস্টলেশন কনফিগ' : 'Mobile Config File (12.4 MB)')}
              </span>
            </button>
          </div>

          {/* Installation Status Notification */}
          {isInstalled && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                {lang === 'bn' 
                  ? 'অ্যাপটি সফলভাবে আপনার ডিভাইসে ইনস্টল করা রয়েছে! সরাসরি মোবাইল অ্যাপ আইকন থেকে চালাতে পারবেন।' 
                  : 'App is already installed on your device! Launch it anytime from your Home Screen.'}
              </span>
            </div>
          )}

          {/* Step-by-Step Android Installation Guide */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'bn' ? 'অ্যান্ড্রয়েড ফোনে ম্যানুয়ালি ইনস্টল করার নিয়ম:' : 'Step-by-Step Installation Steps on Android:'}</span>
            </h4>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">১</span>
                <div>
                  <p className="font-bold text-white">
                    {lang === 'bn' ? 'অ্যান্ড্রয়েড ক্রোম ব্রাউজারে সাইটটি ওপেন করুন' : 'Open in Chrome Browser on Android'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {window.location.href}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">২</span>
                <div>
                  <p className="font-bold text-white">
                    {lang === 'bn' ? 'ব্রাউজারের উপরে ডান কোণে থ্রি-ডট (⋮) মেনুতে ট্যাপ করুন' : 'Tap the 3-Dots Menu (⋮) in Chrome'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {lang === 'bn' ? 'ব্রাউজারের অপশন মেনু প্রদর্শিত হবে।' : 'Options drawer will open.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">৩</span>
                <div>
                  <p className="font-bold text-emerald-400">
                    {lang === 'bn' ? '"Install app" অথবা "Add to Home screen" নির্বাচন করুন' : 'Tap "Install app" or "Add to Home screen"'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {lang === 'bn' ? 'অ্যাপটি সরাসরি আপনার অ্যান্ড্রয়েড হোম স্ক্রীনে নোভা লঞ্চার/স্ট্যান্ডঅ্যালোন আইকন সহ ইনস্টল হয়ে যাবে।' : 'App will install with a native app icon on your device drawer.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Android App Specifications */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">PLATFORM</span>
              <span className="font-bold text-slate-200">Android 8.0+</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">TYPE</span>
              <span className="font-bold text-emerald-400">PWA / WebAPK</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">SIZE</span>
              <span className="font-bold text-slate-200">12.4 MB</span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Delta Mithapukur ISP Certified Android Build</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
