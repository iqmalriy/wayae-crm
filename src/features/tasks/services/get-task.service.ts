import { AppError } from "@/lib/errors";
import { findTaskDetailById } from "../repositories/task.repository";
import type { GetTaskOutput } from "../types/response-types";
import { toTaskDetailView } from "./task-detail-view";
import type { TaskActor } from "../types/actor";

export async function getTaskForUser(
  id: string,
  actor: TaskActor,
): Promise<GetTaskOutput> {
  const row = await findTaskDetailById(id);
  if (!row) {
    throw new AppError("NOT_FOUND", { message: "Task not found." });
  }

  // Access mirrors list-tasks: staff may only view their own tasks.
  const isAdmin = actor.role === "admin";
  if (!isAdmin && row.assigneeId !== actor.userId) {
    throw new AppError("FORBIDDEN", {
      message: "You are not allowed to view this task.",
    });
  }

  return { task: toTaskDetailView(row) };
}
