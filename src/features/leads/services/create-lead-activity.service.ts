import { AppError } from "@/lib/errors";
import { LeadNotFoundError } from "../api-error/errors";
import {
  createLeadActivity,
  findLeadById,
  type LeadActivityRow,
} from "../repositories/lead.repository";
import type { CreateLeadActivityInput } from "../schemas/create-lead-activity.schema";
import type {
  CreateLeadActivityOutput,
  LeadActivityView,
} from "../types/response-types";
import type { LeadActor } from "../utils/censor";
import type { LeadStage } from "@/lib/db/schema";

function toView(row: LeadActivityRow): LeadActivityView {
  return {
    id: row.id,
    body: row.body,
    performedById: row.performedById,
    performedByName: row.performedByName,
    fromStage: row.fromStage as LeadStage | null,
    toStage: row.toStage as LeadStage | null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createLeadActivityForUser(
  id: string,
  actor: LeadActor,
  input: CreateLeadActivityInput,
): Promise<CreateLeadActivityOutput> {
  const existing = await findLeadById(id);
  if (!existing) {
    throw new LeadNotFoundError();
  }

  const isOwner = existing.ownerId === actor.userId;
  const isAssignee = existing.assigneeId === actor.userId;
  const isAdmin = actor.role === "admin";
  if (!isAdmin && !isOwner && !isAssignee) {
    throw new AppError("FORBIDDEN", {
      message: "You are not allowed to add activities to this lead.",
    });
  }

  const row = await createLeadActivity({
    leadId: id,
    body: input.body,
    performedById: actor.userId,
  });

  return { activity: toView(row) };
}