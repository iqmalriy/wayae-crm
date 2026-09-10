import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  isNull,
  notInArray,
  or,
  sql,
  type Column,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/lib/db";
import {
  contacts,
  customers,
  customerOrganizations,
  leadActivities,
  leads,
  user,
} from "@/lib/db/schema";
import type { ListLeadsQuery } from "../schemas/list-lead.schema";

export type LeadRow = typeof leads.$inferSelect;

export interface ListLeadsValues {
  page: number;
  perPage: number;
  search?: string;
  stage?: ListLeadsQuery["stage"];
  ownerId?: string;
  assigneeId?: string;
  mineUserId?: string;
  excludeClosed?: boolean;
  sortBy: ListLeadsQuery["sortBy"];
  sortDir: ListLeadsQuery["sortDir"];
}

export interface LeadListItem extends LeadRow {
  ownerName: string | null;
  assigneeName: string | null;
  contactName: string | null;
  contactPhone: string | null;
  costumerName: string | null;
  costumerEmail: string | null;
  costumerOrganizationName: string | null;
}

const activeLead = isNull(leads.deletedAt);
const assigneeUser = alias(user, "assignee");

const sortColumns: Record<ListLeadsValues["sortBy"], Column> = {
  name: leads.name,
  company: leads.company,
  stage: leads.stage,
  ownerId: leads.ownerId,
  assigneeId: leads.assigneeId,
  estimatedValue: leads.estimatedValue,
  createdAt: leads.createdAt,
};

export async function listLeads(
  values: ListLeadsValues,
): Promise<{ rows: LeadListItem[]; total: number }> {
  const { page, perPage, search, stage, ownerId, assigneeId, mineUserId, excludeClosed, sortBy, sortDir } =
    values;

  const searchWhere = search
    ? or(
        ilike(leads.leadNumber, `%${search}%`),
        ilike(leads.name, `%${search}%`),
        ilike(leads.company, `%${search}%`),
        ilike(leads.phoneNumber, `%${search}%`),
        ilike(leads.email, `%${search}%`),
        ilike(contacts.displayName, `%${search}%`),
        ilike(contacts.phoneNumber, `%${search}%`),
        ilike(customers.fullName, `%${search}%`),
        ilike(customers.email, `%${search}%`),
        ilike(customerOrganizations.name, `%${search}%`),
      )
    : undefined;
  const stageWhere = stage ? eq(leads.stage, stage) : undefined;
  const ownerWhere = ownerId ? eq(leads.ownerId, ownerId) : undefined;
  const assigneeWhere = assigneeId ? eq(leads.assigneeId, assigneeId) : undefined;
  const mineWhere = mineUserId
    ? or(
        eq(leads.ownerId, mineUserId),
        eq(leads.assigneeId, mineUserId),
      )
    : undefined;
  const excludeClosedWhere = excludeClosed
    ? notInArray(leads.stage, ["won", "lost"])
    : undefined;
  const where = and(
    activeLead,
    searchWhere,
    stageWhere,
    ownerWhere,
    assigneeWhere,
    mineWhere,
    excludeClosedWhere,
  );

  const [totalRow] = await db
    .select({ value: count() })
    .from(leads)
    .where(where);
  const total = totalRow?.value ?? 0;

  const orderBy = (sortDir === "asc" ? asc : desc)(sortColumns[sortBy]);
  const rows = await db
    .select({
      id: leads.id,
      leadNumber: leads.leadNumber,
      name: leads.name,
      company: leads.company,
      phoneNumber: leads.phoneNumber,
      email: leads.email,
      stage: leads.stage,
      source: leads.source,
      ownerId: leads.ownerId,
      assigneeId: leads.assigneeId,
      estimatedValue: leads.estimatedValue,
      notes: leads.notes,
      contactId: leads.contactId,
      customerOrganizationId: leads.customerOrganizationId,
      customerId: leads.customerId,
      wonAt: leads.wonAt,
      lostAt: leads.lostAt,
      stageChangedAt: leads.stageChangedAt,
      deletedAt: leads.deletedAt,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
      ownerName: user.name,
      assigneeName: assigneeUser.name,
      contactName: contacts.displayName,
      contactPhone: contacts.phoneNumber,
      costumerName: customers.fullName,
      costumerEmail: customers.email,
      costumerOrganizationName: customerOrganizations.name,
    })
    .from(leads)
    .leftJoin(user, eq(user.id, leads.ownerId))
    .leftJoin(assigneeUser, eq(assigneeUser.id, leads.assigneeId))
    .leftJoin(contacts, eq(contacts.id, leads.contactId))
    .leftJoin(customers, eq(customers.id, leads.customerId))
    .leftJoin(
      customerOrganizations,
      eq(customerOrganizations.id, leads.customerOrganizationId),
    )
    .where(where)
    .orderBy(orderBy)
    .limit(perPage)
    .offset((page - 1) * perPage);

  return { rows, total };
}

