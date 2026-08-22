import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TicketStatus } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  Activity, 
  Check, 
  Lock, 
  UserCheck, 
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface TicketStatusBadgeProps {
  status: TicketStatus;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  lang?: 'bn' | 'en';
  showIcon?: boolean;
  showRipple?: boolean;
  className?: string;
  isRecentlyUpdated?: boolean;
}

export const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({
  status,
  size = 'sm',
  lang = 'bn',
  showIcon = true,
  showRipple = true,
  className = '',
  isRecentlyUpdated = false,
}) => {
  // Label and configuration per status
  const getStatusConfig = () => {
    switch (status) {
      case 'Resolved':
        return {
          labelBn: 'সমাধান হয়েছে (Resolved)',
          labelEn: 'Resolved',
          shortBn: 'সমাধানকৃত',
          shortEn: 'Resolved',
          icon: CheckCircle2,
          bgClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35 shadow-emerald-950/20',
          dotColor: 'bg-emerald-400',
          glowClass: 'shadow-[0_0_12px_rgba(52,211,153,0.35)]',
          rippleColor: 'rgba(52, 211, 153, 0.45)',
          accentColor: 'text-emerald-400',
        };
      case 'Closed':
        return {
          labelBn: 'টিকেট বন্ধ (Closed)',
          labelEn: 'Closed & Archived',
          shortBn: 'বন্ধ (Closed)',
          shortEn: 'Closed',
          icon: ShieldCheck,
          bgClass: 'bg-teal-500/15 text-teal-300 border-teal-500/35 shadow-teal-950/20',
          dotColor: 'bg-teal-400',
          glowClass: 'shadow-[0_0_12px_rgba(45,212,191,0.35)]',
          rippleColor: 'rgba(45, 212, 191, 0.45)',
          accentColor: 'text-teal-400',
        };
      case 'In_Progress':
        return {
          labelBn: 'কাজ চলছে (In Progress)',
          labelEn: 'In Progress',
          shortBn: 'কাজ চলছে',
          shortEn: 'In Progress',
          icon: Activity,
          bgClass: 'bg-amber-500/15 text-amber-300 border-amber-500/35 shadow-amber-950/20',
          dotColor: 'bg-amber-400',
          glowClass: 'shadow-[0_0_12px_rgba(251,191,36,0.3)]',
          rippleColor: 'rgba(251, 191, 36, 0.4)',
          accentColor: 'text-amber-400',
        };
      case 'NOC_Assigned':
        return {
          labelBn: 'নোক নিযুক্ত (Assigned)',
          labelEn: 'NOC Assigned',
          shortBn: 'অ্যাসাইনড',
          shortEn: 'Assigned',
          icon: UserCheck,
          bgClass: 'bg-blue-500/15 text-blue-300 border-blue-500/35 shadow-blue-950/20',
          dotColor: 'bg-blue-400',
          glowClass: 'shadow-[0_0_12px_rgba(96,165,250,0.3)]',
          rippleColor: 'rgba(96, 165, 250, 0.4)',
          accentColor: 'text-blue-400',
        };
      case 'Open':
      default:
        return {
          labelBn: 'নতুন পেন্ডিং (Open)',
          labelEn: 'Open (Pending)',
          shortBn: 'পেন্ডিং (Open)',
          shortEn: 'Open',
          icon: Clock,
          bgClass: 'bg-slate-800/80 text-slate-300 border-slate-700/80 shadow-slate-950/20',
          dotColor: 'bg-rose-400',
          glowClass: '',
          rippleColor: 'rgba(244, 63, 94, 0.35)',
          accentColor: 'text-rose-400',
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;
  const isClosedOrResolved = status === 'Resolved' || status === 'Closed';

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px] gap-1',
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-xs md:text-sm gap-2',
    lg: 'px-4 py-2 text-sm md:text-base gap-2.5 font-bold',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5',
  };

  return (
    <div className="inline-flex items-center relative">
      <AnimatePresence mode="wait">
        <motion.span
          key={status}
          initial={{ scale: 0.84, opacity: 0, y: -2 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.84, opacity: 0, y: 2 }}
          transition={{ 
            type: 'spring', 
            stiffness: 450, 
            damping: 24,
            mass: 0.8
          }}
          className={`relative inline-flex items-center rounded-xl font-bold font-mono tracking-tight border backdrop-blur-sm shadow-sm select-none transition-colors ${config.bgClass} ${config.glowClass} ${sizeClasses[size]} ${className}`}
        >
          {/* Subtle Ripple/Pulse wave on Resolved/Closed or Recently Updated */}
          {(showRipple && (isClosedOrResolved || isRecentlyUpdated)) && (
            <motion.span
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: [0.95, 1.25, 1.4], opacity: [0.7, 0.25, 0] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute inset-0 rounded-xl pointer-events-none -z-10"
              style={{
                border: `1.5px solid ${config.rippleColor}`,
                backgroundColor: config.rippleColor,
              }}
            />
          )}

          {/* Icon with subtle spring entry */}
          {showIcon && (
            <motion.span
              initial={{ rotate: -15, scale: 0.7 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="shrink-0"
            >
              <IconComponent className={`${iconSizes[size]} ${config.accentColor}`} />
            </motion.span>
          )}

          {/* Status Label */}
          <span className="truncate">
            {size === 'xs' || size === 'sm'
              ? (lang === 'bn' ? config.shortBn : config.shortEn)
              : (lang === 'bn' ? config.labelBn : config.labelEn)}
          </span>

          {/* Status Pulse Dot */}
          <span className="relative flex h-2 w-2 ml-0.5 shrink-0">
            {isClosedOrResolved ? (
              <span className={`inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
            ) : (
              <>
                <motion.span
                  animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className={`absolute inline-flex h-full w-full rounded-full ${config.dotColor} opacity-75`}
                />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
              </>
            )}
          </span>
        </motion.span>
      </AnimatePresence>
    </div>
  );
};
