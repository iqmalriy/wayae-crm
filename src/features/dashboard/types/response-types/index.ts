export interface Kpi {
  value: number;
  delta: number | null;
}

export interface DashboardKpis {
  openConversations: Kpi;
  unreadConversations: Kpi;
  openLeads: Kpi;
  pipelineValue: Kpi;
  openTasks: Kpi;
  overdueTasks: Kpi;
  totalCustomers: Kpi;
  onlineWaAccounts: Kpi;
}

export interface RecentLead {
  id: string;
  leadNumber: string;
  name: string | null;
  company: string | null;
  stage: string;
  estimatedValue: number | null;
  createdAt: string;
}

export interface RecentConversation {
  id: string;
  title: string | null;
  status: string;
  unread: boolean;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
}

export interface UpcomingTask {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueAt: string | null;
  assigneeName: string | null;
}

export interface WaAccountStatus {
  id: string;
  label: string;
  phone: string;
  online: boolean;
  lastHeartbeatAt: string | null;
}

export interface DashboardSummary {
  kpis: DashboardKpis;
  recentLeads: RecentLead[];
  recentConversations: RecentConversation[];
  upcomingTasks: UpcomingTask[];
  waAccountStatus: WaAccountStatus[];
}

export interface LeadStageCount {
  stage: string;
  count: number;
}

export interface ActivityPoint {
  date: string;
  leads: number;
  messages: number;
}

export interface ConversationVolumePoint {
  date: string;
  conversations: number;
}

export interface DashboardActivity {
  leadFunnel: LeadStageCount[];
  activityTrend: ActivityPoint[];
  conversationVolume: ConversationVolumePoint[];
}
