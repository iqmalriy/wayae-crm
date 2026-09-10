import { AppError } from "@/lib/errors";
import {
  findTaskById,
  updateTaskWithActivity,
  type UpdateTaskValues,
} from "../repositories/task.repository";
import type { UpdateTaskInput } from "../schemas/update-task.schema";
import type { UpdateTaskOutput } from "../types/response-types";
import { toTaskView } from "./task-view";
import type { UpdateTaskActor } from "./update-task.actor";

export async function updateTaskForUser(
  id: string,
  actor: UpdateTaskActor,
  input: UpdateTaskInput,
): Promise<UpdateTaskOutput> {
  const existing = await findTaskById(id);
  if (!existing) {
    throw new AppError("NOT_FOUND", { message: "Task not found." });
  }

  const isAdmin = actor.role === "admin";
  const isOwner = existing.assigneeId === actor.userId;
  if (!isAdmin && !isOwner) {
    throw new AppError("FORBIDDEN", {
      message: "Only the owner or an admin can update this task.",
    });
  }

  // Staff (even as owner) may only assign tasks to themselves; admins may pick anyone.
  if (
    input.assigneeId !== undefined &&
    !isAdmin &&
    input.assigneeId !== actor.userId
  ) {
    throw new AppError("FORBIDDEN", {
      message: "Staff can only assign tasks to themselves.",
    });
  }

  const values: UpdateTaskValues = {};
  if (input.title !== undefined) values.title = input.title;
  if (input.description !== undefined) values.description = input.description;
  if (input.priority !== undefined) values.priority = input.priority;
  if (input.assigneeId !== undefined)
    values.assigneeId = isAdmin ? input.assigneeId : actor.userId;
  if (input.dueAt !== undefined)
    values.dueAt = input.dueAt === null ? null : new Date(input.dueAt);

  await updateTaskWithActivity(
    id,
    values,
    {
      leadId: existing.leadId as string,
      body: `${actor.name} updated task "${existing.title}".`,
      performedById: actor.userId,
    },
  );

  const updated = await findTaskById(id);
  if (!updated) {
    throw new AppError("INTERNAL", { message: "Failed to load updated task." });
  }

  return { task: toTaskView(updated) };
}
