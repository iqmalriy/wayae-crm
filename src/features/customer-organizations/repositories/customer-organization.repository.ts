import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  or,
  sql,
  type Column,
} from "drizzle-orm";
import { db } from "@/lib/db";
import { customers, customerOrganizations, user } from "@/lib/db/schema";
import type { ListCustomerOrganizationQuery } from "../schemas/list-customer-organization.schema";

export type CustomerOrganizationRow = typeof customerOrganizations.$inferSelect;

export interface CreateCustomerOrganizationValues {
  id: string;
  name: string;
  legalName?: string;
  npwp?: string;
  industry?: string;
  address?: string;
  organizationType?: "enterprise" | "individual";
  accountOwnerId?: string;
}

export async function createCustomerOrganization(
  values: CreateCustomerOrganizationValues,
): Promise<CustomerOrganizationRow> {
  const [row] = await db
    .insert(customerOrganizations)
    .values({
      id: values.id,
      name: values.name,
      legalName: values.legalName,
      npwp: values.npwp,
      status: "active",
      industry: values.industry,
      address: values.address,
      organizationType: values.organizationType,
      accountOwnerId: values.accountOwnerId,
    })
    .returning();
  return row;
}

export async function updateCustomerOrganization(
  id: string,
  values: {
    name?: string;
    legalName?: string | null;
    npwp?: string | null;
    industry?: string | null;
    address?: string | null;
    organizationType?: "enterprise" | "individual" | null;
  },
): Promise<CustomerOrganizationRow> {
  const [row] = await db
    .update(customerOrganizations)
    .set(values)
    .where(
      and(eq(customerOrganizations.id, id), isNull(customerOrganizations.deletedAt)),
    )
    .returning();
  return row;
}

export async function softDeleteCustomerOrganization(
  id: string,
): Promise<CustomerOrganizationRow> {
  const [row] = await db
    .update(customerOrganizations)
    .set({ deletedAt: new Date() })
    .where(
      and(eq(customerOrganizations.id, id), isNull(customerOrganizations.deletedAt)),
    )
    .returning();
  return row;
}

export async function findCustomerIdsByOrganization(
  organizationId: string,
): Promise<string[]> {
  const rows = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.organizationId, organizationId));
  return rows.map((r) => r.id);
}

export async function clearCustomerOrganization(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await db
    .update(customers)
    .set({ organizationId: null, isDecisionMaker: false, isPrimaryContact: false })
    .where(inArray(customers.id, ids));
}

export interface ListCustomerOrganizationsValues {
  page: number;
  perPage: number;
  search?: string;
  type?: "enterprise" | "individual";
  status?: "prospect" | "active" | "churned";
  sortBy: ListCustomerOrganizationQuery["sortBy"];
  sortDir: ListCustomerOrganizationQuery["sortDir"];
}

const activeOrganization = isNull(customerOrganizations.deletedAt);

const sortColumns: Record<ListCustomerOrganizationsValues["sortBy"], Column> = {
  name: customerOrganizations.name,
  status: customerOrganizations.status,
  organizationType: customerOrganizations.organizationType,
  updatedAt: customerOrganizations.updatedAt,
};

export interface CustomerOrganizationWithOwner extends CustomerOrganizationRow {
  ownerName: string | null;
  ownerEmail: string | null;
}

export async function findCustomerOrganizationById(
  id: string,
): Promise<CustomerOrganizationWithOwner | null> {
  const rows = await db
    .select({
      id: customerOrganizations.id,
      name: customerOrganizations.name,
      legalName: customerOrganizations.legalName,
      npwp: customerOrganizations.npwp,
      industry: customerOrganizations.industry,
      address: customerOrganizations.address,
      organizationType: customerOrganizations.organizationType,
      status: customerOrganizations.status,
      accountOwnerId: customerOrganizations.accountOwnerId,
      createdAt: customerOrganizations.createdAt,
      updatedAt: customerOrganizations.updatedAt,
      churnedAt: customerOrganizations.churnedAt,
      prospectAt: customerOrganizations.prospectAt,
      deletedAt: customerOrganizations.deletedAt,
      ownerName: user.name,
      ownerEmail: user.email,
    })
    .from(customerOrganizations)
    .leftJoin(user, eq(user.id, customerOrganizations.accountOwnerId))
    .where(
      and(
        eq(customerOrganizations.id, id),
        isNull(customerOrganizations.deletedAt),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function listCustomerOrganizations(
  values: ListCustomerOrganizationsValues,
): Promise<{ rows: CustomerOrganizationRow[]; total: number }> {
  const { page, perPage, search, type, status, sortBy, sortDir } = values;
  const searchWhere = search
    ? or(
        ilike(customerOrganizations.name, `%${search}%`),
        ilike(customerOrganizations.legalName, `%${search}%`),
      )
    : undefined;
  const typeWhere = type
    ? eq(customerOrganizations.organizationType, type)
    : undefined;
  const statusWhere = status
    ? eq(customerOrganizations.status, status)
    : undefined;
  const where = and(activeOrganization, searchWhere, typeWhere, statusWhere);

  const [totalRow] = await db
    .select({ value: count() })
    .from(customerOrganizations)
    .where(where);
  const total = totalRow?.value ?? 0;

  const orderBy = (sortDir === "asc" ? asc : desc)(sortColumns[sortBy]);
  const rows = await db
    .select()
    .from(customerOrganizations)
    .where(where)
    .orderBy(orderBy)
    .limit(perPage)
    .offset((page - 1) * perPage);

  return { rows, total };
}

export async function countCustomersByOrganization(
  ids: string[],
): Promise<
  Map<string, { customerCount: number; activeCustomerCount: number }>
> {
  if (ids.length === 0) return new Map();
  const rows = await db
    .select({
      organizationId: customers.organizationId,
      customerCount: sql<number>`count(*)`,
      activeCustomerCount: sql<number>`count(*) filter (where ${customers.status} = 'active')`,
    })
    .from(customers)
    .where(inArray(customers.organizationId, ids))
    .groupBy(customers.organizationId);
  const entries: [
    string,
    { customerCount: number; activeCustomerCount: number },
  ][] = [];
  for (const r of rows) {
    if (!r.organizationId) continue;
    entries.push([
      r.organizationId,
      {
        customerCount: r.customerCount,
        activeCustomerCount: r.activeCustomerCount,
      },
    ]);
  }
  return new Map(entries);
}
