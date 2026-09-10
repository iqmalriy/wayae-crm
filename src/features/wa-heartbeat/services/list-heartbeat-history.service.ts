import { AppError } from "@/lib/errors";
import { findWaAccountById } from "@/features/wa-accounts/repositories/wa-account.repository";
import {
  listHeartbeatHistory,
  type ListHeartbeatHistoryRow,
} from "../repositories/wa-heartbeat.repository";
import type { ListHeartbeatHistoryQuery } from "../schemas/list-heartbeat-history.schema";

export interface HeartbeatHistoryItem {
  id: string;
  receivedAt: string;
}

export async function listWaAccountHeartbeatHistory(
  waAccountId: string,
  query: ListHeartbeatHistoryQuery,
): Promise<HeartbeatHistoryItem[]> {
  const account = await findWaAccountById(waAccountId);
  if (!account) throw new AppError("NOT_FOUND");

  const rows = await listHeartbeatHistory({
    waAccountId,
    from: query.from ? new Date(query.from) : undefined,
    to: query.to ? new Date(query.to) : undefined,
    limit: query.limit,
  });

  return rows.map((row: ListHeartbeatHistoryRow) => ({
    id: row.id,
    receivedAt: row.receivedAt.toISOString(),
  }));
}