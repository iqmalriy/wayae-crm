import { AppError } from "@/lib/errors";
import { findActiveByToken } from "../repositories/wa-token.repository";
import { updateWaAccountHeartbeat } from "../repositories/wa-account.repository";
import { insertHeartbeat } from "../repositories/wa-heartbeat.repository";
import type { HeartbeatInput } from "../schemas/heartbeat.schema";

export interface HeartbeatOutput {
  serverTs: number;
}

export async function recordHeartbeat(
  token: string,
  input: HeartbeatInput,
): Promise<HeartbeatOutput> {
  const account = await findActiveByToken(token);
  if (!account) throw new AppError("UNAUTHORIZED");

  if (account.phone !== input.phone) throw new AppError("FORBIDDEN");

  await updateWaAccountHeartbeat(account.id, {
    lastHeartbeatAt: new Date(),
    extVersion: input.extVersion,
    protocolVersion: input.version,
    queueSize: input.queueSize ?? null,
  });

  await insertHeartbeat({
    waAccountId: account.id,
  });

  return { serverTs: Math.floor(Date.now() / 1000) };
}
