import { ContactAlreadyExistsError, CustomerNotFoundError } from "../api-error/errors";
import {
  createContact,
  findContactByPhoneNumber,
  findCustomerById,
  findInteractionByContactAndUser,
  registerContactInteraction,
  type ContactRow,
} from "../repositories/contact.repository";
import type { CreateContactInput } from "../schemas/create-contact.schema";
import type { ContactView, CreateContactResult } from "../types/response-types";

export interface ContactActor {
  userId: string;
  role: "admin" | "staff";
}

function toView(
  row: ContactRow,
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

export async function createContactForUser(
  input: CreateContactInput,
  actor: ContactActor,
): Promise<CreateContactResult> {
  const existing = await findContactByPhoneNumber(input.phoneNumber);
  if (existing) {
    const alreadyRegistered = await findInteractionByContactAndUser(
      existing.id,
      actor.userId,
    );
    if (alreadyRegistered) throw new ContactAlreadyExistsError();

    await registerContactInteraction({
      contactId: existing.id,
      userId: actor.userId,
      savedName: input.displayName,
    });

    const customer = input.customerId
      ? await findCustomerById(input.customerId)
      : null;
    return {
      contact: toView(existing, customer),
      message: "This contact already registered, now connected to your account.",
      status: 200,
    };
  }

  let customer: { id: string; fullName: string } | null = null;
  if (input.customerId) {
    customer = await findCustomerById(input.customerId);
    if (!customer) throw new CustomerNotFoundError();
  }

  const row = await createContact({
    phoneNumber: input.phoneNumber,
    displayName: input.displayName,
    description: input.description,
    isBusiness: input.isBusiness,
    customerId: input.customerId,
    addedBy: actor.userId,
  });

  return {
    contact: toView(row, customer),
    message: "Contact created.",
    status: 201,
  };
}