import React from 'react';
import { Ticket } from '../types';
import { DeltaLogo } from './DeltaLogo';
import { X, Printer, Wrench, ShieldAlert, CheckSquare, MapPin, Phone, User, Radio, FileText } from 'lucide-react';

interface WorkOrderModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  lang: 'bn' | 'en';
}

export const WorkOrderModal: React.FC<WorkOrderModalProps> = ({
  ticket,
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen || !ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-300 text-slate-900 overflow-hidden my-8 print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none">
        
        {/* Top Control Bar (Hidden when Printing) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm font-mono">
              {lang === 'bn' ? 'অপটিক্যাল ফিল্ড জব শিট ও প্রিন্ট ওয়ার্ক অর্ডার' : 'Printable Optical Field Work Order'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'bn' ? 'প্রিন্ট ওয়ার্ক অর্ডার' : 'Print Job Sheet'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet Content */}
        <div className="p-6 md:p-8 space-y-6 print:p-6 print:text-black">
          
          {/* Document Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
            <div>
              <DeltaLogo size="md" theme="light" showTagline={true} />
              <p className="text-xs text-slate-600 mt-1 font-semibold">
                Delta Mithapukur Broadband & Optical Fiber Network Operations Center (NOC)
              </p>
              <p className="text-[11px] text-slate-500">HQ: Main Road, Mithapukur Sadar, Rangpur | Support Line: +880 1711-002233</p>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-slate-900 text-emerald-400 font-mono text-xs font-bold rounded-lg mb-1">
                WORK ORDER #{ticket.id}
              </div>
              <p className="text-xs text-slate-500 font-mono">Date: {new Date().toLocaleDateString('en-GB')}</p>
              <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mt-1">
                Priority: {ticket.priority}
              </p>
            </div>
          </div>

          {/* Job Title & Dispatch Unit */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {lang === 'bn' ? 'কাজের বিষয় ও সমস্যা' : 'Job Subject & Severity'}
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-0.5">{ticket.title}</h2>
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-mono text-xs font-bold rounded">
                Category: {ticket.category}
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-300 min-w-[200px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                {lang === 'bn' ? 'দায়িত্বপ্রাপ্ত ফিল্ড ইউনিট' : 'Assigned Repair Squad'}
              </span>
              <p className="text-xs font-extrabold text-emerald-700 mt-0.5 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" />
                <span>{ticket.assignedNoc || 'Mithapukur Emergency Line Squad'}</span>
              </p>
            </div>
          </div>

          {/* Client & Technical Specifications Table */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-slate-500 font-medium block">{lang === 'bn' ? 'গ্রাহকের নাম' : 'Client Name'}</span>
              <p className="font-bold text-slate-900 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span>{ticket.clientName}</span>
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-slate-500 font-medium block">{lang === 'bn' ? 'গ্রাহক সিআইডি (CID)' : 'Subscriber CID'}</span>
              <p className="font-mono font-bold text-indigo-700">{ticket.cid}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-slate-500 font-medium block">{lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}</span>
              <p className="font-mono font-bold text-slate-900 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-600" />
                <span>{ticket.clientPhone}</span>
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-slate-500 font-medium block">{lang === 'bn' ? 'ইউনিয়ন ও এলাকা' : 'Union & Location'}</span>
              <p className="font-bold text-slate-900 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-600" />
                <span>{ticket.area}</span>
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-slate-500 font-medium block">{lang === 'bn' ? 'টার্গেট অপটিক্যাল পাওয়ার' : 'Target Rx Power'}</span>
              <p className="font-mono font-bold text-rose-600 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-rose-500" />
                <span>{ticket.opticalPower || '-19.5 dBm Target'}</span>
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-slate-500 font-medium block">{lang === 'bn' ? 'প্যাকেজ স্পিড' : 'Package Bandwidth'}</span>
              <p className="font-bold text-emerald-700">{ticket.packageSpeed || '15 Mbps Dedicated'}</p>
            </div>
          </div>

          {/* Problem Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {lang === 'bn' ? 'সমস্যার সংক্ষিপ্ত বিবরণ (NOC Log):' : 'NOC Log & Issue Brief:'}
            </h4>
            <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed font-sans">
              {ticket.description}
            </p>
          </div>

          {/* Field Technician Mandatory Safety & Quality Inspection Protocol */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'bn' ? 'লাইনম্যান ফিল্ড সেফটি ও স্প্লাইসিং চেকলিস্ট' : 'Lineman Field Safety & Splicing Checklist'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                <input type="checkbox" className="rounded text-emerald-600" defaultChecked readOnly />
                <span>1. OTDR Cable Fault Distance Test Verified</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                <input type="checkbox" className="rounded text-emerald-600" defaultChecked readOnly />
                <span>2. Core Cleaver Cleanliness & Fusion Splicing</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                <input type="checkbox" className="rounded text-emerald-600" defaultChecked readOnly />
                <span>3. Joint Box Waterproof Enclosure Sealing</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                <input type="checkbox" className="rounded text-emerald-600" defaultChecked readOnly />
                <span>4. Optical Power Meter Test (-18 to -22 dBm)</span>
              </div>
            </div>
          </div>

          {/* Resolution Log Note Field */}
          <div className="border-t border-slate-200 pt-4 space-y-1">
            <span className="text-xs font-bold text-slate-800 block">
              {lang === 'bn' ? 'অফিশিয়াল সমাধান বিবরণ (Official Resolution Log):' : 'Official Resolution Log:'}
            </span>
            <div className="min-h-[60px] p-3 bg-slate-50 rounded-lg border border-slate-300 text-xs font-mono text-slate-800">
              {ticket.resolutionNote || 'Pending field tech completion report. Splicing verified at pole #14.'}
            </div>
          </div>

          {/* Signatures Footer */}
          <div className="pt-8 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-b border-slate-400 mb-1 h-8"></div>
              <p className="font-bold text-slate-800">{lang === 'bn' ? 'লাইনম্যান / টেকনিশিয়ান স্বাক্ষর' : 'Lineman / Field Tech Signature'}</p>
            </div>
            <div>
              <div className="border-b border-slate-400 mb-1 h-8"></div>
              <p className="font-bold text-slate-800">{lang === 'bn' ? 'ব্রাঞ্চ ম্যানেজার অনুমোদন' : 'Branch Manager Authorization'}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
