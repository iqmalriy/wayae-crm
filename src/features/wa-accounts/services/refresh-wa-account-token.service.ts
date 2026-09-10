import { WaAccountNotFoundError } from "../api-error/errors";
import { generateBearerToken } from "../lib/token-helper";
import {
  findWaAccountById,
  updateWaAccountTokenHash,
  type WaAccountRow,
} from "../repositories/wa-account.repository";
import type { RefreshWaAccountTokenOutput, WaAccountView } from "../types/response-types";

function toView(row: WaAccountRow): WaAccountView {
  return {
    id: row.id,
    userId: row.userId,
    phone: row.phone,
    label: row.label,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function refreshWaAccountTokenForAdmin(
  id: string,
): Promise<RefreshWaAccountTokenOutput> {
  if (!(await findWaAccountById(id))) throw new WaAccountNotFoundError();

  const { token, tokenHash } = await generateBearerToken();
  const row = await updateWaAccountTokenHash(id, tokenHash);
  if (!row) throw new WaAccountNotFoundError();

  return { waAccount: toView(row), token };
}