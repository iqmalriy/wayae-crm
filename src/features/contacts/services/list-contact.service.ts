import {
  findCustomersByIds,
  listContacts,
  type ContactRow,
} from "../repositories/contact.repository";
import type { ListContactQuery } from "../schemas/list-contact.schema";
import type { ContactView, ListContactsOutput } from "../types/response-types";
import { phoneForRole } from "../utils/phone";

export interface ContactActor {
  userId: string;
  role: "admin" | "staff";
}

function toView(
  row: ContactRow,
  customersById: Map<string, { id: string; fullName: string }>,
  actor: ContactActor,
): ContactView {
  const customer = row.customerId
    ? customersById.get(row.customerId) ?? null
    : null;
  return {
    id: row.id,
    phone: phoneForRole(row.phoneNumber, actor.role),
    displayName: row.displayName,
    source: row.source,
    costumers: customer,
    canDetach: actor.role === "admin" || row.addedBy === actor.userId,
    firstSeenAt: row.firstSeenAt?.toISOString() ?? null,
    lastSeenAt: row.lastSeenAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listContactsForUser(
  query: ListContactQuery,
  actor: ContactActor,
): Promise<ListContactsOutput> {
  const { rows, total } = await listContacts(query);

  const customerIds = rows
    .map((r) => r.customerId)
    .filter((id): id is string => Boolean(id));
  const customersById = await findCustomersByIds(customerIds);

  const totalPages = total === 0 ? 0 : Math.ceil(total / query.perPage);
  return {
    contacts: rows.map((row) => toView(row, customersById, actor)),
    page: query.page,
    perPage: query.perPage,
    total,
    totalPages,
  };
}