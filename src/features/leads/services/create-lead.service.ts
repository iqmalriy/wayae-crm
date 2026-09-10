import { AppError } from "@/lib/errors";
import { LeadAlreadyExistsError } from "../api-error/errors";
import {
  createLead,
  findLeadById,
  findLeadByPhone,
} from "../repositories/lead.repository";
import type { CreateLeadInput } from "../schemas/create-lead.schema";
import type { CreateLeadOutput } from "../types/response-types";
import { toLeadView } from "./lead-view";
import type { LeadActor } from "../utils/censor";

function normalizePhone(phone: string): string {
  return phone.replace(/[\s-]/g, "");
}

export async function createLeadForUser(
  userId: string,
  actor: LeadActor,
  input: CreateLeadInput,
): Promise<CreateLeadOutput> {
  const phone = input.phone ? normalizePhone(input.phone) : undefined;

  if (phone) {
    const existing = await findLeadByPhone(phone);
    // Only a lost lead may be re-engaged as a new lead. Won/open leads with the
    // same phone are treated as duplicates (won = already a customer).
    if (existing && existing.stage !== "lost") throw new LeadAlreadyExistsError();
  }

  // Staff may only assign themselves; admins may pick anyone.
  if (actor.role !== "admin" && input.assigneeId && input.assigneeId !== actor.userId) {
    throw new AppError("FORBIDDEN", {
      message: "Staff can only assign leads to themselves.",
    });
  }
  const assigneeId =
    actor.role === "admin" ? (input.assigneeId ?? null) : actor.userId;

  const row = await createLead({
    ownerId: userId,
    source: input.source,
    stage: "new",
    assigneeId,
    estimatedValue: input.estimatedValue ?? null,
    notes: input.notes ?? null,
    contactId: input.contactId ?? null,
    customerId: input.customerId ?? null,
    customerOrganizationId: input.customerOrganizationId ?? null,
    // Clear-on-link: the linked record owns these fields, so don't duplicate.
    name: input.customerId || input.contactId ? null : input.name ?? null,
    company: input.customerOrganizationId ? null : input.company ?? null,
    phoneNumber: input.contactId ? null : phone ?? null,
    email: input.customerId ? null : input.email ?? null,
  });

  const detail = await findLeadById(row.id);
  if (!detail) {
    throw new AppError("INTERNAL", { message: "Failed to load created lead." });
  }

  return { lead: toLeadView(detail, actor) };
}