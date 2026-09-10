import { randomUUID } from "node:crypto";
import { AppError } from "@/lib/errors";
import { findCustomerOrganizationById } from "@/features/customer-organizations/repositories/customer-organization.repository";
import {
  createCustomer,
  findCustomerByEmail,
  type CustomerRow,
} from "../repositories/customer.repository";
import type { CreateCustomerInput } from "../schemas/create-customer.schema";
import type {
  CreateCustomerResult,
  CustomerView,
} from "../types/response-types";

function toView(row: CustomerRow): CustomerView {
  return {
    id: row.id,
    fullName: row.fullName,
    jobTitle: row.jobTitle,
    status: row.status,
    organizationId: row.organizationId,
    organizationName: row.organizationName,
    isDecisionMaker: row.isDecisionMaker,
    isPrimaryContact: row.isPrimaryContact,
    canDetach: true,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export interface CreateCustomerActor {
  userId: string;
}

export async function createCustomerForUser(
  input: CreateCustomerInput,
  actor: CreateCustomerActor,
): Promise<CreateCustomerResult> {
  if (input.email) {
    const existing = await findCustomerByEmail(input.email);
    if (existing) {
      throw new AppError("CONFLICT", {
        message: "A customer with this email already exists.",
        fields: { email: "This email is already in use." },
      });
    }
  }

  if (input.organizationId) {
    const organization = await findCustomerOrganizationById(input.organizationId);
    if (!organization) {
      throw new AppError("NOT_FOUND", {
        message: "Organization not found.",
        fields: { organizationId: "Organization not found." },
      });
    }
  }

  const row = await createCustomer({
    id: randomUUID(),
    organizationId: input.organizationId,
    fullName: input.fullName,
    jobTitle: input.jobTitle,
    email: input.email,
    notes: input.notes,
    isDecisionMaker: input.isDecisionMaker,
    isPrimaryContact: input.isPrimaryContact,
    status: input.status,
    createdById: actor.userId,
  });

  return {
    customer: toView(row),
    message: "Customer created.",
    status: 201,
  };
}