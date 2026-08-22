import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TicketStatus } from '../types';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Activity, 
  UserCheck, 
  Clock, 
  X, 
  Sparkles, 
  ArrowRight,
  ExternalLink,
  Check
} from 'lucide-react';

export interface StatusFeedbackData {
  ticketId: string;
  status: TicketStatus;
  previousStatus?: TicketStatus;
  title: string;
  clientName?: string;
  timestamp: number;
}

interface StatusFeedbackToastProps {
  feedback: StatusFeedbackData | null;
  onDismiss: () => void;
  onViewTicket?: (ticketId: string) => void;
  lang: 'bn' | 'en';
}

export const StatusFeedbackToast: React.FC<StatusFeedbackToastProps> = ({
  feedback,
  onDismiss,
  onViewTicket,
  lang,
}) => {
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [feedback, onDismiss]);

  if (!feedback) return null;

  const isResolvedOrClosed = feedback.status === 'Resolved' || feedback.status === 'Closed';

  const getStatusTheme = (status: TicketStatus) => {
    switch (status) {
      case 'Resolved':
        return {
          icon: CheckCircle2,
          color: 'emerald',
          border: 'border-emerald-500/50',
          bg: 'bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900',
          accent: 'text-emerald-400',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          labelBn: 'সমাধান হয়েছে (Resolved)',
          labelEn: 'Resolved',
        };
      case 'Closed':
        return {
          icon: ShieldCheck,
          color: 'teal',
          border: 'border-teal-500/50',
          bg: 'bg-gradient-to-r from-slate-900 via-teal-950/60 to-slate-900',
          accent: 'text-teal-400',
          badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
          labelBn: 'টিকেট বন্ধ (Closed)',
          labelEn: 'Closed',
        };
      case 'In_Progress':
        return {
          icon: Activity,
          color: 'amber',
          border: 'border-amber-500/50',
          bg: 'bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900',
          accent: 'text-amber-400',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          labelBn: 'কাজ চলছে (In Progress)',
          labelEn: 'In Progress',
        };
      case 'NOC_Assigned':
        return {
          icon: UserCheck,
          color: 'blue',
          border: 'border-blue-500/50',
          bg: 'bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900',
          accent: 'text-blue-400',
          badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          labelBn: 'নোক নিযুক্ত (Assigned)',
          labelEn: 'NOC Assigned',
        };
      case 'Open':
      default:
        return {
          icon: Clock,
          color: 'rose',
          border: 'border-rose-500/50',
          bg: 'bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900',
          accent: 'text-rose-400',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          labelBn: 'পেন্ডিং (Open)',
          labelEn: 'Open (Pending)',
        };
    }
  };

  const theme = getStatusTheme(feedback.status);
  const StatusIcon = theme.icon;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${feedback.ticketId}-${feedback.status}-${feedback.timestamp}`}
          initial={{ y: 40, opacity: 0, scale: 0.92, filter: 'blur(4px)' }}
          animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ y: 30, opacity: 0, scale: 0.94, filter: 'blur(2px)' }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 26,
            mass: 0.8,
          }}
          className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${theme.border} ${theme.bg} p-4 shadow-2xl shadow-slate-950/80 text-white backdrop-blur-xl`}
        >
          {/* Subtle animated background shine on resolve/close */}
          {isResolvedOrClosed && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 1.6, ease: 'easeInOut', repeat: 1, repeatDelay: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"
            />
          )}

          {/* Toast Header */}
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.1 }}
                className={`p-2 rounded-xl border ${theme.badgeBg} shadow-inner shrink-0`}
              >
                <StatusIcon className={`w-5 h-5 ${theme.accent}`} />
              </motion.div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
                    {lang === 'bn' ? 'স্ট্যাটাস আপডেট সফল' : 'Status Updated'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-bold text-xs bg-slate-800 text-teal-300 px-2 py-0.5 rounded border border-slate-700">
                    #{feedback.ticketId}
                  </span>
                  <span className="text-xs font-bold text-slate-200 truncate max-w-[180px]">
                    {feedback.clientName || feedback.title}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Status Transition Visual Indicator */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 relative z-10 text-xs">
            <div className="flex items-center gap-1.5">
              {feedback.previousStatus && feedback.previousStatus !== feedback.status ? (
                <>
                  <span className="text-slate-400 font-mono text-[11px] line-through opacity-70">
                    {feedback.previousStatus}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </>
              ) : null}

              <motion.span
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22, delay: 0.15 }}
                className={`px-2.5 py-0.5 rounded-lg font-bold font-mono text-[11px] border ${theme.badgeBg} flex items-center gap-1.5`}
              >
                <Check className="w-3 h-3 text-emerald-400" />
                <span>{lang === 'bn' ? theme.labelBn : theme.labelEn}</span>
              </motion.span>
            </div>

            {onViewTicket && (
              <button
                onClick={() => onViewTicket(feedback.ticketId)}
                className="text-[11px] font-bold text-teal-400 hover:text-teal-300 hover:underline flex items-center gap-1 transition-colors"
              >
                <span>{lang === 'bn' ? 'টিকেট দেখুন' : 'View Ticket'}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Auto-dismiss countdown bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/60 overflow-hidden">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 4.5, ease: 'linear' }}
              className={`h-full ${
                feedback.status === 'Resolved' || feedback.status === 'Closed'
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : feedback.status === 'In_Progress'
                  ? 'bg-amber-400'
                  : 'bg-teal-400'
              }`}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
