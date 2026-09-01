import React from 'react';
import { DeltaLogo } from './DeltaLogo';
import { 
  ShieldCheck, 
  Users, 
  Award, 
  Globe, 
  Activity, 
  HelpCircle, 
  Gift, 
  UserPlus, 
  Sparkles,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Facebook,
  Linkedin,
  MessageCircle
} from 'lucide-react';

interface FooterProps {
  lang: 'bn' | 'en';
  onNavigateHome?: () => void;
  onOpenNewTicket?: () => void;
  onOpenNewClient?: () => void;
  onOpenPackages?: () => void;
  onOpenCoverage?: () => void;
  onOpenSpeedTest?: () => void;
  onOpenFaq?: () => void;
  onOpenLogoModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onNavigateHome,
  onOpenNewTicket,
  onOpenNewClient,
  onOpenPackages,
  onOpenCoverage,
  onOpenSpeedTest,
  onOpenFaq,
  onOpenLogoModal,
}) => {
  return (
    <footer className="w-full bg-[#030712] text-slate-300 border-t border-slate-800/80 pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-12 relative overflow-hidden">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 pb-10 border-b border-slate-800/80">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: BRAND IDENTITY, DESCRIPTION, BRANCH BADGE & TEAM CARDS      */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header: Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-slate-200 flex items-center justify-center shrink-0">
                <DeltaLogo size="md" showTagline={false} />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-syne tracking-tight">
                  Delta Mithapukur Branch
                </h3>
                <p className="text-sm font-bold text-sky-400 mt-0.5 font-sans">
                  Optical Fiber Broadband
                </p>
              </div>
            </div>

            {/* Paragraph Description */}
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              Delta Mithapukur Branch is a leading provider of high-speed optical fiber broadband and uninterrupted dedicated corporate internet connectivity across Mithapukur Upazila and Rangpur Division.
            </p>

            {/* Official Registered Branch Banner & Social Media Row */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-400/90 font-mono bg-sky-950/30 border border-sky-800/40 px-3 py-1.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  Official Registered Branch — Delta Broadband ISP
                </span>
              </div>

              {/* Social Media Link Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* WhatsApp Direct Support Badge */}
                <a
                  href="https://wa.me/8801719394430?text=Hello%20Delta%20Broadband%20Support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-[#25D366]/20 text-emerald-300 hover:text-[#25D366] border border-emerald-800/60 hover:border-[#25D366]/60 transition-all text-xs font-medium group active:scale-95 shadow-sm"
                  aria-label="Chat on WhatsApp (01719394430)"
                  title="Chat with NOC Support on WhatsApp (01719394430)"
                >
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:text-[#25D366] transition-colors" />
                  <span className="font-semibold text-xs">WhatsApp: 01719394430</span>
                </a>

                {/* Facebook Page Badge */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-[#1877F2]/15 text-slate-300 hover:text-[#1877F2] border border-slate-800 hover:border-[#1877F2]/50 transition-all text-xs font-medium group active:scale-95 shadow-sm"
                  aria-label="Delta Broadband on Facebook"
                  title="Delta Broadband on Facebook"
                >
                  <Facebook className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1877F2] transition-colors" />
                  <span className="font-semibold text-xs">Facebook</span>
                </a>

                {/* LinkedIn Badge */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-[#0A66C2]/15 text-slate-300 hover:text-[#0A66C2] border border-slate-800 hover:border-[#0A66C2]/50 transition-all text-xs font-medium group active:scale-95 shadow-sm"
                  aria-label="Delta Broadband on LinkedIn"
                  title="Delta Broadband on LinkedIn"
                >
                  <Linkedin className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0A66C2] transition-colors" />
                  <span className="font-semibold text-xs">LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Bottom 2 Profile Highlight Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 max-w-xl">
              
              {/* Card 1: Branch Manager */}
              <div className="bg-[#091122]/90 hover:bg-[#0c172e] border border-sky-900/40 hover:border-sky-500/40 rounded-2xl p-3.5 transition-all shadow-md flex items-center gap-3.5 group">
                <div className="relative shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    alt="Mahamudul Hasan - Branch Manager"
                    className="w-12 h-12 rounded-xl object-cover border border-emerald-500/40 group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#091122] rounded-full" />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 font-mono">
                    <Award className="w-3 h-3 text-emerald-400" />
                    <span>MANAGER</span>
                  </div>
                  <h4 className="text-sm font-black text-white truncate mt-0.5">
                    Mahamudul Hasan
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    Branch Manager
                  </p>
                </div>
              </div>

              {/* Card 2: Our Team */}
              <div className="bg-[#130d24]/90 hover:bg-[#1a1233] border border-purple-900/40 hover:border-purple-500/40 rounded-2xl p-3.5 transition-all shadow-md flex items-center gap-3.5 group">
                <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-purple-400 font-mono">
                    <Users className="w-3 h-3 text-purple-400" />
                    <span>OUR TEAM</span>
                  </div>
                  <h4 className="text-sm font-black text-white truncate mt-0.5">
                    Delta Mithapukur Team
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    7 Active Members
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: QUICK NAVIGATION LINKS                                      */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 space-y-4 lg:pl-8">
            
            {/* Quick Navigation Title */}
            <div className="flex items-center gap-2 pb-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
              <h4 className="text-xs font-black uppercase tracking-widest text-white font-mono">
                QUICK NAVIGATION
              </h4>
            </div>

            {/* Navigation List */}
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <button
                  onClick={onNavigateHome}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-left"
                >
                  <span>Home Page</span>
                </button>
              </li>

              <li>
                <button
                  onClick={onOpenPackages}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-left"
                >
                  <span>Packages & Monthly Fees</span>
                </button>
              </li>

              <li>
                <button
                  onClick={onOpenPackages}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-left"
                >
                  <span>Broadband Internet Services</span>
                </button>
              </li>

              <li>
                <button
                  onClick={onOpenCoverage}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-left"
                >
                  <span>Mithapukur Coverage Area</span>
                </button>
              </li>

              <li>
                <button
                  onClick={onOpenSpeedTest}
                  className="text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-2 text-left group"
                >
                  <Activity className="w-4 h-4 text-sky-400 group-hover:rotate-45 transition-transform" />
                  <span>BDIX Speed Test</span>
                </button>
              </li>

              <li>
                <button
                  onClick={onOpenFaq}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-left"
                >
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                  <span>FAQ & Help Center</span>
                </button>
              </li>

              {/* Referral Rewards */}
              <li>
                <button
                  onClick={onOpenNewClient}
                  className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors flex items-center gap-2 text-left"
                >
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <span>Referral Rewards</span>
                </button>
              </li>

              <li>
                <button
                  onClick={onOpenNewClient}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-left"
                >
                  <UserPlus className="w-4 h-4 text-slate-500" />
                  <span>Apply For New Connection</span>
                </button>
              </li>

              <li>
                <button
                  onClick={onOpenLogoModal}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-left"
                >
                  <Sparkles className="w-4 h-4 text-slate-500" />
                  <span>Official Logo & Brand Identity</span>
                </button>
              </li>
            </ul>

          </div>

        </div>

        {/* Bottom Sub-Footer Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} Delta Broadband ISP (Mithapukur Branch).</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-slate-400">All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] flex-wrap justify-center sm:justify-end">
            {/* Direct Social & Chat Links */}
            <div className="flex items-center gap-1.5">
              {/* WhatsApp Quick Chat */}
              <a
                href="https://wa.me/8801719394430?text=Hello%20Delta%20Broadband%20Support"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-[#25D366]/20 text-emerald-400 hover:text-[#25D366] border border-emerald-800/60 hover:border-[#25D366]/50 transition-colors"
                title="WhatsApp Support (01719394430)"
                aria-label="WhatsApp Support (01719394430)"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="font-sans font-semibold text-[10px]">WhatsApp</span>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-[#1877F2]/20 text-slate-400 hover:text-[#1877F2] border border-slate-800 transition-colors"
                title="Facebook"
                aria-label="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-[#0A66C2]/20 text-slate-400 hover:text-[#0A66C2] border border-slate-800 transition-colors"
                title="LinkedIn"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            </div>

            <span className="text-slate-700 hidden sm:inline">|</span>

            <a 
              href="https://app.netlify.com/projects/delta-support-net/deploys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center hover:opacity-90 transition-opacity"
              title="Netlify Deployment Status"
            >
              <img 
                src="https://api.netlify.com/api/v1/badges/9f9fb177-f9ba-4e04-ac4b-e7d21aa122f4/deploy-status" 
                alt="Netlify Status" 
                className="h-5"
                referrerPolicy="no-referrer"
              />
            </a>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>NOC ONLINE (24/7 HELPLINE)</span>
            </span>
            <span className="text-slate-700">|</span>
            <div className="inline-flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
              <a 
                href="tel:01719394430" 
                className="text-slate-200 hover:text-emerald-400 font-bold transition-colors inline-flex items-center gap-1"
                title="Call Helpline: 01719394430"
              >
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>01719394430</span>
              </a>
              <a
                href="https://wa.me/8801719394430?text=Hello%20Delta%20Broadband%20Support"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-slate-950 transition-all duration-200 shadow-sm active:scale-90"
                title="Chat on WhatsApp (01719394430)"
                aria-label="Chat on WhatsApp (01719394430)"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
