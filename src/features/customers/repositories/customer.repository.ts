import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  isNull,
  or,
  type Column,
} from "drizzle-orm";
import { db } from "@/lib/db";
import { customers, customerOrganizations, user } from "@/lib/db/schema";
import type { ListCustomerQuery } from "../schemas/list-customer.schema";

export interface ListCustomersValues {
  page: number;
  perPage: number;
  search?: string;
  organizationId?: string;
  status?: "active" | "inactive";
  isDecisionMaker?: boolean;
  unassigned?: boolean;
  sortBy: ListCustomerQuery["sortBy"];
  sortDir: ListCustomerQuery["sortDir"];
}

const sortColumns: Record<ListCustomersValues["sortBy"], Column> = {
  fullName: customers.fullName,
  email: customers.email,
  status: customers.status,
  createdAt: customers.createdAt,
  updatedAt: customers.updatedAt,
};

export interface CustomerRow {
  id: string;
  fullName: string;
  jobTitle: string | null;
  status: "active" | "inactive";
  organizationId: string | null;
  organizationName: string | null;
  isDecisionMaker: boolean;
  isPrimaryContact: boolean;
  createdById: string | null;
  accountOwnerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerDetailRow {
  id: string;
  fullName: string;
  email: string | null;
  jobTitle: string | null;
  notes: string | null;
  status: "active" | "inactive";
  organizationId: string | null;
  organizationName: string | null;
  isDecisionMaker: boolean;
  isPrimaryContact: boolean;
  createdById: string | null;
  createdByName: string | null;
  accountOwnerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerValues {
  id: string;
  organizationId?: string;
  fullName: string;
  jobTitle?: string;
  email?: string;
  notes?: string;
  isDecisionMaker?: boolean;
  isPrimaryContact?: boolean;
  status?: "active" | "inactive";
  createdById?: string;
}

export async function findCustomerByEmail(
  email: string,
): Promise<{ id: string } | null> {
  const rows = await db
    .select({ id: customers.id })
    .from(customers)
    .where(and(isNull(customers.deletedAt), eq(customers.email, email)))
    .limit(1);
  return rows[0] ?? null;
}

export async function findCustomerById(
  id: string,
): Promise<{ id: string; organizationId: string | null } | null> {
  const rows = await db
    .select({ id: customers.id, organizationId: customers.organizationId })
    .from(customers)
    .where(and(isNull(customers.deletedAt), eq(customers.id, id)))
    .limit(1);
  return rows[0] ?? null;
}

export async function findCustomerDetailById(
  id: string,
): Promise<CustomerDetailRow | null> {
  const rows = await db
    .select({
      id: customers.id,
      fullName: customers.fullName,
      email: customers.email,
      jobTitle: customers.jobTitle,
      notes: customers.notes,
      status: customers.status,
      organizationId: customers.organizationId,
      organizationName: customerOrganizations.name,
      isDecisionMaker: customers.isDecisionMaker,
      isPrimaryContact: customers.isPrimaryContact,
      createdById: customers.createdById,
      createdByName: user.name,
      accountOwnerId: customerOrganizations.accountOwnerId,
      createdAt: customers.createdAt,
      updatedAt: customers.updatedAt,
    })
    .from(customers)
    .leftJoin(
      customerOrganizations,
      eq(customerOrganizations.id, customers.organizationId),
    )
    .leftJoin(user, eq(user.id, customers.createdById))
    .where(and(isNull(customers.deletedAt), eq(customers.id, id)))
    .limit(1);
  return rows[0] ?? null;
}

export interface UpdateCustomerValues {
  fullName?: string;
  email?: string | null;
  organizationId?: string | null;
  jobTitle?: string | null;
  notes?: string | null;
  isDecisionMaker?: boolean;
  isPrimaryContact?: boolean;
  status?: "active" | "inactive";
}

export interface CustomerOwnerRow {
  id: string;
  createdById: string | null;
  accountOwnerId: string | null;
  organizationId: string | null;
}

export async function findCustomerOwnerById(
  id: string,
): Promise<CustomerOwnerRow | null> {
  const rows = await db
    .select({
      id: customers.id,
      createdById: customers.createdById,
      accountOwnerId: customerOrganizations.accountOwnerId,
      organizationId: customers.organizationId,
    })
    .from(customers)
    .leftJoin(
      customerOrganizations,
      eq(customerOrganizations.id, customers.organizationId),
    )
    .where(and(isNull(customers.deletedAt), eq(customers.id, id)))
    .limit(1);
  return rows[0] ?? null;
}

export async function updateCustomer(
  id: string,
  values: UpdateCustomerValues,
): Promise<CustomerRow> {
  const [row] = await db
    .update(customers)
    .set(values)
    .where(and(isNull(customers.deletedAt), eq(customers.id, id)))
    .returning();
  return {
    id: row.id,
    fullName: row.fullName,
    jobTitle: row.jobTitle,
    status: row.status,
    organizationId: row.organizationId,
    organizationName: null,
    isDecisionMaker: row.isDecisionMaker,
    isPrimaryContact: row.isPrimaryContact,
    createdById: null,
    accountOwnerId: null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function softDeleteCustomer(
  id: string,
): Promise<{ id: string } | null> {
  const rows = await db
    .update(customers)
    .set({ deletedAt: new Date() })
    .where(eq(customers.id, id))
    .returning({ id: customers.id });
  return rows[0] ?? null;
}

export async function assignCustomerToOrganization(
  organizationId: string,
  customerId: string,
): Promise<CustomerRow> {
  const [row] = await db
    .update(customers)
    .set({ organizationId })
    .where(and(isNull(customers.deletedAt), eq(customers.id, customerId)))
    .returning();
  return {
    id: row.id,
    fullName: row.fullName,
    jobTitle: row.jobTitle,
    status: row.status,
    organizationId: row.organizationId,
    organizationName: null,
    isDecisionMaker: row.isDecisionMaker,
    isPrimaryContact: row.isPrimaryContact,
    createdById: null,
    accountOwnerId: null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function unassignCustomerFromOrganization(
  customerId: string,
): Promise<CustomerRow> {
  const [row] = await db
    .update(customers)
    .set({ organizationId: null })
    .where(and(isNull(customers.deletedAt), eq(customers.id, customerId)))
    .returning();
  return {
    id: row.id,
    fullName: row.fullName,
    jobTitle: row.jobTitle,
    status: row.status,
    organizationId: row.organizationId,
    organizationName: null,
    isDecisionMaker: row.isDecisionMaker,
    isPrimaryContact: row.isPrimaryContact,
    createdById: null,
    accountOwnerId: null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function createCustomer(
  values: CreateCustomerValues,
): Promise<CustomerRow> {
  const [row] = await db
    .insert(customers)
    .values({
      id: values.id,
      organizationId: values.organizationId,
      fullName: values.fullName,
      jobTitle: values.jobTitle,
      email: values.email,
      notes: values.notes,
      isDecisionMaker: values.isDecisionMaker,
      isPrimaryContact: values.isPrimaryContact,
      status: values.status,
      createdById: values.createdById,
    })
    .returning();
  return {
    id: row.id,
    fullName: row.fullName,
    jobTitle: row.jobTitle,
    status: row.status,
    organizationId: row.organizationId,
    organizationName: null,
    isDecisionMaker: row.isDecisionMaker,
    isPrimaryContact: row.isPrimaryContact,
    createdById: values.createdById ?? null,
    accountOwnerId: null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listCustomers(
  values: ListCustomersValues,
): Promise<{ rows: CustomerRow[]; total: number }> {
  const { page, perPage, search, organizationId, status, isDecisionMaker, unassigned } =
    values;
  const searchWhere = search
    ? or(
        ilike(customers.fullName, `%${search}%`),
        ilike(customers.email, `%${search}%`),
        ilike(customers.jobTitle, `%${search}%`),
      )
    : undefined;
  const organizationWhere = organizationId
    ? eq(customers.organizationId, organizationId)
    : undefined;
  const unassignedWhere = unassigned
    ? isNull(customers.organizationId)
    : undefined;
  const statusWhere = status ? eq(customers.status, status) : undefined;
  const decisionMakerWhere = isDecisionMaker
    ? eq(customers.isDecisionMaker, true)
    : undefined;
  const where = and(
    isNull(customers.deletedAt),
    searchWhere,
    organizationWhere,
    unassignedWhere,
    statusWhere,
    decisionMakerWhere,
  );

  const [totalRow] = await db
    .select({ value: count() })
    .from(customers)
    .where(where);
  const total = totalRow?.value ?? 0;

  const orderBy = (values.sortDir === "asc" ? asc : desc)(
    sortColumns[values.sortBy],
  );
  const rows = await db
    .select({
      id: customers.id,
      fullName: customers.fullName,
      jobTitle: customers.jobTitle,
      status: customers.status,
      organizationId: customers.organizationId,
      organizationName: customerOrganizations.name,
      isDecisionMaker: customers.isDecisionMaker,
      isPrimaryContact: customers.isPrimaryContact,
      createdById: customers.createdById,
      accountOwnerId: customerOrganizations.accountOwnerId,
      createdAt: customers.createdAt,
      updatedAt: customers.updatedAt,
    })
    .from(customers)
    .leftJoin(
      customerOrganizations,
      eq(customerOrganizations.id, customers.organizationId),
    )
    .where(where)
    .orderBy(orderBy)
    .limit(perPage)
    .offset((page - 1) * perPage);

  return { rows, total };
}