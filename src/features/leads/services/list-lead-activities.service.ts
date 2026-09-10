import { LeadNotFoundError } from "../api-error/errors";
import {
  findLeadById,
  listLeadActivities,
  type LeadActivityRow,
} from "../repositories/lead.repository";
import type {
  LeadActivityView,
  ListLeadActivitiesOutput,
} from "../types/response-types";
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

export async function listLeadActivitiesForUser(
  id: string,
): Promise<ListLeadActivitiesOutput> {
  const lead = await findLeadById(id);
  if (!lead) {
    throw new LeadNotFoundError();
  }

  const rows = await listLeadActivities(id);
  return { activities: rows.map(toView) };
}