import type { LeadStage, TaskStatus } from "@/lib/db/schema";
import type { TaskDetailRow } from "../repositories/task.repository";
import type { TaskDetailView } from "../types/response-types";

export function toTaskDetailView(row: TaskDetailRow): TaskDetailView {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as TaskStatus,
    priority: row.priority,
    dueAt: row.dueAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    lead: row.leadId
      ? {
          id: row.leadId,
          number: row.leadNumber,
          name: row.leadName,
          stage: row.leadStage as LeadStage | null,
        }
      : null,
    assignee: row.assigneeId
      ? {
          id: row.assigneeId,
          name: row.assigneeName,
          email: row.assigneeEmail,
        }
      : null,
    createdBy: row.createdById
      ? {
          id: row.createdById,
          name: row.createdByName,
          email: row.createdByEmail,
        }
      : null,
  };
}
