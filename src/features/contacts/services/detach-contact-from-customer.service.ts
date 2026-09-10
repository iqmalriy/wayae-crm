import { AppError } from "@/lib/errors";
import { ContactNotFoundError } from "../api-error/errors";
import {
  findContactById,
  unassignContactsFromCustomer,
  type ContactRow,
} from "../repositories/contact.repository";
import type { ContactView } from "../types/response-types";

function toView(row: ContactRow): ContactView {
  return {
    id: row.id,
    phone: row.phoneNumber,
    displayName: row.displayName,
    source: row.source,
    costumers: null,
    canDetach: true,
    firstSeenAt: row.firstSeenAt?.toISOString() ?? null,
    lastSeenAt: row.lastSeenAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export interface DetachContactActor {
  userId: string;
  role: "admin" | "staff";
}

export async function detachContactFromCustomerForUser(
  contactId: string,
  actor: DetachContactActor,
): Promise<{ contact: ContactView }> {
  const existing = await findContactById(contactId);
  if (!existing) throw new ContactNotFoundError();

  if (actor.role !== "admin" && existing.addedBy !== actor.userId) {
    throw new AppError("FORBIDDEN", {
      message: "You are not allowed to detach this contact.",
    });
  }

  if (!existing.customerId) {
    throw new AppError("CONFLICT", {
      message: "This contact is not assigned to any customer.",
    });
  }

  await unassignContactsFromCustomer([contactId]);

  return { contact: toView({ ...existing, customerId: null }) };
}