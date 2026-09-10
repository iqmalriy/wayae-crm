import { CustomerOrganizationNotFoundError } from "../api-error/errors";
import {
  findCustomerOrganizationById,
  type CustomerOrganizationWithOwner,
} from "../repositories/customer-organization.repository";
import type {
  CustomerOrganizationDetailView,
  GetCustomerOrganizationOutput,
} from "../types/response-types";

function toView(
  row: CustomerOrganizationWithOwner,
  actor: GetCustomerOrganizationActor,
): CustomerOrganizationDetailView {
  const isOwnerOrAdmin =
    actor.role === "admin" || row.accountOwnerId === actor.userId;
  return {
    id: row.id,
    name: row.name,
    legalName: row.legalName,
    npwp: row.npwp,
    industry: row.industry,
    address: row.address,
    organizationType: row.organizationType,
    status: row.status,
    accountOwner: row.accountOwnerId
      ? {
          id: row.accountOwnerId,
          name: row.ownerName ?? "",
          email: row.ownerEmail ?? "",
        }
      : null,
    canUpdate: isOwnerOrAdmin,
    canDelete: actor.role === "admin",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    churnedAt: row.churnedAt?.toISOString() ?? null,
    prospectAt: row.prospectAt?.toISOString() ?? null,
  };
}

export interface GetCustomerOrganizationActor {
  userId: string;
  role: "admin" | "staff";
}

export async function getCustomerOrganizationForUser(
  id: string,
  actor: GetCustomerOrganizationActor,
): Promise<GetCustomerOrganizationOutput> {
  const row = await findCustomerOrganizationById(id);
  if (!row) throw new CustomerOrganizationNotFoundError();

  const view = toView(row, actor);

  return { customerOrganization: view };
}