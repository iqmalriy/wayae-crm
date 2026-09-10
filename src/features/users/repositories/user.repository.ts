import { randomUUID } from "node:crypto";
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
import { hashPassword, generateRandomString } from "better-auth/crypto";
import { db } from "@/lib/db";
import { user, account, type UserRole } from "@/lib/db/schema";

export type UserRow = typeof user.$inferSelect;

const activeUser = isNull(user.deletedAt);

export interface CreateUserValues {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const rows = await db
    .select()
    .from(user)
    .where(and(activeUser, eq(user.email, email)))
    .limit(1);
  return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const rows = await db
    .select()
    .from(user)
    .where(and(activeUser, eq(user.id, id)))
    .limit(1);
  return rows[0] ?? null;
}

export interface ListUsersValues {
  page: number;
  perPage: number;
  search?: string;
  sortBy: "name" | "email" | "role" | "createdAt";
  sortDir: "asc" | "desc";
}

const sortColumns: Record<ListUsersValues["sortBy"], Column> = {
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
};

export async function listUsers(
  values: ListUsersValues,
): Promise<{ rows: UserRow[]; total: number }> {
  const { page, perPage, search, sortBy, sortDir } = values;
  const searchWhere = search
    ? or(
        ilike(user.name, `%${search}%`),
        ilike(user.email, `%${search}%`),
      )
    : undefined;
  const where = and(activeUser, searchWhere);

  const [totalRow] = await db
    .select({ value: count() })
    .from(user)
    .where(where);
  const total = totalRow?.value ?? 0;

  const orderBy = (sortDir === "asc" ? asc : desc)(sortColumns[sortBy]);
  const rows = await db
    .select()
    .from(user)
    .where(where)
    .orderBy(orderBy)
    .limit(perPage)
    .offset((page - 1) * perPage);

  return { rows, total };
}

export async function createUser(values: CreateUserValues): Promise<UserRow> {
  const userId = `user_${generateRandomString(24, "a-z", "0-9")}`;
  const passwordHash = await hashPassword(values.password);

  return db.transaction(async (tx) => {
    await tx.insert(user).values({
      id: userId,
      name: values.name,
      email: values.email,
      emailVerified: true,
      role: values.role,
    });

    await tx.insert(account).values({
      id: randomUUID(),
      issuer: "local:credential",
      accountId: userId,
      providerId: "credential",
      userId,
      password: passwordHash,
    });

    const [row] = await tx
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    return row;
  });
}

export interface UpdateUserValues {
  name?: string;
  email?: string;
  role?: UserRole;
  password?: string;
}

export async function updateUser(
  id: string,
  values: UpdateUserValues,
): Promise<UserRow | null> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .update(user)
      .set({
        name: values.name,
        email: values.email,
        role: values.role,
      })
      .where(and(activeUser, eq(user.id, id)))
      .returning();

    if (!row) return null;

    if (values.password) {
      const passwordHash = await hashPassword(values.password);
      await tx
        .update(account)
        .set({ password: passwordHash })
        .where(eq(account.userId, id));
    }

    return row;
  });
}

export async function deleteUser(id: string): Promise<boolean> {
  const rows = await db
    .update(user)
    .set({ deletedAt: new Date() })
    .where(and(activeUser, eq(user.id, id)))
    .returning({ id: user.id });
  return rows.length > 0;
}