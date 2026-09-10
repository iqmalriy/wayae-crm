import type { TaskRowWithNames } from "../repositories/task.repository";
import type { TaskView } from "../types/response-types";
import type { TaskStatus } from "@/lib/db/schema";

export function toTaskView(row: TaskRowWithNames): TaskView {
  return {
    id: row.id,
    leadId: row.leadId as string,
    leadNumber: row.leadNumber,
    leadName: row.leadName,
    title: row.title,
    description: row.description,
    status: row.status as TaskStatus,
    priority: row.priority,
    assigneeId: row.assigneeId,
    assigneeName: row.assigneeName,
    createdById: row.createdById,
    createdByName: row.createdByName,
    dueAt: row.dueAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}