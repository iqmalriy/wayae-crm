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
  type Column,
} from "drizzle-orm";
import { db } from "@/lib/db";
import {
  contacts,
  contactInteractions,
  contactPhoneRevealLogs,
  customers,
  customerOrganizations,
  user,
} from "@/lib/db/schema";
import type { ListContactQuery } from "../schemas/list-contact.schema";

export type ContactRow = typeof contacts.$inferSelect;

export interface ContactActor {
  userId: string;
  role: "admin" | "staff";
}

export interface ListContactsValues {
  page: number;
  perPage: number;
  search?: string;
  customerId?: string;
  unassigned?: boolean;
  sortBy: ListContactQuery["sortBy"];
  sortDir: ListContactQuery["sortDir"];
}

const activeContact = isNull(contacts.deletedAt);

const sortColumns: Record<ListContactsValues["sortBy"], Column> = {
  displayName: contacts.displayName,
  phoneNumber: contacts.phoneNumber,
  source: contacts.source,
  createdAt: contacts.createdAt,
  lastSeenAt: contacts.lastSeenAt,
};

export async function listContacts(
  values: ListContactsValues,
): Promise<{ rows: ContactRow[]; total: number }> {
  const { page, perPage, search, customerId, unassigned, sortBy, sortDir } =
    values;
  const searchWhere = search
    ? or(
        ilike(contacts.displayName, `%${search}%`),
        ilike(contacts.phoneNumber, `%${search}%`),
      )
    : undefined;
  const customerWhere = customerId
    ? eq(contacts.customerId, customerId)
    : undefined;
  const unassignedWhere = unassigned
    ? isNull(contacts.customerId)
    : undefined;
  const where = and(activeContact, searchWhere, customerWhere, unassignedWhere);

  const [totalRow] = await db
    .select({ value: count() })
    .from(contacts)
    .where(where);
  const total = totalRow?.value ?? 0;

  const orderBy = (sortDir === "asc" ? asc : desc)(sortColumns[sortBy]);
  const rows = await db
    .select()
    .from(contacts)
    .where(where)
    .orderBy(orderBy)
    .limit(perPage)
    .offset((page - 1) * perPage);

  return { rows, total };
}

export async function findContactById(
  id: string,
): Promise<ContactRow | null> {
  const rows = await db
    .select()
    .from(contacts)
    .where(and(activeContact, eq(contacts.id, id)))
    .limit(1);
  return rows[0] ?? null;
}

export interface ContactDetailRow extends ContactRow {
  customerFullName: string | null;
  customerEmail: string | null;
  customerJobTitle: string | null;
  customerStatus: "active" | "inactive" | null;
  customerOrganizationId: string | null;
  customerOrganizationName: string | null;
  customerIsDecisionMaker: boolean | null;
  addedByName: string | null;
}

export async function findContactDetailById(
  id: string,
): Promise<ContactDetailRow | null> {
  const rows = await db
    .select({
      id: contacts.id,
      waJid: contacts.waJid,
      waIdType: contacts.waIdType,
      phoneNumber: contacts.phoneNumber,
      displayName: contacts.displayName,
      description: contacts.description,
      isBusiness: contacts.isBusiness,
      addedBy: contacts.addedBy,
      customerId: contacts.customerId,
      source: contacts.source,
      firstSeenAt: contacts.firstSeenAt,
      lastSeenAt: contacts.lastSeenAt,
      deletedAt: contacts.deletedAt,
      createdAt: contacts.createdAt,
      customerFullName: customers.fullName,
      customerEmail: customers.email,
      customerJobTitle: customers.jobTitle,
      customerStatus: customers.status,
      customerOrganizationId: customers.organizationId,
      customerOrganizationName: customerOrganizations.name,
      customerIsDecisionMaker: customers.isDecisionMaker,
      addedByName: user.name,
    })
    .from(contacts)
    .leftJoin(customers, eq(customers.id, contacts.customerId))
    .leftJoin(
      customerOrganizations,
      eq(customerOrganizations.id, customers.organizationId),
    )
    .leftJoin(user, eq(user.id, contacts.addedBy))
    .where(and(activeContact, eq(contacts.id, id)))
    .limit(1);
  return rows[0] ?? null;
}

export async function assignContactToCustomer(
  customerId: string,
  contactId: string,
): Promise<ContactRow> {
  const [row] = await db
    .update(contacts)
    .set({ customerId })
    .where(eq(contacts.id, contactId))
    .returning();
  return row;
}

