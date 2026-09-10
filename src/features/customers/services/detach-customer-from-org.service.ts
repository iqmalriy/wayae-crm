import { AppError } from "@/lib/errors";
import {
  findCustomerOwnerById,
  unassignCustomerFromOrganization,
  type CustomerRow,
} from "../repositories/customer.repository";
import type { CustomerView } from "../types/response-types";

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

export interface DetachCustomerFromOrgActor {
  userId: string;
  role: "admin" | "staff";
}

export async function detachCustomerFromOrgForUser(
  customerId: string,
  actor: DetachCustomerFromOrgActor,
): Promise<{ customer: CustomerView }> {
  const existing = await findCustomerOwnerById(customerId);
  if (!existing) {
    throw new AppError("NOT_FOUND", { message: "Customer not found." });
  }

  const isOwner = existing.createdById === actor.userId;
  const isAccountOwner = existing.accountOwnerId === actor.userId;
  const isAdmin = actor.role === "admin";
  if (!isOwner && !isAccountOwner && !isAdmin) {
    throw new AppError("FORBIDDEN", {
      message: "You are not allowed to detach this customer.",
    });
  }

  if (!existing.organizationId) {
    throw new AppError("CONFLICT", {
      message: "This customer is not assigned to any organization.",
    });
  }

  const row = await unassignCustomerFromOrganization(customerId);

  return { customer: toView(row) };
}