import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, TicketPriority, TicketStatus } from '../types';
import { 
  Clock, 
  Timer, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Flame, 
  RotateCcw, 
  Sparkles,
  Hourglass,
  Calendar,
  Zap,
  TrendingDown
} from 'lucide-react';

interface SlaTimerProps {
  ticket: Ticket;
  lang: 'bn' | 'en';
  variant?: 'card' | 'compact' | 'badge';
  className?: string;
}

// Target SLA Durations in Minutes
export const SLA_TARGET_HOURS: Record<TicketPriority, number> = {
  Urgent: 2,   // 2 hours (120 min) - Fiber Cut, Red LOS
  High: 4,     // 4 hours (240 min) - High Ping, Packet Loss
  Medium: 8,   // 8 hours (480 min) - Config, Slow Speed
  Low: 24,     // 24 hours (1440 min) - Billing, Migration
};

export const SlaTimer: React.FC<SlaTimerProps> = ({
  ticket,
  lang,
  variant = 'card',
  className = '',
}) => {
  const [now, setNow] = useState<number>(Date.now());
  const [useSimulatedStart, setUseSimulatedStart] = useState<boolean>(false);
  const [simulatedStartTime, setSimulatedStartTime] = useState<number | null>(null);

  // Update live timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const priority = ticket.priority || 'Medium';
  const targetHours = SLA_TARGET_HOURS[priority] || 8;
  const targetDurationMs = targetHours * 60 * 60 * 1000;

  // Determine starting timestamp
  const rawCreatedTime = new Date(ticket.createdDate).getTime();
  const validCreatedTime = !isNaN(rawCreatedTime) ? rawCreatedTime : Date.now();
  
  // If created date is very old (e.g. mock from weeks ago) and not resolved, default or allow simulated session timer
  const startTime = useSimulatedStart && simulatedStartTime ? simulatedStartTime : validCreatedTime;

  const deadlineTime = startTime + targetDurationMs;
  const isResolvedOrClosed = ticket.status === 'Resolved' || ticket.status === 'Closed';
  
  const rawUpdatedTime = ticket.updatedDate ? new Date(ticket.updatedDate).getTime() : Date.now();
  const resolutionTime = !isNaN(rawUpdatedTime) ? rawUpdatedTime : Date.now();

  const elapsedMs = isResolvedOrClosed
    ? Math.max(0, resolutionTime - startTime)
    : Math.max(0, now - startTime);

  const remainingMs = isResolvedOrClosed 
    ? Math.max(0, deadlineTime - resolutionTime)
    : deadlineTime - now;

  const isBreached = !isResolvedOrClosed && remainingMs <= 0;
  const wasBreachedBeforeResolution = isResolvedOrClosed && (resolutionTime > deadlineTime);

  // Percentage calculation
  const progressPercent = Math.min(100, Math.max(0, (elapsedMs / targetDurationMs) * 100));
  const remainingPercent = Math.max(0, 100 - progressPercent);

  // Helper formatting for countdowns
  const formatTimeParts = (ms: number) => {
    const totalSeconds = Math.floor(Math.abs(ms) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return {
      hours,
      minutes,
      seconds,
      formatted: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
      humanTextBn: `${hours > 0 ? `${hours} ঘণ্টা ` : ''}${minutes} মি. ${seconds} সে.`,
      humanTextEn: `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`,
    };
  };

  const remainingParts = formatTimeParts(remainingMs);
  const elapsedParts = formatTimeParts(elapsedMs);

  const deadlineDate = new Date(deadlineTime);
  const formattedDeadline = deadlineDate.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const formattedDeadlineDate = deadlineDate.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });

  // State color themes
  const getTheme = () => {
    if (isResolvedOrClosed) {
      return {
        bgGradient: 'from-emerald-950/40 to-slate-900/90',
        border: 'border-emerald-500/40',
        accentText: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        progressBar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
        glow: 'shadow-[0_0_16px_rgba(16,185,129,0.15)]',
        statusLabelBn: 'SLA সফলভাবে সম্পন্ন (Resolved)',
        statusLabelEn: 'SLA Target Achieved',
        icon: CheckCircle2,
      };
    }
    if (isBreached) {
      return {
        bgGradient: 'from-rose-950/50 to-slate-900/90',
        border: 'border-rose-500/50',
        accentText: 'text-rose-400',
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        progressBar: 'bg-gradient-to-r from-rose-600 to-red-500',
        glow: 'shadow-[0_0_20px_rgba(244,63,94,0.25)]',
        statusLabelBn: '⚠️ SLA সময় অতিক্রান্ত (Breached)',
        statusLabelEn: '⚠️ SLA Deadline Breached',
        icon: ShieldAlert,
      };
    }
    if (remainingPercent < 25) {
      return {
        bgGradient: 'from-rose-950/30 to-slate-900/90',
        border: 'border-rose-500/40',
        accentText: 'text-rose-400',
        badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        progressBar: 'bg-gradient-to-r from-amber-500 to-rose-500',
        glow: 'shadow-[0_0_16px_rgba(244,63,94,0.2)]',
        statusLabelBn: '🚨 অতি দ্রুত সমাধান প্রয়োজন (Critical)',
        statusLabelEn: 'Critical: Imminent Breach',
        icon: Flame,
      };
    }
    if (remainingPercent < 50) {
      return {
        bgGradient: 'from-amber-950/30 to-slate-900/90',
        border: 'border-amber-500/40',
        accentText: 'text-amber-400',
        badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        progressBar: 'bg-gradient-to-r from-teal-500 to-amber-500',
        glow: 'shadow-[0_0_14px_rgba(245,158,11,0.15)]',
        statusLabelBn: '⚠️ সময়সীমা দ্রুত ফুরিয়ে আসছে (Warning)',
        statusLabelEn: 'Warning: 50% Time Passed',
        icon: AlertTriangle,
      };
    }
    return {
      bgGradient: 'from-indigo-950/30 to-slate-900/90',
      border: 'border-indigo-500/30',
      accentText: 'text-indigo-400',
      badgeBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      progressBar: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-400',
      glow: 'shadow-[0_0_14px_rgba(99,102,241,0.15)]',
      statusLabelBn: 'সময়সীমা স্বাভাবিক গতিতে চলছে (On Track)',
      statusLabelEn: 'Resolution On Track',
      icon: Timer,
    };
  };

  const theme = getTheme();
  const StatusIcon = theme.icon;

  const handleStartLiveDemoCountdown = () => {
    setSimulatedStartTime(Date.now());
    setUseSimulatedStart(true);
  };

  const handleResetToRealDate = () => {
    setUseSimulatedStart(false);
    setSimulatedStartTime(null);
  };

  // 1. Compact Badge Variant (for tight spaces)
  if (variant === 'compact' || variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${theme.badgeBg} ${className}`}>
        <StatusIcon className="w-3.5 h-3.5" />
        <span>
          {isResolvedOrClosed 
            ? (lang === 'bn' ? 'SLA সমাধান' : 'SLA Met')
            : isBreached 
            ? (lang === 'bn' ? `+${remainingParts.formatted} ওভারডিউ` : `+${remainingParts.formatted} Overdue`)
            : (lang === 'bn' ? `${remainingParts.formatted} বাকি` : `${remainingParts.formatted} left`)}
        </span>
      </div>
    );
  }

  // 2. Full High-Tech Card Variant (Primary in TicketDetailModal)
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.bgGradient} border ${theme.border} p-4 sm:p-5 text-white ${theme.glow} transition-all ${className}`}>
      
      {/* Background Decorative Matrix Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

      {/* Header Row: Title, Target SLA Badge, & Live Status */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-800/90 border border-slate-700 text-indigo-400 shadow-inner">
            <Timer className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                {lang === 'bn' ? 'সার্ভিস লেভেল এগ্রিমেন্ট (SLA)' : 'Service Level Agreement (SLA)'}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border uppercase ${
                priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                priority === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                'bg-blue-500/20 text-blue-300 border-blue-500/40'
              }`}>
                {priority} Priority • {targetHours}h Max
              </span>
            </div>
            <p className="text-xs font-bold text-slate-200 mt-0.5">
              {lang === 'bn' ? theme.statusLabelBn : theme.statusLabelEn}
            </p>
          </div>
        </div>

        {/* Live / Demo Simulation Switcher */}
        <div className="flex items-center gap-2">
          {!isResolvedOrClosed && (
            <button
              type="button"
              onClick={useSimulatedStart ? handleResetToRealDate : handleStartLiveDemoCountdown}
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700/80 text-[11px] font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title={useSimulatedStart ? 'Switch back to actual ticket creation timestamp' : 'Start live live countdown from this moment for testing'}
            >
              <RotateCcw className="w-3 h-3 text-indigo-400" />
              <span>{useSimulatedStart ? (lang === 'bn' ? 'আসল সময়' : 'Real Date') : (lang === 'bn' ? 'লাইভ টেস্ট' : 'Live Test')}</span>
            </button>
          )}

          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${theme.badgeBg}`}>
            <StatusIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="uppercase tracking-wider">
              {isResolvedOrClosed
                ? (lang === 'bn' ? 'সম্পন্ন' : 'RESOLVED')
                : isBreached 
                ? (lang === 'bn' ? 'ওভারডিউ' : 'OVERDUE')
                : (lang === 'bn' ? 'চলমান' : 'ACTIVE')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Stats Grid: Live Countdown, Deadline, & Progress */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        
        {/* Card 1: Time Remaining / Overdue (HERO DISPLAY) */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
            <span>{isResolvedOrClosed ? (lang === 'bn' ? 'মোট সমাধান সময়' : 'Total Resolution Time') : (lang === 'bn' ? 'সমাধানে বাকি সময়' : 'Time Remaining')}</span>
            <Hourglass className="w-3.5 h-3.5 text-slate-500" />
          </div>

          <div className="mt-2">
            {isResolvedOrClosed ? (
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
                  {elapsedParts.humanTextBn}
                </span>
              </div>
            ) : isBreached ? (
              <div>
                <div className="flex items-baseline gap-1.5 text-rose-400">
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight animate-pulse">
                    +{remainingParts.formatted}
                  </span>
                </div>
                <span className="text-[10px] text-rose-300/80 font-mono block mt-0.5">
                  {lang === 'bn' ? 'নির্ধারিত সময় পার হয়ে গেছে' : 'Target SLA exceeded'}
                </span>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-digital">
                    {remainingParts.formatted}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ({lang === 'bn' ? remainingParts.humanTextBn : remainingParts.humanTextEn})
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                  {lang === 'bn' ? 'লাইভ কাউন্টডাউন টাইমার' : 'Live Real-time Countdown'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Expected Deadline Timestamp */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
            <span>{lang === 'bn' ? 'টার্গেট শেষ সময়' : 'Target SLA Deadline'}</span>
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          </div>

          <div className="mt-2">
            <div className="font-mono text-lg sm:text-xl font-bold text-slate-100">
              {formattedDeadline}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              {formattedDeadlineDate} • {targetHours} {lang === 'bn' ? 'ঘণ্টা টার্গেট' : 'Hours Window'}
            </div>
          </div>
        </div>

        {/* Card 3: Elapsed Time & SLA Window */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
            <span>{lang === 'bn' ? 'ইতিমধ্যে অতিবাহিত' : 'Time Elapsed'}</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>

          <div className="mt-2">
            <div className="font-mono text-lg sm:text-xl font-bold text-amber-300">
              {elapsedParts.humanTextBn}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              {Math.round(progressPercent)}% {lang === 'bn' ? 'সময় ব্যয় হয়েছে' : 'of SLA elapsed'}
            </div>
          </div>
        </div>

      </div>

      {/* Visual SLA Progress Bar */}
      <div className="relative z-10 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>{lang === 'bn' ? 'এসএলএ অগ্রগতি মিটার:' : 'SLA Progress Meter:'}</span>
          </div>
          <span className="font-bold text-slate-200">
            {isResolvedOrClosed 
              ? '100% (Completed)' 
              : isBreached 
              ? '100% (Exceeded)' 
              : `${Math.round(progressPercent)}% Elapsed (${Math.round(remainingPercent)}% Remaining)`}
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${theme.progressBar} transition-all relative`}
          >
            {/* Pulsing leading edge */}
            {!isResolvedOrClosed && !isBreached && (
              <span className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full animate-ping opacity-80" />
            )}
          </motion.div>
        </div>

        {/* Milestone Tick Markers */}
        <div className="flex justify-between text-[9px] font-mono text-slate-500 px-0.5">
          <span>0h (Start)</span>
          <span>{targetHours / 2}h (50% Warning)</span>
          <span>{targetHours * 0.75}h (75% Critical)</span>
          <span className={isBreached ? 'text-rose-400 font-bold' : ''}>{targetHours}h (Deadline)</span>
        </div>
      </div>

    </div>
  );
};
