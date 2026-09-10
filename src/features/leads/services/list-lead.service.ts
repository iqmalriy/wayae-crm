import { listLeads } from "../repositories/lead.repository";
import type { ListLeadsQuery } from "../schemas/list-lead.schema";
import type { ListLeadsOutput } from "../types/response-types";
import { toLeadView, type LeadViewSource } from "./lead-view";
import type { LeadActor } from "../utils/censor";

export async function listLeadsForUser(
  query: ListLeadsQuery,
  actor: LeadActor,
): Promise<ListLeadsOutput> {
  // `mine` is scoped server-side: staff may only see their own leads, admins
  // see all regardless of the flag.
  const isAdmin = actor.role === "admin";
  const mineUserId = isAdmin ? undefined : query.mine ? actor.userId : undefined;

  const { rows, total } = await listLeads({
    ...query,
    mineUserId,
  });

  const totalPages = total === 0 ? 0 : Math.ceil(total / query.perPage);
  return {
    leads: rows.map((row) => toLeadView(row as LeadViewSource, actor)),
    page: query.page,
    perPage: query.perPage,
    total,
    totalPages,
  };
}