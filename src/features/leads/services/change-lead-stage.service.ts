import { AppError } from "@/lib/errors";
import { LeadNotFoundError } from "../api-error/errors";
import {
  changeLeadStage,
  findLeadById,
} from "../repositories/lead.repository";
import type { ChangeLeadStageInput } from "../schemas/change-lead-stage.schema";
import type { ChangeLeadStageResult } from "../types/response-types";
import { toLeadDetailView, type LeadDetailViewSource } from "./lead-view";
import type { LeadActor } from "../utils/censor";

export async function changeLeadStageForUser(
  id: string,
  actor: LeadActor,
  input: ChangeLeadStageInput,
): Promise<ChangeLeadStageResult> {
  const existing = await findLeadById(id);
  if (!existing) {
    throw new LeadNotFoundError();
  }

  const isOwner = existing.ownerId === actor.userId;
  const isAssignee = existing.assigneeId === actor.userId;
  const isAdmin = actor.role === "admin";
  if (!isAdmin && !isOwner && !isAssignee) {
    throw new AppError("FORBIDDEN", {
      message: "You are not allowed to change this lead's stage.",
    });
  }

  if (existing.stage === input.stage) {
    throw new AppError("VALIDATION", {
      message: "Lead is already in this stage.",
      fields: { stage: "Lead is already in this stage." },
    });
  }

  const now = new Date();
  const isWon = input.stage === "won";
  const isLost = input.stage === "lost";

  await changeLeadStage(
    id,
    {
      stage: input.stage,
      stageChangedAt: now,
      wonAt: isWon ? now : null,
      lostAt: isLost ? now : null,
    },
    {
      leadId: id,
      body: input.note ?? null,
      performedById: actor.userId,
      fromStage: existing.stage,
      toStage: input.stage,
    },
  );

  const detail = await findLeadById(id);
  if (!detail) {
    throw new AppError("INTERNAL", { message: "Failed to load updated lead." });
  }

  return {
    lead: toLeadDetailView(detail as LeadDetailViewSource, actor),
    message: `Lead moved to ${input.stage}.`,
    status: 200,
  };
}