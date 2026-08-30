import React, { useState, useEffect } from 'react';
import { 
  UserRole, 
  DeviceMode, 
  Ticket, 
  ClientInfo, 
  NocStaff, 
  NotificationLog, 
  TicketStatus, 
  TicketPriority, 
  TicketCategory,
  NetworkServer
} from './types';
import { INITIAL_CLIENTS, INITIAL_NOC_STAFF, INITIAL_TICKETS, INITIAL_NOTIFICATIONS, INITIAL_SERVERS } from './data/mockData';
import { 
  loadCachedTickets, 
  saveCachedTickets, 
  loadCachedClients, 
  saveCachedClients, 
  loadCachedServers, 
  saveCachedServers, 
  loadCachedNotifications, 
  saveCachedNotifications,
  queueOfflineAction,
  loadOfflineQueue,
  clearOfflineQueue
} from './utils/offlineStorage';
import { StaffLoginForm } from './components/StaffLoginForm';
import { UnifiedLoginPage } from './components/UnifiedLoginPage';
import { Navbar } from './components/Navbar';
import { ManagerDashboard } from './components/ManagerDashboard';
import { NocPortal } from './components/NocPortal';
import { ClientPortal } from './components/ClientPortal';
import { AndroidAppFrame } from './components/AndroidAppFrame';
import { NewTicketModal } from './components/NewTicketModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { NotificationModal } from './components/NotificationModal';
import { EmailCenterModal } from './components/EmailCenterModal';
import { WhatsAppApiCenterModal } from './components/WhatsAppApiCenterModal';
import { ClientDatabaseModal } from './components/ClientDatabaseModal';
import { NewClientModal } from './components/NewClientModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { StaffToolbar } from './components/StaffToolbar';
import { Footer } from './components/Footer';
import { StatusFeedbackToast, StatusFeedbackData } from './components/StatusFeedbackToast';
import { WifiOff, Database, RefreshCw, Radio } from 'lucide-react';

