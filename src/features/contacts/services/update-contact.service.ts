import { AppError } from "@/lib/errors";
import {
  findContactById,
  findCustomerById,
  updateContact,
  type ContactRow,
} from "../repositories/contact.repository";
import type { UpdateContactInput } from "../schemas/update-contact.schema";
import type { ContactView, UpdateContactResult } from "../types/response-types";

export interface ContactActor {
  userId: string;
  role: "admin" | "staff";
}

function toView(
  row: ContactRow,
  customer: { id: string; fullName: string } | null,
  canDetach: boolean,
): ContactView {
  return {
    id: row.id,
    phone: row.phoneNumber,
    displayName: row.displayName,
    source: row.source,
    costumers: customer,
    canDetach,
    firstSeenAt: row.firstSeenAt?.toISOString() ?? null,
    lastSeenAt: row.lastSeenAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function updateContactForUser(
  id: string,
  actor: ContactActor,
  input: UpdateContactInput,
): Promise<UpdateContactResult> {
  const existing = await findContactById(id);
  if (!existing) {
    throw new AppError("NOT_FOUND", { message: "Contact not found." });
  }

  if (actor.role !== "admin" && existing.addedBy !== actor.userId) {
    throw new AppError("FORBIDDEN", {
      message: "You are not allowed to update this contact.",
    });
  }

  const values: {
    displayName?: string;
    description?: string | null;
    isBusiness?: boolean;
  } = {};
  if (input.displayName !== undefined) values.displayName = input.displayName;
  if (input.description !== undefined) values.description = input.description;
  if (input.isBusiness !== undefined) values.isBusiness = input.isBusiness;

  const row = await updateContact(id, values);
  const customer = row.customerId ? await findCustomerById(row.customerId) : null;

  return {
    contact: toView(row, customer, actor.role === "admin" || existing.addedBy === actor.userId),
    message: "Contact updated.",
    status: 200,
  };
}