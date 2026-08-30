import React from 'react';
import { motion } from 'motion/react';
import { TicketPriority } from '../types';
import { 
  AlertOctagon, 
  Flame, 
  Info,
} from 'lucide-react';

export interface PriorityColorConfig {
  name: 'Urgent' | 'High' | 'Normal';
  colorName: 'Red' | 'Yellow' | 'Blue';
  labelBn: string;
  labelEn: string;
  shortBn: string;
  shortEn: string;
  borderLClass: string;
  borderClassDark: string;
  borderClassLight: string;
  bgDark: string;
  bgLight: string;
  bgGradientDark: string;
  bgGradientLight: string;
  badgeDarkClass: string;
  badgeLightClass: string;
  dotColor: string;
  dotPing: string;
  iconColorDark: string;
  iconColorLight: string;
  glow: string;
  barColor: string;
  isPulsing: boolean;
  pillColorDark: string;
  pillColorLight: string;
}

export const getPriorityColorConfig = (priority: TicketPriority | 'Normal' | string): PriorityColorConfig => {
  switch (priority) {
    case 'Urgent':
      return {
        name: 'Urgent',
        colorName: 'Red',
        labelBn: 'জরুরি (Urgent - Red)',
        labelEn: 'Urgent (Red Indicator)',
        shortBn: 'জরুরি (Red)',
        shortEn: 'Urgent (Red)',
        borderLClass: 'border-l-4 border-l-rose-500',
        borderClassDark: 'border-rose-500/40',
        borderClassLight: 'border-rose-300',
        bgDark: 'bg-rose-950/20',
        bgLight: 'bg-rose-50/40',
        bgGradientDark: 'bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-900',
        bgGradientLight: 'bg-gradient-to-r from-rose-50/60 via-white to-white',
        badgeDarkClass: 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-rose-950/30',
        badgeLightClass: 'bg-rose-100 text-rose-800 border-rose-300 shadow-rose-100/50',
        dotColor: 'bg-rose-500',
        dotPing: 'bg-rose-400',
        iconColorDark: 'text-rose-400',
        iconColorLight: 'text-rose-600',
        glow: 'shadow-[0_0_12px_rgba(244,63,94,0.3)]',
        barColor: 'bg-rose-500',
        isPulsing: true,
        pillColorDark: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        pillColorLight: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    case 'High':
      return {
        name: 'High',
        colorName: 'Yellow',
        labelBn: 'উচ্চ (High - Yellow)',
        labelEn: 'High (Yellow Indicator)',
        shortBn: 'উচ্চ (Yellow)',
        shortEn: 'High (Yellow)',
        borderLClass: 'border-l-4 border-l-yellow-400',
        borderClassDark: 'border-yellow-500/40',
        borderClassLight: 'border-yellow-300',
        bgDark: 'bg-yellow-950/20',
        bgLight: 'bg-yellow-50/40',
        bgGradientDark: 'bg-gradient-to-r from-yellow-950/30 via-slate-900 to-slate-900',
        bgGradientLight: 'bg-gradient-to-r from-yellow-50/60 via-white to-white',
        badgeDarkClass: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40 shadow-yellow-950/30',
        badgeLightClass: 'bg-yellow-100 text-yellow-900 border-yellow-300 shadow-yellow-100/50',
        dotColor: 'bg-yellow-400',
        dotPing: 'bg-yellow-300',
        iconColorDark: 'text-yellow-400',
        iconColorLight: 'text-yellow-700',
        glow: 'shadow-[0_0_10px_rgba(234,179,8,0.25)]',
        barColor: 'bg-yellow-400',
        isPulsing: false,
        pillColorDark: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        pillColorLight: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      };
    case 'Medium':
    case 'Low':
    case 'Normal':
    default:
      return {
        name: 'Normal',
        colorName: 'Blue',
        labelBn: 'স্বাভাবিক (Normal - Blue)',
        labelEn: 'Normal (Blue Indicator)',
        shortBn: 'স্বাভাবিক (Blue)',
        shortEn: 'Normal (Blue)',
        borderLClass: 'border-l-4 border-l-blue-500',
        borderClassDark: 'border-blue-500/40',
        borderClassLight: 'border-blue-300',
        bgDark: 'bg-blue-950/20',
        bgLight: 'bg-blue-50/40',
        bgGradientDark: 'bg-gradient-to-r from-blue-950/30 via-slate-900 to-slate-900',
        bgGradientLight: 'bg-gradient-to-r from-blue-50/60 via-white to-white',
        badgeDarkClass: 'bg-blue-500/15 text-blue-300 border-blue-500/40 shadow-blue-950/30',
        badgeLightClass: 'bg-blue-100 text-blue-800 border-blue-300 shadow-blue-100/50',
        dotColor: 'bg-blue-500',
        dotPing: 'bg-blue-400',
        iconColorDark: 'text-blue-400',
        iconColorLight: 'text-blue-600',
        glow: 'shadow-[0_0_8px_rgba(59,130,246,0.2)]',
        barColor: 'bg-blue-500',
        isPulsing: false,
        pillColorDark: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        pillColorLight: 'bg-blue-50 text-blue-700 border-blue-200',
      };
  }
};

interface TicketPriorityBadgeProps {
  priority: TicketPriority | 'Normal' | string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  lang?: 'bn' | 'en';
  theme?: 'dark' | 'light' | 'auto';
  showIcon?: boolean;
  showDot?: boolean;
  className?: string;
}

export const TicketPriorityBadge: React.FC<TicketPriorityBadgeProps> = ({
  priority,
  size = 'sm',
  lang = 'bn',
  theme = 'auto',
  showIcon = true,
  showDot = true,
  className = '',
}) => {
  const config = getPriorityColorConfig(priority);
  const IconComponent = config.name === 'Urgent' ? AlertOctagon : config.name === 'High' ? Flame : Info;

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

  // Determine color classes based on theme prop
  const themeClasses = theme === 'dark' 
    ? `${config.badgeDarkClass} ${config.glow}` 
    : theme === 'light' 
    ? config.badgeLightClass 
    : `${config.badgeDarkClass} dark:${config.badgeDarkClass}`;

  const iconColor = theme === 'light' ? config.iconColorLight : config.iconColorDark;

  return (
    <motion.span
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className={`inline-flex items-center rounded-xl font-extrabold font-mono tracking-tight border backdrop-blur-sm shadow-sm select-none shrink-0 ${themeClasses} ${sizeClasses[size]} ${className}`}
    >
      {/* Subtle Color-Coded Indicator Dot (Red / Yellow / Blue) */}
      {showDot && (
        <span className="relative flex h-2 w-2 shrink-0">
          {config.isPulsing && (
            <motion.span
              animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className={`absolute inline-flex h-full w-full rounded-full ${config.dotPing} opacity-75`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
        </span>
      )}

      {/* Priority Icon */}
      {showIcon && (
        <IconComponent className={`${iconSizes[size]} ${iconColor} shrink-0`} />
      )}

      {/* Priority Label */}
      <span className="truncate">
        {size === 'xs' || size === 'sm'
          ? (lang === 'bn' ? config.shortBn : config.shortEn)
          : (lang === 'bn' ? config.labelBn : config.labelEn)}
      </span>
    </motion.span>
  );
};
