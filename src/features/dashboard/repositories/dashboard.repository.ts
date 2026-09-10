import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  isNotNull,
  isNull,
  lt,
  lte,
  ne,
  notInArray,
  or,
  sql,
  sum,
  type SQL,
} from "drizzle-orm";
import { db } from "@/lib/db";
import {
  conversationReads,
  conversations,
  customers,
  leads,
  messages,
  tasks,
  user,
  waAccounts,
} from "@/lib/db/schema";
import type { DashboardBucket } from "../schemas/get-dashboard.schema";

export interface CountOptions {
  userId?: string;
  before?: Date;
}

function leadOwnerFilter(userId: string): SQL {
  return or(eq(leads.ownerId, userId), eq(leads.assigneeId, userId)) as SQL;
}

function unreadExpression(userId: string): SQL<boolean> {
  return sql<boolean>`coalesce((select max(${messages.seq}) from ${messages} where ${messages.conversationId} = ${conversations.id}), 0) > coalesce((select ${conversationReads.lastReadMessageSeq} from ${conversationReads} where ${conversationReads.conversationId} = ${conversations.id} and ${conversationReads.userId} = ${userId}), 0)`;
}

export async function countOpenLeads(opts: CountOptions = {}): Promise<number> {
  const conditions: SQL[] = [
    isNull(leads.deletedAt),
    notInArray(leads.stage, ["won", "lost"]),
  ];
  if (opts.userId) conditions.push(leadOwnerFilter(opts.userId));
  if (opts.before) conditions.push(lt(leads.createdAt, opts.before));

  const [row] = await db
    .select({ value: count() })
    .from(leads)
    .where(and(...conditions));
  return row?.value ?? 0;
}

export async function sumOpenPipeline(opts: CountOptions = {}): Promise<number> {
  const conditions: SQL[] = [
    isNull(leads.deletedAt),
    notInArray(leads.stage, ["won", "lost"]),
  ];
  if (opts.userId) conditions.push(leadOwnerFilter(opts.userId));
  if (opts.before) conditions.push(lt(leads.createdAt, opts.before));

  const [row] = await db
    .select({ value: sum(leads.estimatedValue) })
    .from(leads)
    .where(and(...conditions));
  return Number(row?.value ?? 0);
}

export async function countOpenConversations(
  opts: CountOptions = {},
): Promise<number> {
  const conditions: SQL[] = [
    isNull(conversations.deletedAt),
    eq(conversations.status, "open"),
  ];
  if (opts.userId) conditions.push(eq(conversations.ownerId, opts.userId));
  if (opts.before) conditions.push(lt(conversations.createdAt, opts.before));

  const [row] = await db
    .select({ value: count() })
    .from(conversations)
    .where(and(...conditions));
  return row?.value ?? 0;
}

export async function countUnreadConversations(
  userId: string,
  before?: Date,
): Promise<number> {
  const conditions: SQL[] = [
    isNull(conversations.deletedAt),
    eq(conversations.status, "open"),
    unreadExpression(userId),
  ];
  if (before) conditions.push(lt(conversations.createdAt, before));

  const [row] = await db
    .select({ value: count() })
    .from(conversations)
    .where(and(...conditions));
  return row?.value ?? 0;
}

export async function countOpenTasks(opts: CountOptions = {}): Promise<number> {
  const conditions: SQL[] = [
    isNull(tasks.deletedAt),
    ne(tasks.status, "done"),
  ];
  if (opts.userId) conditions.push(eq(tasks.assigneeId, opts.userId));
  if (opts.before) conditions.push(lt(tasks.createdAt, opts.before));

  const [row] = await db
    .select({ value: count() })
    .from(tasks)
    .where(and(...conditions));
  return row?.value ?? 0;
}

