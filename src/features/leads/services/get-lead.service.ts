import { LeadNotFoundError } from "../api-error/errors";
import { findLeadById } from "../repositories/lead.repository";
import type { GetLeadOutput } from "../types/response-types";
import { toLeadDetailView, type LeadDetailViewSource } from "./lead-view";
import type { LeadActor } from "../utils/censor";

export async function getLeadForUser(
  id: string,
  actor: LeadActor,
): Promise<GetLeadOutput> {
  const row = await findLeadById(id);
  if (!row) {
    throw new LeadNotFoundError();
  }
  return { lead: toLeadDetailView(row as LeadDetailViewSource, actor) };
}