export default function App() {
  // Load state from local storage cache if available
  const [tickets, setTickets] = useState<Ticket[]>(() => loadCachedTickets(INITIAL_TICKETS));
  const [clients, setClients] = useState<ClientInfo[]>(() => loadCachedClients(INITIAL_CLIENTS));
  const [nocStaff] = useState<NocStaff[]>(INITIAL_NOC_STAFF);
  const [notifications, setNotifications] = useState<NotificationLog[]>(() => loadCachedNotifications(INITIAL_NOTIFICATIONS));
  const [servers, setServers] = useState<NetworkServer[]>(() => loadCachedServers(INITIAL_SERVERS));
  const [statusFeedback, setStatusFeedback] = useState<StatusFeedbackData | null>(null);

  // Real-time Network Connectivity & Offline Cache State
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [queuedActionsCount, setQueuedActionsCount] = useState<number>(() => loadOfflineQueue().length);

  // Auto-persist datasets to localStorage cache whenever they mutate
  useEffect(() => {
    saveCachedTickets(tickets);
  }, [tickets]);

  useEffect(() => {
    saveCachedClients(clients);
  }, [clients]);

  useEffect(() => {
    saveCachedServers(servers);
  }, [servers]);

  useEffect(() => {
    saveCachedNotifications(notifications);
  }, [notifications]);

  // Online / Offline Network Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      const queue = loadOfflineQueue();
      if (queue.length > 0) {
        clearOfflineQueue();
        setQueuedActionsCount(0);
        setStatusFeedback({
          type: 'RESOLVED',
          title: lang === 'bn' ? 'সংযোগ পুনরুদ্ধার ও অফলাইন ডাটা সিঙ্কড' : 'Connection Restored & Synced',
          message: lang === 'bn' 
            ? `${queue.length} টি অফলাইন পরিবর্তন সফলভাবে ক্লাউড সার্ভারে সিঙ্ক হয়েছে।`
            : `Successfully synced ${queue.length} offline operations to server.`,
        });
      } else {
        setStatusFeedback({
          type: 'RESOLVED',
          title: lang === 'bn' ? 'অনলাইন সংযোগ সক্রিয়' : 'Connection Online',
          message: lang === 'bn' ? 'রিয়েল-টাইম ক্লাউড সিঙ্ক্রোনাইজেশন চালু আছে।' : 'Live cloud synchronization active.',
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatusFeedback({
        type: 'FAILED',
        title: lang === 'bn' ? 'অফলাইন মোড সক্রিয়' : 'Offline Mode Active',
        message: lang === 'bn' 
          ? 'সংযোগ বিচ্ছিন্ন। সাম্প্রতিক টিকেট ও সাবস্ক্রাইবার ডাটা লোকাল ক্যাশ থেকে প্রদর্শিত হচ্ছে।' 
          : 'Network offline. Recent tickets and clients are safely loaded from local cache.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleToggleSimulateOffline = () => {
    setIsSimulatedOffline(prev => {
      const next = !prev;
      setStatusFeedback({
        type: next ? 'AUTO_AI' : 'RESOLVED',
        title: next 
          ? (lang === 'bn' ? 'সিমুলেটেড অফলাইন মোড চালু' : 'Simulated Offline Mode Enabled') 
          : (lang === 'bn' ? 'সাধারণ অনলাইন মোডে ফিরতি' : 'Switched to Online Mode'),
        message: next
          ? (lang === 'bn' ? 'এখন লোকাল ক্যাশ ও অফলাইন ফলব্যাক টেস্ট করা যাবে।' : 'App is now acting as offline. Data is read & written to local cache.')
          : (lang === 'bn' ? 'স্বাভাবিক নেটওয়ার্ক মোড সক্রিয়।' : 'Back to normal live network mode.'),
      });
      return next;
    });
  };

  const handleManualSync = () => {
    clearOfflineQueue();
    setQueuedActionsCount(0);
    setStatusFeedback({
      type: 'RESOLVED',
      title: lang === 'bn' ? 'ক্যাশ সফলভাবে সিঙ্ক হয়েছে' : 'Cache Synced Successfully',
      message: lang === 'bn' 
        ? `${tickets.length} টি টিকেট ও ${clients.length} টি ক্লায়েন্ট ডাটা লোকাল স্টোরেজে সংরক্ষিত হয়েছে।` 
        : `Local storage cache updated with ${tickets.length} tickets and ${clients.length} subscribers.`,
    });
  };

  const handleAddServer = (newServer: NetworkServer) => {
    setServers(prev => [newServer, ...prev]);
    setStatusFeedback({
      type: 'RESOLVED',
      title: lang === 'bn' ? 'সার্ভার ডিভাইস যোগ করা হয়েছে' : 'Server Device Added',
      message: `${newServer.name} (${newServer.ipAddress}) - ${newServer.type} ${lang === 'bn' ? 'সফলভাবে নেটওয়ার্কে যুক্ত হয়েছে।' : 'registered successfully.'}`,
      cid: newServer.id,
      ticketId: newServer.id,
    });
  };

  const handleUpdateServer = (updatedServer: NetworkServer) => {
    setServers(prev => prev.map(s => s.id === updatedServer.id ? updatedServer : s));
  };

  const handleDeleteServer = (serverId: string) => {
    setServers(prev => prev.filter(s => s.id !== serverId));
    setStatusFeedback({
      type: 'AUTO_AI',
      title: lang === 'bn' ? 'ডিভাইস মুছে ফেলা হয়েছে' : 'Device Removed',
      message: `${serverId} ${lang === 'bn' ? 'সফলভাবে ইনভেন্টরি থেকে অপসারিত হয়েছে।' : 'removed from server inventory.'}`,
      cid: serverId,
      ticketId: serverId,
    });
  };

  // Application Modes
  const [currentRole, setCurrentRole] = useState<UserRole>('NOC');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('DESKTOP');
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  // Client Session State (Default null for 1st page login)
  const [loggedInCid, setLoggedInCid] = useState<string | null>(null);

  // Staff Session State (Default null for 1st page login)
  const [managerUser, setManagerUser] = useState<{ username: string; name: string; role: 'MANAGER' } | null>(null);
  const [nocUser, setNocUser] = useState<{ username: string; name: string; role: 'NOC' } | null>(null);

  // Check if any user is authenticated in the current session
  const isAnyUserLoggedIn = Boolean(loggedInCid || managerUser || nocUser);

  // Employee check: Returns true if active session is a logged-in Manager or NOC engineer
  const isEmployee = (currentRole === 'MANAGER' && managerUser !== null) || (currentRole === 'NOC' && nocUser !== null);

  const handleStaffLogin = (user: { role: 'MANAGER' | 'NOC'; username: string; name: string }) => {
    if (user.role === 'MANAGER') {
      setManagerUser({ username: user.username, name: user.name, role: 'MANAGER' });
      setCurrentRole('MANAGER');
    } else {
      setNocUser({ username: user.username, name: user.name, role: 'NOC' });
      setCurrentRole('NOC');
    }
  };

  const handleStaffLogout = (role: 'MANAGER' | 'NOC') => {
    if (role === 'MANAGER') {
      setManagerUser(null);
    } else {
      setNocUser(null);
    }
  };

  const handleGlobalLogout = () => {
    setLoggedInCid(null);
    setManagerUser(null);
    setNocUser(null);
  };

  // Modals
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isEmailCenterOpen, setIsEmailCenterOpen] = useState(false);
  const [isWhatsAppApiCenterOpen, setIsWhatsAppApiCenterOpen] = useState(false);
  const [isClientDbModalOpen, setIsClientDbModalOpen] = useState(false);
  const [isAndroidInstallModalOpen, setIsAndroidInstallModalOpen] = useState(false);
  const [aiLoadingTicketId, setAiLoadingTicketId] = useState<string | null>(null);

  // Add Client Handler
  const handleAddClient = (newClient: ClientInfo) => {
    setClients(prev => [newClient, ...prev]);
    // Send system notification
    const newNotif: NotificationLog = {
      id: `N_${Date.now()}`,
      ticketId: newClient.cid,
      cid: newClient.cid,
      channel: 'WhatsApp',
      recipient: `${newClient.name} (${newClient.phone})`,
      recipientType: 'Client',
      title: 'New Subscriber Registered',
      message: `[DELTA MITHAPUKUR] Welcome ${newClient.name}! Your internet connection (Package: ${newClient.package}, IP: ${newClient.ipAddress}) has been registered successfully.`,
      status: 'Delivered',
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Update Status Action
  const handleUpdateTicketStatus = (ticketId: string, status: TicketStatus) => {
    const targetTicket = tickets.find(t => t.id === ticketId);
    const previousStatus = targetTicket?.status;

    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const updated = {
          ...t,
          status,
          updatedDate: new Date().toISOString(),
          comments: [
            ...t.comments,
            {
              id: `c_${Date.now()}`,
              author: currentRole === 'MANAGER' ? 'ব্রাঞ্চ ম্যানেজার' : currentRole === 'NOC' ? 'নোক টিম' : t.clientName,
              role: currentRole === 'MANAGER' ? 'Manager' : currentRole === 'NOC' ? 'NOC' : 'Client',
              text: `স্ট্যাটাস পরিবর্তন করা হয়েছে: ${status}`,
              timestamp: new Date().toISOString(),
            }
          ]
        };
        if (selectedTicket?.id === ticketId) setSelectedTicket(updated);
        return updated;
      }
      return t;
    }));

    // Trigger subtle Framer Motion status update visual feedback toast
    setStatusFeedback({
      ticketId,
      status,
      previousStatus,
      title: targetTicket?.title || `Ticket #${ticketId}`,
      clientName: targetTicket?.clientName,
      timestamp: Date.now(),
    });

    // Queue action if offline
    if (!isOnline || isSimulatedOffline) {
      queueOfflineAction({
        type: 'UPDATE_STATUS',
        payload: { ticketId, status },
        description: `Status -> ${status} (#${ticketId})`,
      });
      setQueuedActionsCount(prev => prev + 1);
    }

    // Trigger Outbound Notification API to Client & Manager (WhatsApp & Email)
    handleSendManualNotification(
      ticketId,
      targetTicket?.cid || 'CID-1001',
      `টিকেট #${ticketId} এর বর্তমান স্ট্যাটাস আপডেট করা হয়েছে: ${status}`,
      'WhatsApp'
    );
    handleSendManualNotification(
      ticketId,
      targetTicket?.cid || 'CID-1001',
      `Dear Client, Your ticket #${ticketId} status has been updated to "${status}". NOC engineering team is monitoring line quality.`,
      'Email'
    );
  };

  // Bulk Update Status Action for Multiple Tickets Simultaneously
  const handleBulkUpdateTicketStatus = (ticketIds: string[], status: TicketStatus, assignedNoc?: string) => {
    if (!ticketIds.length) return;

    const idSet = new Set(ticketIds);
    const now = new Date().toISOString();
    const roleAuthor = currentRole === 'MANAGER' ? 'ব্রাঞ্চ ম্যানেজার' : currentRole === 'NOC' ? 'নোক টিম' : 'Staff';
    const roleName = currentRole === 'MANAGER' ? 'Manager' : 'NOC';

    setTickets(prev => prev.map(t => {
      if (idSet.has(t.id)) {
        const updated = {
          ...t,
          status,
          ...(assignedNoc !== undefined && assignedNoc !== '' ? { assignedNoc } : {}),
          updatedDate: now,
          comments: [
            ...t.comments,
            {
              id: `c_bulk_${Date.now()}_${t.id}`,
              author: roleAuthor,
              role: roleName as any,
              text: `[বাল্ক অ্যাকশন]: স্ট্যাটাস পরিবর্তন -> ${status}${assignedNoc ? ` | টেকনিশিয়ান: ${assignedNoc}` : ''}`,
              timestamp: now,
            }
          ]
        };
        if (selectedTicket?.id === t.id) setSelectedTicket(updated);
        return updated;
      }
      return t;
    }));

    // Trigger subtle status feedback toast
    setStatusFeedback({
      type: status === 'Resolved' || status === 'Closed' ? 'RESOLVED' : 'AUTO_AI',
      title: lang === 'bn' ? `${ticketIds.length} টি টিকেটের স্ট্যাটাস আপডেট সফল` : `Bulk Updated ${ticketIds.length} Tickets`,
      message: lang === 'bn' 
        ? `নির্বাচিত ${ticketIds.length} টি টিকেট একযোগে '${status}' স্ট্যাটাসে পরিবর্তিত হয়েছে।` 
        : `Successfully updated ${ticketIds.length} tickets to '${status}'.`,
      status,
      ticketId: ticketIds.join(', '),
      timestamp: Date.now(),
    });

    // Offline queueing
    if (!isOnline || isSimulatedOffline) {
      ticketIds.forEach(ticketId => {
        queueOfflineAction({
          type: 'UPDATE_STATUS',
          payload: { ticketId, status, ...(assignedNoc ? { assignedNoc } : {}) },
          description: `Bulk Status -> ${status} (#${ticketId})`,
        });
      });
      setQueuedActionsCount(prev => prev + ticketIds.length);
    }

    // Outbound notifications for affected tickets
    ticketIds.forEach(id => {
      const target = tickets.find(t => t.id === id);
      if (target) {
        handleSendManualNotification(
          id,
          target.cid,
          `টিকেট #${id} এর বর্তমান স্ট্যাটাস একযোগে আপডেট করা হয়েছে: ${status}`,
          'WhatsApp'
        );
      }
    });
  };

  // Assign NOC Staff Action
  const handleAssignNocStaff = (ticketId: string, staffName: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const updated = {
          ...t,
          assignedNoc: staffName,
          status: 'NOC_Assigned' as TicketStatus,
          updatedDate: new Date().toISOString(),
        };
        if (selectedTicket?.id === ticketId) setSelectedTicket(updated);
        return updated;
      }
      return t;
    }));

    if (!isOnline || isSimulatedOffline) {
      queueOfflineAction({
        type: 'UPDATE_STATUS',
        payload: { ticketId, assignedNoc: staffName, status: 'NOC_Assigned' },
        description: `Assigned NOC ${staffName} (#${ticketId})`,
      });
      setQueuedActionsCount(prev => prev + 1);
    }

    handleSendManualNotification(
      ticketId,
      tickets.find(t => t.id === ticketId)?.cid || 'CID-1001',
      `নোক ইঞ্জিনিয়ার ${staffName} আপনার টিকেট #${ticketId} এর দায়িত্বে নিয়োজিত হয়েছেন।`,
      'WhatsApp'
    );
  };

  // Add Comment Action
  const handleAddComment = (ticketId: string, text: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const newComm = {
          id: `c_${Date.now()}`,
          author: currentRole === 'MANAGER' ? 'ব্রাঞ্চ ম্যানেজার' : currentRole === 'NOC' ? 'নোক সাপোর্ট' : t.clientName,
          role: currentRole === 'MANAGER' ? 'Manager' as const : currentRole === 'NOC' ? 'NOC' as const : 'Client' as const,
          text,
          timestamp: new Date().toISOString(),
        };
        const updated = {
          ...t,
          comments: [...t.comments, newComm],
          updatedDate: new Date().toISOString(),
        };
        if (selectedTicket?.id === ticketId) setSelectedTicket(updated);
        return updated;
      }
      return t;
    }));

    if (!isOnline || isSimulatedOffline) {
      queueOfflineAction({
        type: 'ADD_NOTE',
        payload: { ticketId, text },
        description: `Added comment to #${ticketId}`,
      });
      setQueuedActionsCount(prev => prev + 1);
    }
  };

  // Rating Ticket (Closes ticket)
  const handleRateTicket = (ticketId: string, rating: number, feedback: string) => {
    const targetTicket = tickets.find(t => t.id === ticketId);
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const updated = {
          ...t,
          rating,
          feedback,
          status: 'Closed' as TicketStatus,
          updatedDate: new Date().toISOString(),
        };
        if (selectedTicket?.id === ticketId) setSelectedTicket(updated);
        return updated;
      }
      return t;
    }));

    // Trigger Framer Motion visual feedback for Closed ticket
    setStatusFeedback({
      ticketId,
      status: 'Closed',
      previousStatus: targetTicket?.status,
      title: targetTicket?.title || `Ticket #${ticketId}`,
      clientName: targetTicket?.clientName,
      timestamp: Date.now(),
    });
  };

  // Manual / Auto Dispatch Notification (Calls backend API)
  const handleSendManualNotification = async (
    ticketId: string, 
    cid: string, 
    message: string, 
    channel: 'WhatsApp' | 'Email' | 'SMS'
  ) => {
    try {
      const clientObj = clients.find(c => c.cid === cid);
      const recipientAddr = channel === 'Email' 
        ? (clientObj?.email || 'client@deltamithapukur.com') 
        : (clientObj?.phone || '01700-000000');

      const endpoint = channel === 'Email' ? '/api/notify/email' : '/api/notify/whatsapp';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: recipientAddr,
          recipientType: currentRole,
          title: `Delta Mithapukur Ticket Alert #${ticketId}`,
          message,
          ticketId,
          cid,
          clientEmail: clientObj?.email,
        }),
      });

      const data = await res.json();

      const newLog: NotificationLog = {
        id: `N-${Date.now()}`,
        ticketId,
        cid,
        channel,
        recipient: `${clientObj?.name || 'Client'} (${recipientAddr})`,
        recipientType: 'Client',
        title: `Alert for Ticket #${ticketId}`,
        message,
        timestamp: new Date().toISOString(),
        status: 'Delivered',
      };

      setNotifications(prev => [newLog, ...prev]);
    } catch (e) {
      console.error('Failed to send notification via API:', e);
    }
  };

  // Create New Ticket (Web Portal)
  const handleCreateTicket = (data: {
    cid: string;
    clientName: string;
    clientPhone: string;
    clientAddress: string;
    area: string;
    packageSpeed: string;
    category: TicketCategory;
    title: string;
    description: string;
    priority: TicketPriority;
  }) => {
    const newId = `T-2026-00${tickets.length + 1}`;
    const newTicket: Ticket = {
      id: newId,
      ...data,
      status: 'Open',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      comments: [
        {
          id: `c_init_${Date.now()}`,
          author: data.clientName,
          role: 'Client',
          text: `নতুন সাপোর্ট টিকেট সাবমিট করা হয়েছে: ${data.description}`,
          timestamp: new Date().toISOString(),
        }
      ],
      opticalPower: data.category.includes('LOS') ? '-32.5 dBm (LOS)' : '-21.8 dBm',
      pingMs: data.category.includes('LOS') ? 0 : 24,
    };

    setTickets(prev => [newTicket, ...prev]);

    // Send instant alert to Branch Manager & NOC (WhatsApp & Email)
    handleSendManualNotification(
      newId,
      data.cid,
      `🚨 নতুন টিকেট তৈরি হয়েছে: ${data.clientName} (${data.cid}) - ${data.title}`,
      'WhatsApp'
    );

    handleSendManualNotification(
      newId,
      data.cid,
      `Dear ${data.clientName}, Your support ticket #${newId} has been registered at Delta Mithapukur. Our NOC engineering team is investigating your issue in ${data.area}.`,
      'Email'
    );
  };

  // Create Ticket from Inbound Email (Client sent email to support@deltamithapukur.com)
  const handleCreateInboundEmailTicket = (emailData: {
    fromEmail: string;
    fromName: string;
    subject: string;
    body: string;
    area: string;
  }) => {
    const newId = `T-2026-00${tickets.length + 1}`;
    const matchedClient = clients.find(c => c.email.toLowerCase() === emailData.fromEmail.toLowerCase()) || clients[0];

    const newTicket: Ticket = {
      id: newId,
      cid: matchedClient.cid,
      clientName: emailData.fromName || matchedClient.name,
      clientPhone: matchedClient.phone,
      clientAddress: matchedClient.address,
      area: emailData.area || matchedClient.area,
      packageSpeed: matchedClient.package,
      category: emailData.subject.toLowerCase().includes('los') 
        ? 'রেড এলওএস বাতি (Red LOS Light)' 
        : 'ফাইবার সংযোগ বিচ্ছিন্ন (Fiber Line Down)',
      title: `[EMAIL] ${emailData.subject}`,
      description: `${emailData.body}\n(Received via Client Email: ${emailData.fromEmail})`,
      status: 'Open',
      priority: emailData.subject.toLowerCase().includes('urgent') || emailData.subject.toLowerCase().includes('los') ? 'Urgent' : 'High',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      comments: [
        {
          id: `c_email_${Date.now()}`,
          author: `${emailData.fromName} (via Email)`,
          role: 'Client',
          text: `[Inbound Email Received]: ${emailData.body}`,
          timestamp: new Date().toISOString(),
        }
      ],
      opticalPower: '-31.2 dBm (Signal Fault)',
      pingMs: 0,
    };

    setTickets(prev => [newTicket, ...prev]);

    handleSendManualNotification(
      newId,
      matchedClient.cid,
      `📧 [INBOUND EMAIL RECEIVED] Support ticket #${newId} generated from client email ${emailData.fromEmail}`,
      'Email'
    );
  };

  // Create Ticket from Inbound WhatsApp Message
  const handleCreateInboundWhatsAppTicket = (waData: {
    phone: string;
    senderName: string;
    messageText: string;
    area: string;
  }) => {
    const newId = `T-2026-00${tickets.length + 1}`;
    const cleanPhone = waData.phone.replace(/[^0-9]/g, '');
    const matchedClient = clients.find(c => c.phone.replace(/[^0-9]/g, '').includes(cleanPhone)) || clients[0];

    const newTicket: Ticket = {
      id: newId,
      cid: matchedClient.cid,
      clientName: waData.senderName || matchedClient.name,
      clientPhone: waData.phone || matchedClient.phone,
      clientAddress: matchedClient.address,
      area: waData.area || matchedClient.area,
      packageSpeed: matchedClient.package,
      category: waData.messageText.toLowerCase().includes('los') || waData.messageText.toLowerCase().includes('red')
        ? 'রেড এলওএস বাতি (Red LOS Light)' 
        : 'উচ্চ পিং ও স্লো স্পিড (High Ping / Slow Speed)',
      title: `[WHATSAPP BOT] ${waData.messageText.slice(0, 40)}...`,
      description: `${waData.messageText}\n(Auto-Received via WhatsApp Business Cloud API Webhook)`,
      status: 'Open',
      priority: 'Urgent',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      comments: [
        {
          id: `c_wa_${Date.now()}`,
          author: `${waData.senderName} (via WhatsApp)`,
          role: 'Client',
          text: `[Inbound WhatsApp Message]: ${waData.messageText}`,
          timestamp: new Date().toISOString(),
        }
      ],
      opticalPower: '-33.8 dBm (LOS Light Warning)',
      pingMs: 0,
    };

    setTickets(prev => [newTicket, ...prev]);

    handleSendManualNotification(
      newId,
      matchedClient.cid,
      `📱 [INBOUND WA BOT TICKET] Ticket #${newId} auto-generated from WhatsApp Cloud API webhook for ${matchedClient.name}`,
      'WhatsApp'
    );
  };

  // AI NOC Diagnostic Trigger (Calls server `/api/ai/diagnose`)
  const handleTriggerAiDiagnosis = async (ticket: Ticket) => {
    setAiLoadingTicketId(ticket.id);
    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketTitle: ticket.title,
          ticketDescription: ticket.description,
          category: ticket.category,
          area: ticket.area,
          clientName: ticket.clientName,
          cid: ticket.cid,
          opticalPower: ticket.opticalPower,
          pingMs: ticket.pingMs,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTickets(prev => prev.map(t => {
          if (t.id === ticket.id) {
            const updated = {
              ...t,
              aiDiagnosis: {
                summaryBengali: data.summaryBengali,
                nocSteps: data.nocSteps,
                clientReplyBengali: data.clientReplyBengali,
                recommendedPriority: data.recommendedPriority,
              }
            };
            if (selectedTicket?.id === ticket.id) setSelectedTicket(updated);
            return updated;
          }
          return t;
        }));
      }
    } catch (e) {
      console.error('AI diagnosis error:', e);
    } finally {
      setAiLoadingTicketId(null);
    }
  };

  // Render Portal Component based on Role
  const renderActivePortal = () => {
    if (currentRole === 'MANAGER') {
      if (!managerUser) {
        return (
          <StaffLoginForm
            initialRole="MANAGER"
            onLoginSuccess={handleStaffLogin}
            lang={lang}
            onSwitchRole={setCurrentRole}
          />
        );
      }
      return (
        <ManagerDashboard
          tickets={tickets}
          clients={clients}
          nocStaff={nocStaff}
          notifications={notifications}
          servers={servers}
          lang={lang}
          onSelectTicket={(ticket) => setSelectedTicket(ticket)}
          onUpdateTicketStatus={handleUpdateTicketStatus}
          onBulkUpdateTicketStatus={handleBulkUpdateTicketStatus}
          onAssignNocStaff={handleAssignNocStaff}
          onSendManualNotification={handleSendManualNotification}
          onOpenNewTicketModal={() => setIsNewTicketModalOpen(true)}
          onOpenAddNewClient={() => setIsNewClientModalOpen(true)}
          onAddServer={handleAddServer}
          onUpdateServer={handleUpdateServer}
          onDeleteServer={handleDeleteServer}
          currentUser={managerUser}
          onLogout={() => handleStaffLogout('MANAGER')}
        />
      );
    }

    if (currentRole === 'NOC') {
      if (!nocUser) {
        return (
          <StaffLoginForm
            initialRole="NOC"
            onLoginSuccess={handleStaffLogin}
            lang={lang}
            onSwitchRole={setCurrentRole}
          />
        );
      }
      return (
        <NocPortal
          tickets={tickets}
          nocStaff={nocStaff}
          lang={lang}
          onSelectTicket={(ticket) => setSelectedTicket(ticket)}
          onUpdateTicketStatus={handleUpdateTicketStatus}
          onBulkUpdateTicketStatus={handleBulkUpdateTicketStatus}
          onAddComment={handleAddComment}
          onTriggerAiDiagnosis={handleTriggerAiDiagnosis}
          aiLoadingTicketId={aiLoadingTicketId}
          currentUser={nocUser}
          onLogout={() => handleStaffLogout('NOC')}
        />
      );
    }

    return (
      <ClientPortal
        clients={clients}
        tickets={tickets}
        loggedInCid={loggedInCid}
        onLogin={(cid) => setLoggedInCid(cid)}
        onLogout={() => setLoggedInCid(null)}
        lang={lang}
        onOpenNewTicketModal={() => setIsNewTicketModalOpen(true)}
        onAddComment={handleAddComment}
        onRateTicket={handleRateTicket}
      />
    );
  };

  const handleGoHome = () => {
    setSelectedTicket(null);
    setIsNewTicketModalOpen(false);
    setIsNewClientModalOpen(false);
    setIsNotifModalOpen(false);
    setIsEmailCenterOpen(false);
    setIsWhatsAppApiCenterOpen(false);
    setIsClientDbModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1st Page: Show Unified Login Page if no user is authenticated
  if (!isAnyUserLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-900 selection:bg-emerald-500 selection:text-slate-950">
        <UnifiedLoginPage
          clients={clients}
          onClientLogin={(cid) => {
            setLoggedInCid(cid);
            setCurrentRole('CLIENT');
          }}
          onStaffLogin={(user) => {
            handleStaffLogin(user);
          }}
          lang={lang}
          onToggleLang={() => setLang(prev => prev === 'bn' ? 'en' : 'bn')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-900 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Main Navbar */}
      <Navbar
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        deviceMode={deviceMode}
        setDeviceMode={setDeviceMode}
        lang={lang}
        setLang={setLang}
        onOpenNewTicketModal={() => setIsNewTicketModalOpen(true)}
        onOpenNotificationsModal={() => setIsNotifModalOpen(true)}
        unreadNotifsCount={notifications.length}
        loggedInCid={loggedInCid}
        onClientLogout={() => setLoggedInCid(null)}
        managerUser={managerUser}
        nocUser={nocUser}
        onStaffLogout={handleStaffLogout}
        onOpenEmailCenter={() => setIsEmailCenterOpen(true)}
        onOpenWhatsAppCenter={() => setIsWhatsAppApiCenterOpen(true)}
        onOpenClientDatabase={() => setIsClientDbModalOpen(true)}
        onOpenAddNewClient={() => setIsNewClientModalOpen(true)}
        onOpenAndroidInstall={() => setIsAndroidInstallModalOpen(true)}
        onGoHome={handleGoHome}
        onSelectTicket={(ticket) => setSelectedTicket(ticket)}
        isOnline={isOnline}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulateOffline={handleToggleSimulateOffline}
        onManualSync={handleManualSync}
        queuedActionsCount={queuedActionsCount}
        tickets={tickets}
        clients={clients}
        servers={servers}
      />

      {/* Offline Alert Strip if Network Dropped or Simulated Offline */}
      {(!isOnline || isSimulatedOffline) && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-amber-950 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-inner border-b border-amber-500/40 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-900/20 text-amber-950 flex items-center justify-center">
              <WifiOff className="w-4 h-4 animate-bounce" />
            </span>
            <span>
              {isSimulatedOffline ? (
                lang === 'bn' ? (
                  <><strong>সিমুলেটেড অফলাইন মোড:</strong> ব্রাউজার লোকাল ক্যাশ থেকে ডাটা দেখানো হচ্ছে। টিকেট ব্রাউজ ও লোকাল আপডেট চালু আছে।</>
                ) : (
                  <><strong>Simulated Offline Mode:</strong> Working from local storage cache. Staff can browse, search, and update tickets seamlessly.</>
                )
              ) : (
                lang === 'bn' ? (
                  <><strong>ইন্টারনেট সংযোগ বিচ্ছিন্ন:</strong> লোকাল ক্যাশ থেকে {tickets.length} টি টিকেট প্রদর্শিত হচ্ছে। সংযোগ ফিরে আসলে স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।</>
                ) : (
                  <><strong>Offline Mode Active:</strong> Displaying {tickets.length} cached tickets and {clients.length} clients. Changes will sync when online.</>
                )
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualSync}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-950/20 hover:bg-amber-950/30 text-amber-950 rounded font-bold transition-all text-[11px]"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{lang === 'bn' ? 'ক্যাশ রিফ্রেশ' : 'Sync Cache'}</span>
            </button>
            {isSimulatedOffline && (
              <button
                onClick={handleToggleSimulateOffline}
                className="px-2 py-1 bg-amber-950 text-amber-100 hover:bg-amber-900 rounded font-bold transition-all text-[11px]"
              >
                {lang === 'bn' ? 'অনলাইন করুন' : 'Go Online'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content View (Desktop vs Android Frame) */}
      <main className="bg-slate-100 min-h-[calc(100vh-4rem)]">
        {deviceMode === 'ANDROID' ? (
          <AndroidAppFrame
            activeRole={currentRole}
            onSwitchRole={setCurrentRole}
            lang={lang}
          >
            {renderActivePortal()}
          </AndroidAppFrame>
        ) : (
          <>
            {renderActivePortal()}
            <Footer
              lang={lang}
              onNavigateHome={() => setCurrentRole('CLIENT')}
              onOpenNewTicket={() => setIsNewTicketModalOpen(true)}
              onOpenNewClient={() => setIsNewClientModalOpen(true)}
              onOpenPackages={() => {
                setCurrentRole('CLIENT');
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              onOpenCoverage={() => {
                setCurrentRole('MANAGER');
              }}
              onOpenSpeedTest={() => {
                setStatusFeedback({
                  type: 'RESOLVED',
                  title: lang === 'bn' ? 'BDIX স্পিড টেস্ট সার্ভার সক্রিয়' : 'BDIX Speed Test Connected',
                  message: lang === 'bn' ? 'মিঠাপুকুর ১ গিগাবাইট BDIX লোকাল অপটিক্যাল ক্যাশ লিংক ১০০% সক্রিয়।' : 'Mithapukur 1Gbps BDIX optical backbone link is running at 0ms latency.',
                });
              }}
              onOpenFaq={() => {
                setCurrentRole('CLIENT');
              }}
              onOpenLogoModal={() => {
                setStatusFeedback({
                  type: 'RESOLVED',
                  title: lang === 'bn' ? 'ডেল্টা ব্রডব্যান্ড অফিশিয়াল পরিচয়' : 'Delta Official Identity',
                  message: lang === 'bn' ? 'রেজিস্টার্ড ট্রেডমার্ক: ডেল্টা ব্রডব্যান্ড ইন্টারনেট (মিঠাপুকুর শাখা)' : 'Registered Trademark: Delta Broadband Internet (Mithapukur Branch HQ)',
                });
              }}
            />
          </>
        )}
      </main>

      {/* Modals */}
      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        clients={clients}
        onSubmitTicket={handleCreateTicket}
        lang={lang}
        defaultCid={loggedInCid}
      />

      <TicketDetailModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        nocStaff={nocStaff}
        onUpdateTicketStatus={handleUpdateTicketStatus}
        onAssignNocStaff={handleAssignNocStaff}
        onAddComment={handleAddComment}
        onSendManualNotification={handleSendManualNotification}
        onTriggerAiDiagnosis={handleTriggerAiDiagnosis}
        aiLoading={selectedTicket ? aiLoadingTicketId === selectedTicket.id : false}
        lang={lang}
      />

      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        notifications={notifications}
        lang={lang}
      />

      <EmailCenterModal
        isOpen={isEmailCenterOpen}
        onClose={() => setIsEmailCenterOpen(false)}
        tickets={tickets}
        notifications={notifications}
        currentRole={currentRole}
        lang={lang}
        onSendEmailNotification={async (ticketId, cid, message, channel) => {
          await handleSendManualNotification(ticketId, cid, message, channel);
        }}
        onCreateInboundEmailTicket={handleCreateInboundEmailTicket}
      />

      <WhatsAppApiCenterModal
        isOpen={isWhatsAppApiCenterOpen}
        onClose={() => setIsWhatsAppApiCenterOpen(false)}
        tickets={tickets}
        notifications={notifications}
        currentRole={currentRole}
        lang={lang}
        onSendManualNotification={handleSendManualNotification}
        onCreateInboundTicketFromWhatsApp={handleCreateInboundWhatsAppTicket}
      />

      <ClientDatabaseModal
        isOpen={isClientDbModalOpen}
        onClose={() => setIsClientDbModalOpen(false)}
        clients={clients}
        lang={lang}
        onOpenAddNewClient={() => {
          setIsClientDbModalOpen(false);
          setIsNewClientModalOpen(true);
        }}
      />

      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onAddClient={handleAddClient}
        clientsCount={clients.length}
        lang={lang}
      />

      <AndroidInstallModal
        isOpen={isAndroidInstallModalOpen}
        onClose={() => setIsAndroidInstallModalOpen(false)}
        lang={lang}
      />

      <StaffToolbar isEmployee={isEmployee} />

      {/* Floating Status Feedback Toast (Framer Motion Animation) */}
      <StatusFeedbackToast
        feedback={statusFeedback}
        onDismiss={() => setStatusFeedback(null)}
        onViewTicket={(ticketId) => {
          const t = tickets.find(item => item.id === ticketId);
          if (t) setSelectedTicket(t);
        }}
        lang={lang}
      />

    </div>
  );
}
