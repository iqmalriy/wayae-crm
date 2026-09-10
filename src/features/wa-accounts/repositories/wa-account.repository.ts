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
  type SQL,
} from "drizzle-orm";
import { db } from "@/lib/db";
import { user, waAccounts } from "@/lib/db/schema";

export type WaAccountRow = typeof waAccounts.$inferSelect;

export interface CreateWaAccountValues {
  userId: string;
  phone: string;
  label: string;
  tokenHash: string;
}

export async function findActiveByUserAndPhone(
  userId: string,
  phone: string,
): Promise<WaAccountRow | null> {
  const rows = await db
    .select()
    .from(waAccounts)
    .where(
      and(
        eq(waAccounts.userId, userId),
        eq(waAccounts.phone, phone),
        isNull(waAccounts.deletedAt),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function findWaAccountById(
  id: string,
): Promise<WaAccountRow | null> {
  const rows = await db
    .select()
    .from(waAccounts)
    .where(and(eq(waAccounts.id, id), isNull(waAccounts.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}

export async function updateWaAccountLabel(
  id: string,
  label: string,
): Promise<WaAccountRow | null> {
  const rows = await db
    .update(waAccounts)
    .set({ label, updatedAt: new Date() })
    .where(and(eq(waAccounts.id, id), isNull(waAccounts.deletedAt)))
    .returning();
  return rows[0] ?? null;
}

export async function updateWaAccountTokenHash(
  id: string,
  tokenHash: string,
): Promise<WaAccountRow | null> {
  const rows = await db
    .update(waAccounts)
    .set({ tokenHash, updatedAt: new Date() })
    .where(and(eq(waAccounts.id, id), isNull(waAccounts.deletedAt)))
    .returning();
  return rows[0] ?? null;
}

export async function softDeleteWaAccount(id: string): Promise<boolean> {
  const rows = await db
    .update(waAccounts)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(waAccounts.id, id), isNull(waAccounts.deletedAt)))
    .returning({ id: waAccounts.id });
  return rows.length > 0;
}

export async function createWaAccount(
  values: CreateWaAccountValues,
): Promise<WaAccountRow> {
  const [row] = await db
    .insert(waAccounts)
    .values({
      userId: values.userId,
      phone: values.phone,
      label: values.label,
      tokenHash: values.tokenHash,
    })
    .returning();
  return row;
}

export interface ListWaAccountsValues {
  page: number;
  perPage: number;
  search?: string;
  sortBy: "phone" | "label" | "createdAt" | "userName";
  sortDir: "asc" | "desc";
  ownerUserId?: string;
}

export interface WaAccountWithUser {
  id: string;
  userId: string | null;
  phone: string;
  label: string;
  lastHeartbeatAt: Date | null;
  extVersion: string | null;
  protocolVersion: string | null;
  queueSize: number | null;
  createdAt: Date;
  userName: string | null;
  userEmail: string | null;
}

const sortColumns: Record<ListWaAccountsValues["sortBy"], Column> = {
  phone: waAccounts.phone,
  label: waAccounts.label,
  createdAt: waAccounts.createdAt,
  userName: user.name,
};

export async function listWaAccounts(
  values: ListWaAccountsValues,
): Promise<{ rows: WaAccountWithUser[]; total: number }> {
  const { page, perPage, search, sortBy, sortDir, ownerUserId } = values;
  const conditions: SQL[] = [isNull(waAccounts.deletedAt)];
  if (ownerUserId) conditions.push(eq(waAccounts.userId, ownerUserId));
  if (search) {
    conditions.push(
      or(
        ilike(waAccounts.phone, `%${search}%`),
        ilike(waAccounts.label, `%${search}%`),
        ilike(user.name, `%${search}%`),
      ) as SQL,
    );
  }
  const where = and(...conditions);

  const [totalRow] = await db
    .select({ value: count() })
    .from(waAccounts)
    .leftJoin(user, eq(user.id, waAccounts.userId))
    .where(where);
  const total = totalRow?.value ?? 0;

  const orderBy = (sortDir === "asc" ? asc : desc)(sortColumns[sortBy]);
  const rows = await db
    .select({
      id: waAccounts.id,
      userId: waAccounts.userId,
      phone: waAccounts.phone,
      label: waAccounts.label,
      lastHeartbeatAt: waAccounts.lastHeartbeatAt,
      extVersion: waAccounts.extVersion,
      protocolVersion: waAccounts.protocolVersion,
      queueSize: waAccounts.queueSize,
      createdAt: waAccounts.createdAt,
      userName: user.name,
      userEmail: user.email,
    })
    .from(waAccounts)
    .leftJoin(user, eq(user.id, waAccounts.userId))
    .where(where)
    .orderBy(orderBy)
    .limit(perPage)
    .offset((page - 1) * perPage);

  return { rows, total };
}