import React from 'react';
import { NotificationLog } from '../types';
import { X, BellRing, MessageSquare, Mail, Smartphone, CheckCircle2 } from 'lucide-react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <BellRing className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {lang === 'bn' ? 'হোয়াটসঅ্যাপ ও ইমেইল ডিসপ্যাচ লগ' : 'WhatsApp & Email Dispatch Log'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'bn' ? 'ম্যানেজার, নোক ও ক্লায়েন্টের নিকট প্রেরিত সকল নোটিফিকেশন' : 'Outbound alert notifications stream'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Notification Logs */}
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div 
              key={notif.id}
              className={`p-4 rounded-2xl border text-xs space-y-2 relative overflow-hidden ${
                notif.channel === 'WhatsApp'
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              {/* Top Row */}
              <div className="flex items-center justify-between font-bold text-slate-900">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    notif.channel === 'WhatsApp' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white'
                  }`}>
                    {notif.channel}
                  </span>
                  <span className="text-slate-600">Re: #{notif.ticketId} ({notif.cid})</span>
                </div>

                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(notif.timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Title & Body */}
              <p className="font-bold text-slate-900">{notif.title}</p>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 italic">
                "{notif.message}"
              </div>

              {/* Status footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Receiver: {notif.recipient} ({notif.recipientType})</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{notif.status}</span>
                </span>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <p className="text-center py-8 text-xs text-slate-500">
              No outbound notifications generated yet.
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
