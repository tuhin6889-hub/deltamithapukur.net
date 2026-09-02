import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NetworkServer, PopPingResult, PopLatencyAlert, Ticket } from '../types';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Zap, 
  RotateCcw, 
  Sliders, 
  Radio, 
  Server, 
  Wifi, 
  ArrowUpRight, 
  Bell, 
  X, 
  ChevronRight, 
  Flame, 
  Clock, 
  ShieldAlert, 
  Terminal, 
  Download, 
  Sparkles,
  Layers,
  HelpCircle,
  ExternalLink,
  Plus
} from 'lucide-react';

interface PopPingMonitorServiceProps {
  servers: NetworkServer[];
  lang: 'bn' | 'en';
  isOpen: boolean;
  onClose: () => void;
  onUpdateServer?: (server: NetworkServer) => void;
  onTriggerSystemAlert?: (alert: { type: 'AUTO_AI' | 'RESOLVED' | 'FAILED' | 'ESCALATED'; title: string; message: string }) => void;
  onCreateEmergencyTicket?: (ticketData: Partial<Ticket>) => void;
  onStatsUpdate?: (stats: { totalHighPriority: number; highLatencyCount: number; avgRtt: number }) => void;
}

// Play synthetic Web Audio alert beep on latency breach
function playAlertBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export const PopPingMonitorService: React.FC<PopPingMonitorServiceProps> = ({
  servers,
  lang,
  isOpen,
  onClose,
  onUpdateServer,
  onTriggerSystemAlert,
  onCreateEmergencyTicket,
  onStatsUpdate,
}) => {
  // Monitoring Engine Configuration
  const [isMonitoringActive, setIsMonitoringActive] = useState<boolean>(true);
  const [latencyThresholdMs, setLatencyThresholdMs] = useState<number>(100);
  const [pingIntervalSeconds, setPingIntervalSeconds] = useState<number>(3);
  const [isSoundAlertEnabled, setIsSoundAlertEnabled] = useState<boolean>(true);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Chaos Injection state (for simulating sudden spikes > 100ms or packet loss)
  const [injectedSpikes, setInjectedSpikes] = useState<Record<string, { targetMs: number; remainingTicks: number; reason: string }>>({});

  // Ping History & Live Metrics per Server
  const [pingResults, setPingResults] = useState<Record<string, PopPingResult>>({});
  
  // Incident Alert Log
  const [latencyAlerts, setLatencyAlerts] = useState<PopLatencyAlert[]>([]);
  const [lastAlertSoundTimestamp, setLastAlertSoundTimestamp] = useState<number>(0);

  // Filter high-priority PoP servers (Core Routers, Core OLTs, and sub-PoP Gateways)
  const highPriorityServers = useMemo(() => {
    return servers.filter(s => {
      const isCoreOrOlt = s.type === 'Core_Router' || s.type === 'OLT' || s.type === 'MikroTik';
      const hasPopLocation = s.locationArea.toLowerCase().includes('pop') || 
                             s.locationArea.toLowerCase().includes('সদর') || 
                             s.name.toLowerCase().includes('core') ||
                             s.name.toLowerCase().includes('olt') ||
                             s.name.toLowerCase().includes('pop');
      return isCoreOrOlt || hasPopLocation;
    });
  }, [servers]);

  // Initialize ping results for servers if not present
  useEffect(() => {
    setPingResults(prev => {
      const updated = { ...prev };
      highPriorityServers.forEach(srv => {
        if (!updated[srv.id]) {
          const baseline = srv.lastPingMs || (srv.type === 'Core_Router' ? 2 : srv.type === 'OLT' ? 6 : 8);
          updated[srv.id] = {
            serverId: srv.id,
            serverName: srv.name,
            ipAddress: srv.ipAddress,
            locationArea: srv.locationArea,
            type: srv.type,
            rtt: baseline,
            packetLoss: 0,
            jitter: 1,
            status: baseline > latencyThresholdMs ? 'HIGH_LATENCY' : baseline > 40 ? 'DEGRADED' : 'OPTIMAL',
            timestamp: new Date().toLocaleTimeString(),
            isHighPriority: true,
            history: [baseline, baseline, baseline, baseline, baseline, baseline, baseline, baseline],
          };
        }
      });
      return updated;
    });
  }, [highPriorityServers, latencyThresholdMs]);

  // Continuous Ping Simulation Loop
  const pingLoopRef = useRef<NodeJS.Timeout | null>(null);

  const performPingCycle = useCallback(() => {
    if (!isMonitoringActive || highPriorityServers.length === 0) return;

    setPingResults(prev => {
      const nextResults = { ...prev };
      const newAlerts: PopLatencyAlert[] = [];

      highPriorityServers.forEach(srv => {
        const existing = nextResults[srv.id];
        const baseLatency = srv.lastPingMs || (srv.type === 'Core_Router' ? 2 : srv.type === 'OLT' ? 6 : 8);

        let currentRtt = baseLatency;
        let packetLoss = 0;
        let jitter = Math.floor(Math.random() * 3) + 1;

        // Check if there's an injected spike on this server
        const activeSpike = injectedSpikes[srv.id];
        if (activeSpike && activeSpike.remainingTicks > 0) {
          currentRtt = activeSpike.targetMs + Math.floor((Math.random() - 0.5) * 16);
          jitter = Math.floor(Math.random() * 14) + 8;
          packetLoss = Math.random() > 0.6 ? 20 : 0;
        } else {
          // Normal stochastic fluctuation
          const variance = (Math.random() - 0.45) * 4; // slight jitter
          currentRtt = Math.max(1, Math.round(baseLatency + variance));
        }

        // Determine health status
        let status: 'OPTIMAL' | 'DEGRADED' | 'HIGH_LATENCY' | 'UNREACHABLE' = 'OPTIMAL';
        if (currentRtt >= latencyThresholdMs) {
          status = 'HIGH_LATENCY';
        } else if (currentRtt >= 40) {
          status = 'DEGRADED';
        }

        // Keep rolling history of last 16 pings
        const prevHistory = existing?.history || [];
        const nextHistory = [...prevHistory.slice(-15), currentRtt];

        nextResults[srv.id] = {
          serverId: srv.id,
          serverName: srv.name,
          ipAddress: srv.ipAddress,
          locationArea: srv.locationArea,
          type: srv.type,
          rtt: currentRtt,
          packetLoss,
          jitter,
          status,
          timestamp: new Date().toLocaleTimeString(),
          isHighPriority: true,
          history: nextHistory,
        };

        // Check for Latency Threshold Breach (> 100ms)
        if (currentRtt >= latencyThresholdMs) {
          const alertId = `alert_${srv.id}_${Date.now()}`;
          const alertObj: PopLatencyAlert = {
            id: alertId,
            serverId: srv.id,
            serverName: srv.name,
            ipAddress: srv.ipAddress,
            locationArea: srv.locationArea,
            latencyMs: currentRtt,
            thresholdMs: latencyThresholdMs,
            packetLoss,
            timestamp: new Date().toLocaleTimeString(),
            severity: currentRtt >= 150 ? 'CRITICAL' : 'WARNING',
            acknowledged: false,
            notes: activeSpike?.reason || 'Continuous PoP Ping Watcher detected high latency spike exceeding 100ms threshold.',
          };
          newAlerts.push(alertObj);

          // Update server status in parent state if available
          if (onUpdateServer) {
            onUpdateServer({
              ...srv,
              lastPingMs: currentRtt,
              status: currentRtt >= 150 ? 'Warning' : 'Online',
            });
          }
        }
      });

      // Handle triggered alerts
      if (newAlerts.length > 0) {
        setLatencyAlerts(curr => {
          // Avoid spamming duplicate alerts for the same server within 10 seconds
          const recentThreshold = Date.now() - 10000;
          const filteredNew = newAlerts.filter(na => 
            !curr.some(c => c.serverId === na.serverId && Date.now() - new Date(c.timestamp).getTime() < 10000)
          );
          return [...filteredNew, ...curr].slice(0, 50); // Keep last 50
        });

        // Trigger system toast notification
        const worstAlert = newAlerts.reduce((prev, curr) => curr.latencyMs > prev.latencyMs ? curr : prev, newAlerts[0]);
        if (onTriggerSystemAlert) {
          onTriggerSystemAlert({
            type: 'ESCALATED',
            title: lang === 'bn' ? '⚠️ PoP লেটেন্সি অ্যালার্ট (>100ms)!' : '⚠️ PoP Latency Threshold Breach!',
            message: `${worstAlert.serverName} (${worstAlert.ipAddress}): ${worstAlert.latencyMs}ms (Threshold: ${latencyThresholdMs}ms). ${worstAlert.locationArea}`,
          });
        }

        // Play sound if enabled and not played in the last 4 seconds
        if (isSoundAlertEnabled && Date.now() - lastAlertSoundTimestamp > 4000) {
          playAlertBeep();
          setLastAlertSoundTimestamp(Date.now());
        }
      }

      // Decrement injected spikes
      setInjectedSpikes(currentSpikes => {
        const nextSpikes: Record<string, { targetMs: number; remainingTicks: number; reason: string }> = {};
        (Object.entries(currentSpikes) as [string, { targetMs: number; remainingTicks: number; reason: string }][]).forEach(([srvId, data]) => {
          if (data.remainingTicks > 1) {
            nextSpikes[srvId] = { ...data, remainingTicks: data.remainingTicks - 1 };
          }
        });
        return nextSpikes;
      });

      if (onStatsUpdate) {
        const allRes = Object.values(nextResults) as PopPingResult[];
        const total = allRes.length;
        const highCount = allRes.filter(r => r.rtt >= latencyThresholdMs).length;
        const avg = total > 0 ? Math.round(allRes.reduce((acc, r) => acc + r.rtt, 0) / total) : 8;
        onStatsUpdate({
          totalHighPriority: total,
          highLatencyCount: highCount,
          avgRtt: avg,
        });
      }

      return nextResults;
    });
  }, [
    isMonitoringActive, 
    highPriorityServers, 
    injectedSpikes, 
    latencyThresholdMs, 
    isSoundAlertEnabled, 
    lastAlertSoundTimestamp, 
    lang, 
    onTriggerSystemAlert, 
    onUpdateServer,
    onStatsUpdate
  ]);

  // Set up ping interval timer
  useEffect(() => {
    if (pingLoopRef.current) {
      clearInterval(pingLoopRef.current);
    }

    if (isMonitoringActive) {
      pingLoopRef.current = setInterval(performPingCycle, pingIntervalSeconds * 1000);
    }

    return () => {
      if (pingLoopRef.current) {
        clearInterval(pingLoopRef.current);
      }
    };
  }, [isMonitoringActive, pingIntervalSeconds, performPingCycle]);

  // Calculate live statistics
  const metrics = useMemo(() => {
    const values = Object.values(pingResults) as PopPingResult[];
    if (values.length === 0) return { avgRtt: 0, maxRtt: 0, highLatencyCount: 0, optimalCount: 0 };

    const sum = values.reduce((acc: number, v: PopPingResult) => acc + v.rtt, 0);
    const avg = Math.round(sum / values.length);
    const max = Math.max(...values.map(v => v.rtt));
    const high = values.filter(v => v.rtt >= latencyThresholdMs).length;
    const optimal = values.filter(v => v.rtt < 40).length;

    return { avgRtt: avg, maxRtt: max, highLatencyCount: high, optimalCount: optimal };
  }, [pingResults, latencyThresholdMs]);

  // Handlers for Chaos Testing / Latency Spikes Simulation
  const handleTriggerSpike = (serverId: string, spikeMs: number = 145, reason: string = 'Upstream Fiber Degradation / BGP Path Flap') => {
    setInjectedSpikes(prev => ({
      ...prev,
      [serverId]: {
        targetMs: spikeMs,
        remainingTicks: 6, // lasts for 6 ping ticks
        reason,
      }
    }));
    // Immediately execute a ping cycle to reflect changes
    setTimeout(performPingCycle, 100);
  };

  const handleResolveSpike = (serverId: string) => {
    setInjectedSpikes(prev => {
      const updated = { ...prev };
      delete updated[serverId];
      return updated;
    });
    setPingResults(prev => {
      if (!prev[serverId]) return prev;
      const srv = highPriorityServers.find(s => s.id === serverId);
      const baseline = srv?.lastPingMs || 6;
      return {
        ...prev,
        [serverId]: {
          ...prev[serverId],
          rtt: baseline,
          packetLoss: 0,
          status: 'OPTIMAL',
        }
      };
    });
    if (onTriggerSystemAlert) {
      onTriggerSystemAlert({
        type: 'RESOLVED',
        title: lang === 'bn' ? 'লেটেন্সি স্বাভাবিক হয়েছে' : 'PoP Latency Restored',
        message: `${pingResults[serverId]?.serverName || serverId} ${lang === 'bn' ? 'লিঙ্ক অপটিমাইজড এবং লেটেন্সি < 15ms এ নেমে এসেছে।' : 'rerouted to primary 10G SFP+ link.'}`,
      });
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setLatencyAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  };

  const handleClearAlerts = () => {
    setLatencyAlerts([]);
  };

  const handleCreateTicketForAlert = (alert: PopLatencyAlert) => {
    if (onCreateEmergencyTicket) {
      onCreateEmergencyTicket({
        title: `[EMERGENCY POP LATENCY] ${alert.serverName} High Ping (${alert.latencyMs}ms > ${alert.thresholdMs}ms)`,
        category: 'PON_PORT_DOWN',
        priority: 'URGENT',
        description: `Continuous ICMP Ping Monitor triggered critical latency alert at ${alert.timestamp}.\nNode: ${alert.serverName} (${alert.ipAddress})\nLocation: ${alert.locationArea}\nObserved Latency: ${alert.latencyMs} ms (Configured Threshold: ${alert.thresholdMs} ms)\nPacket Loss: ${alert.packetLoss}%\nDiagnosis: Check optical attenuation on distribution trunk fiber and verify OSPF/BGP gateway route tables.`,
        assignedNocStaff: 'Engr. Tanvir Ahmed (NOC Core)',
        area: alert.locationArea,
      });
      handleAcknowledgeAlert(alert.id);
      if (onTriggerSystemAlert) {
        onTriggerSystemAlert({
          type: 'RESOLVED',
          title: lang === 'bn' ? 'জরুরি টিকেট তৈরি হয়েছে' : 'Emergency NOC Ticket Generated',
          message: `${alert.serverName} ${lang === 'bn' ? 'এর জন্য লেটেন্সি তদন্ত টিকেট খোলা হয়েছে।' : 'latency investigation ticket dispatched.'}`,
        });
      }
    }
  };

  // Filtered servers list in the modal
  const filteredPingServers = useMemo(() => {
    return (Object.values(pingResults) as PopPingResult[]).filter(res => {
      const matchesSearch = res.serverName.toLowerCase().includes(searchFilter.toLowerCase()) ||
                            res.ipAddress.includes(searchFilter) ||
                            res.locationArea.toLowerCase().includes(searchFilter.toLowerCase());
      return matchesSearch;
    });
  }, [pingResults, searchFilter]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ================= HEADER ================= */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl relative">
                <Radio className={`w-6 h-6 text-emerald-400 ${isMonitoringActive ? 'animate-pulse' : ''}`} />
                {metrics.highLatencyCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full animate-ping" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-wide">
                    {lang === 'bn' ? 'PoP সার্ভার কন্টিনিউয়াস পিং মনিটরিং সার্ভিস' : 'Continuous PoP Ping Latency Watcher'}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold flex items-center gap-1 ${
                    isMonitoringActive 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isMonitoringActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                    {isMonitoringActive ? 'LIVE ACTIVE' : 'PAUSED'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'bn' 
                    ? `হাই-প্রায়োরিটি কোর ও সাব-PoP নোডের বাস্তব লেটেন্সি মনিটরিং (> ${latencyThresholdMs}ms লেটেন্সিতে স্বয়ংক্রিয় সিস্টেম অ্যালার্ট)`
                    : `Simulating continuous ICMP echo probes for high-priority Core & PoP nodes (Auto-alerts when latency > ${latencyThresholdMs}ms)`}
                </p>
              </div>
            </div>

            {/* Quick Controls Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Play/Pause Button */}
              <button
                onClick={() => setIsMonitoringActive(!isMonitoringActive)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-sm ${
                  isMonitoringActive
                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                }`}
              >
                {isMonitoringActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isMonitoringActive ? (lang === 'bn' ? 'পজ করুন' : 'Pause Monitor') : (lang === 'bn' ? 'চালু করুন' : 'Resume Ping')}</span>
              </button>

              {/* Sound Alert Toggle */}
              <button
                onClick={() => setIsSoundAlertEnabled(!isSoundAlertEnabled)}
                className={`p-2 rounded-xl text-xs border transition-all cursor-pointer ${
                  isSoundAlertEnabled
                    ? 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40 hover:bg-indigo-900'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
                title={isSoundAlertEnabled ? 'Sound alerts enabled (>100ms)' : 'Sound alerts muted'}
              >
                {isSoundAlertEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>

              {/* Ping Now Trigger */}
              <button
                onClick={performPingCycle}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Force instantaneous ICMP cycle across all PoPs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                <span>{lang === 'bn' ? 'এখনই পিং করুন' : 'Ping All Now'}</span>
              </button>

              {/* Close Modal Button */}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all cursor-pointer border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ================= METRIC SUMMARY STRIP ================= */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 bg-slate-950/60 border-b border-slate-800 text-xs">
            {/* Avg PoP Latency */}
            <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 block font-medium">{lang === 'bn' ? 'গড় নেটওয়ার্ক লেটেন্সি' : 'Average PoP Latency'}</span>
                <span className={`text-xl font-bold font-mono ${
                  metrics.avgRtt >= latencyThresholdMs ? 'text-rose-400' : metrics.avgRtt >= 40 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {metrics.avgRtt} <span className="text-xs font-normal">ms</span>
                </span>
              </div>
              <Activity className="w-5 h-5 text-slate-500" />
            </div>

            {/* High Latency Nodes (>100ms) */}
            <div className={`p-3 rounded-2xl border flex items-center justify-between ${
              metrics.highLatencyCount > 0 
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-200' 
                : 'bg-slate-900/80 border-slate-800/80 text-slate-300'
            }`}>
              <div>
                <span className="text-slate-400 block font-medium">{lang === 'bn' ? 'উচ্চ লেটেন্সি নোড (>100ms)' : 'High Latency Nodes'}</span>
                <span className={`text-xl font-bold font-mono ${metrics.highLatencyCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
                  {metrics.highLatencyCount} <span className="text-xs font-normal text-slate-400">/ {highPriorityServers.length}</span>
                </span>
              </div>
              <AlertTriangle className={`w-5 h-5 ${metrics.highLatencyCount > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-500'}`} />
            </div>

            {/* Optimal Healthy PoPs */}
            <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 block font-medium">{lang === 'bn' ? 'অপটিমাল হেলদি PoP (<40ms)' : 'Healthy Optimal Nodes'}</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {metrics.optimalCount} <span className="text-xs font-normal text-slate-400">/ {highPriorityServers.length}</span>
                </span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>

            {/* Threshold Setting */}
            <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 block font-medium">{lang === 'bn' ? 'অ্যালার্ট থ্রেশহোল্ড লিমিট' : 'Alert Trigger Threshold'}</span>
                <span className="text-xl font-bold font-mono text-indigo-300">
                  &gt; {latencyThresholdMs} <span className="text-xs font-normal">ms</span>
                </span>
              </div>
              <Sliders className="w-5 h-5 text-indigo-400" />
            </div>
          </div>

          {/* ================= MAIN CONTENT BODY ================= */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Real-time Chaos Test / Latency Injection Panel */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/20 border border-slate-800 rounded-3xl p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white text-sm">
                    {lang === 'bn' ? 'লেটেন্সি স্পাইক সিমুলেশন ও কেওস টেস্ট' : 'Real-time Latency Spike Simulation & Chaos Injection'}
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {lang === 'bn' ? 'সিস্টেম স্বয়ংক্রিয়ভাবে ১০০ms অতিক্রম করলে রিয়েল-টাইম অ্যালার্ট টেস্ট করতে পারেন' : 'Trigger instant >100ms latency spikes to test automatic alerting'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {highPriorityServers.map(srv => {
                  const pingData = pingResults[srv.id];
                  const hasSpike = injectedSpikes[srv.id] !== undefined;
                  const isHigh = (pingData?.rtt || 0) >= latencyThresholdMs;

                  return (
                    <div 
                      key={srv.id}
                      className={`p-2.5 rounded-2xl border flex items-center justify-between gap-3 flex-1 min-w-[240px] ${
                        isHigh
                          ? 'bg-rose-950/30 border-rose-600/70 shadow-lg shadow-rose-950/30'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-white truncate">{srv.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">{srv.ipAddress}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`font-mono text-xs font-bold ${isHigh ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {pingData?.rtt || 0} ms
                          </span>
                          <span className="text-[10px] text-slate-400">{srv.locationArea.split('(')[0]}</span>
                        </div>
                      </div>

                      {hasSpike || isHigh ? (
                        <button
                          onClick={() => handleResolveSpike(srv.id)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer shrink-0 shadow-sm flex items-center gap-1"
                          title="Restore normal 10G link latency"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{lang === 'bn' ? 'স্বাভাবিক করুন' : 'Normalize'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleTriggerSpike(srv.id, 148, 'Simulated Upstream Fiber Jitter & Queue Congestion')}
                          className="px-2.5 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-[11px] font-bold rounded-xl transition-all cursor-pointer shrink-0 shadow-sm flex items-center gap-1"
                          title="Inject >100ms Latency Spike"
                        >
                          <Zap className="w-3.5 h-3.5 text-rose-400" />
                          <span>{lang === 'bn' ? 'স্পাইক ঘটান (>100ms)' : 'Inject Spike (>100ms)'}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Threshold & Configuration Bar */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sliders className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white text-xs">
                    {lang === 'bn' ? 'লেটেন্সি অ্যালার্ট থ্রেশহোল্ড টিউনিং' : 'Latency Trigger Threshold Tuning'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'bn' 
                      ? 'লেটেন্সি এই মান অতিক্রম করলে সিস্টেমে সতর্কবার্তা ও অডিও অ্যালার্ট যাবে।' 
                      : 'Trigger alerts & notification toast when ping exceeds this threshold limit.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                {/* Threshold Slider */}
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-mono">50ms</span>
                  <input
                    type="range"
                    min="50"
                    max="250"
                    step="10"
                    value={latencyThresholdMs}
                    onChange={(e) => setLatencyThresholdMs(Number(e.target.value))}
                    className="w-32 accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-indigo-300 w-12 text-right">{latencyThresholdMs}ms</span>
                </div>

                {/* Interval Selector */}
                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
                  <span className="px-2 text-slate-400 text-[11px]">{lang === 'bn' ? 'ফ্রিকোয়েন্সি:' : 'Interval:'}</span>
                  {[2, 3, 5, 10].map(sec => (
                    <button
                      key={sec}
                      onClick={() => setPingIntervalSeconds(sec)}
                      className={`px-2.5 py-1 rounded-xl font-mono text-[11px] transition-all cursor-pointer ${
                        pingIntervalSeconds === sec
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ================= ACTIVE POP NODES REAL-TIME TABLE ================= */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'bn' ? 'লাইভ PoP সার্ভার লেটেন্সি ও আরটিটি ম্যাট্রিক্স' : 'Live PoP Servers Latency & RTT Matrix'}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn' ? 'বাস্তব সময়ে প্রতি সেকেন্ডে আরটিটি ও প্যাকেট লস পরিমাপ করা হচ্ছে' : 'Real-time round-trip latency, jitter and sparkline wave graph'}
                  </p>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder={lang === 'bn' ? 'PoP নাম বা আইপি দিয়ে খুঁজুন...' : 'Search PoP or IP...'}
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 w-48"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                      <th className="p-3.5 pl-5">NODE / POP NAME</th>
                      <th className="p-3.5">IP ADDRESS</th>
                      <th className="p-3.5">CURRENT RTT</th>
                      <th className="p-3.5">JITTER</th>
                      <th className="p-3.5">PACKET LOSS</th>
                      <th className="p-3.5 min-w-[140px]">LATENCY WAVE (LAST 16 PINGS)</th>
                      <th className="p-3.5">STATUS</th>
                      <th className="p-3.5 text-right pr-5">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredPingServers.map(res => {
                      const isHighLatency = res.rtt >= latencyThresholdMs;
                      const isDegraded = res.rtt >= 40 && res.rtt < latencyThresholdMs;

                      // Calculate min, max, avg for this server's history
                      const histMin = Math.min(...res.history);
                      const histMax = Math.max(...res.history);
                      const histAvg = Math.round(res.history.reduce((a, b) => a + b, 0) / res.history.length);

                      return (
                        <tr 
                          key={res.serverId}
                          className={`hover:bg-slate-900/60 transition-colors ${
                            isHighLatency ? 'bg-rose-950/20' : ''
                          }`}
                        >
                          {/* Node & Location */}
                          <td className="p-3.5 pl-5">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-lg ${
                                res.type === 'Core_Router' ? 'bg-indigo-500/20 text-indigo-300' :
                                res.type === 'OLT' ? 'bg-sky-500/20 text-sky-300' : 'bg-emerald-500/20 text-emerald-300'
                              }`}>
                                <Server className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="font-bold text-white block">{res.serverName}</span>
                                <span className="text-[10px] text-slate-400">{res.locationArea}</span>
                              </div>
                            </div>
                          </td>

                          {/* IP Address */}
                          <td className="p-3.5 font-mono text-slate-300">
                            {res.ipAddress}
                          </td>

                          {/* Live RTT */}
                          <td className="p-3.5">
                            <div className="flex items-baseline gap-1">
                              <span className={`font-mono text-base font-bold ${
                                isHighLatency 
                                  ? 'text-rose-400 animate-pulse font-extrabold' 
                                  : isDegraded 
                                  ? 'text-amber-400' 
                                  : 'text-emerald-400'
                              }`}>
                                {res.rtt}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">ms</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              avg: {histAvg}ms • max: {histMax}ms
                            </span>
                          </td>

                          {/* Jitter */}
                          <td className="p-3.5 font-mono text-slate-300">
                            ±{res.jitter}ms
                          </td>

                          {/* Packet Loss */}
                          <td className="p-3.5">
                            <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                              res.packetLoss > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400'
                            }`}>
                              {res.packetLoss}%
                            </span>
                          </td>

                          {/* Latency Sparkline Graph */}
                          <td className="p-3.5">
                            <div className="h-8 flex items-end gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 w-36">
                              {res.history.map((val, idx) => {
                                const heightPercent = Math.min(100, Math.max(15, (val / (latencyThresholdMs * 1.5)) * 100));
                                const isBarHigh = val >= latencyThresholdMs;
                                return (
                                  <div
                                    key={idx}
                                    style={{ height: `${heightPercent}%` }}
                                    className={`flex-1 rounded-t transition-all ${
                                      isBarHigh ? 'bg-rose-500' : val >= 40 ? 'bg-amber-400' : 'bg-emerald-400'
                                    }`}
                                    title={`${val}ms at ping #${idx + 1}`}
                                  />
                                );
                              })}
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="p-3.5">
                            {isHighLatency ? (
                              <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold font-mono flex items-center gap-1 w-max animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                HIGH LATENCY
                              </span>
                            ) : isDegraded ? (
                              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold font-mono flex items-center gap-1 w-max">
                                <Clock className="w-3 h-3 text-amber-400" />
                                DEGRADED
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold font-mono flex items-center gap-1 w-max">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                OPTIMAL
                              </span>
                            )}
                          </td>

                          {/* Quick Actions */}
                          <td className="p-3.5 text-right pr-5">
                            <div className="flex items-center justify-end gap-1.5">
                              {isHighLatency ? (
                                <button
                                  onClick={() => handleResolveSpike(res.serverId)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                                  title="Reroute / Fix Spike"
                                >
                                  {lang === 'bn' ? 'ফিক্স করুন' : 'Resolve Spike'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleTriggerSpike(res.serverId, 160)}
                                  className="px-2 py-1 bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 text-slate-300 rounded-lg text-[10px] transition-all cursor-pointer border border-slate-700 hover:border-rose-500/40"
                                  title="Simulate Latency Spike on this node"
                                >
                                  {lang === 'bn' ? 'টেস্ট স্পাইক' : 'Test Spike'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ================= LATENCY INCIDENTS & ALERT LOG ================= */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-rose-400" />
                  <h3 className="font-bold text-white text-sm">
                    {lang === 'bn' ? 'সিস্টেম লেটেন্সি ইনসিডেন্ট ও অ্যালার্ট লগ (>100ms)' : 'Triggered Latency Incidents & Alert History'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold">
                    {latencyAlerts.length} {lang === 'bn' ? 'টি ইনসিডেন্ট' : 'logged'}
                  </span>
                </div>

                {latencyAlerts.length > 0 && (
                  <button
                    onClick={handleClearAlerts}
                    className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'লগ মুছুন' : 'Clear Log'}
                  </button>
                )}
              </div>

              {latencyAlerts.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
                  <p>{lang === 'bn' ? 'কোনো সক্রিয় লেটেন্সি ভায়োলেশন নেই। সব PoP সার্ভার ১০০ms এর নিচে স্বাভাবিক রয়েছে।' : 'No latency violations detected. All PoP servers are operating comfortably below the threshold.'}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {latencyAlerts.map(alert => (
                    <div 
                      key={alert.id}
                      className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
                        alert.acknowledged
                          ? 'bg-slate-900/60 border-slate-800/80 opacity-75'
                          : 'bg-rose-950/30 border-rose-800/60 text-rose-200 shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 mt-0.5">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{alert.serverName}</span>
                            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">{alert.ipAddress}</span>
                            <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
                          </div>
                          <p className="text-slate-300 text-[11px] mt-0.5">
                            Observed Latency: <span className="font-mono font-bold text-rose-400">{alert.latencyMs} ms</span> (Threshold: {alert.thresholdMs} ms) • {alert.locationArea}
                          </p>
                          {alert.notes && (
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{alert.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!alert.acknowledged && (
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] transition-all cursor-pointer border border-slate-700"
                          >
                            {lang === 'bn' ? 'একনলেজ' : 'Acknowledge'}
                          </button>
                        )}
                        {onCreateEmergencyTicket && (
                          <button
                            onClick={() => handleCreateTicketForAlert(alert)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>{lang === 'bn' ? 'জরুরি NOC টিকেট খুলুন' : 'Open Ticket'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ================= FOOTER ================= */}
          <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>
                {lang === 'bn' ? 'PoP ওয়াচার ব্যাকগ্রাউন্ডে স্বয়ংক্রিয়ভাবে সক্রিয় রয়েছে' : 'PoP ICMP Watcher continuously monitoring in background'}
              </span>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              {lang === 'bn' ? 'বন্ধ করুন' : 'Close Studio'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
