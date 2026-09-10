import { AppError } from "@/lib/errors";
import { findLeadById } from "@/features/leads/repositories/lead.repository";
import {
  createTaskWithActivity,
  findUserNameById,
} from "../repositories/task.repository";
import type { CreateTaskInput } from "../schemas/create-task.schema";
import type { CreateTaskOutput } from "../types/response-types";
import type { CreateTaskActor } from "./create-task.actor";
import { toTaskView } from "./task-view";

export async function createTaskForUser(
  actor: CreateTaskActor,
  input: CreateTaskInput,
): Promise<CreateTaskOutput> {
  const lead = await findLeadById(input.leadId);
  if (!lead) {
    throw new AppError("NOT_FOUND", { message: "Lead not found." });
  }

  const isOwner = lead.ownerId === actor.userId;
  const isAssignee = lead.assigneeId === actor.userId;
  const isAdmin = actor.role === "admin";
  if (!isAdmin && !isOwner && !isAssignee) {
    throw new AppError("FORBIDDEN", {
      message: "You are not allowed to create tasks on this lead.",
    });
  }

  let assigneeId: string | null;
  if (input.assigneeId !== undefined) {
    if (!isAdmin && input.assigneeId !== actor.userId) {
      throw new AppError("FORBIDDEN", {
        message: "Staff can only assign tasks to themselves.",
      });
    }
    assigneeId = isAdmin ? input.assigneeId || null : actor.userId;
  } else {
    assigneeId = isAdmin ? null : actor.userId;
  }

  let activityBody = `${actor.name} created a task: ${input.title}`;
  if (isAdmin && assigneeId && assigneeId !== actor.userId) {
    const assigneeName = await findUserNameById(assigneeId);
    activityBody += ` and assigned to ${assigneeName ?? assigneeId}`;
  }

  const row = await createTaskWithActivity(
    {
      leadId: input.leadId,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority,
      assigneeId,
      createdById: actor.userId,
      dueAt: input.dueAt ? new Date(input.dueAt) : null,
    },
    {
      leadId: input.leadId,
      body: activityBody,
      performedById: actor.userId,
    },
  );

  return { task: toTaskView(row) };
}