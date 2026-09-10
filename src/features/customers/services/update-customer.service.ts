import { AppError } from "@/lib/errors";
import { findCustomerOrganizationById } from "@/features/customer-organizations/repositories/customer-organization.repository";
import {
  findCustomerByEmail,
  findCustomerOwnerById,
  updateCustomer,
  type CustomerRow,
  type UpdateCustomerValues,
} from "../repositories/customer.repository";
import type { UpdateCustomerInput } from "../schemas/update-customer.schema";
import type {
  CustomerView,
  UpdateCustomerResult,
} from "../types/response-types";

function toView(row: CustomerRow, canDetach: boolean): CustomerView {
  return {
    id: row.id,
    fullName: row.fullName,
    jobTitle: row.jobTitle,
    status: row.status,
    organizationId: row.organizationId,
    organizationName: row.organizationName,
    isDecisionMaker: row.isDecisionMaker,
    isPrimaryContact: row.isPrimaryContact,
    canDetach,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export interface UpdateCustomerActor {
  userId: string;
  role: "admin" | "staff";
}

export async function updateCustomerForUser(
  id: string,
  actor: UpdateCustomerActor,
  input: UpdateCustomerInput,
): Promise<UpdateCustomerResult> {
  const existing = await findCustomerOwnerById(id);
  if (!existing) {
    throw new AppError("NOT_FOUND", { message: "Customer not found." });
  }

  const isOwner = existing.createdById === actor.userId;
  const isAccountOwner = existing.accountOwnerId === actor.userId;
  const isAdmin = actor.role === "admin";
  if (!isOwner && !isAccountOwner && !isAdmin) {
    throw new AppError("FORBIDDEN", {
      message: "You are not allowed to update this customer.",
    });
  }

  if (input.email) {
    const duplicate = await findCustomerByEmail(input.email);
    if (duplicate && duplicate.id !== id) {
      throw new AppError("CONFLICT", {
        message: "A customer with this email already exists.",
        fields: { email: "This email is already in use." },
      });
    }
  }

  if (input.organizationId !== undefined && input.organizationId) {
    const organization = await findCustomerOrganizationById(input.organizationId);
    if (!organization) {
      throw new AppError("NOT_FOUND", {
        message: "Organization not found.",
        fields: { organizationId: "Organization not found." },
      });
    }
  }

  const values: UpdateCustomerValues = {};
  if (input.fullName !== undefined) values.fullName = input.fullName;
  if (input.email !== undefined) values.email = input.email;
  if (input.organizationId !== undefined)
    values.organizationId = input.organizationId || null;
  if (input.jobTitle !== undefined) values.jobTitle = input.jobTitle;
  if (input.notes !== undefined) values.notes = input.notes;
  if (input.isDecisionMaker !== undefined)
    values.isDecisionMaker = input.isDecisionMaker;
  if (input.isPrimaryContact !== undefined)
    values.isPrimaryContact = input.isPrimaryContact;
  if (input.status !== undefined) values.status = input.status;

  const row = await updateCustomer(id, values);

  return {
    customer: toView(row, isOwner || isAccountOwner || isAdmin),
    message: "Customer updated.",
    status: 200,
  };
}