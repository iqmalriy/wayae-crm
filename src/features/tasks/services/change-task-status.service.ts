import { AppError } from "@/lib/errors";
import {
  changeTaskStatus,
  findTaskById,
} from "../repositories/task.repository";
import type { ChangeTaskStatusInput } from "../schemas/change-task-status.schema";
import type { ChangeTaskStatusOutput } from "../types/response-types";
import { toTaskView } from "./task-view";
import type { ChangeTaskStatusActor } from "./change-task-status.actor";

export async function changeTaskStatusForUser(
  id: string,
  actor: ChangeTaskStatusActor,
  input: ChangeTaskStatusInput,
): Promise<ChangeTaskStatusOutput> {
  const existing = await findTaskById(id);
  if (!existing) {
    throw new AppError("NOT_FOUND", { message: "Task not found." });
  }

  const isAdmin = actor.role === "admin";
  const isAssignee = existing.assigneeId === actor.userId;
  if (!isAdmin && !isAssignee) {
    throw new AppError("FORBIDDEN", {
      message: "Only the assignee or an admin can change this task's status.",
    });
  }

  if (existing.status === input.status) {
    throw new AppError("VALIDATION", {
      message: "Task is already in this status.",
      fields: { status: "Task is already in this status." },
    });
  }

  const now = new Date();
  const isDone = input.status === "done";

  await changeTaskStatus(
    id,
    {
      status: input.status,
      completedAt: isDone ? now : null,
    },
    {
      leadId: existing.leadId as string,
      body: `${actor.name} moved task "${existing.title}" to ${input.status}.`,
      performedById: actor.userId,
      fromStatus: existing.status,
      toStatus: input.status,
    },
  );

  const updated = await findTaskById(id);
  if (!updated) {
    throw new AppError("INTERNAL", { message: "Failed to load updated task." });
  }

  return { task: toTaskView(updated) };
}
