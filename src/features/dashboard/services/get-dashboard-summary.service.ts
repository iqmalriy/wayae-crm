import {
  countActiveCustomers,
  countOnlineWaAccounts,
  countOpenConversations,
  countOpenLeads,
  countOpenTasks,
  countOverdueTasks,
  countUnreadConversations,
  listRecentConversations,
  listRecentLeads,
  listUpcomingTasks,
  listWaAccountStatus,
  sumOpenPipeline,
} from "../repositories/dashboard.repository";
import type { DashboardRange, DashboardSummaryQuery } from "../schemas/get-dashboard.schema";
import type {
  DashboardSummary,
  Kpi,
  RecentConversation,
  RecentLead,
  UpcomingTask,
} from "../types/response-types";

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_MS: Record<DashboardRange, number> = {
  "7d": 7 * DAY_MS,
  "30d": 30 * DAY_MS,
  "90d": 90 * DAY_MS,
};
const ONLINE_WINDOW_MS = 3 * 60 * 1000;

async function kpi(
  current: Promise<number>,
  previous: Promise<number>,
): Promise<Kpi> {
  const [cur, prev] = await Promise.all([current, previous]);
  if (prev === 0) return { value: cur, delta: null };
  return { value: cur, delta: Math.round(((cur - prev) / prev) * 100) };
}

export async function getDashboardSummary(
  user: { id: string },
  query: DashboardSummaryQuery,
): Promise<DashboardSummary> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RANGE_MS[query.range]);
  const onlineThreshold = new Date(now.getTime() - ONLINE_WINDOW_MS);
  const ownerId = query.scope === "mine" ? user.id : undefined;

  const [
    openConversations,
    unreadConversations,
    openLeads,
    pipelineValue,
    openTasks,
    overdueTasks,
    totalCustomers,
    onlineWaAccounts,
    recentLeads,
    recentConversations,
    upcomingTasks,
    waAccountStatus,
  ] = await Promise.all([
    kpi(
      countOpenConversations({ userId: ownerId }),
      countOpenConversations({ userId: ownerId, before: windowStart }),
    ),
    kpi(
      countUnreadConversations(user.id),
      countUnreadConversations(user.id, windowStart),
    ),
    kpi(
      countOpenLeads({ userId: ownerId }),
      countOpenLeads({ userId: ownerId, before: windowStart }),
    ),
    kpi(
      sumOpenPipeline({ userId: ownerId }),
      sumOpenPipeline({ userId: ownerId, before: windowStart }),
    ),
    kpi(
      countOpenTasks({ userId: ownerId }),
      countOpenTasks({ userId: ownerId, before: windowStart }),
    ),
    kpi(
      countOverdueTasks({ userId: ownerId }),
      countOverdueTasks({ userId: ownerId, before: windowStart }),
    ),
    kpi(
      countActiveCustomers({ userId: ownerId }),
      countActiveCustomers({ userId: ownerId, before: windowStart }),
    ),
    countOnlineWaAccounts(onlineThreshold, ownerId).then((value) => ({
      value,
      delta: null,
    })),
    listRecentLeads({ userId: ownerId, limit: query.limit }),
    listRecentConversations({
      userId: ownerId,
      readerId: user.id,
      limit: query.limit,
    }),
    listUpcomingTasks({ userId: ownerId, limit: query.limit }),
    listWaAccountStatus(ownerId),
  ]);

  return {
    kpis: {
      openConversations,
      unreadConversations,
      openLeads,
      pipelineValue,
      openTasks,
      overdueTasks,
      totalCustomers,
      onlineWaAccounts,
    },
    recentLeads: recentLeads.map(toRecentLead),
    recentConversations: recentConversations.map(toRecentConversation),
    upcomingTasks: upcomingTasks.map(toUpcomingTask),
    waAccountStatus: waAccountStatus.map((row) => ({
      id: row.id,
      label: row.label,
      phone: row.phone,
      online: row.lastHeartbeatAt
        ? now.getTime() - row.lastHeartbeatAt.getTime() <= ONLINE_WINDOW_MS
        : false,
      lastHeartbeatAt: row.lastHeartbeatAt?.toISOString() ?? null,
    })),
  };
}

function toRecentLead(row: {
  id: string;
  leadNumber: string;
  name: string | null;
  company: string | null;
  stage: string;
  estimatedValue: number | null;
  createdAt: Date;
}): RecentLead {
  return {
    id: row.id,
    leadNumber: row.leadNumber,
    name: row.name,
    company: row.company,
    stage: row.stage,
    estimatedValue: row.estimatedValue,
    createdAt: row.createdAt.toISOString(),
  };
}

function toRecentConversation(row: {
  id: string;
  title: string | null;
  status: string;
  unread: boolean;
  lastMessagePreview: string | null;
  lastMessageAt: Date | null;
}): RecentConversation {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    unread: row.unread,
    lastMessagePreview: row.lastMessagePreview,
    lastMessageAt: row.lastMessageAt?.toISOString() ?? null,
  };
}

function toUpcomingTask(row: {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueAt: Date | null;
  assigneeName: string | null;
}): UpcomingTask {
  return {
    id: row.id,
    title: row.title,
    priority: row.priority,
    status: row.status,
    dueAt: row.dueAt?.toISOString() ?? null,
    assigneeName: row.assigneeName,
  };
}