import { Ticket, ClientInfo, NetworkServer, NotificationLog } from '../types';

export const CACHE_KEYS = {
  TICKETS: 'delta_isp_tickets_cache_v2',
  CLIENTS: 'delta_isp_clients_cache_v2',
  SERVERS: 'delta_isp_servers_cache_v2',
  NOTIFICATIONS: 'delta_isp_notifications_cache_v2',
  OFFLINE_QUEUE: 'delta_isp_offline_actions_queue_v2',
  LAST_SYNC: 'delta_isp_last_sync_timestamp',
  OFFLINE_SIMULATION: 'delta_isp_offline_sim_active',
};

export interface OfflineAction {
  id: string;
  type: 'UPDATE_STATUS' | 'CREATE_TICKET' | 'ADD_NOTE' | 'ADD_SERVER';
  payload: any;
  timestamp: string;
  description: string;
}

export interface CacheMetadata {
  ticketCount: number;
  clientCount: number;
  serverCount: number;
  queuedCount: number;
  lastSyncTime: string;
  approxSizeKb: number;
}

// Load cached tickets with fallback
export function loadCachedTickets(defaultTickets: Ticket[]): Ticket[] {
  try {
    const raw = localStorage.getItem(CACHE_KEYS.TICKETS);
    if (!raw) return defaultTickets;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('[OfflineCache] Failed to load tickets from cache:', e);
  }
  return defaultTickets;
}

// Save tickets to local cache
export function saveCachedTickets(tickets: Ticket[]): void {
  try {
    localStorage.setItem(CACHE_KEYS.TICKETS, JSON.stringify(tickets));
    localStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
  } catch (e) {
    console.warn('[OfflineCache] Failed to save tickets to cache:', e);
  }
}

// Load cached clients
export function loadCachedClients(defaultClients: ClientInfo[]): ClientInfo[] {
  try {
    const raw = localStorage.getItem(CACHE_KEYS.CLIENTS);
    if (!raw) return defaultClients;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('[OfflineCache] Failed to load clients from cache:', e);
  }
  return defaultClients;
}

// Save clients to local cache
export function saveCachedClients(clients: ClientInfo[]): void {
  try {
    localStorage.setItem(CACHE_KEYS.CLIENTS, JSON.stringify(clients));
  } catch (e) {
    console.warn('[OfflineCache] Failed to save clients to cache:', e);
  }
}

// Load cached servers
export function loadCachedServers(defaultServers: NetworkServer[]): NetworkServer[] {
  try {
    const raw = localStorage.getItem(CACHE_KEYS.SERVERS);
    if (!raw) return defaultServers;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('[OfflineCache] Failed to load servers from cache:', e);
  }
  return defaultServers;
}

// Save servers to local cache
export function saveCachedServers(servers: NetworkServer[]): void {
  try {
    localStorage.setItem(CACHE_KEYS.SERVERS, JSON.stringify(servers));
  } catch (e) {
    console.warn('[OfflineCache] Failed to save servers to cache:', e);
  }
}

// Load cached notifications
export function loadCachedNotifications(defaultNotifs: NotificationLog[]): NotificationLog[] {
  try {
    const raw = localStorage.getItem(CACHE_KEYS.NOTIFICATIONS);
    if (!raw) return defaultNotifs;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('[OfflineCache] Failed to load notifications from cache:', e);
  }
  return defaultNotifs;
}

// Save notifications to local cache
export function saveCachedNotifications(notifs: NotificationLog[]): void {
  try {
    localStorage.setItem(CACHE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  } catch (e) {
    console.warn('[OfflineCache] Failed to save notifications to cache:', e);
  }
}

// Load Offline Actions Queue
export function loadOfflineQueue(): OfflineAction[] {
  try {
    const raw = localStorage.getItem(CACHE_KEYS.OFFLINE_QUEUE);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

// Add an action to the offline sync queue
export function queueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): OfflineAction {
  const newAction: OfflineAction = {
    ...action,
    id: `ACT_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };

  try {
    const currentQueue = loadOfflineQueue();
    const updatedQueue = [...currentQueue, newAction];
    localStorage.setItem(CACHE_KEYS.OFFLINE_QUEUE, JSON.stringify(updatedQueue));
  } catch (e) {
    console.warn('[OfflineCache] Failed to queue offline action:', e);
  }

  return newAction;
}

// Clear offline queue
export function clearOfflineQueue(): void {
  try {
    localStorage.removeItem(CACHE_KEYS.OFFLINE_QUEUE);
  } catch (e) {
    console.warn('[OfflineCache] Failed to clear queue:', e);
  }
}

// Get cache statistics
export function getCacheMetadata(): CacheMetadata {
  let totalBytes = 0;
  for (const key of Object.values(CACHE_KEYS)) {
    const item = localStorage.getItem(key);
    if (item) totalBytes += item.length * 2; // rough UTF-16 bytes
  }

  const ticketsRaw = localStorage.getItem(CACHE_KEYS.TICKETS);
  const clientsRaw = localStorage.getItem(CACHE_KEYS.CLIENTS);
  const serversRaw = localStorage.getItem(CACHE_KEYS.SERVERS);
  const queueRaw = localStorage.getItem(CACHE_KEYS.OFFLINE_QUEUE);
  const lastSync = localStorage.getItem(CACHE_KEYS.LAST_SYNC) || new Date().toISOString();

  let ticketCount = 0;
  let clientCount = 0;
  let serverCount = 0;
  let queuedCount = 0;

  try {
    if (ticketsRaw) ticketCount = JSON.parse(ticketsRaw).length;
    if (clientsRaw) clientCount = JSON.parse(clientsRaw).length;
    if (serversRaw) serverCount = JSON.parse(serversRaw).length;
    if (queueRaw) queuedCount = JSON.parse(queueRaw).length;
  } catch (e) {
    // fallback
  }

  return {
    ticketCount,
    clientCount,
    serverCount,
    queuedCount,
    lastSyncTime: lastSync,
    approxSizeKb: Math.round(totalBytes / 1024),
  };
}
