import {
  countCustomersByOrganization,
  listCustomerOrganizations,
  type CustomerOrganizationRow,
} from "../repositories/customer-organization.repository";
import type { ListCustomerOrganizationQuery } from "../schemas/list-customer-organization.schema";
import type {
  CustomerOrganizationView,
  ListCustomerOrganizationsOutput,
} from "../types/response-types";

function toView(
  row: CustomerOrganizationRow,
  counts: Map<string, { customerCount: number; activeCustomerCount: number }>,
): CustomerOrganizationView {
  const orgCounts = counts.get(row.id) ?? {
    customerCount: 0,
    activeCustomerCount: 0,
  };
  return {
    id: row.id,
    name: row.name,
    legalName: row.legalName,
    organizationType: row.organizationType,
    status: row.status,
    customerCount: orgCounts.customerCount,
    activeCustomerCount: orgCounts.activeCustomerCount,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listCustomerOrganizationsForUser(
  query: ListCustomerOrganizationQuery,
): Promise<ListCustomerOrganizationsOutput> {
  const { rows, total } = await listCustomerOrganizations(query);
  const counts = await countCustomersByOrganization(rows.map((r) => r.id));

  const totalPages = total === 0 ? 0 : Math.ceil(total / query.perPage);
  return {
    customerOrganizations: rows.map((row) => toView(row, counts)),
    page: query.page,
    perPage: query.perPage,
    total,
    totalPages,
  };
}