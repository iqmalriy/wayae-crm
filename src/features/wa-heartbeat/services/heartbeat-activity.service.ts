import { AppError } from "@/lib/errors";
import { findWaAccountById } from "@/features/wa-accounts/repositories/wa-account.repository";
import {
  listHeartbeatActivity,
  type HeartbeatActivityRow,
} from "../repositories/wa-heartbeat.repository";
import type {
  HeartbeatActivityQuery,
  HeartbeatBucket,
} from "../schemas/heartbeat-activity.schema";

const DEFAULT_RANGE_MS = 24 * 60 * 60 * 1000;

const BUCKET_STEP_MS: Record<HeartbeatBucket, number> = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
};

function pickBucket(spanMs: number): HeartbeatBucket {
  if (spanMs <= 6 * 60 * 60 * 1000) return "minute";
  if (spanMs <= 48 * 60 * 60 * 1000) return "hour";
  return "day";
}

export interface HeartbeatActivityPoint {
  timestamp: string;
  count: number;
}

export async function getWaAccountHeartbeatActivity(
  waAccountId: string,
  query: HeartbeatActivityQuery,
): Promise<HeartbeatActivityPoint[]> {
  const account = await findWaAccountById(waAccountId);
  if (!account) throw new AppError("NOT_FOUND");

  const to = query.to ? new Date(query.to) : new Date();
  const from = query.from
    ? new Date(query.from)
    : new Date(to.getTime() - DEFAULT_RANGE_MS);

  const bucket = query.bucket ?? pickBucket(to.getTime() - from.getTime());
  const step = BUCKET_STEP_MS[bucket];

  const rows = await listHeartbeatActivity({ waAccountId, from, to, bucket });

  const countByBucket = new Map(
    rows.map((row: HeartbeatActivityRow) => [row.bucket.getTime(), row.count]),
  );

  const start = Math.floor(from.getTime() / step) * step;
  const points: HeartbeatActivityPoint[] = [];
  for (let t = start; t <= to.getTime(); t += step) {
    points.push({
      timestamp: new Date(t).toISOString(),
      count: countByBucket.get(t) ?? 0,
    });
  }

  return points;
}