export async function logContactPhoneReveal(values: {
  contactId: string;
  userId: string;
  role?: string;
  reason?: string;
}): Promise<void> {
  await db.insert(contactPhoneRevealLogs).values({
    contactId: values.contactId,
    userId: values.userId,
    role: values.role,
    reason: values.reason,
  });
}

export interface ContactPhoneRevealRow {
  id: string;
  userId: string | null;
  userName: string | null;
  role: string | null;
  reason: string | null;
  revealedAt: Date;
}

export async function listContactPhoneReveals(
  contactId: string,
): Promise<ContactPhoneRevealRow[]> {
  return db
    .select({
      id: contactPhoneRevealLogs.id,
      userId: contactPhoneRevealLogs.userId,
      userName: user.name,
      role: contactPhoneRevealLogs.role,
      reason: contactPhoneRevealLogs.reason,
      revealedAt: contactPhoneRevealLogs.revealedAt,
    })
    .from(contactPhoneRevealLogs)
    .leftJoin(user, eq(user.id, contactPhoneRevealLogs.userId))
    .where(eq(contactPhoneRevealLogs.contactId, contactId))
    .orderBy(desc(contactPhoneRevealLogs.revealedAt));
}

export async function findCustomersByIds(
  ids: string[],
): Promise<Map<string, { id: string; fullName: string }>> {
  if (ids.length === 0) return new Map();
  const rows = await db
    .select({ id: customers.id, fullName: customers.fullName })
    .from(customers)
    .where(inArray(customers.id, ids));
  return new Map(rows.map((r) => [r.id, r]));
}

export async function findCustomerById(
  id: string,
): Promise<{ id: string; fullName: string } | null> {
  const rows = await db
    .select({ id: customers.id, fullName: customers.fullName })
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function findContactByPhoneNumber(
  phoneNumber: string,
): Promise<ContactRow | null> {
  const rows = await db
    .select()
    .from(contacts)
    .where(and(activeContact, eq(contacts.phoneNumber, phoneNumber)))
    .limit(1);
  return rows[0] ?? null;
}

export async function findInteractionByContactAndUser(
  contactId: string,
  userId: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: contactInteractions.id })
    .from(contactInteractions)
    .where(
      and(
        eq(contactInteractions.contactId, contactId),
        eq(contactInteractions.userId, userId),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

export async function registerContactInteraction(values: {
  contactId: string;
  userId: string;
  savedName?: string;
}): Promise<void> {
  await db.insert(contactInteractions).values({
    contactId: values.contactId,
    waAccountId: null,
    userId: values.userId,
    savedName: values.savedName,
    firstInteractionAt: null,
    lastInteractionAt: null,
  });
}

export async function updateContact(
  id: string,
  values: {
    displayName?: string;
    description?: string | null;
    isBusiness?: boolean;
  },
): Promise<ContactRow> {
  const [row] = await db
    .update(contacts)
    .set(values)
    .where(and(activeContact, eq(contacts.id, id)))
    .returning();
  return row;
}

export async function softDeleteContact(id: string): Promise<ContactRow> {
  const [row] = await db
    .update(contacts)
    .set({ deletedAt: new Date() })
    .where(and(activeContact, eq(contacts.id, id)))
    .returning();
  return row;
}

export async function findContactIdsByCustomerId(
  customerId: string,
): Promise<string[]> {
  const rows = await db
    .select({ id: contacts.id })
    .from(contacts)
    .where(and(activeContact, eq(contacts.customerId, customerId)));
  return rows.map((row) => row.id);
}

export async function unassignContactsFromCustomer(
  contactIds: string[],
): Promise<void> {
  if (contactIds.length === 0) return;
  await db
    .update(contacts)
    .set({ customerId: null })
    .where(inArray(contacts.id, contactIds));
}

export interface CreateContactValues {
  phoneNumber: string;
  displayName: string;
  description?: string;
  isBusiness?: boolean;
  customerId?: string;
  addedBy: string;
}

export async function createContact(
  values: CreateContactValues,
): Promise<ContactRow> {
  const [row] = await db
    .insert(contacts)
    .values({
      waJid: null,
      waIdType: "unknown",
      phoneNumber: values.phoneNumber,
      displayName: values.displayName,
      description: values.description,
      isBusiness: values.isBusiness ?? false,
      addedBy: values.addedBy,
      customerId: values.customerId,
      source: "manual",
    })
    .returning();
  return row;
}