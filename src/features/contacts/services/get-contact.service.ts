import { AppError } from "@/lib/errors";
import {
  findContactDetailById,
  type ContactDetailRow,
} from "../repositories/contact.repository";
import type {
  ContactDetailView,
  GetContactOutput,
} from "../types/response-types";
import { phoneForViewer } from "../utils/phone";

export interface ContactActor {
  userId: string;
  role: "admin" | "staff";
}

function toView(
  row: ContactDetailRow,
  actor: ContactActor,
): ContactDetailView {
  const isOwnerOrAdmin = actor.role === "admin" || row.addedBy === actor.userId;
  return {
    id: row.id,
    phone: phoneForViewer(
      row.phoneNumber,
      actor.role,
      row.addedBy === actor.userId,
    ),
    displayName: row.displayName,
    description: row.description,
    isBusiness: row.isBusiness,
    source: row.source,
    waIdType: row.waIdType,
    addedById: row.addedBy,
    addedByName: row.addedByName,
    allowedUpdate: isOwnerOrAdmin,
    allowedRevealPhone: isOwnerOrAdmin,
    isAdmin: actor.role === "admin",
    firstSeenAt: row.firstSeenAt?.toISOString() ?? null,
    lastSeenAt: row.lastSeenAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    customer: row.customerId
      ? {
          id: row.customerId,
          fullName: row.customerFullName ?? "",
          email: row.customerEmail ?? "",
          jobTitle: row.customerJobTitle,
          status: row.customerStatus ?? "inactive",
          organizationId: row.customerOrganizationId,
          organizationName: row.customerOrganizationName,
          isDecisionMaker: row.customerIsDecisionMaker ?? false,
        }
      : null,
  };
}

export async function getContactForUser(
  id: string,
  actor: ContactActor,
): Promise<GetContactOutput> {
  const row = await findContactDetailById(id);
  if (!row) {
    throw new AppError("NOT_FOUND", { message: "Contact not found." });
  }
  return { contact: toView(row, actor) };
}