export type UserRole = 'MANAGER' | 'NOC' | 'CLIENT';
export type DeviceMode = 'DESKTOP' | 'ANDROID';
export type TicketStatus = 'Open' | 'NOC_Assigned' | 'In_Progress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type TicketCategory = 
  | 'ফাইবার সংযোগ বিচ্ছিন্ন (Fiber Line Down)'
  | 'রেড এলওএস বাতি (Red LOS Light)'
  | 'উচ্চ পিং ও স্লো স্পিড (High Ping / Slow Speed)'
  | 'রাউটার ও কনফিগারেশন (Router / Config)'
  | 'বিলিং ও পেমেন্ট (Billing & Payment)'
  | 'সংযোগ স্থানান্তর (Shift Connection)'
  | 'অন্যান্য (Others)';

export interface CommentItem {
  id: string;
  author: string;
  role: 'Client' | 'NOC' | 'Manager' | 'System';
  text: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  cid: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  area: string;
  packageSpeed: string;
  category: TicketCategory;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedNoc?: string;
  createdDate: string;
  updatedDate: string;
  comments: CommentItem[];
  opticalPower?: string; // e.g., "-22.4 dBm"
  pingMs?: number; // e.g., 28
  rating?: number; // 1-5
  feedback?: string;
  aiDiagnosis?: {
    summaryBengali: string;
    nocSteps: string[];
    clientReplyBengali: string;
    recommendedPriority: string;
  };
  resolutionNote?: string;
}

export interface ClientInfo {
  cid: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  area: string;
  package: string;
  ipAddress: string;
  onuMac: string;
  opticalPower: string;
  balance: number;
  status: 'Active' | 'Suspended';
}

export interface NocStaff {
  id: string;
  name: string;
  designation: string;
  phone: string;
  area: string;
  status: 'On Duty' | 'On Field' | 'Off Duty';
  activeTickets: number;
  completedToday: number;
  avgResponseTimeMin?: number;
  totalResolvedMonth?: number;
  slaAdherenceRate?: number;
  rating?: number;
}

export interface StaffPerformanceMetric {
  staffId: string;
  staffName: string;
  shortName: string;
  designation: string;
  area: string;
  status: 'On Duty' | 'On Field' | 'Off Duty';
  avgResponseTimeMin: number;
  avgResolutionTimeMin: number;
  ticketsClosed: number;
  ticketsActive: number;
  urgentResolved: number;
  slaComplianceRate: number;
  customerRating: number;
  productivityScore: number;
  badge?: string;
  weeklyHistory: { day: string; closed: number; avgResponseMin: number }[];
  categoryBreakdown: { category: string; count: number }[];
}

export interface NotificationLog {
  id: string;
  ticketId: string;
  cid: string;
  channel: 'WhatsApp' | 'Email' | 'SMS';
  recipient: string;
  recipientType: 'Manager' | 'NOC' | 'Client';
  title: string;
  message: string;
  timestamp: string;
  status: 'Delivered' | 'Sent';
}

export type NetworkServerType = 'OLT' | 'MikroTik' | 'Core_Router' | 'Switch' | 'Radius_Server';

export interface NetworkServer {
  id: string;
  name: string;
  type: NetworkServerType;
  model: string;
  ipAddress: string;
  port: number;
  winboxPort?: number;
  apiPort?: number;
  username?: string;
  password?: string;
  adminGroup?: string;
  radiusSecret?: string;
  locationArea: string;
  vlan?: string;
  status: 'Online' | 'Warning' | 'Offline';
  uptime?: string;
  cpuUsage?: number; // e.g. 18%
  memoryUsage?: number; // e.g. 42%
  totalPonPorts?: number;
  activePonPorts?: number;
  totalClientsOnline?: number;
  temperature?: string; // e.g. "41°C"
  firmwareVersion?: string;
  lastPingMs?: number;
  notes?: string;
  addedDate: string;
}

