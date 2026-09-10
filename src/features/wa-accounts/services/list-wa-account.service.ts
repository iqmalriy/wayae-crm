import {
  listWaAccounts,
  type WaAccountWithUser,
} from "../repositories/wa-account.repository";
import type { ListWaAccountQuery } from "../schemas/list-wa-account.schema";
import type {
  ListWaAccountsOutput,
  WaAccountListItem,
} from "../types/response-types";

function toListItem(row: WaAccountWithUser): WaAccountListItem {
  return {
    id: row.id,
    userId: row.userId,
    phone: row.phone,
    label: row.label,
    lastHeartbeatAt: row.lastHeartbeatAt?.toISOString() ?? null,
    extVersion: row.extVersion,
    protocolVersion: row.protocolVersion,
    queueSize: row.queueSize,
    createdAt: row.createdAt.toISOString(),
    user: row.userName
      ? { id: row.userId!, name: row.userName, email: row.userEmail! }
      : null,
  };
}

export async function listWaAccountsForUser(
  user: { id: string; role: string | null | undefined },
  query: ListWaAccountQuery,
): Promise<ListWaAccountsOutput> {
  const isAdmin = user.role === "admin";
  const { rows, total } = await listWaAccounts({
    ...query,
    ownerUserId: isAdmin ? undefined : user.id,
  });
  const totalPages = total === 0 ? 0 : Math.ceil(total / query.perPage);
  return {
    waAccounts: rows.map(toListItem),
    page: query.page,
    perPage: query.perPage,
    total,
    totalPages,
  };
}