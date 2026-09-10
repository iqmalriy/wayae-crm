import { AppError } from "@/lib/errors";
import { LeadNotFoundError } from "../api-error/errors";
import { findLeadById, softDeleteLead } from "../repositories/lead.repository";
import type { LeadActor } from "../utils/censor";

export interface DeleteLeadResult {
  deleted: boolean;
  message: string;
}

export async function deleteLeadForUser(
  id: string,
  actor: LeadActor,
): Promise<DeleteLeadResult> {
  const existing = await findLeadById(id);
  if (!existing) {
    throw new LeadNotFoundError();
  }

  if (actor.role !== "admin") {
    throw new AppError("FORBIDDEN", {
      message: "Only admins can delete leads.",
    });
  }

  await softDeleteLead(id);

  return { deleted: true, message: "Lead deleted." };
}