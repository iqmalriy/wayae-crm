import {
  listConversationVolume,
  listLeadFunnel,
  listLeadsTrend,
  listMessagesTrend,
} from "../repositories/dashboard.repository";
import type {
  DashboardActivityQuery,
  DashboardBucket,
  DashboardRange,
} from "../schemas/get-dashboard.schema";
import type { DashboardActivity } from "../types/response-types";

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_MS: Record<DashboardRange, number> = {
  "7d": 7 * DAY_MS,
  "30d": 30 * DAY_MS,
  "90d": 90 * DAY_MS,
};
const RANGE_BUCKET: Record<DashboardRange, DashboardBucket> = {
  "7d": "hour",
  "30d": "day",
  "90d": "day",
};

export async function getDashboardActivity(
  user: { id: string },
  query: DashboardActivityQuery,
): Promise<DashboardActivity> {
  const now = new Date();
  const from = new Date(now.getTime() - RANGE_MS[query.range]);
  const bucket = RANGE_BUCKET[query.range];
  const ownerId = query.scope === "mine" ? user.id : undefined;

  const [leadFunnel, leadTrend, messageTrend, conversationVolume] =
    await Promise.all([
      listLeadFunnel(ownerId),
      listLeadsTrend(from, now, bucket, ownerId),
      listMessagesTrend(from, now, bucket, ownerId),
      listConversationVolume(from, now, bucket, ownerId),
    ]);

  const merged = new Map<string, { leads: number; messages: number }>();
  for (const row of leadTrend) {
    const key = row.bucket.toISOString();
    merged.set(key, { leads: row.count, messages: merged.get(key)?.messages ?? 0 });
  }
  for (const row of messageTrend) {
    const key = row.bucket.toISOString();
    merged.set(key, { leads: merged.get(key)?.leads ?? 0, messages: row.count });
  }

  const activityTrend = [...merged.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({ date, ...values }));

  return {
    leadFunnel: leadFunnel.map((row) => ({ stage: row.stage, count: row.count })),
    activityTrend,
    conversationVolume: conversationVolume.map((row) => ({
      date: row.bucket.toISOString(),
      conversations: row.count,
    })),
  };
}