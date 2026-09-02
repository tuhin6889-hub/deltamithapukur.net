import React, { useState } from 'react';
import { NotificationLog } from '../types';
import { 
  X, 
  BellRing, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Flame, 
  RefreshCw,
  Info
} from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationLog[];
  lang: 'bn' | 'en';
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  lang,
}) => {
  const [filterChannel, setFilterChannel] = useState<'ALL' | 'WhatsApp' | 'Email' | 'SMS' | 'EMERGENCY'>('ALL');

  if (!isOpen) return null;

  const emergencyCount = notifications.filter(n => n.isEmergencyFallback || n.status === 'Failed').length;
  const waCount = notifications.filter(n => n.channel === 'WhatsApp').length;
  const smsCount = notifications.filter(n => n.channel === 'SMS').length;
  const emailCount = notifications.filter(n => n.channel === 'Email').length;

  const filteredNotifications = notifications.filter(n => {
    if (filterChannel === 'ALL') return true;
    if (filterChannel === 'EMERGENCY') return n.isEmergencyFallback || n.status === 'Failed';
    return n.channel === filterChannel;
  });

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-3xl w-full shadow-2xl border border-slate-200 text-slate-800 space-y-4 max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <BellRing className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <span>{lang === 'bn' ? 'নোটিফিকেশন ও জরুরী SMS ডিসপ্যাচ অডিট লগ' : 'Outbound Notification & Emergency SMS Audit'}</span>
                {emergencyCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700 font-bold border border-rose-200 animate-pulse">
                    {emergencyCount} {lang === 'bn' ? 'জরুরী ফলব্যাক' : 'Emergency Fallbacks'}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'bn' ? 'WhatsApp (৩ বার চেষ্টার পর স্বয়ংক্রিয় Emergency SMS), ইমেইল ও পুশ অ্যালার্ট ট্র্যাকার' : 'WhatsApp 3-retry engine, auto Emergency SMS trigger, and Email delivery streams'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Channel Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold border-b border-slate-100">
          <button
            onClick={() => setFilterChannel('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterChannel === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({notifications.length})
          </button>

          <button
            onClick={() => setFilterChannel('WhatsApp')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
              filterChannel === 'WhatsApp'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp ({waCount})</span>
          </button>

          <button
            onClick={() => setFilterChannel('SMS')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
              filterChannel === 'SMS'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>SMS ({smsCount})</span>
          </button>

          <button
            onClick={() => setFilterChannel('EMERGENCY')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
              filterChannel === 'EMERGENCY'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Emergency SMS ({emergencyCount})</span>
          </button>

          <button
            onClick={() => setFilterChannel('Email')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
              filterChannel === 'Email'
                ? 'bg-sky-600 text-white'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email ({emailCount})</span>
          </button>
        </div>

        {/* List of Notification Logs */}
        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          {filteredNotifications.map((notif) => (
            <div 
              key={notif.id}
              className={`p-4 rounded-2xl border text-xs space-y-2 relative overflow-hidden transition-all ${
                notif.isEmergencyFallback
                  ? 'bg-rose-50/80 border-rose-300 ring-1 ring-rose-300/50 shadow-sm'
                  : notif.status === 'Failed'
                  ? 'bg-red-50/70 border-red-200'
                  : notif.channel === 'WhatsApp'
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : notif.channel === 'SMS'
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              {/* Top Row */}
              <div className="flex items-center justify-between font-bold text-slate-900">
                <div className="flex items-center gap-2 flex-wrap">
                  {notif.isEmergencyFallback ? (
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-rose-600 text-white flex items-center gap-1 shadow-sm">
                      <Flame className="w-3 h-3" />
                      <span>🚨 EMERGENCY SMS TRIGGERED</span>
                    </span>
                  ) : (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                      notif.status === 'Failed'
                        ? 'bg-red-600 text-white'
                        : notif.channel === 'WhatsApp'
                        ? 'bg-emerald-600 text-white'
                        : notif.channel === 'SMS'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-white'
                    }`}>
                      {notif.channel === 'WhatsApp' && <MessageSquare className="w-3 h-3" />}
                      {notif.channel === 'SMS' && <Smartphone className="w-3 h-3" />}
                      {notif.channel === 'Email' && <Mail className="w-3 h-3" />}
                      <span>{notif.channel}</span>
                    </span>
                  )}

                  <span className="text-slate-600 font-mono">Re: #{notif.ticketId} ({notif.cid})</span>

                  {notif.attempts && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      notif.status === 'Failed' || notif.isEmergencyFallback 
                        ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      Attempts: {notif.attempts}/3 {notif.status === 'Failed' ? '(All Failed)' : notif.isEmergencyFallback ? '(Failover)' : '(Success)'}
                    </span>
                  )}
                </div>

                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(notif.timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              {/* Title & Body */}
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-900 text-xs">{notif.title}</p>
                {notif.gateway && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    Gateway: {notif.gateway}
                  </span>
                )}
              </div>

              <div className={`p-3 rounded-xl border text-slate-700 italic ${
                notif.isEmergencyFallback 
                  ? 'bg-white border-rose-200 text-rose-950 font-medium'
                  : 'bg-white border-slate-200'
              }`}>
                "{notif.message}"
              </div>

              {/* Delivery Log Steps */}
              {notif.deliveryLog && notif.deliveryLog.length > 0 && (
                <div className="bg-slate-950 text-emerald-400 p-2.5 rounded-xl font-mono text-[10px] space-y-1">
                  <div className="text-slate-400 font-bold border-b border-slate-800 pb-0.5 mb-1 flex items-center justify-between">
                    <span>Delivery Attempt Trace ({notif.deliveryLog.length} events)</span>
                    {notif.isEmergencyFallback && <span className="text-rose-400 font-bold">Automatic Fallback Triggered</span>}
                  </div>
                  {notif.deliveryLog.map((log, idx) => (
                    <div key={idx} className={log.includes('Failed') ? 'text-rose-400' : 'text-emerald-400'}>
                      › {log}
                    </div>
                  ))}
                </div>
              )}

              {/* Status footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100/60">
                <span>Receiver: <strong className="text-slate-700">{notif.recipient}</strong> ({notif.recipientType})</span>
                
                {notif.status === 'Failed' ? (
                  <span className="text-red-600 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span>Failed (3 Attempts Exhausted)</span>
                  </span>
                ) : notif.isEmergencyFallback ? (
                  <span className="text-rose-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Emergency SMS Delivered</span>
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{notif.status}</span>
                  </span>
                )}
              </div>
            </div>
          ))}

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12 text-xs text-slate-500 space-y-1">
              <Info className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No notifications match the selected filter.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

