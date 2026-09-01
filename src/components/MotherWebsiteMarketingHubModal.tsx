import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClientInfo, MotherSiteLead, MarketingCampaign, MotherSiteSyncConfig, Ticket } from '../types';
import {
  Globe,
  Database,
  Megaphone,
  Users,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
  Tag,
  Share2,
  Code2,
  Copy,
  Check,
  Search,
  Plus,
  ArrowUpRight,
  Phone,
  Mail,
  MapPin,
  Wifi,
  ShieldCheck,
  Activity,
  Send,
  MessageSquare,
  Sliders,
  Download,
  Upload,
  UserCheck,
  Layers
} from 'lucide-react';

interface MotherWebsiteMarketingHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientInfo[];
  lang: 'bn' | 'en';
  onConvertLeadToClient?: (lead: MotherSiteLead) => void;
  onOpenAddNewClient?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const MotherWebsiteMarketingHubModal: React.FC<MotherWebsiteMarketingHubModalProps> = ({
  isOpen,
  onClose,
  clients,
  lang,
  onConvertLeadToClient,
  onOpenAddNewClient,
  onShowToast,
}) => {
  // Active Navigation Tab: 'CLIENT_DB' | 'MARKETING' | 'LEADS' | 'API_EMBED' | 'SETTINGS'
  const [activeTab, setActiveTab] = useState<'CLIENT_DB' | 'MARKETING' | 'LEADS' | 'API_EMBED' | 'SETTINGS'>('CLIENT_DB');

  // Mother Site Config state (persisted in localStorage)
  const [syncConfig, setSyncConfig] = useState<MotherSiteSyncConfig>(() => {
    try {
      const saved = localStorage.getItem('delta_mother_site_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      motherSiteUrl: 'https://delta-mithapukur.vercel.app/',
      apiSecretKey: 'dm_live_sec_89f92a10b47e291c981b490',
      webhookEndpoint: 'https://delta-mithapukur.vercel.app/api/webhooks/delta-support-sync',
      autoSyncEnabled: true,
      syncIntervalMinutes: 5,
      lastSyncTimestamp: new Date().toISOString(),
      syncStatus: 'SUCCESS',
      syncedSubscribersCount: clients.length,
      syncedCampaignsCount: 4,
      pendingLeadsCount: 3,
    };
  });

  // Marketing Campaigns state
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(() => {
    try {
      const saved = localStorage.getItem('delta_mother_site_campaigns');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'CMP-2026-01',
        campaignTitle: 'Mithapukur Super Fiber 30 Mbps Mega Fest',
        campaignTitleBn: 'মিঠাপুকুর সুপার ফাইবার ৩০ এমবিপিএস মেগা অফার',
        packageName: 'Fiber Starter 30 Mbps',
        speedMbps: 30,
        bdixMbps: 100,
        monthlyFee: 800,
        promoDiscountPercent: 20,
        bannerBadgeText: '💥 POPULAR IN MITHAPUKUR',
        featuresList: ['100 Mbps BDIX & FTP Hub', 'Bufferless 4K YouTube & Facebook', 'Free Optical ONU with 6M advance', '24/7 Red LOS Emergency Support'],
        featuresListBn: ['১০০ এমবিপিএস BDIX ও আল্ট্রা বাফারলেস এফটিপি', 'ইউটিউব ও ফেসবুকে ৪কে ভিডিও স্ট্রিমিং', '৬ মাসের অগ্রিম পেমেন্টে ফ্রি অপটিক্যাল ONU', '২৪/৭ স্পেশাল ফিল্ড স্প্লাইসিং সাপোর্ট'],
        ctaUrl: 'https://delta-mithapukur.vercel.app/#packages',
        isActiveOnMotherSite: true,
        impressions: 4820,
        clicks: 642,
        leadsGenerated: 38,
        lastSynced: new Date().toISOString(),
      },
      {
        id: 'CMP-2026-02',
        campaignTitle: 'Business & Cyber Cafe Extreme 60 Mbps',
        campaignTitleBn: 'ব্যবসা প্রতিষ্ঠান ও সাইবার ক্যাফে এক্সট্রিম ৬০ এমবিপিএস',
        packageName: 'Commercial Ultra 60 Mbps',
        speedMbps: 60,
        bdixMbps: 200,
        monthlyFee: 1500,
        promoDiscountPercent: 15,
        bannerBadgeText: '🚀 CORPORATE / HIGH SPEED',
        featuresList: ['Dedicated Real Public IP Included', 'Dual Gateway Failover Protection', '99.9% Uptime Priority SLA', 'Free Dual Band Gigabit Wi-Fi 6 Router'],
        featuresListBn: ['ফ্রি রিয়েল পাবলিক আইপি অ্যাড্রেস', 'ডুয়াল গেটওয়ে ব্যাকআপ প্রটেকশন', '৯৯.৯% আপটাইম প্রায়োরিটি এসএলএ', 'ফ্রি গিগাবিট ডুয়াল-ব্যান্ড ওয়াইফাই ৬ রাউটার'],
        ctaUrl: 'https://delta-mithapukur.vercel.app/#corporate',
        isActiveOnMotherSite: true,
        impressions: 2950,
        clicks: 310,
        leadsGenerated: 19,
        lastSynced: new Date().toISOString(),
      },
      {
        id: 'CMP-2026-03',
        campaignTitle: 'Student & Freelancer Gamer 45 Mbps Pro',
        campaignTitleBn: 'স্টুডেন্ট ও ফ্রিল্যান্সার গেমার ৪৫ এমবিপিএস প্রো',
        packageName: 'Freelance & Gaming 45 Mbps',
        speedMbps: 45,
        bdixMbps: 150,
        monthlyFee: 1100,
        promoDiscountPercent: 10,
        bannerBadgeText: '⚡ LOW PING GAMING',
        featuresList: ['Ultra-Low Ping for Valorant, PUBG, CS2', 'Unlimited High Speed Google Drive/GitHub', 'Instant WhatsApp Bill Payment', 'Prioritized Voice Over IP Traffic'],
        featuresListBn: ['লো পিং পাবজি, ভ্যালোরেন্ট ও গেম অপ্টিমাইজেশন', 'আনলিমিটেড গুগল ড্রাইভ ও গিটহাব স্পিড', 'ইনস্ট্যান্ট হোয়াটসঅ্যাপ বিকাশ/নগদ পেমেন্ট', 'ভয়েস ও জুম মিটিংয়ে প্রায়োরিটি রুট'],
        ctaUrl: 'https://delta-mithapukur.vercel.app/#gaming',
        isActiveOnMotherSite: true,
        impressions: 3640,
        clicks: 485,
        leadsGenerated: 27,
        lastSynced: new Date().toISOString(),
      },
      {
        id: 'CMP-2026-04',
        campaignTitle: 'Village Connectivity Outreach (Gramin Fiber)',
        campaignTitleBn: 'পল্লী সংযোগ অভিযান (গ্রামীণ ফাইবার ব্রডব্যান্ড)',
        packageName: 'Rural Connect 20 Mbps',
        speedMbps: 20,
        bdixMbps: 60,
        monthlyFee: 600,
        bannerBadgeText: '🌾 RURAL FIBER EXPANSION',
        featuresList: ['Covers Balua, Payraband, Shathibari zones', 'Low Optical Loss with Tough Drop Fiber', 'Free Home Line Setup within 24 Hours', 'Local Union Representative Contact'],
        featuresListBn: ['বালুয়া, পায়রাবন্দ, শঠিবাড়ী ও কাফ্রিখাল কভারেজ', 'হেভি ড্রপ ফাইবার ও লো সিগন্যাল লস', '২৪ ঘণ্টার মধ্যে দ্রুত নতুন হোম লাইন সংযোগ', 'স্থানীয় ইউনিয়ন প্রতিনিধির সার্বক্ষণিক সহায়তা'],
        ctaUrl: 'https://delta-mithapukur.vercel.app/#rural',
        isActiveOnMotherSite: true,
        impressions: 1890,
        clicks: 220,
        leadsGenerated: 14,
        lastSynced: new Date().toISOString(),
      },
    ];
  });

  // Leads from Mother Website state
  const [leads, setLeads] = useState<MotherSiteLead[]>(() => {
    try {
      const saved = localStorage.getItem('delta_mother_site_leads');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'LEAD-901',
        name: 'মো: জাহিদুল ইসলাম (Jahidul Islam)',
        phone: '01712984512',
        email: 'jahid.mitha@gmail.com',
        area: 'পায়রাবন্দ ইউনিয়ন (Payraband)',
        address: 'পায়রাবন্দ বেগম রোকেয়া মেমোরিয়াল সংলগ্ন, মিঠাপুকুর',
        requestedPackage: 'Fiber Starter 30 Mbps',
        monthlyBudget: '৮০০ টাকা',
        source: 'Mother_Website',
        status: 'New_Lead',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        notes: 'মাদার ওয়েবসাইট (delta-mithapukur.vercel.app) থেকে নতুন অপটিক্যাল ফাইবার সংযোগের জন্য আবেদন করেছেন। জরুরি ভিত্তিতে সার্ভে দরকার।',
      },
      {
        id: 'LEAD-902',
        name: 'আরিফ মাহমুদ (Arif Mahmud)',
        phone: '01819445566',
        email: 'arif.trade@yahoo.com',
        area: 'মিঠাপুকুর বাজার জোন (Mithapukur Bazar)',
        address: 'মিঠাপুকুর কলেজ রোড, ৩য় তলা',
        requestedPackage: 'Commercial Ultra 60 Mbps',
        monthlyBudget: '১৫০০ টাকা',
        source: 'Mother_Website',
        status: 'Contacted',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        notes: 'দোকান ও সাইবার সার্ভিসের জন্য রিয়েল আইপি সহ ৬০ এমবিপিএস প্রয়োজন। টেকনিশিয়ান ভিজিট করেছেন।',
      },
      {
        id: 'LEAD-903',
        name: 'নাসরিন আক্তার (Nasreen Akhter)',
        phone: '01911778899',
        area: 'শঠিবাড়ী জোন (Shathibari)',
        address: 'শঠিবাড়ী বাসস্ট্যান্ড রোড',
        requestedPackage: 'Freelance & Gaming 45 Mbps',
        monthlyBudget: '১১০০ টাকা',
        source: 'Landing_Page',
        status: 'Survey_Scheduled',
        timestamp: new Date(Date.now() - 3600000 * 22).toISOString(),
        notes: 'ফ্রিল্যান্সিংয়ের জন্য বাফারলেস ইন্টারনেট চান। ড্রপ কেবলের দূরত্ব ৫০ মিটার। সংযোগ প্রস্তুত।',
      },
    ];
  });

  // Client search query & Filter
  const [clientSearch, setClientSearch] = useState('');
  const [leadSearch, setLeadSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);

  // New Campaign Form State
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    titleBn: '',
    packageName: '',
    speedMbps: 25,
    bdixMbps: 80,
    monthlyFee: 700,
    promoDiscountPercent: 15,
    badgeText: '🔥 SPECIAL OFFER',
    features: 'High Speed BDIX\n24/7 Support\nFree Installation',
    featuresBn: 'হাই স্পিড BDIX ও এফটিপি\n২৪/৭ সাপোর্ট\nফ্রি ইনস্টলেশন',
    ctaUrl: 'https://delta-mithapukur.vercel.app/#contact',
  });

  // Client CID Live Verification Diagnostic Simulator
  const [verifyCidInput, setVerifyCidInput] = useState('CID-1001');
  const [verifyResult, setVerifyResult] = useState<ClientInfo | null>(() => clients[0] || null);

  // Persist State to LocalStorage on updates
  const saveState = (newConfig?: MotherSiteSyncConfig, newCamp?: MarketingCampaign[], newL?: MotherSiteLead[]) => {
    if (newConfig) {
      setSyncConfig(newConfig);
      localStorage.setItem('delta_mother_site_config', JSON.stringify(newConfig));
    }
    if (newCamp) {
      setCampaigns(newCamp);
      localStorage.setItem('delta_mother_site_campaigns', JSON.stringify(newCamp));
    }
    if (newL) {
      setLeads(newL);
      localStorage.setItem('delta_mother_site_leads', JSON.stringify(newL));
    }
  };

  // Filtered Clients
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    const q = clientSearch.toLowerCase();
    return clients.filter(c => 
      c.cid.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.area.toLowerCase().includes(q)
    );
  }, [clients, clientSearch]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    if (!leadSearch.trim()) return leads;
    const q = leadSearch.toLowerCase();
    return leads.filter(l => 
      l.name.toLowerCase().includes(q) ||
      l.phone.toLowerCase().includes(q) ||
      l.area.toLowerCase().includes(q) ||
      l.requestedPackage.toLowerCase().includes(q)
    );
  }, [leads, leadSearch]);

  // Sync Action Handlers
  const handlePerformSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const updatedConfig: MotherSiteSyncConfig = {
        ...syncConfig,
        lastSyncTimestamp: new Date().toISOString(),
        syncStatus: 'SUCCESS',
        syncedSubscribersCount: clients.length,
        syncedCampaignsCount: campaigns.filter(c => c.isActiveOnMotherSite).length,
        pendingLeadsCount: leads.filter(l => l.status === 'New_Lead').length,
      };
      saveState(updatedConfig);
      if (onShowToast) {
        onShowToast(
          lang === 'bn' 
            ? '✓ মাদার ওয়েবসাইট (delta-mithapukur.vercel.app) এর সাথে সফলভাবে সিঙ্ক সম্পন্ন হয়েছে!' 
            : '✓ Successfully synchronized Client DB & Marketing Portal with delta-mithapukur.vercel.app!',
          'success'
        );
      }
    }, 900);
  };

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeKey(key);
    setTimeout(() => setCopiedCodeKey(null), 2000);
    if (onShowToast) {
      onShowToast(lang === 'bn' ? 'ক্লিপবোর্ডে কপি করা হয়েছে!' : 'Copied to clipboard!', 'info');
    }
  };

  // Toggle Campaign active
  const handleToggleCampaign = (id: string) => {
    const updated = campaigns.map(c => {
      if (c.id === id) {
        return { ...c, isActiveOnMotherSite: !c.isActiveOnMotherSite, lastSynced: new Date().toISOString() };
      }
      return c;
    });
    saveState(undefined, updated);
  };

  // Add Campaign
  const handleAddCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const newCampObj: MarketingCampaign = {
      id: `CMP-${Date.now().toString().slice(-4)}`,
      campaignTitle: newCampaign.title || 'New Fiber Promo',
      campaignTitleBn: newCampaign.titleBn || 'নতুন ফাইবার স্পেশাল অফার',
      packageName: newCampaign.packageName || 'Custom Fiber Plan',
      speedMbps: Number(newCampaign.speedMbps) || 25,
      bdixMbps: Number(newCampaign.bdixMbps) || 80,
      monthlyFee: Number(newCampaign.monthlyFee) || 700,
      promoDiscountPercent: Number(newCampaign.promoDiscountPercent) || 0,
      bannerBadgeText: newCampaign.badgeText || '🔥 SPECIAL OFFER',
      featuresList: newCampaign.features.split('\n').filter(Boolean),
      featuresListBn: newCampaign.featuresBn.split('\n').filter(Boolean),
      ctaUrl: newCampaign.ctaUrl || 'https://delta-mithapukur.vercel.app/#packages',
      isActiveOnMotherSite: true,
      impressions: 0,
      clicks: 0,
      leadsGenerated: 0,
      lastSynced: new Date().toISOString(),
    };
    saveState(undefined, [newCampObj, ...campaigns]);
    setIsCreatingCampaign(false);
    if (onShowToast) {
      onShowToast(lang === 'bn' ? '✓ নতুন মার্কেটিং ক্যাম্পেইন যোগ ও সিঙ্ক হয়েছে!' : '✓ New marketing campaign published & synced!', 'success');
    }
  };

  // Lead status update
  const handleUpdateLeadStatus = (leadId: string, status: MotherSiteLead['status']) => {
    const updated = leads.map(l => l.id === leadId ? { ...l, status } : l);
    saveState(undefined, undefined, updated);
  };

  // Export JSON of Client DB for direct Mother Site use
  const handleExportClientDbJson = () => {
    const exportPayload = {
      source: 'Delta Support NOC Portal',
      targetMotherSite: 'https://delta-mithapukur.vercel.app/',
      exportedAt: new Date().toISOString(),
      totalSubscribers: clients.length,
      clients: clients.map(c => ({
        cid: c.cid,
        name: c.name,
        phone: c.phone,
        area: c.area,
        package: c.package,
        opticalPowerDbm: c.opticalPowerDbm,
        onuMac: c.onuMac,
        status: c.status,
        dueBalance: c.dueBalance,
        lastBillPaidDate: c.lastBillPaidDate,
      })),
      activeMarketingCampaigns: campaigns.filter(c => c.isActiveOnMotherSite),
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delta_mother_site_client_db_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    if (onShowToast) {
      onShowToast(lang === 'bn' ? '✓ মাদার সাইটের জন্য ক্লায়েন্ট ডাটাবেজ JSON ডাউনলোড হয়েছে' : '✓ Exported Mother Site Client DB JSON file', 'success');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white font-sans my-auto">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/70 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/40 shadow-inner">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black font-syne tracking-tight text-white">
                  {lang === 'bn' ? 'মাদার ওয়েবসাইট ও মার্কেটিং পোর্টাল হাব' : 'Mother Website & Marketing Portal Hub'}
                </h2>
                <a
                  href="https://delta-mithapukur.vercel.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 hover:bg-indigo-500/30 transition-colors"
                >
                  <span>https://delta-mithapukur.vercel.app/</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'bn'
                  ? 'মাদার ওয়েবসাইটের ক্লায়েন্ট ডাটাবেজ স্টোরেজ, রিয়েল-টাইম সিঙ্ক এবং মার্কেটিং ক্যাম্পেইন ও লিড পোর্টাল'
                  : 'Centralized Client DB storage, real-time sync bridge, marketing campaign publisher & leads CRM for delta-mithapukur.vercel.app'}
              </p>
            </div>
          </div>

          {/* Sync Trigger & Close Buttons */}
          <div className="flex items-center gap-2.5 self-end md:self-auto">
            <button
              onClick={handlePerformSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? (lang === 'bn' ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') : (lang === 'bn' ? 'তাৎক্ষণিক সিঙ্ক' : 'Sync Now')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Live Bridge Health Banner */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold">STATUS: LIVE CONNECTED</span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              {lang === 'bn' ? 'সর্বশেষ সিঙ্ক:' : 'Last Synced:'}{' '}
              <span className="text-slate-200">{new Date(syncConfig.lastSyncTimestamp).toLocaleTimeString()}</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">
              {lang === 'bn' ? 'সিঙ্ককৃত গ্রাহক:' : 'Synced DB:'}{' '}
              <span className="text-sky-400 font-bold">{clients.length} CIDs</span>
            </span>
            <span className="text-slate-400">
              {lang === 'bn' ? 'সক্রিয় ক্যাম্পেইন:' : 'Active Offers:'}{' '}
              <span className="text-indigo-400 font-bold">{campaigns.filter(c => c.isActiveOnMotherSite).length}</span>
            </span>
            <span className="text-slate-400">
              {lang === 'bn' ? 'নতুন লিড:' : 'New Inquiries:'}{' '}
              <span className="text-amber-400 font-bold">{leads.filter(l => l.status === 'New_Lead').length}</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-slate-800 px-4 sm:px-6 bg-slate-900 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('CLIENT_DB')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'CLIENT_DB'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ক্লায়েন্ট ডাটাবেজ স্টোরেজ' : 'Client DB Storage'}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300">
              {clients.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('MARKETING')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'MARKETING'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>{lang === 'bn' ? 'মার্কেটিং পোর্টাল ও অফার' : 'Marketing Offers & Ads'}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300">
              {campaigns.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('LEADS')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'LEADS'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ওয়েবসাইট লিডস ও আবেদন' : 'Mother Site Leads'}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
              {leads.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('API_EMBED')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'API_EMBED'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>{lang === 'bn' ? 'এপিআই ও এম্বেড গেটওয়ে' : 'Public API & Embed'}</span>
          </button>

          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'SETTINGS'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{lang === 'bn' ? 'সিঙ্ক কনফিগারেশন' : 'Sync Config'}</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: CLIENT DB STORAGE & MOTHER SITE ACCESS */}
          {activeTab === 'CLIENT_DB' && (
            <div className="space-y-5">
              
              {/* Header Info & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-sky-400" />
                    <span>{lang === 'bn' ? 'মাদার ওয়েবসাইটের সেন্ট্রাল ক্লায়েন্ট স্টোরেজ' : 'Central Client DB Storage for Mother Website'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'bn'
                      ? 'https://delta-mithapukur.vercel.app/ এই ডাটাবেজ থেকে সরাসরি গ্রাহক আইডি ভেরিফাই এবং বিল চেক করতে পারে।'
                      : 'Allows https://delta-mithapukur.vercel.app/ to verify subscriber CIDs, optical power, and bill statuses in real-time.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleExportClientDbJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold border border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>{lang === 'bn' ? 'JSON এক্সপোর্ট' : 'Export JSON'}</span>
                  </button>

                  {onOpenAddNewClient && (
                    <button
                      onClick={onOpenAddNewClient}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'নতুন গ্রাহক রেজিস্টার' : 'Register Client'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder={lang === 'bn' ? 'CID, গ্রাহকের নাম, ফোন বা এলাকা দিয়ে খুঁজুন...' : 'Search by CID, name, phone, or zone...'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Client DB Table */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="p-3">CID</th>
                        <th className="p-3">{lang === 'bn' ? 'গ্রাহকের নাম ও ফোন' : 'Subscriber & Phone'}</th>
                        <th className="p-3">{lang === 'bn' ? 'এলাকা / জোন' : 'Area Zone'}</th>
                        <th className="p-3">{lang === 'bn' ? 'প্যাকেজ' : 'Package'}</th>
                        <th className="p-3">{lang === 'bn' ? 'অপটিক্যাল সিগন্যাল' : 'Optical Signal'}</th>
                        <th className="p-3">{lang === 'bn' ? 'মাদার সাইট স্ট্যাটাস' : 'Mother Site Sync'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-sans">
                      {filteredClients.map((client) => {
                        const isGoodSignal = client.opticalPowerDbm ? client.opticalPowerDbm >= -24 : true;
                        return (
                          <tr key={client.cid} className="hover:bg-slate-900/60 transition-colors">
                            <td className="p-3 font-mono font-bold text-sky-400">
                              {client.cid}
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-slate-200">{client.name}</div>
                              <div className="text-[11px] font-mono text-slate-400">{client.phone}</div>
                            </td>
                            <td className="p-3 text-slate-300">
                              {client.area}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[11px] border border-indigo-500/30">
                                {client.package}
                              </span>
                            </td>
                            <td className="p-3">
                              {client.opticalPowerDbm ? (
                                <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold ${
                                  isGoodSignal ? 'text-emerald-400' : 'text-rose-400'
                                }`}>
                                  <Wifi className="w-3 h-3" />
                                  <span>{client.opticalPowerDbm} dBm</span>
                                </span>
                              ) : (
                                <span className="text-slate-500 font-mono text-[10px]">N/A</span>
                              )}
                            </td>
                            <td className="p-3">
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>SYNCED</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Live CID Verification Simulator */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono uppercase text-indigo-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'মাদার ওয়েবসাইট সিআইডি ভেরিফিকেশন সিমুলেটর' : 'Mother Website Live CID Verification Tool'}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Endpoint: GET /api/v1/subscribers?cid=CID-1001
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verifyCidInput}
                    onChange={(e) => setVerifyCidInput(e.target.value.toUpperCase())}
                    placeholder="Enter CID (e.g. CID-1001)"
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 uppercase flex-1"
                  />
                  <button
                    onClick={() => {
                      const found = clients.find(c => c.cid.toUpperCase() === verifyCidInput.trim());
                      setVerifyResult(found || null);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    {lang === 'bn' ? 'যাচাই করুন' : 'Verify CID'}
                  </button>
                </div>

                {verifyResult ? (
                  <div className="p-3 bg-slate-900 rounded-lg border border-indigo-500/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">CID & NAME</span>
                      <span className="font-bold text-sky-400">{verifyResult.cid}</span>
                      <span className="block text-slate-300 font-sans">{verifyResult.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">PACKAGE</span>
                      <span className="font-bold text-white">{verifyResult.package}</span>
                      <span className="block text-emerald-400">Paid: {verifyResult.monthlyFee || 800}৳</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">OPTICAL POWER</span>
                      <span className="font-bold text-emerald-400">{verifyResult.opticalPowerDbm || -19.4} dBm</span>
                      <span className="block text-slate-400">Normal</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">STATUS</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold inline-block mt-0.5">
                        ACTIVE / ONLINE
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs font-mono">
                    ❌ No subscriber record found for &ldquo;{verifyCidInput}&rdquo; on Mother Website.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: MARKETING OFFERS & CAMPAIGNS */}
          {activeTab === 'MARKETING' && (
            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-amber-400" />
                    <span>{lang === 'bn' ? 'মাদার ওয়েবসাইটে প্রচারিত অফার ও প্যাকেজ' : 'Promotional Campaigns on delta-mithapukur.vercel.app'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'bn'
                      ? 'এখান থেকে যেকোনো অফার অ্যাক্টিভ বা নতুন ক্যাম্পেইন যোগ করলে তা সরাসরি মাদার সাইটে প্রদর্শিত হবে।'
                      : 'Toggle, edit, or publish broadband package offers directly to delta-mithapukur.vercel.app.'}
                  </p>
                </div>

                <button
                  onClick={() => setIsCreatingCampaign(!isCreatingCampaign)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isCreatingCampaign ? (lang === 'bn' ? 'ফর্ম বন্ধ' : 'Close Form') : (lang === 'bn' ? 'নতুন অফার যোগ' : 'Create Offer')}</span>
                </button>
              </div>

              {/* Create Campaign Inline Form */}
              {isCreatingCampaign && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  onSubmit={handleAddCampaign}
                  className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-amber-500/40 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-amber-400 font-mono uppercase">
                      {lang === 'bn' ? 'নতুন অফার তৈরির ফর্ম' : 'Create New Promotional Offer for Mother Site'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Publishes to https://delta-mithapukur.vercel.app/
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1 font-mono text-[10px] uppercase">
                        {lang === 'bn' ? 'অফার শিরোনাম (বাংলা)' : 'Campaign Title (Bengali)'}
                      </label>
                      <input
                        type="text"
                        required
                        value={newCampaign.titleBn}
                        onChange={(e) => setNewCampaign({ ...newCampaign, titleBn: e.target.value })}
                        placeholder="যেমন: মিঠাপুকুর স্পেশাল ফাইবার অফার"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-sans"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-mono text-[10px] uppercase">
                        {lang === 'bn' ? 'প্যাকেজের নাম' : 'Package Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={newCampaign.packageName}
                        onChange={(e) => setNewCampaign({ ...newCampaign, packageName: e.target.value })}
                        placeholder="Fiber Turbo 35 Mbps"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-mono text-[10px] uppercase">
                        {lang === 'bn' ? 'ব্যানার ব্যাজ টেক্সট' : 'Banner Badge Text'}
                      </label>
                      <input
                        type="text"
                        value={newCampaign.badgeText}
                        onChange={(e) => setNewCampaign({ ...newCampaign, badgeText: e.target.value })}
                        placeholder="💥 BEST SELLER"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-mono text-[10px] uppercase">
                        {lang === 'bn' ? 'ইন্টারনেট গতি (Mbps)' : 'Speed (Mbps)'}
                      </label>
                      <input
                        type="number"
                        required
                        value={newCampaign.speedMbps}
                        onChange={(e) => setNewCampaign({ ...newCampaign, speedMbps: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-mono text-[10px] uppercase">
                        {lang === 'bn' ? 'মাসিক ফি (টাকা)' : 'Monthly Fee (BDT)'}
                      </label>
                      <input
                        type="number"
                        required
                        value={newCampaign.monthlyFee}
                        onChange={(e) => setNewCampaign({ ...newCampaign, monthlyFee: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-mono text-[10px] uppercase">
                        {lang === 'bn' ? 'ডিসকাউন্ট (%)' : 'Discount (%)'}
                      </label>
                      <input
                        type="number"
                        value={newCampaign.promoDiscountPercent}
                        onChange={(e) => setNewCampaign({ ...newCampaign, promoDiscountPercent: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-slate-400 block mb-1 font-mono text-[10px] uppercase">
                        {lang === 'bn' ? 'সুবিধাসমূহ (প্রতি লাইনে ১টি)' : 'Features List (1 per line)'}
                      </label>
                      <textarea
                        rows={2}
                        value={newCampaign.featuresBn}
                        onChange={(e) => setNewCampaign({ ...newCampaign, featuresBn: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-sans text-xs"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md"
                      >
                        {lang === 'bn' ? '✓ মাদার সাইটে পাবলিশ করুন' : '✓ Publish to Mother Site'}
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}

              {/* Campaigns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns.map((camp) => (
                  <div
                    key={camp.id}
                    className={`bg-slate-950 rounded-xl p-4 border transition-all relative overflow-hidden flex flex-col justify-between ${
                      camp.isActiveOnMotherSite
                        ? 'border-indigo-500/40 shadow-lg'
                        : 'border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block mb-1.5">
                            {camp.bannerBadgeText}
                          </span>
                          <h4 className="text-sm font-bold text-white">
                            {lang === 'bn' ? camp.campaignTitleBn : camp.campaignTitle}
                          </h4>
                          <span className="text-xs font-mono text-sky-400">{camp.packageName}</span>
                        </div>

                        <button
                          onClick={() => handleToggleCampaign(camp.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                            camp.isActiveOnMotherSite
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {camp.isActiveOnMotherSite ? 'LIVE ON SITE' : 'PAUSED'}
                        </button>
                      </div>

                      {/* Pricing & Speed */}
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-baseline justify-between font-mono">
                        <div>
                          <span className="text-2xl font-black text-white">{camp.speedMbps}</span>
                          <span className="text-xs text-slate-400 ml-1">Mbps Internet</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-emerald-400">{camp.monthlyFee}৳</span>
                          <span className="text-[10px] text-slate-400"> / month</span>
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-1 text-xs text-slate-300">
                        {(lang === 'bn' ? camp.featuresListBn : camp.featuresList).slice(0, 3).map((feat, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span className="truncate">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Footer Stats & Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <div className="flex items-center gap-3">
                        <span>👁️ {camp.impressions}</span>
                        <span>🖱️ {camp.clicks}</span>
                        <span className="text-emerald-400 font-bold">🎯 {camp.leadsGenerated} leads</span>
                      </div>

                      <a
                        href={camp.ctaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold"
                      >
                        <span>Preview</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 3: LEADS & INQUIRIES FROM MOTHER SITE */}
          {activeTab === 'LEADS' && (
            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'bn' ? 'মাদার ওয়েবসাইট থেকে আগত নতুন সংযোগ আবেদন' : 'Real-Time Inquiries & Connection Leads'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'bn'
                      ? 'delta-mithapukur.vercel.app থেকে গ্রাহকদের পাঠানো প্যাকেজ রিকোয়েস্ট ও যোগাযোগ তথ্য'
                      : 'Incoming customer leads and optical broadband booking requests submitted on delta-mithapukur.vercel.app.'}
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    placeholder={lang === 'bn' ? 'নাম, ফোন বা এলাকা...' : 'Search leads...'}
                    className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 font-mono"
                  />
                </div>
              </div>

              {/* Leads List Cards */}
              <div className="space-y-3">
                {filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-slate-950 rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-xs font-mono">
                          {lead.id.split('-')[1]}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{lead.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                            <span className="text-sky-400">{lead.phone}</span>
                            <span>•</span>
                            <span>{new Date(lead.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2">
                        <select
                          value={lead.status}
                          onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as any)}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-200 outline-none"
                        >
                          <option value="New_Lead">🟢 New Lead</option>
                          <option value="Contacted">🟡 Contacted</option>
                          <option value="Survey_Scheduled">🔵 Survey Scheduled</option>
                          <option value="Converted">🟣 Converted to Client</option>
                          <option value="Rejected">🔴 Rejected</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 font-mono text-[10px] uppercase block">
                          {lang === 'bn' ? 'আবেদিত প্যাকেজ' : 'Requested Package'}
                        </span>
                        <span className="font-bold text-white font-mono">{lead.requestedPackage}</span>
                        <span className="text-slate-400 block text-[11px]">Budget: {lead.monthlyBudget}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 font-mono text-[10px] uppercase block">
                          {lang === 'bn' ? 'সংযোগের এলাকা ও ঠিকানা' : 'Address / Zone'}
                        </span>
                        <span className="font-semibold text-slate-200">{lead.area}</span>
                        <span className="text-slate-400 block text-[11px] truncate">{lead.address}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 font-mono text-[10px] uppercase block">
                          {lang === 'bn' ? 'উৎস (Source)' : 'Source'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-bold border border-indigo-500/30 inline-block mt-0.5">
                          {lead.source}
                        </span>
                      </div>
                    </div>

                    {lead.notes && (
                      <p className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 font-sans italic">
                        &ldquo;{lead.notes}&rdquo;
                      </p>
                    )}

                    {/* Quick 1-Click Conversion Actions */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <a
                        href={`https://wa.me/88${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${lead.name}, ডেল্টা মিঠাপুকুর আইএসপি (https://delta-mithapukur.vercel.app/) থেকে আপনার অপটিক্যাল ফাইবার সংযোগ আবেদনের প্রেক্ষিতে যোগাযোগ করছি।`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-xs font-mono font-bold border border-emerald-500/30 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp Chat</span>
                      </a>

                      <button
                        onClick={() => {
                          if (onConvertLeadToClient) {
                            onConvertLeadToClient(lead);
                          } else if (onOpenAddNewClient) {
                            onOpenAddNewClient();
                          }
                          handleUpdateLeadStatus(lead.id, 'Converted');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'CID গ্রাহক হিসেবে কনভার্ট করুন' : 'Convert to CID Client'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: PUBLIC API & EMBED HUBS FOR MOTHER WEBSITE */}
          {activeTab === 'API_EMBED' && (
            <div className="space-y-5">
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  <span>{lang === 'bn' ? 'মাদার ওয়েবসাইটের জন্য রেস্ট এপিআই ও এম্বেড গেটওয়ে' : 'REST API & Embed Integration Gateway'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'bn'
                    ? 'https://delta-mithapukur.vercel.app/ ওয়েবসাইটটি নিচের এন্ডপয়েন্ট ও কোড স্নপেট ব্যবহার করে এই সিস্টেমের সাথে সরাসরি কানেক্ট থাকবে।'
                    : 'delta-mithapukur.vercel.app can query real-time subscriber diagnostics, active offers, and embed ticket widgets.'}
                </p>
              </div>

              {/* Endpoint 1: Subscriber Verification & Optical Status */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-[10px] font-bold">GET</span>
                    <span className="text-xs font-mono font-bold text-white">/api/v1/mother-site/subscribers</span>
                  </div>
                  <button
                    onClick={() => handleCopy('https://delta-support.preview/api/v1/mother-site/subscribers?cid=CID-1001', 'subApi')}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                  >
                    {copiedCodeKey === 'subApi' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Returns subscriber profile, monthly bill, ONU optical signal power, and active tickets.
                </p>
                <div className="bg-slate-900 p-3 rounded-lg font-mono text-[11px] text-sky-300 overflow-x-auto border border-slate-800">
                  {`curl -X GET "https://delta-support.preview/api/v1/mother-site/subscribers?cid=CID-1001" \\
  -H "Authorization: Bearer ${syncConfig.apiSecretKey}"`}
                </div>
              </div>

              {/* Endpoint 2: Marketing Campaigns & Packages Feed */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">GET</span>
                    <span className="text-xs font-mono font-bold text-white">/api/v1/mother-site/marketing/campaigns</span>
                  </div>
                  <button
                    onClick={() => handleCopy('https://delta-support.preview/api/v1/mother-site/marketing/campaigns', 'campApi')}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                  >
                    {copiedCodeKey === 'campApi' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Returns all active broadband packages, pricing, discounts, and banner highlights for https://delta-mithapukur.vercel.app/
                </p>
              </div>

              {/* Iframe Embed Code for delta-mithapukur.vercel.app */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-indigo-400">
                    &lt;iframe&gt; EMBED CODE FOR MOTHER WEBSITE
                  </span>
                  <button
                    onClick={() => handleCopy(`<iframe src="https://ais-dev-4jnz22tiro3xslicg5rtmf-411568105156.asia-east1.run.app" width="100%" height="700" style="border:none; border-radius:16px;"></iframe>`, 'iframeEmbed')}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors flex items-center gap-1 text-[10px] font-mono"
                  >
                    {copiedCodeKey === 'iframeEmbed' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Embed</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={2}
                  value={`<iframe src="https://ais-dev-4jnz22tiro3xslicg5rtmf-411568105156.asia-east1.run.app" width="100%" height="700" style="border:none; border-radius:16px;"></iframe>`}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 resize-none outline-none select-all"
                />
              </div>

            </div>
          )}

          {/* TAB 5: SYNC SETTINGS */}
          {activeTab === 'SETTINGS' && (
            <div className="space-y-5">
              
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'bn' ? 'মাদার ওয়েবসাইট সিঙ্ক সেটিংস ও সিকিউরিটি' : 'Mother Website Sync & Security Settings'}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1 font-mono text-[10px] uppercase">
                      Mother Website Target URL
                    </label>
                    <input
                      type="url"
                      value={syncConfig.motherSiteUrl}
                      onChange={(e) => setSyncConfig({ ...syncConfig, motherSiteUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-mono text-[10px] uppercase">
                      API Authorization Secret Key
                    </label>
                    <input
                      type="password"
                      value={syncConfig.apiSecretKey}
                      onChange={(e) => setSyncConfig({ ...syncConfig, apiSecretKey: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-slate-400 block mb-1 font-mono text-[10px] uppercase">
                      Mother Site Webhook Endpoint
                    </label>
                    <input
                      type="url"
                      value={syncConfig.webhookEndpoint}
                      onChange={(e) => setSyncConfig({ ...syncConfig, webhookEndpoint: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => {
                      saveState(syncConfig);
                      if (onShowToast) {
                        onShowToast(lang === 'bn' ? '✓ কনফিগারেশন সংরক্ষণ করা হয়েছে!' : '✓ Configuration saved successfully!', 'success');
                      }
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-sm cursor-pointer"
                  >
                    {lang === 'bn' ? 'সেটিংস সেভ করুন' : 'Save Settings'}
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>Target: <span className="text-white font-bold">https://delta-mithapukur.vercel.app/</span></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
