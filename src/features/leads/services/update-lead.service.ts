import { AppError } from "@/lib/errors";
import {
  LeadAlreadyExistsError,
  LeadNotFoundError,
} from "../api-error/errors";
import {
  findLeadById,
  findLeadByPhone,
  updateLead,
  type UpdateLeadValues,
} from "../repositories/lead.repository";
import type { UpdateLeadInput } from "../schemas/update-lead.schema";
import type { UpdateLeadResult } from "../types/response-types";
import { toLeadDetailView, type LeadDetailViewSource } from "./lead-view";
import type { LeadActor } from "../utils/censor";

function normalizePhone(phone: string): string {
  return phone.replace(/[\s-]/g, "");
}

export async function updateLeadForUser(
  id: string,
  actor: LeadActor,
  input: UpdateLeadInput,
): Promise<UpdateLeadResult> {
  const existing = await findLeadById(id);
  if (!existing) {
    throw new LeadNotFoundError();
  }

  const isOwner = existing.ownerId === actor.userId;
  const isAdmin = actor.role === "admin";
  if (!isAdmin && !isOwner) {
    throw new AppError("FORBIDDEN", {
      message: "You are not allowed to update this lead.",
    });
  }

  let phone: string | null | undefined;
  if (input.phone !== undefined) {
    phone = input.phone === null ? null : normalizePhone(input.phone);
    if (phone) {
      const duplicate = await findLeadByPhone(phone);
      // Only a lost lead may be re-engaged; open/won leads with the same phone
      // are treated as duplicates.
      if (duplicate && duplicate.id !== id && duplicate.stage !== "lost") {
        throw new LeadAlreadyExistsError();
      }
    }
  }

  // Staff (even as owner) may only assign themselves; admins may pick anyone.
  if (
    input.assigneeId !== undefined &&
    !isAdmin &&
    input.assigneeId !== actor.userId
  ) {
    throw new AppError("FORBIDDEN", {
      message: "Staff can only assign leads to themselves.",
    });
  }

  const values: UpdateLeadValues = {};
  if (input.name !== undefined) values.name = input.name;
  if (input.company !== undefined) values.company = input.company;
  if (phone !== undefined) values.phoneNumber = phone;
  if (input.email !== undefined) values.email = input.email;
  if (input.source !== undefined) values.source = input.source;
  if (input.assigneeId !== undefined)
    values.assigneeId = isAdmin ? input.assigneeId : actor.userId;
  if (input.estimatedValue !== undefined)
    values.estimatedValue = input.estimatedValue;
  if (input.notes !== undefined) values.notes = input.notes;

  await updateLead(id, values);

  const detail = await findLeadById(id);
  if (!detail) {
    throw new AppError("INTERNAL", { message: "Failed to load updated lead." });
  }

  return {
    lead: toLeadDetailView(detail as LeadDetailViewSource, actor),
    message: "Lead updated.",
    status: 200,
  };
}