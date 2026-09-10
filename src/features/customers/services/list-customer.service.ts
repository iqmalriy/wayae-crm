import { listCustomers, type CustomerRow } from "../repositories/customer.repository";
import type { ListCustomerQuery } from "../schemas/list-customer.schema";
import type { CustomerView, ListCustomersOutput } from "../types/response-types";

function toView(row: CustomerRow, actor: ListCustomerActor): CustomerView {
  const isOwner = row.createdById === actor.userId;
  const isAccountOwner = row.accountOwnerId === actor.userId;
  const isAdmin = actor.role === "admin";
  return {
    id: row.id,
    fullName: row.fullName,
    jobTitle: row.jobTitle,
    status: row.status,
    organizationId: row.organizationId,
    organizationName: row.organizationName,
    isDecisionMaker: row.isDecisionMaker,
    isPrimaryContact: row.isPrimaryContact,
    canDetach: isOwner || isAccountOwner || isAdmin,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export interface ListCustomerActor {
  userId: string;
  role: "admin" | "staff";
}

export async function listCustomersForUser(
  query: ListCustomerQuery,
  actor: ListCustomerActor,
): Promise<ListCustomersOutput> {
  const { rows, total } = await listCustomers(query);

  const totalPages = total === 0 ? 0 : Math.ceil(total / query.perPage);
  return {
    customers: rows.map((row) => toView(row, actor)),
    page: query.page,
    perPage: query.perPage,
    total,
    totalPages,
  };
}