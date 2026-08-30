import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid, 
  Cell, 
  ComposedChart, 
  Line, 
  Area,
  ReferenceLine 
} from 'recharts';
import { 
  Clock, 
  CheckCircle2, 
  Award, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Zap, 
  Filter, 
  Calendar, 
  Star, 
  Download, 
  Search, 
  Wrench, 
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Check,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { NocStaff, StaffPerformanceMetric, Ticket } from '../types';
import { INITIAL_STAFF_PERFORMANCE } from '../data/mockData';

interface Props {
  nocStaff: NocStaff[];
  tickets: Ticket[];
  lang: 'bn' | 'en';
  onSelectStaffMember?: (staffId: string) => void;
}

export const NocStaffPerformanceDashboard: React.FC<Props> = ({
  nocStaff,
  tickets,
  lang,
  onSelectStaffMember
}) => {
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days' | 'all'>('30days');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bonusSentStaffId, setBonusSentStaffId] = useState<string | null>(null);

  // SLA Benchmark target for response time in minutes
  const SLA_TARGET_MINUTES = 25;

  // Calculate live dynamic metrics merged with historical baseline
  const staffPerformanceData: StaffPerformanceMetric[] = useMemo(() => {
    return INITIAL_STAFF_PERFORMANCE.map(staffMetric => {
      // Find matching staff in current live nocStaff prop
      const liveStaff = nocStaff.find(s => s.id === staffMetric.staffId);
      
      // Calculate ticket assignments from the live tickets list
      const staffTickets = tickets.filter(t => 
        t.assignedNoc && (t.assignedNoc.includes(staffMetric.staffId) || t.assignedNoc.includes(staffMetric.shortName) || t.assignedNoc.includes(staffMetric.staffName))
      );

      const resolvedLive = staffTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
      const activeLive = staffTickets.filter(t => t.status === 'Open' || t.status === 'In_Progress' || t.status === 'NOC_Assigned').length;
      const urgentLive = staffTickets.filter(t => (t.priority === 'Urgent' || t.priority === 'High') && (t.status === 'Resolved' || t.status === 'Closed')).length;

      // Scale metrics according to selected timeRange
      let multiplier = 1;
      if (timeRange === 'today') multiplier = 0.12;
      else if (timeRange === '7days') multiplier = 0.35;
      else if (timeRange === '30days') multiplier = 1.0;
      else multiplier = 1.35;

      const ticketsClosed = Math.max(1, Math.round((staffMetric.ticketsClosed + resolvedLive) * multiplier));
      const urgentResolved = Math.max(0, Math.round((staffMetric.urgentResolved + urgentLive) * multiplier));
      const ticketsActive = liveStaff ? liveStaff.activeTickets : staffMetric.ticketsActive;
      const avgResponseTimeMin = liveStaff?.avgResponseTimeMin || staffMetric.avgResponseTimeMin;
      const slaComplianceRate = liveStaff?.slaAdherenceRate || staffMetric.slaComplianceRate;
      const customerRating = liveStaff?.rating || staffMetric.customerRating;

      return {
        ...staffMetric,
        status: liveStaff ? liveStaff.status : staffMetric.status,
        ticketsClosed,
        ticketsActive,
        urgentResolved,
        avgResponseTimeMin,
        slaComplianceRate,
        customerRating,
        productivityScore: Math.min(100, Math.round(
          (100 - (avgResponseTimeMin * 1.5)) * 0.4 + 
          (slaComplianceRate * 0.4) + 
          (customerRating * 4)
        ))
      };
    });
  }, [nocStaff, tickets, timeRange]);

  // Filtered performance dataset
  const filteredData = useMemo(() => {
    return staffPerformanceData.filter(staff => {
      const matchesArea = selectedArea === 'ALL' || staff.area.toLowerCase().includes(selectedArea.toLowerCase());
      const matchesStaff = selectedStaffId === 'ALL' || staff.staffId === selectedStaffId;
      const matchesSearch = searchQuery === '' || 
        staff.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.area.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesArea && matchesStaff && matchesSearch;
    }).sort((a, b) => b.productivityScore - a.productivityScore);
  }, [staffPerformanceData, selectedArea, selectedStaffId, searchQuery]);

  // Aggregate KPI summary metrics
  const teamAggregates = useMemo(() => {
    if (staffPerformanceData.length === 0) {
      return { avgResponse: 0, totalClosed: 0, overallSla: 0, topPerformer: null, totalUrgent: 0 };
    }
    const totalResp = staffPerformanceData.reduce((acc, s) => acc + s.avgResponseTimeMin, 0);
    const totalClosed = staffPerformanceData.reduce((acc, s) => acc + s.ticketsClosed, 0);
    const totalSla = staffPerformanceData.reduce((acc, s) => acc + s.slaComplianceRate, 0);
    const totalUrgent = staffPerformanceData.reduce((acc, s) => acc + s.urgentResolved, 0);
    const topPerformer = [...staffPerformanceData].sort((a, b) => b.productivityScore - a.productivityScore)[0];

    return {
      avgResponse: +(totalResp / staffPerformanceData.length).toFixed(1),
      totalClosed,
      overallSla: +(totalSla / staffPerformanceData.length).toFixed(1),
      topPerformer,
      totalUrgent
    };
  }, [staffPerformanceData]);

  // Chart 1: Average Response Time per Engineer Data
  const responseTimeChartData = useMemo(() => {
    return filteredData.map(staff => ({
      name: staff.shortName,
      staffId: staff.staffId,
      avgMinutes: staff.avgResponseTimeMin,
      slaBenchmark: SLA_TARGET_MINUTES,
      statusColor: staff.avgResponseTimeMin <= 15 ? '#10b981' : staff.avgResponseTimeMin <= 22 ? '#3b82f6' : '#f59e0b'
    }));
  }, [filteredData]);

  // Chart 2: Tickets Closed & Active per Engineer Data
  const ticketsClosedChartData = useMemo(() => {
    return filteredData.map(staff => ({
      name: staff.shortName,
      staffId: staff.staffId,
      closed: staff.ticketsClosed,
      active: staff.ticketsActive,
      urgent: staff.urgentResolved,
      score: staff.productivityScore
    }));
  }, [filteredData]);

  // Selected staff detail for historical trend chart
  const activeStaffForTrend = useMemo(() => {
    if (selectedStaffId !== 'ALL') {
      return staffPerformanceData.find(s => s.staffId === selectedStaffId) || staffPerformanceData[0];
    }
    return teamAggregates.topPerformer || staffPerformanceData[0];
  }, [selectedStaffId, staffPerformanceData, teamAggregates]);

  // Handler for Exporting CSV
  const handleExportPerformanceCSV = () => {
    const headers = [
      'Staff ID',
      'Name',
      'Designation',
      'Area',
      'Avg Response Time (Min)',
      'Tickets Closed',
      'Active Tickets',
      'Urgent Resolved',
      'SLA Compliance %',
      'Customer Rating',
      'Productivity Score'
    ];

    const rows = filteredData.map(s => [
      `"${s.staffId}"`,
      `"${s.staffName}"`,
      `"${s.designation}"`,
      `"${s.area}"`,
      s.avgResponseTimeMin,
      s.ticketsClosed,
      s.ticketsActive,
      s.urgentResolved,
      `${s.slaComplianceRate}%`,
      s.customerRating,
      s.productivityScore
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Delta_Mithapukur_NOC_Performance_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handler to acknowledge / award bonus to staff
  const handleSendCommendation = (staffId: string) => {
    setBonusSentStaffId(staffId);
    setTimeout(() => {
      setBonusSentStaffId(null);
    }, 3500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER CONTROLS & TIMEFRAME FILTER */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 font-syne">
                {lang === 'bn' ? 'নোক স্টাফ পারফরম্যান্স ও প্রোডাক্টিভিটি ড্যাশবোর্ড' : 'NOC Staff Performance & Productivity Metrics'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'bn' 
                  ? 'গড় টিকেট রেসপন্স সময়, ইঞ্জিনিয়ার প্রতি সমাধানকৃত টিকেট ও এসএলএ মান নিয়ন্ত্রণ' 
                  : 'Track Average Response Time, Tickets Closed per Engineer, and Team Efficiency'}
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe & Export Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === 'today' 
                  ? 'bg-white text-indigo-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'bn' ? 'আজ (Today)' : 'Today'}
            </button>
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === '7days' 
                  ? 'bg-white text-indigo-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'bn' ? '৭ দিন' : '7 Days'}
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === '30days' 
                  ? 'bg-white text-indigo-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'bn' ? '৩০ দিন (মাসিক)' : '30 Days'}
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === 'all' 
                  ? 'bg-white text-indigo-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'bn' ? 'সর্বমোট' : 'All Time'}
            </button>
          </div>

          <button
            onClick={handleExportPerformanceCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
            title="Download Performance Scorecard in CSV"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'bn' ? 'সিএসভি রিপোর্ট' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* TOP AGGREGATE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Team Average Response Time */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Clock className="w-24 h-24" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              {lang === 'bn' ? 'টিম গড় রেসপন্স টাইম' : 'Avg Team Response'}
            </span>
            <span className="p-2 bg-indigo-500/20 rounded-xl text-indigo-300 border border-indigo-500/30">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black font-syne text-white tracking-tight">
              {teamAggregates.avgResponse}
            </span>
            <span className="text-sm font-bold text-indigo-300 font-mono">
              {lang === 'bn' ? 'মিনিট' : 'Minutes'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-indigo-800/60 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>{lang === 'bn' ? 'SLA বেঞ্চমার্ক: ২৫ মি.' : 'SLA Target: 25 min'}</span>
            </span>
            <span className="text-indigo-200 font-semibold">
              {teamAggregates.avgResponse < SLA_TARGET_MINUTES ? '✓ On Track' : '⚠️ Alert'}
            </span>
          </div>
        </div>

        {/* Metric 2: Total Tickets Closed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'bn' ? 'মোট ক্লোজড / সমাধান' : 'Tickets Closed'}
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black font-syne text-slate-900 tracking-tight">
              {teamAggregates.totalClosed}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-mono">
              +{teamAggregates.totalUrgent} Urgent
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{lang === 'bn' ? 'সক্রিয় নোক ইঞ্জিনিয়ার:' : 'Active NOC Staff:'}</span>
            <span className="font-bold text-slate-800">{staffPerformanceData.length} Engineers</span>
          </div>
        </div>

        {/* Metric 3: Overall SLA Adherence */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'bn' ? 'এসএলএ পরিপালন হার' : 'SLA Adherence'}
            </span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black font-syne text-slate-900 tracking-tight">
              {teamAggregates.overallSla}%
            </span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              High Standard
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{lang === 'bn' ? 'টার্গেট সীমা:' : 'Target Benchmark:'}</span>
            <span className="font-bold text-emerald-600">&gt; 95.0%</span>
          </div>
        </div>

        {/* Metric 4: Top Performer Spotlight */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-100 uppercase tracking-wider">
              {lang === 'bn' ? 'শীর্ষ পারফর্মার' : 'Top Performer'}
            </span>
            <span className="p-2 bg-white/20 rounded-xl text-white border border-white/30">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <h4 className="text-base font-extrabold text-white truncate">
              {teamAggregates.topPerformer?.shortName || 'N/A'}
            </h4>
            <p className="text-[11px] text-amber-100 truncate mt-0.5">
              {teamAggregates.topPerformer?.designation}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-[11px] text-amber-50">
            <span className="font-bold">{teamAggregates.topPerformer?.ticketsClosed} Closed</span>
            <span className="flex items-center gap-1 font-mono font-bold">
              <Star className="w-3 h-3 fill-white text-white" />
              {teamAggregates.topPerformer?.customerRating} / 5.0
            </span>
          </div>
        </div>

      </div>

      {/* FILTER & SEARCH STRIP */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === 'bn' ? 'ইঞ্জিনিয়ার বা এলাকা খুঁজুন...' : 'Search engineer name or area...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 font-medium text-xs"
            />
          </div>

          {/* Area Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">{lang === 'bn' ? 'সকল জোন ও ইউনিয়ন (All Zones)' : 'All Zones / Areas'}</option>
              <option value="সদর">মিঠাপুকুর সদর (Mithapukur Sadar)</option>
              <option value="পায়রাবন্দ">পায়রাবন্দ (Pairaband)</option>
              <option value="রানীপুকুর">রানীপুকুর (Ranipukur)</option>
              <option value="বলদিপুকুর">বলদিপুকুর (Boldipukur)</option>
              <option value="বালুয়া">বালুয়া মাসিমপুর (Balua Masimpur)</option>
            </select>
          </div>

          {/* Staff Filter */}
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">{lang === 'bn' ? 'সকল নোক মেম্বার (All Engineers)' : 'All Engineers'}</option>
            {staffPerformanceData.map(s => (
              <option key={s.staffId} value={s.staffId}>{s.shortName} ({s.staffId})</option>
            ))}
          </select>
        </div>

        <div className="text-slate-500 font-mono text-[11px]">
          Showing <strong>{filteredData.length}</strong> of {staffPerformanceData.length} Engineers
        </div>
      </div>

      {/* CHARTS ROW 1: PRIMARY METRICS REQUESTED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CHART 1: Average Ticket Response Time per Engineer */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900 font-syne">
                  {lang === 'bn' ? 'ইঞ্জিনিয়ার প্রতি গড় রেসপন্স টাইম (মিনিট)' : 'Average Ticket Response Time per Engineer'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'bn' 
                  ? 'প্রতিটি ফিল্ড টেকনিশিয়ান ও নোক ইঞ্জিনিয়ারের গড় রেসপন্স গতি (কম সময় = বেশি দক্ষ)' 
                  : 'Average minutes taken to acknowledge & assign dispatch (lower is faster)'}
              </p>
            </div>
            <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-xs font-bold rounded-lg">
              Target: &le; 25m
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={responseTimeChartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  unit=" m"
                />
                <Tooltip 
                  formatter={(value: any) => [`${value} Minutes`, 'Avg Response Time']}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '0.75rem', 
                    color: '#f8fafc',
                    fontSize: '0.75rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <ReferenceLine 
                  y={SLA_TARGET_MINUTES} 
                  stroke="#ef4444" 
                  strokeDasharray="4 4" 
                  label={{ value: 'SLA Max (25m)', fill: '#ef4444', fontSize: 10, position: 'right' }} 
                />
                <Bar 
                  dataKey="avgMinutes" 
                  name={lang === 'bn' ? 'গড় রেসপন্স সময় (মিনিট)' : 'Avg Response Time (min)'} 
                  radius={[6, 6, 0, 0]}
                >
                  {responseTimeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.statusColor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold">{lang === 'bn' ? '⚡ সেরা রেসপন্স স্পিড:' : '⚡ Fastest Response Squad:'}</span>
            <span className="font-bold text-emerald-600">
              {responseTimeChartData[0]?.name} ({responseTimeChartData[0]?.avgMinutes} min)
            </span>
          </div>
        </div>

        {/* CHART 2: Tickets Closed per Engineer */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900 font-syne">
                  {lang === 'bn' ? 'ইঞ্জিনিয়ার প্রতি সম্পন্নকৃত টিকেট সংখ্যা' : 'Tickets Closed per Engineer'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'bn' 
                  ? 'সমাধানকৃত সাধারণ ও জরুরি ফাইবার টিকেট বনাম চলমান সক্রিয় টিকেট ভলিউম' 
                  : 'Total resolved tickets, urgent line fixes, and current active workload'}
              </p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-xs font-bold rounded-lg">
              Productivity
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketsClosedChartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '0.75rem', 
                    color: '#f8fafc',
                    fontSize: '0.75rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <Bar 
                  dataKey="closed" 
                  name={lang === 'bn' ? 'সমাধানকৃত টিকেট' : 'Resolved / Closed'} 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="urgent" 
                  name={lang === 'bn' ? 'জরুরি ফাইবার রিপেয়ার' : 'Urgent Line Cuts'} 
                  fill="#f43f5e" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="active" 
                  name={lang === 'bn' ? 'চলমান টিকেট' : 'Active In-Progress'} 
                  fill="#f59e0b" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold">{lang === 'bn' ? '🏆 সর্বোচ্চ সমাধানকারী:' : '🏆 Top Volume Resolver:'}</span>
            <span className="font-bold text-indigo-700">
              {ticketsClosedChartData[0]?.name} ({ticketsClosedChartData[0]?.closed} tickets resolved)
            </span>
          </div>
        </div>

      </div>

      {/* CHARTS ROW 2: DRILL-DOWN HISTORY & CATEGORY BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Trend for Selected Engineer */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900 font-syne">
                  {lang === 'bn' 
                    ? `${activeStaffForTrend.shortName} - এর সাপ্তাহিক প্রোডাক্টিভিটি ট্রেন্ড` 
                    : `${activeStaffForTrend.shortName} - Weekly Productivity & Response Trend`}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'bn' ? 'প্রতিদিনের সমাধানকৃত টিকেট সংখ্যা (বার) ও গড় রেসপন্স মিনিট (লাইন)' : 'Daily closed tickets (bars) alongside response speed in minutes (line)'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium">{lang === 'bn' ? 'সিলেক্টেড:' : 'Selected:'}</span>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                {activeStaffForTrend.shortName}
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={activeStaffForTrend.weeklyHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#818cf8' }} axisLine={false} tickLine={false} unit="m" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '0.75rem', 
                    color: '#f8fafc',
                    fontSize: '0.75rem'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <Bar yAxisId="left" dataKey="closed" name={lang === 'bn' ? 'সমাধানকৃত টিকেট' : 'Closed Tickets'} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="avgResponseMin" name={lang === 'bn' ? 'রেসপন্স সময় (মিনিট)' : 'Avg Response (min)'} stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Specialization */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-extrabold text-slate-900 font-syne">
                {lang === 'bn' ? 'সমস্যা সমাধান ক্যাটাগরি' : 'Category Specialization'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeStaffForTrend.shortName} {lang === 'bn' ? 'দ্বারা ফিক্স করা ইস্যুসমূহ' : 'resolved issues breakdown'}
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {activeStaffForTrend.categoryBreakdown.map((cat, idx) => {
              const maxCount = Math.max(...activeStaffForTrend.categoryBreakdown.map(c => c.count));
              const pct = Math.round((cat.count / maxCount) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>{cat.category}</span>
                    <span className="font-mono font-bold text-slate-900">{cat.count} cases</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-rose-500' : idx === 1 ? 'bg-indigo-500' : idx === 2 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {lang === 'bn' 
                  ? 'ফাইবার অপটিক্যাল জয়েন্ট ও রেড এলওএস সমস্যা সমাধানে বিশেষ পারদর্শী।' 
                  : 'High resolution efficiency in fiber breakages & red optical LOS repairs.'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* NOC STAFF PERFORMANCE & EVALUATION LEADERBOARD TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-900 text-white font-bold text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'bn' ? 'নোক ইঞ্জিনিয়ার প্রোডাক্টিভিটি ও পারফরম্যান্স স্কোরবোর্ড' : 'NOC Engineer Productivity & Performance Scorecard'}</span>
          </div>
          <span className="text-xs text-slate-400 font-normal">
            {lang === 'bn' ? 'ম্যানেজার রিভিউ ও পারফরম্যান্স অ্যাসেসমেন্ট' : 'Executive evaluation & ranking'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">{lang === 'bn' ? 'র‍্যাংক ও ইঞ্জিনিয়ার' : 'Rank & Engineer'}</th>
                <th className="py-3 px-4">{lang === 'bn' ? 'জোন ও পদবী' : 'Zone & Role'}</th>
                <th className="py-3 px-4 text-center">{lang === 'bn' ? 'গড় রেসপন্স টাইম' : 'Avg Response Time'}</th>
                <th className="py-3 px-4 text-center">{lang === 'bn' ? 'সমাধানকৃত টিকেট' : 'Tickets Closed'}</th>
                <th className="py-3 px-4 text-center">{lang === 'bn' ? 'জরুরি ফিক্স' : 'Urgent Line Cuts'}</th>
                <th className="py-3 px-4 text-center">{lang === 'bn' ? 'এসএলএ পরিপালন' : 'SLA Compliance'}</th>
                <th className="py-3 px-4 text-center">{lang === 'bn' ? 'কাস্টমার রেটিং' : 'Rating'}</th>
                <th className="py-3 px-4 text-center">{lang === 'bn' ? 'প্রোডাক্টিভিটি স্কোর' : 'Productivity Score'}</th>
                <th className="py-3 px-4 text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredData.map((staff, index) => {
                const isSelected = selectedStaffId === staff.staffId;
                const isBonusSent = bonusSentStaffId === staff.staffId;

                return (
                  <tr 
                    key={staff.staffId}
                    onClick={() => {
                      setSelectedStaffId(staff.staffId === selectedStaffId ? 'ALL' : staff.staffId);
                      if (onSelectStaffMember) onSelectStaffMember(staff.staffId);
                    }}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                      isSelected ? 'bg-indigo-50/60 font-semibold' : ''
                    }`}
                  >
                    {/* Rank & Engineer Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          index === 0 ? 'bg-amber-400 text-slate-950 shadow-sm' :
                          index === 1 ? 'bg-slate-300 text-slate-900' :
                          index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{staff.staffName}</span>
                            {staff.badge && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-semibold hidden md:inline">
                                {staff.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">{staff.staffId}</span>
                        </div>
                      </div>
                    </td>

                    {/* Zone & Designation */}
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800">{staff.designation}</p>
                      <p className="text-[11px] text-slate-500">{staff.area}</p>
                    </td>

                    {/* Avg Response Time */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                        staff.avgResponseTimeMin <= 15
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : staff.avgResponseTimeMin <= 22
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <Clock className="w-3 h-3" />
                        <span>{staff.avgResponseTimeMin}m</span>
                      </span>
                    </td>

                    {/* Tickets Closed */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-black text-slate-900 text-sm font-mono">
                        {staff.ticketsClosed}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        {staff.ticketsActive} Active
                      </span>
                    </td>

                    {/* Urgent Line Cuts */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 font-mono font-bold rounded-md text-xs">
                        {staff.urgentResolved} Fixes
                      </span>
                    </td>

                    {/* SLA Compliance */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`font-bold font-mono text-xs ${
                        staff.slaComplianceRate >= 97 ? 'text-emerald-600' : 'text-slate-800'
                      }`}>
                        {staff.slaComplianceRate}%
                      </span>
                    </td>

                    {/* Customer Rating */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{staff.customerRating}</span>
                      </span>
                    </td>

                    {/* Productivity Score */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-xl">
                        <Flame className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="font-black text-indigo-800 font-mono text-xs">{staff.productivityScore}/100</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleSendCommendation(staff.staffId)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 ${
                          isBonusSent 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                        }`}
                        title="Send Manager Recognition & Commendation"
                      >
                        {isBonusSent ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{lang === 'bn' ? 'স্বীকৃতি প্রেরিত' : 'Commended'}</span>
                          </>
                        ) : (
                          <>
                            <Award className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{lang === 'bn' ? 'স্বীকৃতি' : 'Award'}</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
