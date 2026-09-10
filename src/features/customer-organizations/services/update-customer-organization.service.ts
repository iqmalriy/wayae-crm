import { AppError } from "@/lib/errors";
import { CustomerOrganizationNotFoundError } from "../api-error/errors";
import {
  findCustomerOrganizationById,
  updateCustomerOrganization,
  type CustomerOrganizationRow,
} from "../repositories/customer-organization.repository";
import type { UpdateCustomerOrganizationInput } from "../schemas/update-customer-organization.schema";
import type {
  CustomerOrganizationView,
  UpdateCustomerOrganizationResult,
} from "../types/response-types";

export interface UpdateCustomerOrganizationActor {
  userId: string;
  role: "admin" | "staff";
}

function toView(row: CustomerOrganizationRow): CustomerOrganizationView {
  return {
    id: row.id,
    name: row.name,
    legalName: row.legalName,
    organizationType: row.organizationType,
    status: row.status,
    customerCount: 0,
    activeCustomerCount: 0,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateCustomerOrganizationForUser(
  id: string,
  actor: UpdateCustomerOrganizationActor,
  input: UpdateCustomerOrganizationInput,
): Promise<UpdateCustomerOrganizationResult> {
  const existing = await findCustomerOrganizationById(id);
  if (!existing) throw new CustomerOrganizationNotFoundError();

  if (actor.role !== "admin" && existing.accountOwnerId !== actor.userId) {
    throw new AppError("FORBIDDEN", {
      message: "You are not allowed to update this organization.",
    });
  }

  const values: {
    name?: string;
    legalName?: string | null;
    npwp?: string | null;
    industry?: string | null;
    address?: string | null;
    organizationType?: "enterprise" | "individual" | null;
  } = {};
  if (input.name !== undefined) values.name = input.name;
  if (input.legalName !== undefined) values.legalName = input.legalName;
  if (input.npwp !== undefined) values.npwp = input.npwp;
  if (input.industry !== undefined) values.industry = input.industry;
  if (input.address !== undefined) values.address = input.address;
  if (input.organizationType !== undefined) {
    values.organizationType = input.organizationType;
  }

  const row = await updateCustomerOrganization(id, values);

  return {
    customerOrganization: toView(row),
    message: "Customer organization updated.",
    status: 200,
  };
}