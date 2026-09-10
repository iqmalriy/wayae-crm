import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/lib/db";
import { leadActivities, leads, tasks, user } from "@/lib/db/schema";
import type { TaskPriority, TaskStatus } from "@/lib/db/schema";

export type TaskRow = typeof tasks.$inferSelect;

export interface CreateTaskValues {
  leadId: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  assigneeId?: string | null;
  createdById: string;
  dueAt?: Date | null;
}

export interface CreateTaskActivityValues {
  leadId: string;
  body: string;
  performedById: string;
}

export interface ChangeTaskStatusValues {
  status: TaskStatus;
  completedAt: Date | null;
}

export interface ChangeTaskStatusActivityValues {
  leadId: string;
  body: string;
  performedById: string;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
}

export interface UpdateTaskValues {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueAt?: Date | null;
}

export interface UpdateTaskActivityValues {
  leadId: string;
  body: string;
  performedById: string;
}

export interface TaskRowWithNames extends TaskRow {
  leadNumber: string | null;
  leadName: string | null;
  assigneeName: string | null;
  createdByName: string | null;
}

const assigneeUser = alias(user, "assignee");
const creatorUser = alias(user, "creator");

function selectTaskWithNames() {
  return db
    .select({
      id: tasks.id,
      leadId: tasks.leadId,
      leadNumber: leads.leadNumber,
      leadName: leads.name,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      assigneeId: tasks.assigneeId,
      createdById: tasks.createdById,
      dueAt: tasks.dueAt,
      completedAt: tasks.completedAt,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      deletedAt: tasks.deletedAt,
      assigneeName: assigneeUser.name,
      createdByName: creatorUser.name,
    })
    .from(tasks)
    .leftJoin(assigneeUser, eq(assigneeUser.id, tasks.assigneeId))
    .leftJoin(creatorUser, eq(creatorUser.id, tasks.createdById))
    .leftJoin(leads, eq(leads.id, tasks.leadId));
}

const taskOrder = [
  sql`case ${tasks.priority} when 'high' then 3 when 'medium' then 2 else 1 end desc`,
  sql`${tasks.dueAt} asc nulls last`,
  desc(tasks.createdAt),
] as const;

export interface ListTasksValues {
  leadId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  limit: number;
  offset: number;
}

function taskWhere(values: {
  leadId?: string;
  assigneeId?: string;
  status?: TaskStatus;
}) {
  return and(
    isNull(tasks.deletedAt),
    values.leadId ? eq(tasks.leadId, values.leadId) : undefined,
    values.assigneeId ? eq(tasks.assigneeId, values.assigneeId) : undefined,
    values.status ? eq(tasks.status, values.status) : undefined,
  );
}

export async function listTasks(
  values: ListTasksValues,
): Promise<TaskRowWithNames[]> {
  return selectTaskWithNames()
    .where(taskWhere(values))
    .orderBy(...taskOrder)
    .limit(values.limit)
    .offset(values.offset);
}

export async function countTasks(values: {
  leadId?: string;
  assigneeId?: string;
  status?: TaskStatus;
}): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tasks)
    .where(taskWhere(values));
  return rows[0]?.count ?? 0;
}

export async function findUserNameById(
  userId: string,
): Promise<string | null> {
  const rows = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  return rows[0]?.name ?? null;
}

export async function createTaskWithActivity(
  values: CreateTaskValues,
  activity: CreateTaskActivityValues,
): Promise<TaskRowWithNames> {
  const insertedId = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(tasks)
      .values(values)
      .returning({ id: tasks.id });
    await tx.insert(leadActivities).values(activity);
    return row.id;
  });

  const rows = await selectTaskWithNames()
    .where(eq(tasks.id, insertedId))
    .limit(1);
  return rows[0];
}

export async function findTaskById(id: string): Promise<TaskRowWithNames | null> {
  const rows = await selectTaskWithNames()
    .where(and(isNull(tasks.deletedAt), eq(tasks.id, id)))
    .limit(1);
  return rows[0] ?? null;
}

export interface TaskDetailRow extends TaskRow {
  leadNumber: string | null;
  leadName: string | null;
  leadStage: string | null;
  assigneeName: string | null;
  assigneeEmail: string | null;
  createdByName: string | null;
  createdByEmail: string | null;
}

export async function findTaskDetailById(
  id: string,
): Promise<TaskDetailRow | null> {
  const rows = await db
    .select({
      id: tasks.id,
      leadId: tasks.leadId,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      assigneeId: tasks.assigneeId,
      createdById: tasks.createdById,
      dueAt: tasks.dueAt,
      completedAt: tasks.completedAt,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      deletedAt: tasks.deletedAt,
      leadNumber: leads.leadNumber,
      leadName: leads.name,
      leadStage: leads.stage,
      assigneeName: assigneeUser.name,
      assigneeEmail: assigneeUser.email,
      createdByName: creatorUser.name,
      createdByEmail: creatorUser.email,
    })
    .from(tasks)
    .leftJoin(assigneeUser, eq(assigneeUser.id, tasks.assigneeId))
    .leftJoin(creatorUser, eq(creatorUser.id, tasks.createdById))
    .leftJoin(leads, eq(leads.id, tasks.leadId))
    .where(and(isNull(tasks.deletedAt), eq(tasks.id, id)))
    .limit(1);
  return rows[0] ?? null;
}

export async function changeTaskStatus(
  id: string,
  values: ChangeTaskStatusValues,
  activity: ChangeTaskStatusActivityValues,
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(tasks)
      .set({
        status: values.status,
        completedAt: values.completedAt,
      })
      .where(and(isNull(tasks.deletedAt), eq(tasks.id, id)));
    await tx.insert(leadActivities).values({
      leadId: activity.leadId,
      body: activity.body,
      performedById: activity.performedById,
      fromStage: activity.fromStatus,
      toStage: activity.toStatus,
    });
  });
}

export async function updateTaskWithActivity(
  id: string,
  values: UpdateTaskValues,
  activity: UpdateTaskActivityValues,
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(tasks)
      .set(values)
      .where(and(isNull(tasks.deletedAt), eq(tasks.id, id)));
    await tx.insert(leadActivities).values({
      leadId: activity.leadId,
      body: activity.body,
      performedById: activity.performedById,
    });
  });
}