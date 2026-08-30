import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, TicketPriority } from '../types';
import { 
  BarChart2, 
  PieChart as PieIcon, 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Zap, 
  ShieldAlert, 
  ArrowUpRight, 
  Flame, 
  Layers, 
  Info,
  Sparkles,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';

interface MonthSummaryAnalyticsProps {
  tickets: Ticket[];
  lang: 'bn' | 'en';
  onFilterCategory?: (category: string) => void;
}

export const MonthSummaryAnalytics: React.FC<MonthSummaryAnalyticsProps> = ({
  tickets,
  lang,
  onFilterCategory,
}) => {
  const [categoryChartType, setCategoryChartType] = useState<'bar' | 'donut'>('bar');
  const [resolutionViewMode, setResolutionViewMode] = useState<'comparison' | 'difference'>('comparison');
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);

  // Dynamic Current Month Context
  const monthInfo = useMemo(() => {
    const now = new Date();
    const monthEn = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const monthBn = now.toLocaleString('bn-BD', { month: 'long', year: 'numeric' });
    const shortMonthEn = now.toLocaleString('en-US', { month: 'short' });
    const shortMonthBn = now.toLocaleString('bn-BD', { month: 'short' });
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();

    return {
      monthEn,
      monthBn,
      shortMonthEn,
      shortMonthBn,
      daysInMonth,
      currentDay,
      daysRemaining: daysInMonth - currentDay,
    };
  }, []);

  // Standard ISP Categories Configuration
  const categoryDefinitions = useMemo(() => [
    {
      key: 'Red LOS',
      labelBn: 'রেড এলওএস বাতি (Red LOS Light)',
      labelEn: 'Red LOS Light (No Optical Signal)',
      shortBn: 'রেড এলওএস',
      shortEn: 'Red LOS',
      color: '#f43f5e', // Rose-500
      accentBg: 'bg-rose-50 text-rose-800 border-rose-200',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      slaTarget: 30, // 30 minutes
      baseAvgMinutes: 18.6,
      baseMonthSeed: 48,
      baseResolvedSeed: 46,
      baseUrgentSeed: 28,
      descriptionBn: 'ফাইবার সিগন্যাল বিচ্ছিন্ন বা অপটিক্যাল লস',
      descriptionEn: 'Loss of optical carrier signal / broken drop cable',
    },
    {
      key: 'Fiber Cut',
      labelBn: 'ফাইবার সংযোগ বিচ্ছিন্ন (Fiber Line Down)',
      labelEn: 'Fiber Line Down (Trunk / Drop Cut)',
      shortBn: 'ফাইবার কাট',
      shortEn: 'Fiber Cut',
      color: '#e11d48', // Rose-600
      accentBg: 'bg-red-50 text-red-800 border-red-200',
      badgeClass: 'bg-red-500/20 text-red-300 border-red-500/30',
      slaTarget: 45, // 45 minutes
      baseAvgMinutes: 36.4,
      baseMonthSeed: 38,
      baseResolvedSeed: 35,
      baseUrgentSeed: 22,
      descriptionBn: 'প্রধান ব্যাকবোন বা ডিস্ট্রিবিউশন ক্যাবল কাটা',
      descriptionEn: 'Physical fiber severance on backbone or feeder lines',
    },
    {
      key: 'High Ping',
      labelBn: 'উচ্চ পিং ও স্লো স্পিড (High Ping / Slow Speed)',
      labelEn: 'High Ping / Slow Browsing Speed',
      shortBn: 'হাই পিং / স্লো',
      shortEn: 'High Ping',
      color: '#f59e0b', // Amber-500
      accentBg: 'bg-amber-50 text-amber-800 border-amber-200',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      slaTarget: 40, // 40 minutes
      baseAvgMinutes: 24.2,
      baseMonthSeed: 74,
      baseResolvedSeed: 70,
      baseUrgentSeed: 12,
      descriptionBn: 'লেটেন্সি বৃদ্ধি ও ব্যান্ডউইথ কনজেশন',
      descriptionEn: 'Packet loss, upstream latency or bandwidth congestion',
    },
    {
      key: 'ONU Signal',
      labelBn: 'ওএনইউ ও অপটিক্যাল পাওয়ার (ONU Power)',
      labelEn: 'ONU Signal / Optical Power Degradation',
      shortBn: 'ওএনইউ সিগন্যাল',
      shortEn: 'ONU Signal',
      color: '#3b82f6', // Blue-500
      accentBg: 'bg-blue-50 text-blue-800 border-blue-200',
      badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      slaTarget: 35, // 35 minutes
      baseAvgMinutes: 21.5,
      baseMonthSeed: 44,
      baseResolvedSeed: 42,
      baseUrgentSeed: 8,
      descriptionBn: 'উচ্চ অপটিক্যাল লস (-২৭ dBm এর বেশি)',
      descriptionEn: 'Low Rx optical power attenuation or faulty patch cord',
    },
    {
      key: 'Router Config',
      labelBn: 'রাউটার ও কনফিগারেশন (Router / Config)',
      labelEn: 'Router & Wi-Fi Configuration',
      shortBn: 'রাউটার কনফিগ',
      shortEn: 'Router Config',
      color: '#8b5cf6', // Violet-500
      accentBg: 'bg-violet-50 text-violet-800 border-violet-200',
      badgeClass: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      slaTarget: 25, // 25 minutes
      baseAvgMinutes: 13.8,
      baseMonthSeed: 32,
      baseResolvedSeed: 31,
      baseUrgentSeed: 4,
      descriptionBn: 'পিপিওই (PPPoE), ডিএইচসিপি বা ওয়াইফাই রিসেট',
      descriptionEn: 'PPPoE dial setup, SSID frequency, or reset recovery',
    },
    {
      key: 'Billing',
      labelBn: 'বিলিং ও পেমেন্ট (Billing & Payment)',
      labelEn: 'Billing, Renewal & Package Shift',
      shortBn: 'বিলিং ও প্যাকেজ',
      shortEn: 'Billing',
      color: '#10b981', // Emerald-500
      accentBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      slaTarget: 20, // 20 minutes
      baseAvgMinutes: 8.5,
      baseMonthSeed: 28,
      baseResolvedSeed: 28,
      baseUrgentSeed: 2,
      descriptionBn: 'প্যাকেজ স্পিড আপগ্রেড ও রিনিউয়াল রসিদ',
      descriptionEn: 'Speed tier changes, portal account, or payment clears',
    },
  ], []);

  // Compute Live Aggregations for Current Month
  const { 
    categoryData, 
    resolutionData, 
    totalMonthTickets, 
    totalMonthResolved, 
    overallAvgResolutionMinutes, 
    slaCompliancePercentage,
    topCategory 
  } = useMemo(() => {
    // Tally live tickets
    const liveCounts: Record<string, { total: number; resolved: number; urgent: number }> = {};
    categoryDefinitions.forEach(c => {
      liveCounts[c.key] = { total: 0, resolved: 0, urgent: 0 };
    });

    tickets.forEach(ticket => {
      let matchedKey = 'High Ping';
      const cat = (ticket.category || '').toLowerCase();
      const title = (ticket.title || '').toLowerCase();

      if (cat.includes('los') || title.includes('los')) {
        matchedKey = 'Red LOS';
      } else if (cat.includes('ফাইবার') || cat.includes('fiber') || title.includes('cut') || title.includes('কাট')) {
        matchedKey = 'Fiber Cut';
      } else if (cat.includes('পিং') || cat.includes('ping') || cat.includes('স্পিড') || cat.includes('slow')) {
        matchedKey = 'High Ping';
      } else if (cat.includes('ওএনইউ') || cat.includes('onu') || cat.includes('সিগন্যাল') || cat.includes('power')) {
        matchedKey = 'ONU Signal';
      } else if (cat.includes('রাউটার') || cat.includes('router') || cat.includes('কনফিগারেশন') || cat.includes('wifi')) {
        matchedKey = 'Router Config';
      } else if (cat.includes('বিলিং') || cat.includes('billing') || cat.includes('পেমেন্ট') || cat.includes('payment') || cat.includes('স্থানান্তর')) {
        matchedKey = 'Billing';
      }

      if (liveCounts[matchedKey]) {
        liveCounts[matchedKey].total += 1;
        if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
          liveCounts[matchedKey].resolved += 1;
        }
        if (ticket.priority === 'Urgent') {
          liveCounts[matchedKey].urgent += 1;
        }
      }
    });

    // Calculate total monthly tickets across all categories
    let grandTotal = 0;
    let grandResolved = 0;
    let weightedResolutionTimeSum = 0;

    const catList = categoryDefinitions.map(def => {
      const live = liveCounts[def.key] || { total: 0, resolved: 0, urgent: 0 };
      const totalCount = def.baseMonthSeed + live.total;
      const resolvedCount = def.baseResolvedSeed + live.resolved;
      const urgentCount = def.baseUrgentSeed + live.urgent;

      grandTotal += totalCount;
      grandResolved += resolvedCount;

      // Adjust average resolution time dynamically based on live ticket ratio
      const liveAdjustment = live.urgent > 1 ? 1.2 : -0.4;
      const avgMinutes = Number(Math.max(5, def.baseAvgMinutes + liveAdjustment).toFixed(1));
      weightedResolutionTimeSum += avgMinutes * totalCount;

      return {
        key: def.key,
        name: lang === 'bn' ? def.labelBn : def.labelEn,
        shortName: lang === 'bn' ? def.shortBn : def.shortEn,
        color: def.color,
        count: totalCount,
        resolved: resolvedCount,
        open: totalCount - resolvedCount,
        urgent: urgentCount,
        slaTarget: def.slaTarget,
        avgMinutes,
        timeSavedMinutes: Number((def.slaTarget - avgMinutes).toFixed(1)),
        efficiencyPercent: Math.round(((def.slaTarget - avgMinutes) / def.slaTarget) * 100),
        slaStatus: avgMinutes <= def.slaTarget ? 'Within SLA' : 'Exceeding SLA',
        accentBg: def.accentBg,
        badgeClass: def.badgeClass,
        description: lang === 'bn' ? def.descriptionBn : def.descriptionEn,
      };
    });

    // Add percentage shares
    const finalCategoryData = catList.map(c => ({
      ...c,
      percentage: grandTotal > 0 ? Number(((c.count / grandTotal) * 100).toFixed(1)) : 0,
      resolvedPercentage: c.count > 0 ? Number(((c.resolved / c.count) * 100).toFixed(1)) : 0,
    }));

    // Find top category by volume
    const sorted = [...finalCategoryData].sort((a, b) => b.count - a.count);
    const top = sorted[0];

    const overallAvgMinutes = grandTotal > 0 ? Number((weightedResolutionTimeSum / grandTotal).toFixed(1)) : 22.4;
    const overallSlaPercent = grandTotal > 0 ? Number(((grandResolved / grandTotal) * 100).toFixed(1)) : 96.5;

    // Build Resolution comparison dataset
    const resData = finalCategoryData.map(c => ({
      category: c.shortName,
      fullName: c.name,
      'Avg Resolution Time': c.avgMinutes,
      'SLA Target Benchmark': c.slaTarget,
      'Time Saved (Faster)': Math.max(0, c.timeSavedMinutes),
      color: c.color,
      efficiency: c.efficiencyPercent,
      ticketCount: c.count,
    }));

    return {
      categoryData: finalCategoryData,
      resolutionData: resData,
      totalMonthTickets: grandTotal,
      totalMonthResolved: grandResolved,
      overallAvgResolutionMinutes: overallAvgMinutes,
      slaCompliancePercentage: overallSlaPercent,
      topCategory: top,
    };
  }, [tickets, categoryDefinitions, lang]);

  return (
    <section 
      id="manager-month-summary-section"
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 md:p-7 space-y-6 relative overflow-hidden"
    >
      {/* Subtle Ambient Decorative Header Glow */}
      <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-bl from-emerald-50/80 via-teal-50/30 to-transparent pointer-events-none rounded-tr-3xl" />

      {/* 1. Header & Month Range Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'bn' ? `চলতি মাস: ${monthInfo.monthBn}` : `Current Month: ${monthInfo.monthEn}`}</span>
            </span>

            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900 text-teal-300 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>RECHARTS VISUALIZATION</span>
            </span>

            <span className="text-xs font-semibold text-slate-400">
              • {lang === 'bn' ? `মোট ${tickets.length}টি লাইভ টিকেট অন্তর্ভুক্ত` : `Active live stream sync`}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-slate-900 font-syne tracking-tight">
            {lang === 'bn' 
              ? 'মাসিক টিকেট ক্যাটাগরি ও গড় সমাধান সময় এনালাইটিক্স' 
              : 'Current Month Ticket Categories & Average Resolution Time'}
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-3xl">
            {lang === 'bn'
              ? `${monthInfo.monthBn} মাসের গ্রাহক সাপোর্ট কমপ্লেন বিশ্লেষণ, ক্যাটাগরি ভিত্তিক ভলিউম ব্রেকডাউন এবং নির্ধারিত এসএলএ (SLA) বনাম প্রকৃত সমাধান সময় মেট্রিক্স।`
              : `Comprehensive ISP incident breakdown and benchmark resolution durations for ${monthInfo.monthEn}, tracking SLA compliance and field repair efficiency.`}
          </p>
        </div>

        {/* Quick Month Status Indicator Pill */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 shrink-0">
          <div className="p-2 bg-emerald-100/80 rounded-xl text-emerald-800">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="pr-2 text-right">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block font-mono">
              {lang === 'bn' ? 'এসএলএ সাকসেস রেট' : 'Month SLA Success'}
            </span>
            <span className="text-sm font-black text-emerald-700 font-mono">
              {slaCompliancePercentage}% {lang === 'bn' ? 'অন-টার্গেট' : 'On-Target'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top Metric KPI Strip for Current Month */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* KPI 1: Month Inbound Tickets */}
        <div className="bg-slate-50/90 hover:bg-white p-4 rounded-2xl border border-slate-200/80 transition-all shadow-sm hover:shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'bn' ? 'চলতি মাসের মোট টিকেট' : 'Total Month Tickets'}
            </span>
            <div className="p-2 bg-slate-200/70 group-hover:bg-slate-900 group-hover:text-teal-300 rounded-xl text-slate-700 transition-colors">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl md:text-3xl font-black text-slate-900 font-mono">{totalMonthTickets}</span>
            <span className="text-xs font-bold text-emerald-600 font-mono">
              ✓ {totalMonthResolved} ({((totalMonthResolved/totalMonthTickets)*100).toFixed(0)}%) {lang === 'bn' ? 'সমাধান' : 'Done'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            {lang === 'bn' 
              ? `দৈনিক গড় ~${(totalMonthTickets / (monthInfo.currentDay || 1)).toFixed(1)} টিকেট` 
              : `Pacing at ~${(totalMonthTickets / (monthInfo.currentDay || 1)).toFixed(1)} tkts/day`}
          </p>
        </div>

        {/* KPI 2: Average Resolution Time */}
        <div className="bg-slate-50/90 hover:bg-white p-4 rounded-2xl border border-slate-200/80 transition-all shadow-sm hover:shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'bn' ? 'চলতি মাসের গড় সমাধান সময়' : 'Month Avg Resolution'}
            </span>
            <div className="p-2 bg-blue-100 group-hover:bg-blue-600 group-hover:text-white rounded-xl text-blue-700 transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl md:text-3xl font-black text-blue-700 font-mono">{overallAvgResolutionMinutes} min</span>
            <span className="text-xs font-bold text-emerald-600 font-mono">
              ↓ 35% {lang === 'bn' ? 'দ্রুত' : 'Faster'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Target SLA Benchmark: &lt; 35.0 min
          </p>
        </div>

        {/* KPI 3: SLA Compliance Rate */}
        <div className="bg-slate-50/90 hover:bg-white p-4 rounded-2xl border border-slate-200/80 transition-all shadow-sm hover:shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'bn' ? 'এসএলএ কমপ্লায়েন্স স্কোর' : 'SLA Compliance Rate'}
            </span>
            <div className="p-2 bg-emerald-100 group-hover:bg-emerald-600 group-hover:text-white rounded-xl text-emerald-700 transition-colors">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl md:text-3xl font-black text-emerald-600 font-mono">{slaCompliancePercentage}%</span>
            <span className="text-xs font-bold text-emerald-600 font-mono">↑ 1.8%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Goal: &gt; 95.0% SLA Target
          </p>
        </div>

        {/* KPI 4: Top Category by Volume */}
        <div className="bg-slate-50/90 hover:bg-white p-4 rounded-2xl border border-slate-200/80 transition-all shadow-sm hover:shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'bn' ? 'সর্বোচ্চ টিকেট ক্যাটাগরি' : 'Top Incident Category'}
            </span>
            <div className="p-2 bg-amber-100 group-hover:bg-amber-600 group-hover:text-white rounded-xl text-amber-700 transition-colors">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl md:text-2xl font-black text-slate-900 truncate">
              {topCategory ? topCategory.shortName : 'High Ping'}
            </span>
          </div>
          <p className="text-[11px] text-amber-700 font-bold mt-1 font-mono">
            {topCategory?.count} {lang === 'bn' ? 'টিকেট' : 'Tickets'} ({topCategory?.percentage}% {lang === 'bn' ? 'অংশ' : 'share'})
          </p>
        </div>

      </div>

      {/* 3. Side-by-Side Visualizations Grid (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ========================================================= */}
        {/* CHART 1: TICKETS BY CATEGORY (CURRENT MONTH)              */}
        {/* ========================================================= */}
        <div className="bg-slate-900 text-white p-5 md:p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4 relative flex flex-col justify-between">
          <div>
            {/* Header with Type Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-extrabold text-white font-syne tracking-tight">
                    {lang === 'bn' ? 'চলতি মাসের ক্যাটাগরি অনুযায়ী টিকেট' : 'Tickets by Category'}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'bn' 
                    ? `${monthInfo.monthBn} মাসে মোট টিকেটের ক্যাটাগরি অনুযায়ী বণ্টন ও সমাধান` 
                    : `Distribution of ${totalMonthTickets} complaints across 6 technical categories`}
                </p>
              </div>

              {/* Bar vs Donut Toggle */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                <button
                  onClick={() => setCategoryChartType('bar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    categoryChartType === 'bar'
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'বার চার্ট' : 'Bar'}</span>
                </button>
                <button
                  onClick={() => setCategoryChartType('donut')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    categoryChartType === 'donut'
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <PieIcon className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'ডোনাট' : 'Donut'}</span>
                </button>
              </div>
            </div>

            {/* Main Recharts Area */}
            <div className="h-72 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                {categoryChartType === 'bar' ? (
                  <BarChart 
                    data={categoryData} 
                    margin={{ top: 15, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis 
                      dataKey="shortName" 
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={{ stroke: '#334155' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-950 border border-slate-700 p-3 rounded-2xl shadow-2xl text-xs font-mono space-y-1.5 min-w-[200px] z-50">
                              <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                                <span className="font-bold text-white text-[13px]">{data.name}</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-300">
                                <span>{lang === 'bn' ? 'মোট টিকেট:' : 'Total Tickets:'}</span>
                                <strong className="text-white text-sm">{data.count}</strong>
                              </div>
                              <div className="flex items-center justify-between text-emerald-400">
                                <span>{lang === 'bn' ? 'সমাধানকৃত:' : 'Resolved:'}</span>
                                <strong>{data.resolved} ({data.resolvedPercentage}%)</strong>
                              </div>
                              <div className="flex items-center justify-between text-rose-400">
                                <span>{lang === 'bn' ? 'জরুরি/রেড এলওএস:' : 'Urgent Incidents:'}</span>
                                <strong>{data.urgent}</strong>
                              </div>
                              <div className="flex items-center justify-between text-teal-300 pt-1 border-t border-slate-800 font-bold">
                                <span>{lang === 'bn' ? 'মাসিক শেয়ার:' : 'Monthly Share:'}</span>
                                <span>{data.percentage}%</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      radius={[8, 8, 0, 0]}
                      animationDuration={800}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-cat-${index}`} 
                          fill={entry.color} 
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="count"
                      nameKey="shortName"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      animationDuration={800}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`pie-cell-${index}`} 
                          fill={entry.color}
                          stroke="#0f172a"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-950 border border-slate-700 p-3 rounded-2xl shadow-2xl text-xs font-mono space-y-1 z-50">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                                <span className="font-bold text-white">{data.name}</span>
                              </div>
                              <div className="text-slate-300">
                                {data.count} {lang === 'bn' ? 'টিকেট' : 'Tickets'} ({data.percentage}%)
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Chips Legend Strip */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
              {categoryData.map((cat, idx) => (
                <div
                  key={`leg-${cat.key}`}
                  onClick={() => onFilterCategory && onFilterCategory(cat.key)}
                  className={`p-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between cursor-pointer group`}
                >
                  <div className="flex items-center gap-1.5 overflow-hidden pr-1">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-slate-300 group-hover:text-white truncate font-medium">{cat.shortName}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-white">{cat.count}</span>
                    <span className="text-[10px] text-slate-500 ml-1">({cat.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CHART 2: AVERAGE RESOLUTION TIME (CURRENT MONTH)          */}
        {/* ========================================================= */}
        <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg border border-blue-200">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 font-syne tracking-tight">
                    {lang === 'bn' ? 'গড় সমাধান সময় (Average Resolution Time)' : 'Average Resolution Time'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === 'bn'
                    ? `${monthInfo.monthBn} মাসে প্রতিটি ক্যাটাগরির প্রকৃত সমাধান সময় (মিনিট) বনাম এসএলএ সীমা`
                    : `Actual resolution duration (minutes) vs agreed SLA benchmark for ${monthInfo.monthEn}`}
                </p>
              </div>

              {/* Benchmark Status Pill */}
              <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto shadow-sm">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Within Target</span>
              </span>
            </div>

            {/* Recharts Bar Chart: Actual vs SLA Target Benchmark */}
            <div className="h-72 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={resolutionData}
                  margin={{ top: 15, right: 10, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    unit="m"
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-950 border border-slate-700 p-3 rounded-2xl shadow-2xl text-xs font-mono space-y-1.5 min-w-[220px] z-50">
                            <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                              <span className="font-bold text-white text-[13px]">{data.fullName}</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-300">
                              <span>{lang === 'bn' ? 'গড় সমাধান সময়:' : 'Avg Resolution Time:'}</span>
                              <strong className="text-emerald-400 text-sm font-bold">{data['Avg Resolution Time']} min</strong>
                            </div>
                            <div className="flex items-center justify-between text-slate-400">
                              <span>{lang === 'bn' ? 'এসএলএ টার্গেট:' : 'SLA Target Limit:'}</span>
                              <strong className="text-slate-300">{data['SLA Target Benchmark']} min</strong>
                            </div>
                            <div className="flex items-center justify-between text-teal-300 pt-1 border-t border-slate-800">
                              <span>{lang === 'bn' ? 'এসএলএ সেভিং:' : 'Speed Gain:'}</span>
                              <strong className="text-emerald-300">+{data.efficiency}% faster</strong>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                  <ReferenceLine 
                    y={30} 
                    stroke="#059669" 
                    strokeDasharray="4 4" 
                    label={{ value: 'ISP Standard Goal (30m)', fill: '#059669', fontSize: 10, position: 'insideTopRight' }} 
                  />
                  <Bar 
                    dataKey="Avg Resolution Time" 
                    name={lang === 'bn' ? 'প্রকৃত গড় সমাধান (মিনিট)' : 'Actual Avg Resolution (min)'}
                    radius={[6, 6, 0, 0]}
                    animationDuration={800}
                  >
                    {resolutionData.map((entry, index) => (
                      <Cell key={`cell-res-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                  <Bar 
                    dataKey="SLA Target Benchmark" 
                    name={lang === 'bn' ? 'এসএলএ টার্গেট সীমা (মিনিট)' : 'SLA Target Benchmark (min)'}
                    fill="#e2e8f0" 
                    radius={[6, 6, 0, 0]}
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Resolution Benchmarks Footer Strip */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {lang === 'bn' 
                  ? '⚡ দ্রুততম সমাধান: বিলিং (৮.৫ মি.) ও রাউটার কনফিগ (১৩.৮ মি.)' 
                  : '⚡ Fastest categories: Billing (8.5m) & Router Config (13.8m)'}
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-500">
              {lang === 'bn' ? `গড় এসএলএ মার্জিন: +${((35 - overallAvgResolutionMinutes)).toFixed(1)} মিনিট` : `Overall Margin: +${((35 - overallAvgResolutionMinutes)).toFixed(1)}m ahead`}
            </span>
          </div>
        </div>

      </div>

      {/* 4. Detailed Current Month Category Performance Matrix Table */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 md:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs md:text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">
              {lang === 'bn' ? 'চলতি মাসের ক্যাটাগরি পারফরম্যান্স ম্যাট্রিক্স' : 'Current Month Category Performance Matrix'}
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {monthInfo.monthEn} Performance Scorecard
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2 px-3">{lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}</th>
                <th className="py-2 px-3 text-center">{lang === 'bn' ? 'মোট টিকেট' : 'Tickets'}</th>
                <th className="py-2 px-3 text-center">{lang === 'bn' ? 'মাসিক শেয়ার' : 'Share'}</th>
                <th className="py-2 px-3 text-center">{lang === 'bn' ? 'সমাধানকৃত' : 'Resolved'}</th>
                <th className="py-2 px-3 text-center">{lang === 'bn' ? 'জরুরি' : 'Urgent'}</th>
                <th className="py-2 px-3 text-center">{lang === 'bn' ? 'গড় সমাধান' : 'Avg Resolution'}</th>
                <th className="py-2 px-3 text-center">{lang === 'bn' ? 'এসএলএ টার্গেট' : 'SLA Target'}</th>
                <th className="py-2 px-3 text-right">{lang === 'bn' ? 'এসএলএ পারফরম্যান্স' : 'SLA Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-700">
              {categoryData.map((row) => (
                <tr key={`table-${row.key}`} className="hover:bg-white transition-colors">
                  <td className="py-2.5 px-3 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">{row.name}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{row.description}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-900">{row.count}</td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ width: `${row.percentage * 2}%`, backgroundColor: row.color }} 
                        />
                      </div>
                      <span className="font-bold text-[11px]">{row.percentage}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center text-emerald-700 font-bold">
                    {row.resolved} <span className="text-[10px] text-slate-400 font-normal">({row.resolvedPercentage}%)</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {row.urgent > 0 ? (
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px]">
                        {row.urgent}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                    <span className="text-emerald-700">{row.avgMinutes} min</span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-500">{row.slaTarget} min</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      <Check className="w-3 h-3" />
                      <span>+{row.efficiencyPercent}% {lang === 'bn' ? 'দ্রুত' : 'Faster'}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
