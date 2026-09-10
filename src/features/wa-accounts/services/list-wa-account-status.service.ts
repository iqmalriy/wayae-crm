import { listWaAccountStatus } from "../repositories/wa-account-status.repository";

export interface WaAccountStatusView {
  label: string;
  lastHeartbeatAt: string | null;
}

export async function listWaAccountStatusForSession(): Promise<
  WaAccountStatusView[]
> {
  const rows = await listWaAccountStatus();
  return rows.map((row) => ({
    label: row.label,
    lastHeartbeatAt: row.lastHeartbeatAt?.toISOString() ?? null,
  }));
}