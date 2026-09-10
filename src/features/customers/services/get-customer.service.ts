import { AppError } from "@/lib/errors";
import { censorEmail } from "@/lib/censor";
import {
  findCustomerDetailById,
  type CustomerDetailRow,
} from "../repositories/customer.repository";
import type {
  CustomerDetailView,
  GetCustomerOutput,
} from "../types/response-types";

function toView(
  row: CustomerDetailRow,
  canUpdate: boolean,
  canDelete: boolean,
): CustomerDetailView {
  return {
    id: row.id,
    fullName: row.fullName,
    email: canUpdate ? row.email : row.email ? censorEmail(row.email) : null,
    jobTitle: row.jobTitle,
    notes: row.notes,
    status: row.status,
    organizationId: row.organizationId,
    organizationName: row.organizationName,
    isDecisionMaker: row.isDecisionMaker,
    isPrimaryContact: row.isPrimaryContact,
    createdById: row.createdById,
    createdByName: row.createdByName,
    canUpdate,
    canDelete,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export interface GetCustomerActor {
  userId: string;
  role: "admin" | "staff";
}

export async function getCustomerForUser(
  id: string,
  actor: GetCustomerActor,
): Promise<GetCustomerOutput> {
  const row = await findCustomerDetailById(id);
  if (!row) {
    throw new AppError("NOT_FOUND", { message: "Customer not found." });
  }
  const isOwner = row.createdById === actor.userId;
  const isAccountOwner = row.accountOwnerId === actor.userId;
  const isAdmin = actor.role === "admin";
  return {
    customer: toView(
      row,
      isOwner || isAccountOwner || isAdmin,
      isAccountOwner || isAdmin,
    ),
  };
}