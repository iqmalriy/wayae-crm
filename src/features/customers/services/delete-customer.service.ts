import { AppError } from "@/lib/errors";
import { findContactIdsByCustomerId, unassignContactsFromCustomer } from "@/features/contacts/repositories/contact.repository";
import {
  findCustomerOwnerById,
  softDeleteCustomer,
} from "../repositories/customer.repository";

export interface DeleteCustomerActor {
  userId: string;
  role: "admin" | "staff";
}

export interface DeleteCustomerResult {
  deleted: boolean;
  message: string;
}

export async function deleteCustomerForUser(
  id: string,
  actor: DeleteCustomerActor,
): Promise<DeleteCustomerResult> {
  const existing = await findCustomerOwnerById(id);
  if (!existing) {
    throw new AppError("NOT_FOUND", { message: "Customer not found." });
  }

  const isAccountOwner = existing.accountOwnerId === actor.userId;
  const isAdmin = actor.role === "admin";
  if (!isAccountOwner && !isAdmin) {
    throw new AppError("FORBIDDEN", {
      message: "You are not allowed to delete this customer.",
    });
  }

  const contactIds = await findContactIdsByCustomerId(id);
  await unassignContactsFromCustomer(contactIds);
  await softDeleteCustomer(id);

  return { deleted: true, message: "Customer deleted." };
}