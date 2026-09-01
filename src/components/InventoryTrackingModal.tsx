import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InventoryManager } from './InventoryManager';
import { InventoryItem, InventoryLog, NocStaff, ClientInfo } from '../types';
import { Package, X, Maximize2 } from 'lucide-react';

interface InventoryTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  inventoryLogs: InventoryLog[];
  nocStaff: NocStaff[];
  clients: ClientInfo[];
  lang: 'bn' | 'en';
  onAddInventoryItem: (item: InventoryItem) => void;
  onUpdateInventoryItem: (item: InventoryItem) => void;
  onDeleteInventoryItem: (itemId: string) => void;
  onRestockItem: (itemId: string, quantity: number, notes?: string, performedBy?: string) => void;
  onDispatchItem: (
    itemId: string, 
    quantity: number, 
    targetRecipient: string, 
    actionType: 'DISPATCH_FIELD' | 'CLIENT_INSTALL' | 'REPLACE_FAULTY',
    ticketId?: string,
    notes?: string, 
    performedBy?: string
  ) => void;
  currentUser?: { username: string; name: string; role?: string } | null;
}

export const InventoryTrackingModal: React.FC<InventoryTrackingModalProps> = ({
  isOpen,
  onClose,
  inventory,
  inventoryLogs,
  nocStaff,
  clients,
  lang,
  onAddInventoryItem,
  onUpdateInventoryItem,
  onDeleteInventoryItem,
  onRestockItem,
  onDispatchItem,
  currentUser,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 15 }}
          className="bg-slate-950 border border-slate-700/80 rounded-2xl w-full max-w-7xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        >
          {/* Modal Header */}
          <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Package className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  {lang === 'bn' ? 'ডেল্টা ব্রডব্যান্ড হার্ডওয়্যার ও স্পেয়ার্স ইনভেন্টরি' : 'Delta Hardware & Spares Inventory'}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    Live NOC Sync
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'bn' 
                    ? 'রাউটার, ওএনইউ, অপটিক্যাল ফাইবার, ড্রপ ক্যাবল এবং ফিল্ড স্পেয়ার্স ট্র্যাকিং' 
                    : 'Manage spare routers, ONUs, fiber cables, SFP modules & low stock alerts'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                title={lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950/80">
            <InventoryManager
              inventory={inventory}
              inventoryLogs={inventoryLogs}
              nocStaff={nocStaff}
              clients={clients}
              lang={lang}
              onAddInventoryItem={onAddInventoryItem}
              onUpdateInventoryItem={onUpdateInventoryItem}
              onDeleteInventoryItem={onDeleteInventoryItem}
              onRestockItem={onRestockItem}
              onDispatchItem={onDispatchItem}
              currentUser={currentUser}
            />
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
