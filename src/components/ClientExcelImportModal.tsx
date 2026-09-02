import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Users, 
  Layers, 
  Database,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { ClientInfo } from '../types';
import { 
  parseClientExcelFile, 
  downloadClientExcelTemplate, 
  downloadClientCsvTemplate 
} from '../utils/excelHelper';

interface ClientExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingClients: ClientInfo[];
  onConfirmImport: (importedClients: ClientInfo[], mode: 'UPSERT' | 'APPEND' | 'OVERWRITE') => void;
  lang: 'bn' | 'en';
}

export const ClientExcelImportModal: React.FC<ClientExcelImportModalProps> = ({
  isOpen,
  onClose,
  existingClients,
  onConfirmImport,
  lang,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ClientInfo[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'UPSERT' | 'APPEND' | 'OVERWRITE'>('UPSERT');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelection = async (selectedFile: File) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setParsing(true);
    setParseErrors([]);
    setParsedData([]);

    try {
      const result = await parseClientExcelFile(selectedFile, existingClients);
      setParsedData(result.clients);
      setParseErrors(result.errors);
    } catch (err: any) {
      setParseErrors([err?.message || 'Error processing Excel file. Please verify column format.']);
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileSelection(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setParseErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExecuteImport = () => {
    if (parsedData.length === 0) return;
    onConfirmImport(parsedData, importMode);
    handleReset();
    onClose();
  };

  // Metrics for parsed clients vs existing
  const existingCidSet = new Set(existingClients.map(c => c.cid.toUpperCase()));
  const duplicateCids = parsedData.filter(c => existingCidSet.has(c.cid.toUpperCase())).length;
  const newCids = parsedData.length - duplicateCids;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <FileSpreadsheet className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 font-mono uppercase">
                <span>{lang === 'bn' ? 'গ্রাহক ডাটা এক্সেল ইমপোর্ট সেন্টার' : 'Subscriber Excel Import Center'}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] border border-emerald-500/30 font-bold">
                  .XLSX / .XLS / .CSV
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {lang === 'bn' 
                  ? 'মাইক্রোসফট এক্সেল শিট থেকে এক ক্লিকে শত শত গ্রাহক প্রোফাইল ডাটাবেজে অন্তর্ভুক্ত করুন'
                  : 'Batch import & synchronize subscriber records from Microsoft Excel or CSV spreadsheets'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Top Actions: Template Download Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-500/20 rounded-xl text-sky-400 border border-sky-500/30">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  {lang === 'bn' ? 'স্ট্যান্ডার্ড এক্সেল টেমপ্লেট ডাউনলোড করুন' : 'Download Standard Excel Template'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {lang === 'bn' 
                    ? 'প্রি-ফরমেটেড কলাম ও ডেমো গ্রাহক ডাটা সহ এক্সেল ফাইল (CID, PPPoE, IP, ONU MAC, Package)'
                    : 'Official formatted spreadsheet with sample subscribers, technical and billing headers'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={downloadClientExcelTemplate}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap active:scale-95 cursor-pointer"
                title="Download formatted Excel spreadsheet template (.xlsx)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'এক্সেল টেমপ্লেট (.xlsx)' : 'Excel Template (.xlsx)'}</span>
              </button>

              <button
                onClick={downloadClientCsvTemplate}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap active:scale-95 cursor-pointer"
                title="Download CSV spreadsheet template (.csv)"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>{lang === 'bn' ? 'CSV টেমপ্লেট (.csv)' : 'CSV Template (.csv)'}</span>
              </button>
            </div>
          </div>

          {/* Upload Area */}
          {!file && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]' 
                  : 'border-slate-700 bg-slate-900/60 hover:bg-slate-900 hover:border-emerald-500/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelection(e.target.files[0]);
                  }
                }}
              />
              
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-lg">
                <UploadCloud className="w-7 h-7 animate-bounce" />
              </div>

              <h3 className="text-sm font-bold text-white">
                {lang === 'bn' ? 'এক্সেল ফাইলটি এখানে টেনে আনুন বা ক্লিক করে সিলেক্ট করুন' : 'Drag & Drop your Excel file here, or browse files'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Supports Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)
              </p>
            </div>
          )}

          {/* Parsing State */}
          {parsing && (
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-xs font-mono text-slate-300">Parsing Excel columns, validating subscriber rows...</p>
            </div>
          )}

          {/* Errors Display */}
          {parseErrors.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>{lang === 'bn' ? 'এক্সেল ফাইল প্রক্রিয়াকরণে সমস্যা' : 'Excel Parsing Warnings / Errors'}</span>
              </div>
              <ul className="text-xs list-disc list-inside space-y-1 text-rose-200 font-mono">
                {parseErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Parsed Preview Section */}
          {parsedData.length > 0 && (
            <div className="space-y-4">
              
              {/* File Info & Statistics Bar */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-mono">{file?.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {(file?.size ? (file.size / 1024).toFixed(1) : 0)} KB • {parsedData.length} Subscribers Parsed
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'ফাইল পরিবর্তন করুন' : 'Change File'}
                </button>
              </div>

              {/* Import Mode Selector & Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div 
                  onClick={() => setImportMode('UPSERT')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    importMode === 'UPSERT' 
                      ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/50' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">1. Smart Upsert (Recommended)</span>
                    {importMode === 'UPSERT' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Updates existing records if CID matches; adds new clients if new.
                  </p>
                  <div className="mt-2 text-[10px] font-mono text-emerald-300 font-bold">
                    {duplicateCids} updates • {newCids} new additions
                  </div>
                </div>

                <div 
                  onClick={() => setImportMode('APPEND')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    importMode === 'APPEND' 
                      ? 'bg-sky-950/40 border-sky-500 ring-1 ring-sky-500/50' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">2. Append As New Only</span>
                    {importMode === 'APPEND' && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Adds all {parsedData.length} records without overwriting existing clients.
                  </p>
                  <div className="mt-2 text-[10px] font-mono text-sky-300 font-bold">
                    +{parsedData.length} subscribers total
                  </div>
                </div>

                <div 
                  onClick={() => setImportMode('OVERWRITE')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    importMode === 'OVERWRITE' 
                      ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500/50' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">3. Overwrite Database</span>
                    {importMode === 'OVERWRITE' && <CheckCircle2 className="w-4 h-4 text-rose-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Replaces current database with this Excel sheet ({parsedData.length} clients).
                  </p>
                  <div className="mt-2 text-[10px] font-mono text-rose-300 font-bold">
                    Reset & apply {parsedData.length} clients
                  </div>
                </div>
              </div>

              {/* Table Preview (First 8 rows) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Previewing Parsed Records (showing {Math.min(parsedData.length, 6)} of {parsedData.length}):</span>
                  <span>{parsedData.length} Records Verified</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
                  <table className="w-full text-left border-collapse text-[11px] font-mono">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                        <th className="p-2.5">CID</th>
                        <th className="p-2.5">Client Name</th>
                        <th className="p-2.5">Phone</th>
                        <th className="p-2.5">Package</th>
                        <th className="p-2.5">Area</th>
                        <th className="p-2.5">IP Address</th>
                        <th className="p-2.5">ONU MAC</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {parsedData.slice(0, 6).map((c, idx) => {
                        const isExisting = existingCidSet.has(c.cid.toUpperCase());
                        return (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="p-2.5 font-bold text-white flex items-center gap-1.5">
                              <span>{c.cid}</span>
                              {isExisting && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Existing
                                </span>
                              )}
                            </td>
                            <td className="p-2.5">{c.name}</td>
                            <td className="p-2.5">{c.phone}</td>
                            <td className="p-2.5 text-sky-400">{c.package}</td>
                            <td className="p-2.5">{c.area}</td>
                            <td className="p-2.5">{c.ipAddress}</td>
                            <td className="p-2.5 text-slate-400">{c.onuMac}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                c.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                              }`}>
                                {c.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-slate-400 font-mono">
            {parsedData.length > 0 
              ? `${parsedData.length} clients ready to import into Delta Mithapukur Database` 
              : 'Please upload an Excel spreadsheet to begin'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>

            <button
              onClick={handleExecuteImport}
              disabled={parsedData.length === 0 || parsing}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {lang === 'bn' 
                  ? `ডাটাবেজে ইমপোর্ট সম্পন্ন করুন (${parsedData.length})` 
                  : `Confirm Import (${parsedData.length} Subscribers)`}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
