import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { waAccounts } from "@/lib/db/schema";
import type { WaAccountRow } from "@/features/wa-accounts/repositories/wa-account.repository";

export interface UpdateHeartbeatValues {
  lastHeartbeatAt: Date;
  extVersion: string;
  protocolVersion: string;
  queueSize: number | null;
}

export async function updateWaAccountHeartbeat(
  id: string,
  values: UpdateHeartbeatValues,
): Promise<WaAccountRow | null> {
  const rows = await db
    .update(waAccounts)
    .set({
      lastHeartbeatAt: values.lastHeartbeatAt,
      extVersion: values.extVersion,
      protocolVersion: values.protocolVersion,
      queueSize: values.queueSize,
      updatedAt: new Date(),
    })
    .where(and(eq(waAccounts.id, id), isNull(waAccounts.deletedAt)))
    .returning();
  return rows[0] ?? null;
}