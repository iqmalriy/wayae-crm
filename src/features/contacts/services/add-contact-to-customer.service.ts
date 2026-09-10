import { AppError } from "@/lib/errors";
import { ContactNotFoundError } from "../api-error/errors";
import {
  assignContactToCustomer,
  findContactById,
  findCustomerById,
} from "../repositories/contact.repository";
import type { AddContactToCustomerInput } from "../schemas/add-contact-to-customer.schema";
import type { ContactView } from "../types/response-types";

function toView(
  row: Awaited<ReturnType<typeof assignContactToCustomer>>,
  customer: { id: string; fullName: string } | null,
): ContactView {
  return {
    id: row.id,
    phone: row.phoneNumber,
    displayName: row.displayName,
    source: row.source,
    costumers: customer,
    canDetach: true,
    firstSeenAt: row.firstSeenAt?.toISOString() ?? null,
    lastSeenAt: row.lastSeenAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function addContactToCustomerForUser(
  customerId: string,
  input: AddContactToCustomerInput,
): Promise<{ contact: ContactView }> {
  const customer = await findCustomerById(customerId);
  if (!customer) throw new AppError("NOT_FOUND", { message: "Customer not found." });

  const existing = await findContactById(input.contactId);
  if (!existing) throw new ContactNotFoundError();
  if (existing.customerId) {
    throw new AppError("CONFLICT", {
      message: "This contact is already assigned to a customer.",
    });
  }

  const row = await assignContactToCustomer(customerId, input.contactId);

  return { contact: toView(row, customer) };
}