export async function countOverdueTasks(
  opts: CountOptions & { now?: Date } = {},
): Promise<number> {
  const now = opts.now ?? new Date();
  const conditions: SQL[] = [
    isNull(tasks.deletedAt),
    ne(tasks.status, "done"),
    isNotNull(tasks.dueAt),
    lt(tasks.dueAt, now),
  ];
  if (opts.userId) conditions.push(eq(tasks.assigneeId, opts.userId));
  if (opts.before) conditions.push(lt(tasks.createdAt, opts.before));

  const [row] = await db
    .select({ value: count() })
    .from(tasks)
    .where(and(...conditions));
  return row?.value ?? 0;
}

export async function countActiveCustomers(
  opts: CountOptions = {},
): Promise<number> {
  const conditions: SQL[] = [
    isNull(customers.deletedAt),
    eq(customers.status, "active"),
  ];
  if (opts.userId) conditions.push(eq(customers.createdById, opts.userId));
  if (opts.before) conditions.push(lt(customers.createdAt, opts.before));

  const [row] = await db
    .select({ value: count() })
    .from(customers)
    .where(and(...conditions));
  return row?.value ?? 0;
}

export async function countOnlineWaAccounts(
  threshold: Date,
  userId?: string,
): Promise<number> {
  const conditions: SQL[] = [
    isNull(waAccounts.deletedAt),
    gte(waAccounts.lastHeartbeatAt, threshold),
  ];
  if (userId) conditions.push(eq(waAccounts.userId, userId));

  const [row] = await db
    .select({ value: count() })
    .from(waAccounts)
    .where(and(...conditions));
  return row?.value ?? 0;
}

export interface WaAccountStatusRow {
  id: string;
  label: string;
  phone: string;
  lastHeartbeatAt: Date | null;
}

export async function listWaAccountStatus(
  userId?: string,
): Promise<WaAccountStatusRow[]> {
  const conditions: SQL[] = [isNull(waAccounts.deletedAt)];
  if (userId) conditions.push(eq(waAccounts.userId, userId));

  return db
    .select({
      id: waAccounts.id,
      label: waAccounts.label,
      phone: waAccounts.phone,
      lastHeartbeatAt: waAccounts.lastHeartbeatAt,
    })
    .from(waAccounts)
    .where(and(...conditions))
    .orderBy(asc(waAccounts.label));
}

export interface RecentLeadRow {
  id: string;
  leadNumber: string;
  name: string | null;
  company: string | null;
  stage: string;
  estimatedValue: number | null;
  createdAt: Date;
}