export async function findLeadById(id: string): Promise<LeadListItem | null> {
  const rows = await db
    .select({
      id: leads.id,
      leadNumber: leads.leadNumber,
      name: leads.name,
      company: leads.company,
      phoneNumber: leads.phoneNumber,
      email: leads.email,
      stage: leads.stage,
      source: leads.source,
      ownerId: leads.ownerId,
      assigneeId: leads.assigneeId,
      estimatedValue: leads.estimatedValue,
      notes: leads.notes,
      contactId: leads.contactId,
      customerOrganizationId: leads.customerOrganizationId,
      customerId: leads.customerId,
      wonAt: leads.wonAt,
      lostAt: leads.lostAt,
      stageChangedAt: leads.stageChangedAt,
      deletedAt: leads.deletedAt,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
      ownerName: user.name,
      assigneeName: assigneeUser.name,
      contactName: contacts.displayName,
      contactPhone: contacts.phoneNumber,
      costumerName: customers.fullName,
      costumerEmail: customers.email,
      costumerOrganizationName: customerOrganizations.name,
    })
    .from(leads)
    .leftJoin(user, eq(user.id, leads.ownerId))
    .leftJoin(assigneeUser, eq(assigneeUser.id, leads.assigneeId))
    .leftJoin(contacts, eq(contacts.id, leads.contactId))
    .leftJoin(customers, eq(customers.id, leads.customerId))
    .leftJoin(
      customerOrganizations,
      eq(customerOrganizations.id, leads.customerOrganizationId),
    )
    .where(and(activeLead, eq(leads.id, id)))
    .limit(1);
  return rows[0] ?? null;
}

export async function findLeadByPhone(
  phoneNumber: string,
): Promise<LeadRow | null> {
  const rows = await db
    .select()
    .from(leads)
    .where(and(activeLead, eq(leads.phoneNumber, phoneNumber)))
    .limit(1);
  return rows[0] ?? null;
}

export interface CreateLeadValues {
  name?: string | null;
  company?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  stage: LeadRow["stage"];
  source: LeadRow["source"];
  ownerId: string;
  assigneeId?: string | null;
  estimatedValue?: number | null;
  notes?: string | null;
  contactId?: string | null;
  customerId?: string | null;
  customerOrganizationId?: string | null;
}

export async function createLead(values: CreateLeadValues): Promise<LeadRow> {
  const leadNumber = await nextLeadNumber();
  const [row] = await db
    .insert(leads)
    .values({ ...values, leadNumber })
    .returning();
  return row;
}

async function nextLeadNumber(): Promise<string> {
  const result = await db.execute(
    sql`select nextval('leads_lead_number_seq') as n`,
  );
  const n = Number(result.rows[0]?.n);
  return `L-${String(n).padStart(4, "0")}`;
}

export interface UpdateLeadValues {
  name?: string | null;
  company?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  source?: LeadRow["source"];
  assigneeId?: string | null;
  estimatedValue?: number | null;
  notes?: string | null;
}

export async function updateLead(
  id: string,
  values: UpdateLeadValues,
): Promise<LeadRow> {
  const [row] = await db
    .update(leads)
    .set(values)
    .where(and(activeLead, eq(leads.id, id)))
    .returning();
  return row;
}

export async function softDeleteLead(id: string): Promise<void> {
  await db
    .update(leads)
    .set({ deletedAt: new Date() })
    .where(and(activeLead, eq(leads.id, id)));
}

export interface StageChangeValues {
  stage: LeadRow["stage"];
  stageChangedAt: Date;
  wonAt: Date | null;
  lostAt: Date | null;
}

export interface InsertLeadActivityValues {
  leadId: string;
  body: string | null;
  performedById: string | null;
  fromStage: string | null;
  toStage: string | null;
}

export async function changeLeadStage(
  id: string,
  values: StageChangeValues,
  activity: InsertLeadActivityValues,
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(leads)
      .set({
        stage: values.stage,
        stageChangedAt: values.stageChangedAt,
        wonAt: values.wonAt,
        lostAt: values.lostAt,
      })
      .where(and(activeLead, eq(leads.id, id)));
    await tx.insert(leadActivities).values(activity);
  });
}

export interface LeadActivityRow {
  id: string;
  leadId: string;
  body: string | null;
  performedById: string | null;
  performedByName: string | null;
  fromStage: string | null;
  toStage: string | null;
  createdAt: Date;
}

export async function listLeadActivities(
  leadId: string,
): Promise<LeadActivityRow[]> {
  return db
    .select({
      id: leadActivities.id,
      leadId: leadActivities.leadId,
      body: leadActivities.body,
      performedById: leadActivities.performedById,
      performedByName: user.name,
      fromStage: leadActivities.fromStage,
      toStage: leadActivities.toStage,
      createdAt: leadActivities.createdAt,
    })
    .from(leadActivities)
    .leftJoin(user, eq(user.id, leadActivities.performedById))
    .where(eq(leadActivities.leadId, leadId))
    .orderBy(desc(leadActivities.createdAt));
}

export interface CreateLeadActivityValues {
  leadId: string;
  body: string;
  performedById: string;
}

export async function createLeadActivity(
  values: CreateLeadActivityValues,
): Promise<LeadActivityRow> {
  const [inserted] = await db.insert(leadActivities).values(values).returning();
  const rows = await db
    .select({
      id: leadActivities.id,
      leadId: leadActivities.leadId,
      body: leadActivities.body,
      performedById: leadActivities.performedById,
      performedByName: user.name,
      fromStage: leadActivities.fromStage,
      toStage: leadActivities.toStage,
      createdAt: leadActivities.createdAt,
    })
    .from(leadActivities)
    .leftJoin(user, eq(user.id, leadActivities.performedById))
    .where(eq(leadActivities.id, inserted.id))
    .limit(1);
  return rows[0];
}