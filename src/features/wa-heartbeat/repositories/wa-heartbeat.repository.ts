import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { waAccountHeartbeats } from "@/lib/db/schema";
import type { HeartbeatBucket } from "../schemas/heartbeat-activity.schema";

export interface InsertHeartbeatValues {
  waAccountId: string;
}

export async function insertHeartbeat(
  values: InsertHeartbeatValues,
): Promise<void> {
  await db.insert(waAccountHeartbeats).values({
    waAccountId: values.waAccountId,
  });
}

export interface ListHeartbeatHistoryRow {
  id: string;
  receivedAt: Date;
}

export interface ListHeartbeatHistoryValues {
  waAccountId: string;
  from?: Date;
  to?: Date;
  limit: number;
}

export async function listHeartbeatHistory(
  values: ListHeartbeatHistoryValues,
): Promise<ListHeartbeatHistoryRow[]> {
  const { waAccountId, from, to, limit } = values;
  const where = and(
    eq(waAccountHeartbeats.waAccountId, waAccountId),
    from ? gte(waAccountHeartbeats.receivedAt, from) : undefined,
    to ? lte(waAccountHeartbeats.receivedAt, to) : undefined,
  );

  return db
    .select({
      id: waAccountHeartbeats.id,
      receivedAt: waAccountHeartbeats.receivedAt,
    })
    .from(waAccountHeartbeats)
    .where(where)
    .orderBy(desc(waAccountHeartbeats.receivedAt))
    .limit(limit);
}

export interface ListHeartbeatActivityValues {
  waAccountId: string;
  from: Date;
  to: Date;
  bucket: HeartbeatBucket;
}

export interface HeartbeatActivityRow {
  bucket: Date;
  count: number;
}

export async function listHeartbeatActivity(
  values: ListHeartbeatActivityValues,
): Promise<HeartbeatActivityRow[]> {
  const { waAccountId, from, to, bucket } = values;
  const unit = sql.raw(`'${bucket}'`);
  const truncated = sql<string>`date_trunc(${unit}, ${waAccountHeartbeats.receivedAt})::timestamptz`;

  const rows = await db
    .select({ bucket: truncated, count: count() })
    .from(waAccountHeartbeats)
    .where(
      and(
        eq(waAccountHeartbeats.waAccountId, waAccountId),
        gte(waAccountHeartbeats.receivedAt, from),
        lte(waAccountHeartbeats.receivedAt, to),
      ),
    )
    .groupBy(truncated)
    .orderBy(truncated);

  return rows.map((row) => ({ bucket: new Date(row.bucket), count: row.count }));
}
