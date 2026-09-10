import { isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { waAccounts } from "@/lib/db/schema";

export interface WaAccountStatusRow {
  label: string;
  lastHeartbeatAt: Date | null;
}

export async function listWaAccountStatus(): Promise<WaAccountStatusRow[]> {
  return db
    .select({
      label: waAccounts.label,
      lastHeartbeatAt: waAccounts.lastHeartbeatAt,
    })
    .from(waAccounts)
    .where(isNull(waAccounts.deletedAt))
    .orderBy(waAccounts.label);
}