export async function listRecentLeads(opts: {
  userId?: string;
  limit: number;
}): Promise<RecentLeadRow[]> {
  const conditions: SQL[] = [isNull(leads.deletedAt)];
  if (opts.userId) conditions.push(leadOwnerFilter(opts.userId));

  return db
    .select({
      id: leads.id,
      leadNumber: leads.leadNumber,
      name: leads.name,
      company: leads.company,
      stage: leads.stage,
      estimatedValue: leads.estimatedValue,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .where(and(...conditions))
    .orderBy(desc(leads.createdAt))
    .limit(opts.limit);
}

export interface RecentConversationRow {
  id: string;
  title: string | null;
  status: string;
  unread: boolean;
  lastMessagePreview: string | null;
  lastMessageAt: Date | null;
}

export async function listRecentConversations(opts: {
  userId?: string;
  readerId: string;
  limit: number;
}): Promise<RecentConversationRow[]> {
  const conditions: SQL[] = [isNull(conversations.deletedAt)];
  if (opts.userId) conditions.push(eq(conversations.ownerId, opts.userId));

  return db
    .select({
      id: conversations.id,
      title: conversations.title,
      status: conversations.status,
      unread: unreadExpression(opts.readerId),
      lastMessagePreview: conversations.lastMessagePreview,
      lastMessageAt: conversations.lastMessageAt,
    })
    .from(conversations)
    .where(and(...conditions))
    .orderBy(desc(conversations.lastMessageAt))
    .limit(opts.limit);
}

export interface UpcomingTaskRow {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueAt: Date | null;
  assigneeName: string | null;
}

export async function listUpcomingTasks(opts: {
  userId?: string;
  limit: number;
}): Promise<UpcomingTaskRow[]> {
  const conditions: SQL[] = [
    isNull(tasks.deletedAt),
    ne(tasks.status, "done"),
    isNotNull(tasks.dueAt),
  ];
  if (opts.userId) conditions.push(eq(tasks.assigneeId, opts.userId));

  return db
    .select({
      id: tasks.id,
      title: tasks.title,
      priority: tasks.priority,
      status: tasks.status,
      dueAt: tasks.dueAt,
      assigneeName: user.name,
    })
    .from(tasks)
    .leftJoin(user, eq(user.id, tasks.assigneeId))
    .where(and(...conditions))
    .orderBy(asc(tasks.dueAt))
    .limit(opts.limit);
}

export interface StageCountRow {
  stage: string;
  count: number;
}

export async function listLeadFunnel(userId?: string): Promise<StageCountRow[]> {
  const conditions: SQL[] = [isNull(leads.deletedAt)];
  if (userId) conditions.push(leadOwnerFilter(userId));

  return db
    .select({ stage: leads.stage, count: count() })
    .from(leads)
    .where(and(...conditions))
    .groupBy(leads.stage)
    .orderBy(desc(count()));
}

export interface TrendRow {
  bucket: Date;
  count: number;
}

function bucketUnit(bucket: DashboardBucket): SQL {
  return sql.raw(`'${bucket}'`);
}

export async function listLeadsTrend(
  from: Date,
  to: Date,
  bucket: DashboardBucket,
  userId?: string,
): Promise<TrendRow[]> {
  const unit = bucketUnit(bucket);
  const truncated = sql<string>`date_trunc(${unit}, ${leads.createdAt})::timestamptz`;
  const conditions: SQL[] = [
    isNull(leads.deletedAt),
    gte(leads.createdAt, from),
    lte(leads.createdAt, to),
  ];
  if (userId) conditions.push(leadOwnerFilter(userId));

  const rows = await db
    .select({ bucket: truncated, count: count() })
    .from(leads)
    .where(and(...conditions))
    .groupBy(truncated)
    .orderBy(truncated);
  return rows.map((row) => ({ bucket: new Date(row.bucket), count: row.count }));
}

export async function listMessagesTrend(
  from: Date,
  to: Date,
  bucket: DashboardBucket,
  userId?: string,
): Promise<TrendRow[]> {
  const unit = bucketUnit(bucket);
  const truncated = sql<string>`date_trunc(${unit}, ${messages.receivedAt})::timestamptz`;
  const conditions: SQL[] = [
    isNull(messages.deletedAt),
    gte(messages.receivedAt, from),
    lte(messages.receivedAt, to),
  ];
  if (userId) conditions.push(eq(messages.ownerId, userId));

  const rows = await db
    .select({ bucket: truncated, count: count() })
    .from(messages)
    .where(and(...conditions))
    .groupBy(truncated)
    .orderBy(truncated);
  return rows.map((row) => ({ bucket: new Date(row.bucket), count: row.count }));
}

export async function listConversationVolume(
  from: Date,
  to: Date,
  bucket: DashboardBucket,
  userId?: string,
): Promise<TrendRow[]> {
  const unit = bucketUnit(bucket);
  const truncated = sql<string>`date_trunc(${unit}, ${conversations.createdAt})::timestamptz`;
  const conditions: SQL[] = [
    isNull(conversations.deletedAt),
    gte(conversations.createdAt, from),
    lte(conversations.createdAt, to),
  ];
  if (userId) conditions.push(eq(conversations.ownerId, userId));

  const rows = await db
    .select({ bucket: truncated, count: count() })
    .from(conversations)
    .where(and(...conditions))
    .groupBy(truncated)
    .orderBy(truncated);
  return rows.map((row) => ({ bucket: new Date(row.bucket), count: row.count }));
}
