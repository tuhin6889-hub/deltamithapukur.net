import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  InventoryItem, 
  InventoryLog, 
  InventoryCategory, 
  InventoryStockStatus, 
  NocStaff, 
  ClientInfo 
} from '../types';
import { 
  Package, 
  Router, 
  Cpu, 
  Cable, 
  Radio, 
  Layers, 
  Box, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  PlusCircle, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  ArrowDownRight, 
  ArrowUpRight, 
  MapPin, 
  ShieldAlert, 
  Tag, 
  Coins, 
  Truck, 
  Clock, 
  FileText, 
  ChevronDown, 
  SlidersHorizontal,
  Trash2,
  Edit3,
  X,
  Check,
  Zap,
  Info,
  History,
  Archive,
  ArrowRight
} from 'lucide-react';

interface InventoryManagerProps {
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

export const InventoryManager: React.FC<InventoryManagerProps> = ({
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
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'ALERTS' | 'LOGS'>('ITEMS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [restockTargetItem, setRestockTargetItem] = useState<InventoryItem | null>(null);
  const [dispatchTargetItem, setDispatchTargetItem] = useState<InventoryItem | null>(null);

  // Restock Form State
  const [restockQty, setRestockQty] = useState<number>(10);
  const [restockNotes, setRestockNotes] = useState('');

  // Dispatch Form State
  const [dispatchQty, setDispatchQty] = useState<number>(1);
  const [dispatchRecipientType, setDispatchRecipientType] = useState<'STAFF' | 'CLIENT' | 'VAN'>('STAFF');
  const [dispatchStaffName, setDispatchStaffName] = useState<string>(nocStaff[0]?.name || '');
  const [dispatchClientCid, setDispatchClientCid] = useState<string>(clients[0]?.cid || '');
  const [dispatchActionType, setDispatchActionType] = useState<'DISPATCH_FIELD' | 'CLIENT_INSTALL' | 'REPLACE_FAULTY'>('DISPATCH_FIELD');
  const [dispatchTicketId, setDispatchTicketId] = useState<string>('');
  const [dispatchNotes, setDispatchNotes] = useState('');

  // Add/Edit Item Form State
  const [formData, setFormData] = useState<{
    name: string;
    category: InventoryCategory;
    brand: string;
    model: string;
    location: string;
    totalStock: number;
    allocatedCount: number;
    minThreshold: number;
    unit: 'pcs' | 'reels' | 'meters' | 'box' | 'pkts' | 'rolls' | 'sets';
    unitPrice: number;
    sku: string;
    shelfNumber: string;
    notes: string;
  }>({
    name: '',
    category: 'Router',
    brand: '',
    model: '',
    location: 'মিঠাপুকুর হেডকোয়ার্টার স্টোর (HQ Central Store)',
    totalStock: 10,
    allocatedCount: 0,
    minThreshold: 5,
    unit: 'pcs',
    unitPrice: 1500,
    sku: '',
    shelfNumber: 'Rack-A1',
    notes: '',
  });

  // Calculate Metrics
  const metrics = useMemo(() => {
    const totalItemsCount = inventory.length;
    const totalStockUnits = inventory.reduce((acc, item) => acc + item.totalStock, 0);
    const totalAvailableUnits = inventory.reduce((acc, item) => acc + item.availableStock, 0);
    const totalAllocatedUnits = inventory.reduce((acc, item) => acc + item.allocatedCount, 0);
    const totalValuation = inventory.reduce((acc, item) => acc + (item.totalStock * item.unitPrice), 0);
    
    // Low stock items (available <= minThreshold)
    const lowStockItems = inventory.filter(item => item.availableStock <= item.minThreshold);
    const outOfStockItems = inventory.filter(item => item.availableStock <= 0);

    return {
      totalItemsCount,
      totalStockUnits,
      totalAvailableUnits,
      totalAllocatedUnits,
      totalValuation,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      lowStockItems,
    };
  }, [inventory]);

  // Unique Locations list
  const uniqueLocations = useMemo(() => {
    const set = new Set<string>();
    inventory.forEach(item => {
      if (item.location) set.add(item.location);
    });
    return Array.from(set);
  }, [inventory]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        item.name.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q) ||
        (item.sku && item.sku.toLowerCase().includes(q)) ||
        item.location.toLowerCase().includes(q)
      );

      // Category
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

      // Location
      const matchesLocation = selectedLocation === 'ALL' || item.location === selectedLocation;

      // Status
      let matchesStatus = true;
      if (selectedStatus === 'LOW') {
        matchesStatus = item.availableStock <= item.minThreshold;
      } else if (selectedStatus === 'IN_STOCK') {
        matchesStatus = item.availableStock > item.minThreshold;
      } else if (selectedStatus === 'OUT') {
        matchesStatus = item.availableStock <= 0;
      }

      // Tab Alert View filter
      if (activeTab === 'ALERTS') {
        return matchesSearch && item.availableStock <= item.minThreshold;
      }

      return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
    });
  }, [inventory, searchQuery, selectedCategory, selectedLocation, selectedStatus, activeTab]);

  // Category visual metadata
  const getCategoryMeta = (category: InventoryCategory) => {
    switch (category) {
      case 'Router':
        return { label: lang === 'bn' ? 'ওয়াইফাই রাউটার' : 'WiFi Routers', icon: Router, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' };
      case 'ONU':
        return { label: lang === 'bn' ? 'ওএনইউ / টার্মিনাল' : 'XPON/GPON ONU', icon: Cpu, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'Fiber_Cable':
        return { label: lang === 'bn' ? 'অপটিক্যাল ফাইবার ক্যাবল' : 'Fiber Cables', icon: Cable, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'Patch_Cord':
        return { label: lang === 'bn' ? 'প্যাচ কর্ড ও কানেক্টর' : 'Patch Cords & Fast Connectors', icon: Zap, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' };
      case 'SFP_Module':
        return { label: lang === 'bn' ? 'SFP পন মডিউল' : 'SFP Transceivers', icon: Radio, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
      case 'Splitter':
        return { label: lang === 'bn' ? 'PLC স্প্লিটার' : 'PLC Splitters', icon: Layers, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
      case 'TJ_Box':
        return { label: lang === 'bn' ? 'টিজে জয়েন্ট ক্লোজার' : 'TJ Splice Closures', icon: Box, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
      case 'Media_Converter':
        return { label: lang === 'bn' ? 'মিডিয়া কনভার্টার' : 'Media Converters', icon: Package, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
      case 'Tools_Accessories':
        return { label: lang === 'bn' ? 'টুলস ও টেস্ট মিটার' : 'Tools & Test Meters', icon: Wrench, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      default:
        return { label: category, icon: Package, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Router',
      brand: '',
      model: '',
      location: 'মিঠাপুকুর হেডকোয়ার্টার স্টোর (HQ Central Store)',
      totalStock: 10,
      allocatedCount: 0,
      minThreshold: 5,
      unit: 'pcs',
      unitPrice: 1800,
      sku: `INV-${Date.now().toString().slice(-4)}`,
      shelfNumber: 'Rack-A1',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      brand: item.brand,
      model: item.model,
      location: item.location,
      totalStock: item.totalStock,
      allocatedCount: item.allocatedCount,
      minThreshold: item.minThreshold,
      unit: item.unit,
      unitPrice: item.unitPrice,
      sku: item.sku || '',
      shelfNumber: item.shelfNumber || '',
      notes: item.notes || '',
    });
    setIsAddModalOpen(true);
  };

  // Save Add/Edit
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const availableStock = Math.max(0, formData.totalStock - formData.allocatedCount);
    let status: InventoryStockStatus = 'In_Stock';
    if (availableStock <= 0) {
      status = 'Out_of_Stock';
    } else if (availableStock <= formData.minThreshold) {
      status = 'Low_Stock';
    }

    if (editingItem) {
      const updated: InventoryItem = {
        ...editingItem,
        ...formData,
        availableStock,
        status,
        lastRestocked: new Date().toISOString(),
      };
      onUpdateInventoryItem(updated);
    } else {
      const newItem: InventoryItem = {
        id: `INV-${Date.now()}`,
        ...formData,
        availableStock,
        status,
        lastRestocked: new Date().toISOString(),
      };
      onAddInventoryItem(newItem);
    }

    setIsAddModalOpen(false);
    setEditingItem(null);
  };

  // Execute Restock
  const handleConfirmRestock = () => {
    if (!restockTargetItem || restockQty <= 0) return;
    const actor = currentUser?.name ? `${currentUser.name} (${currentUser.role || 'Staff'})` : 'NOC Manager';
    onRestockItem(restockTargetItem.id, restockQty, restockNotes, actor);
    setRestockTargetItem(null);
    setRestockNotes('');
  };

  // Execute Dispatch
  const handleConfirmDispatch = () => {
    if (!dispatchTargetItem || dispatchQty <= 0) return;
    let recipient = dispatchStaffName;
    if (dispatchRecipientType === 'CLIENT') {
      const client = clients.find(c => c.cid === dispatchClientCid);
      recipient = client ? `${client.name} (${client.cid})` : dispatchClientCid;
    } else if (dispatchRecipientType === 'VAN') {
      recipient = 'ফিল্ড টেকনিশিয়ান ভ্যান (Field Van #1)';
    }

    const actor = currentUser?.name ? `${currentUser.name} (${currentUser.role || 'Staff'})` : 'NOC Engineer';
    onDispatchItem(
      dispatchTargetItem.id,
      dispatchQty,
      recipient,
      dispatchActionType,
      dispatchTicketId || undefined,
      dispatchNotes,
      actor
    );

    setDispatchTargetItem(null);
    setDispatchNotes('');
    setDispatchTicketId('');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Item Name', 'Category', 'Brand', 'Model', 'Location', 'Available Stock', 'Total Stock', 'Min Alert Threshold', 'Unit', 'Unit Price (BDT)', 'Total Value (BDT)', 'Status', 'Last Restocked'];
    const rows = inventory.map(item => [
      item.id,
      `"${item.name.replace(/"/g, '""')}"`,
      item.category,
      `"${item.brand}"`,
      `"${item.model}"`,
      `"${item.location}"`,
      item.availableStock,
      item.totalStock,
      item.minThreshold,
      item.unit,
      item.unitPrice,
      item.totalStock * item.unitPrice,
      item.status,
      item.lastRestocked,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Delta_Hardware_Inventory_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/70 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Package className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                {lang === 'bn' ? 'হার্ডওয়্যার ও স্পেয়ার্স ইনভেন্টরি ট্র্যাকিং' : 'Hardware & Spares Inventory'}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  {inventory.length} {lang === 'bn' ? 'আইটেম' : 'Items'}
                </span>
              </h2>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
              {lang === 'bn' 
                ? 'রাউটার, ওএনইউ, অপটিক্যাল ফাইবার ড্রপ ক্যাবল, SFP মডিউল এবং ফিল্ড যন্ত্রাংশের লাইভ স্টক ও নোক (NOC) অ্যালার্ট।'
                : 'Real-time inventory tracking for spare routers, ONUs, fiber drop cables, SFP transceivers and NOC stock alerts.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'CSV রিপোর্ট ডাউনলোড' : 'Export CSV'}</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{lang === 'bn' ? 'নতুন হার্ডওয়্যার যোগ' : 'Add Hardware Item'}</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>{lang === 'bn' ? 'মোট হার্ডওয়্যার স্টক' : 'Total Stock Units'}</span>
              <Box className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-white flex items-baseline gap-1.5">
              <span>{metrics.totalStockUnits}</span>
              <span className="text-xs text-slate-400 font-normal">{lang === 'bn' ? 'ইউনিট' : 'Units'}</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{metrics.totalAvailableUnits} {lang === 'bn' ? 'উপলব্ধ (Available)' : 'Available'}</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>{lang === 'bn' ? 'মোট ইনভেন্টরি মূল্যায়ন' : 'Inventory Valuation'}</span>
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400">
              ৳ {metrics.totalValuation.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {inventory.length} {lang === 'bn' ? 'টি ভিন্ন মডেল ও স্পেস' : 'different hardware SKUs'}
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('ALERTS')}
            className={`border rounded-xl p-3.5 cursor-pointer transition-all ${
              metrics.lowStockCount > 0 
                ? 'bg-rose-950/30 border-rose-500/40 hover:border-rose-400' 
                : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-rose-300 text-xs mb-1">
              <span className="font-semibold">{lang === 'bn' ? 'NOC লো স্টক অ্যালার্ট' : 'NOC Stock Alerts'}</span>
              <AlertTriangle className={`w-3.5 h-3.5 ${metrics.lowStockCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
            </div>
            <div className="text-xl font-bold text-rose-400 flex items-baseline gap-1.5">
              <span>{metrics.lowStockCount}</span>
              <span className="text-xs text-rose-300/80 font-normal">{lang === 'bn' ? 'আইটেম কম' : 'Items Low'}</span>
            </div>
            <div className="text-[11px] text-rose-300/70 mt-1 flex items-center gap-1">
              <span>{metrics.outOfStockCount > 0 ? `${metrics.outOfStockCount} ${lang === 'bn' ? 'টি আউট অব স্টক' : 'Out of Stock'}` : (lang === 'bn' ? 'রি-অর্ডার প্রয়োজন' : 'Reorder recommended')}</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>{lang === 'bn' ? 'মাঠে বরাদ্দ / ইস্যুকৃত' : 'Field Dispatched'}</span>
              <Truck className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-xl font-bold text-sky-400 flex items-baseline gap-1.5">
              <span>{metrics.totalAllocatedUnits}</span>
              <span className="text-xs text-sky-300/80 font-normal">{lang === 'bn' ? 'ইউনিট' : 'Allocated'}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {lang === 'bn' ? 'ভ্যান ও টেকনিশিয়ান রুট' : 'NOC Vans & Technicians'}
            </div>
          </div>

        </div>
      </div>

      {/* NOC Stock Warning Notice Banner (If low stock exists) */}
      {metrics.lowStockCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-950/50 border border-rose-500/50 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-rose-200 shadow-md"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-600/30 text-rose-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>{lang === 'bn' ? 'জরুরি নোক (NOC) হার্ডওয়্যার স্টক সতর্কবার্তা:' : 'Critical NOC Hardware Stock Warning:'}</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-bold">
                  {metrics.lowStockCount} {lang === 'bn' ? 'টি আইটেম নিচে নেমেছে' : 'Low Stock Items'}
                </span>
              </div>
              <p className="text-xs text-rose-200/90 mt-0.5">
                {lang === 'bn' 
                  ? 'নিম্নলিখিত যন্ত্রাংশগুলো ন্যূনতম থ্রেশহোল্ডের নিচে নেমে গেছে। মাঠপর্যায়ে নতুন সংযোগ ও মেরামত ব্যাহত হওয়ার আগেই রিস্টক করুন।' 
                  : 'The components below are running under safety thresholds. Restock immediately to prevent installation delays.'}
              </p>
              
              {/* Quick Pills of Low Items */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {metrics.lowStockItems.slice(0, 4).map(item => (
                  <span 
                    key={item.id}
                    onClick={() => {
                      setRestockTargetItem(item);
                      setRestockQty(item.minThreshold * 2);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 border border-rose-500/40 text-white text-[11px] font-medium transition-all cursor-pointer"
                  >
                    <span>{item.name}</span>
                    <strong className="text-rose-300">({item.availableStock}/{item.minThreshold} {item.unit})</strong>
                    <RefreshCw className="w-3 h-3 text-rose-300" />
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ALERTS')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              {lang === 'bn' ? 'সকল অ্যালার্ট দেখুন' : 'View All Alerts'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('ITEMS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ITEMS'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'হার্ডওয়্যার স্টক তালিকা' : 'Hardware Stock List'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
              {inventory.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ALERTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'ALERTS'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{lang === 'bn' ? 'NOC লো-স্টক অ্যালার্ট' : 'Low Stock Alerts'}</span>
            {metrics.lowStockCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                {metrics.lowStockCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('LOGS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'LOGS'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'স্টক মুভমেন্ট ও ফিল্ড অডিট লগ' : 'Movement & Audit Logs'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
              {inventoryLogs.length}
            </span>
          </button>
        </div>

        {activeTab !== 'LOGS' && (
          <div className="text-xs text-slate-400">
            {lang === 'bn' ? `মোট ${filteredItems.length} টি আইটেম প্রদর্শিত` : `Showing ${filteredItems.length} hardware components`}
          </div>
        )}
      </div>

      {/* Filter and Search Toolbar */}
      {activeTab !== 'LOGS' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'bn' ? 'রাউটার মডেল, ব্র্যান্ড, ক্যাবল বা অবস্থান খুঁজুন...' : 'Search by model, brand, drop cable or location...'}
                className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Storage Location Filter */}
            <div className="w-full sm:w-60">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:border-emerald-500 outline-none"
              >
                <option value="ALL">{lang === 'bn' ? 'সকল স্টোরেজ লোকেশন' : 'All Storage Locations'}</option>
                {uniqueLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-44">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:border-emerald-500 outline-none"
              >
                <option value="ALL">{lang === 'bn' ? 'সকল স্টক স্ট্যাটাস' : 'All Stock Status'}</option>
                <option value="LOW">{lang === 'bn' ? '⚠️ লো স্টক অ্যালার্ট' : '⚠️ Low Stock Alerts'}</option>
                <option value="IN_STOCK">{lang === 'bn' ? '✅ পর্যাপ্ত স্টক' : '✅ Healthy Stock'}</option>
                <option value="OUT">{lang === 'bn' ? '❌ আউট অব স্টক' : '❌ Out of Stock'}</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {lang === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}
            </button>

            {[
              { id: 'Router', labelBn: 'রাউটার (Routers)' },
              { id: 'ONU', labelBn: 'ওএনইউ (XPON/GPON)' },
              { id: 'Fiber_Cable', labelBn: 'ড্রপ ও মেইন ফাইবার (Cables)' },
              { id: 'SFP_Module', labelBn: 'SFP ট্রান্সসিভার (SFP)' },
              { id: 'Splitter', labelBn: 'PLC স্প্লিটার (Splitters)' },
              { id: 'TJ_Box', labelBn: 'টিজে বক্স (TJ Box)' },
              { id: 'Patch_Cord', labelBn: 'কানেক্টর ও প্যাচকর্ড' },
              { id: 'Tools_Accessories', labelBn: 'টুলস ও টেস্ট কিট' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat.labelBn}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === 'LOGS' ? (
        /* Stock Movement Logs Table */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-sky-400" />
              <h3 className="font-bold text-sm text-white">
                {lang === 'bn' ? 'হার্ডওয়্যার স্টক আদান-প্রদান ও টেকনিশিয়ান ইস্যু লগ' : 'Hardware Movement & Technician Dispatch History'}
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {inventoryLogs.length} {lang === 'bn' ? 'টি ট্রানজ্যাকশন' : 'transactions logged'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">{lang === 'bn' ? 'তারিখ ও সময়' : 'Timestamp'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'অ্যাকশন টাইপ' : 'Action'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'হার্ডওয়্যার আইটেম' : 'Item Name'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'পরিমাণ' : 'Quantity'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'প্রাপক / ফিল্ড ভ্যান' : 'Recipient / Target'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'দায়িত্বপ্রাপ্ত স্টাফ' : 'Logged By'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'মন্তব্য ও নোট' : 'Remarks'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {inventoryLogs.map(log => {
                  const isRestock = log.action === 'RESTOCK';
                  const isFaultyReplace = log.action === 'REPLACE_FAULTY';
                  const isDispatch = log.action === 'DISPATCH_FIELD' || log.action === 'CLIENT_INSTALL';

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString('en-GB', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                      <td className="py-3 px-4">
                        {isRestock ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                            <ArrowDownRight className="w-3 h-3" />
                            {lang === 'bn' ? 'রিস্টক (ইন)' : 'RESTOCKED'}
                          </span>
                        ) : isFaultyReplace ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[11px]">
                            <RefreshCw className="w-3 h-3" />
                            {lang === 'bn' ? 'ফল্ট রিপ্লেসমেন্ট' : 'FAULTY REPLACE'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold text-[11px]">
                            <ArrowUpRight className="w-3 h-3" />
                            {lang === 'bn' ? 'মাঠে ইস্যু (আউট)' : 'DISPATCHED'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-white max-w-xs truncate">
                        {log.itemName}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        {isRestock ? `+${log.quantity}` : `-${log.quantity}`} {log.unit}
                      </td>
                      <td className="py-3 px-4 text-slate-200">
                        {log.targetRecipient || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {log.performedBy}
                      </td>
                      <td className="py-3 px-4 text-slate-400 max-w-sm truncate text-[11px]">
                        {log.notes || '-'}
                        {log.ticketId && (
                          <span className="ml-1.5 text-sky-400 font-mono">[{log.ticketId}]</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Inventory Items Grid / Cards */
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <Package className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <h4 className="text-base font-bold text-white mb-1">
                {lang === 'bn' ? 'কোন হার্ডওয়্যার আইটেম পাওয়া যায়নি' : 'No Hardware Items Found'}
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                {lang === 'bn' 
                  ? 'আপনার ফিল্টারিংয়ের সাথে কোনো রাউটার বা অপটিক্যাল ফাইবার মিলছে না। নতুন আইটেম যোগ করতে পারেন।' 
                  : 'No hardware matching the selected criteria. You can add new stock items.'}
              </p>
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{lang === 'bn' ? 'নতুন হার্ডওয়্যার যোগ করুন' : 'Add New Hardware'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map(item => {
                const categoryMeta = getCategoryMeta(item.category);
                const isLowStock = item.availableStock <= item.minThreshold;
                const isOutOfStock = item.availableStock <= 0;
                const CategoryIcon = categoryMeta.icon;
                const stockRatio = Math.min(100, Math.round((item.availableStock / (item.totalStock || 1)) * 100));

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between transition-all shadow-md hover:shadow-xl relative overflow-hidden ${
                      isLowStock 
                        ? 'border-rose-500/50 bg-gradient-to-b from-slate-900 to-rose-950/20' 
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Low Stock Warning Header Tag */}
                    {isLowStock && (
                      <div className="absolute top-0 right-0 px-3 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{isOutOfStock ? 'OUT OF STOCK' : 'LOW STOCK ALERT'}</span>
                      </div>
                    )}

                    <div>
                      {/* Top Row: Category Badge & Brand */}
                      <div className="flex items-center justify-between gap-2 mb-2 pr-20">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${categoryMeta.color}`}>
                          <CategoryIcon className="w-3 h-3" />
                          <span>{categoryMeta.label}</span>
                        </span>
                        {item.brand && (
                          <span className="text-[11px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                            {item.brand}
                          </span>
                        )}
                      </div>

                      {/* Hardware Name & Model */}
                      <h4 className="text-sm sm:text-base font-bold text-white leading-snug mb-1">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mb-3">
                        {item.model} {item.sku ? `• SKU: ${item.sku}` : ''}
                      </p>

                      {/* Location & Shelf */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 mb-3">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{item.location}</span>
                        {item.shelfNumber && (
                          <span className="ml-auto text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                            {item.shelfNumber}
                          </span>
                        )}
                      </div>

                      {/* Stock Progress Bar & Metrics */}
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-400">{lang === 'bn' ? 'উপলব্ধ স্টক (Available):' : 'Available Stock:'}</span>
                          <span className={`font-bold ${isLowStock ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {item.availableStock} / {item.totalStock} {item.unit}
                          </span>
                        </div>

                        {/* Progress meter */}
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              isLowStock 
                                ? 'bg-rose-500' 
                                : stockRatio > 50 
                                  ? 'bg-emerald-500' 
                                  : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.max(5, stockRatio)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                          <span>{lang === 'bn' ? 'মাঠে ইস্যু:' : 'Field Allocated:'} <strong className="text-slate-300">{item.allocatedCount} {item.unit}</strong></span>
                          <span>{lang === 'bn' ? 'অ্যালার্ট সীমা:' : 'Min Alert:'} <strong className="text-amber-300">≤{item.minThreshold} {item.unit}</strong></span>
                        </div>
                      </div>

                      {/* Pricing & Valuation */}
                      <div className="flex items-center justify-between text-xs py-2 border-t border-slate-800/80 mb-3">
                        <span className="text-slate-400">{lang === 'bn' ? 'ইউনিট মূল্য:' : 'Unit Price:'}</span>
                        <span className="font-bold text-white">৳ {item.unitPrice.toLocaleString()} / {item.unit}</span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setRestockTargetItem(item);
                            setRestockQty(10);
                          }}
                          className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                          title={lang === 'bn' ? 'স্টক রিস্টক করুন' : 'Restock Item'}
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>{lang === 'bn' ? 'রিস্টক' : 'Restock'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setDispatchTargetItem(item);
                            setDispatchQty(1);
                          }}
                          disabled={item.availableStock <= 0}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            item.availableStock > 0
                              ? 'bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30'
                              : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed opacity-50'
                          }`}
                          title={lang === 'bn' ? 'মাঠে বা টেকনিশিয়ানকে ইস্যু করুন' : 'Dispatch / Issue to Field'}
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>{lang === 'bn' ? 'ইস্যু' : 'Dispatch'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                          title={lang === 'bn' ? 'আইটেম এডিট করুন' : 'Edit Item'}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(lang === 'bn' ? `আপনি কি নিশ্চিত '${item.name}' ইনভেন্টরি থেকে মুছতে চান?` : `Delete '${item.name}' from inventory?`)) {
                              onDeleteInventoryItem(item.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                          title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete Item'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Restock Modal */}
      <AnimatePresence>
        {restockTargetItem && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 text-white shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <PlusCircle className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      {lang === 'bn' ? 'স্টক রিস্টক / নতুন সরবরাহ' : 'Restock Hardware Stock'}
                    </h3>
                    <p className="text-xs text-slate-400">{restockTargetItem.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setRestockTargetItem(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>{lang === 'bn' ? 'বর্তমান উপলব্ধ স্টক:' : 'Current Available Stock:'}</span>
                  <strong className="text-white">{restockTargetItem.availableStock} {restockTargetItem.unit}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{lang === 'bn' ? 'লো স্টক সতর্কবার্তা সীমা:' : 'Alert Threshold:'}</span>
                  <strong className="text-amber-300">≤{restockTargetItem.minThreshold} {restockTargetItem.unit}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{lang === 'bn' ? 'স্টোরেজ অবস্থান:' : 'Location:'}</span>
                  <span className="text-slate-300">{restockTargetItem.location}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? `যোগ করার পরিমাণ (${restockTargetItem.unit}) *` : `Add Quantity (${restockTargetItem.unit}) *`}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={restockQty}
                    onChange={(e) => setRestockQty(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-lg font-bold text-emerald-400 focus:border-emerald-500 outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {lang === 'bn' ? `রিস্টকের পর মোট স্টক হবে: ${restockTargetItem.totalStock + restockQty} ${restockTargetItem.unit}` : `New total stock will be: ${restockTargetItem.totalStock + restockQty} ${restockTargetItem.unit}`}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'চালান / সাপ্লায়ার নোট (ঐচ্ছিক)' : 'Invoice / Supplier Note (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={restockNotes}
                    onChange={(e) => setRestockNotes(e.target.value)}
                    placeholder="e.g. কম্পিউটার সিটি চালান #৮৪৫২, ব্যাচ-৩"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRestockTargetItem(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRestock}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
                >
                  <Check className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'রিস্টক নিশ্চিত করুন' : 'Confirm Restock'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dispatch / Issue to Field Modal */}
      <AnimatePresence>
        {dispatchTargetItem && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 text-white shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                    <Truck className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      {lang === 'bn' ? 'মাঠপর্যায়ে বা গ্রাহককে হার্ডওয়্যার ইস্যু' : 'Dispatch / Issue to Field'}
                    </h3>
                    <p className="text-xs text-slate-400">{dispatchTargetItem.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDispatchTargetItem(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>{lang === 'bn' ? 'উপলব্ধ স্টক:' : 'Available Stock:'}</span>
                  <strong className="text-emerald-400">{dispatchTargetItem.availableStock} {dispatchTargetItem.unit}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{lang === 'bn' ? 'লোকেশন:' : 'Location:'}</span>
                  <span className="text-slate-300">{dispatchTargetItem.location}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'ইস্যুর উদ্দেশ্য / ধরন *' : 'Dispatch Purpose *'}
                  </label>
                  <select
                    value={dispatchActionType}
                    onChange={(e: any) => setDispatchActionType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-sky-500 outline-none"
                  >
                    <option value="DISPATCH_FIELD">{lang === 'bn' ? 'ফিল্ড টেকনিশিয়ান / ভ্যানে ইস্যু' : 'Dispatch to NOC Field Technician'}</option>
                    <option value="CLIENT_INSTALL">{lang === 'bn' ? 'নতুন গ্রাহক সংযোগ ইনস্টলেশন' : 'New Client Installation'}</option>
                    <option value="REPLACE_FAULTY">{lang === 'bn' ? 'ত্রুটিপূর্ণ ডিভাইস রিপ্লেসমেন্ট (বজ্রপাত/LOS)' : 'Faulty Device Replacement'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? `ইস্যুর পরিমাণ (${dispatchTargetItem.unit}) *` : `Quantity (${dispatchTargetItem.unit}) *`}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={dispatchTargetItem.availableStock}
                    value={dispatchQty}
                    onChange={(e) => setDispatchQty(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-lg font-bold text-sky-400 focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'প্রাপক নির্বাচন *' : 'Recipient Target *'}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    <button
                      type="button"
                      onClick={() => setDispatchRecipientType('STAFF')}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        dispatchRecipientType === 'STAFF'
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {lang === 'bn' ? 'টেকনিশিয়ান' : 'NOC Staff'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDispatchRecipientType('CLIENT')}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        dispatchRecipientType === 'CLIENT'
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {lang === 'bn' ? 'গ্রাহক (CID)' : 'Client CID'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDispatchRecipientType('VAN')}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        dispatchRecipientType === 'VAN'
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {lang === 'bn' ? 'ফিল্ড ভ্যান' : 'Field Van'}
                    </button>
                  </div>

                  {dispatchRecipientType === 'STAFF' && (
                    <select
                      value={dispatchStaffName}
                      onChange={(e) => setDispatchStaffName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-sky-500 outline-none"
                    >
                      {nocStaff.map(staff => (
                        <option key={staff.id} value={staff.name}>
                          {staff.name} ({staff.designation} - {staff.area})
                        </option>
                      ))}
                    </select>
                  )}

                  {dispatchRecipientType === 'CLIENT' && (
                    <select
                      value={dispatchClientCid}
                      onChange={(e) => setDispatchClientCid(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-sky-500 outline-none"
                    >
                      {clients.map(c => (
                        <option key={c.cid} value={c.cid}>
                          {c.cid} - {c.name} ({c.area})
                        </option>
                      ))}
                    </select>
                  )}

                  {dispatchRecipientType === 'VAN' && (
                    <input
                      type="text"
                      readOnly
                      value="ফিল্ড টেকনিশিয়ান ভ্যান (Field Van #1 - Mithapukur Route)"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'সাপোর্ট টিকেট আইডি (যদি থাকে)' : 'Associated Ticket ID (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={dispatchTicketId}
                    onChange={(e) => setDispatchTicketId(e.target.value)}
                    placeholder="e.g. TKT-8842"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {lang === 'bn' ? 'মন্তব্য ও সিরিয়াল নম্বর' : 'Remarks / Serial Numbers'}
                  </label>
                  <input
                    type="text"
                    value={dispatchNotes}
                    onChange={(e) => setDispatchNotes(e.target.value)}
                    placeholder="e.g. বজ্রপাতে নষ্ট ওএনইউ রিপ্লেস"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDispatchTargetItem(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDispatch}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-950/40"
                >
                  <Truck className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'ইস্যু সম্পন্ন করুন' : 'Confirm Dispatch'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Hardware Item Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 text-white shadow-2xl my-8 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Package className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      {editingItem 
                        ? (lang === 'bn' ? 'হার্ডওয়্যার আইটেম এডিট করুন' : 'Edit Hardware Item')
                        : (lang === 'bn' ? 'নতুন হার্ডওয়্যার আইটেম রেজিস্টার' : 'Register New Hardware Component')}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {lang === 'bn' ? 'রাউটার, ওএনইউ, অপটিক্যাল ফাইবার বা টুলস' : 'Routers, ONUs, Fiber Cables or Tools'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      {lang === 'bn' ? 'ক্যাটাগরি *' : 'Category *'}
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none"
                    >
                      <option value="Router">{lang === 'bn' ? 'ওয়াইফাই রাউটার (Router)' : 'WiFi Router'}</option>
                      <option value="ONU">{lang === 'bn' ? 'ওএনইউ / টার্মিনাল (XPON/GPON ONU)' : 'XPON/GPON ONU'}</option>
                      <option value="Fiber_Cable">{lang === 'bn' ? 'অপটিক্যাল ফাইবার ড্রপ ক্যাবল (Fiber Cable)' : 'Optical Fiber Cable'}</option>
                      <option value="Patch_Cord">{lang === 'bn' ? 'প্যাচকর্ড ও ফাস্ট কানেক্টর (Patch Cord)' : 'Patch Cord & Fast Connector'}</option>
                      <option value="SFP_Module">{lang === 'bn' ? 'SFP পন মডিউল (SFP Transceiver)' : 'SFP Transceiver Module'}</option>
                      <option value="Splitter">{lang === 'bn' ? 'PLC স্প্লিটার (Optical Splitter)' : 'PLC Optical Splitter'}</option>
                      <option value="TJ_Box">{lang === 'bn' ? 'টিজে জয়েন্ট ডোম / ক্লোজার (TJ Box)' : 'TJ Joint Enclosure'}</option>
                      <option value="Media_Converter">{lang === 'bn' ? 'মিডিয়া কনভার্টার (Media Converter)' : 'Media Converter'}</option>
                      <option value="Tools_Accessories">{lang === 'bn' ? 'ফিল্ড টুলস ও অপটিক্যাল মিটার (Tools)' : 'Field Tools & Meters'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      {lang === 'bn' ? 'ব্র্যান্ড নাম *' : 'Brand Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g. TP-Link, Huawei, V-SOL, Tenda"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {lang === 'bn' ? 'আইটেমের পূর্ণ নাম ও স্পেসিফিকেশন *' : 'Item Full Name & Specification *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. TP-Link Archer C6 V3.2 Gigabit Dual-Band AC1200"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      {lang === 'bn' ? 'মডেল নম্বর *' : 'Model Number *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="e.g. Archer C6 / V2801SG"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      {lang === 'bn' ? 'SKU / কোড (ঐচ্ছিক)' : 'SKU / Barcode (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="e.g. TPL-C6-V32-BD"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      {lang === 'bn' ? 'মোট প্রারম্ভিক স্টক *' : 'Total Stock Count *'}
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.totalStock}
                      onChange={(e) => setFormData({ ...formData, totalStock: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-bold focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      {lang === 'bn' ? 'NOC অ্যালার্ট থ্রেশহোল্ড *' : 'NOC Alert Threshold *'}
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.minThreshold}
                      onChange={(e) => setFormData({ ...formData, minThreshold: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-rose-400 font-bold focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      {lang === 'bn' ? 'একক (Unit) *' : 'Unit *'}
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e: any) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none"
                    >
                      <option value="pcs">{lang === 'bn' ? 'টি (pcs)' : 'pcs'}</option>
                      <option value="reels">{lang === 'bn' ? 'রিল (reels)' : 'reels'}</option>
                      <option value="meters">{lang === 'bn' ? 'মিটার (meters)' : 'meters'}</option>
                      <option value="box">{lang === 'bn' ? 'বক্স (box)' : 'box'}</option>
                      <option value="pkts">{lang === 'bn' ? 'প্যাকেট (pkts)' : 'pkts'}</option>
                      <option value="sets">{lang === 'bn' ? 'সেট (sets)' : 'sets'}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      {lang === 'bn' ? 'প্রতি ইউনিট মূল্য (BDT ৳) *' : 'Unit Price (BDT ৳) *'}
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      {lang === 'bn' ? 'র্যাক / তাকের নম্বর' : 'Shelf / Rack No.'}
                    </label>
                    <input
                      type="text"
                      value={formData.shelfNumber}
                      onChange={(e) => setFormData({ ...formData, shelfNumber: e.target.value })}
                      placeholder="e.g. Rack-A2, Locker-3"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {lang === 'bn' ? 'স্টোরেজ লোকেশন *' : 'Storage Location *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. মিঠাপুকুর হেডকোয়ার্টার স্টোর (HQ Central Store)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {lang === 'bn' ? 'মন্তব্য ও বিবরণ' : 'Notes & Description'}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. জনপ্রিয় গিগাবাইট রাউটার"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingItem ? (lang === 'bn' ? 'আপডেট সংরক্ষণ' : 'Save Changes') : (lang === 'bn' ? 'হার্ডওয়্যার সংরক্ষণ' : 'Register Item')}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
