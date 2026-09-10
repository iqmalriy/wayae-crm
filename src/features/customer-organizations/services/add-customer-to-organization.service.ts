import { AppError } from "@/lib/errors";
import { CustomerOrganizationNotFoundError } from "../api-error/errors";
import { findCustomerOrganizationById } from "../repositories/customer-organization.repository";
import {
  assignCustomerToOrganization,
  findCustomerById,
} from "@/features/customers/repositories/customer.repository";
import type { AddCustomerToOrganizationInput } from "../schemas/add-customer-to-organization.schema";
import type { CustomerView } from "@/features/customers/types/response-types";

export async function addCustomerToOrganizationForUser(
  organizationId: string,
  input: AddCustomerToOrganizationInput,
): Promise<{ customer: CustomerView }> {
  const org = await findCustomerOrganizationById(organizationId);
  if (!org) throw new CustomerOrganizationNotFoundError();

  const existing = await findCustomerById(input.customerId);
  if (!existing) {
    throw new AppError("NOT_FOUND", { message: "Customer not found." });
  }
  if (existing.organizationId) {
    throw new AppError("CONFLICT", {
      message: "This customer is already assigned to an organization.",
    });
  }

  const row = await assignCustomerToOrganization(
    organizationId,
    input.customerId,
  );

  return {
    customer: {
      id: row.id,
      fullName: row.fullName,
      jobTitle: row.jobTitle,
      status: row.status,
      organizationId: row.organizationId,
      organizationName: org.name,
      isDecisionMaker: row.isDecisionMaker,
      isPrimaryContact: row.isPrimaryContact,
      canDetach: true,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    },
  };
}