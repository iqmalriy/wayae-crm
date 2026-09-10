import { randomUUID } from "node:crypto";
import {
  createCustomerOrganization,
  type CustomerOrganizationRow,
} from "../repositories/customer-organization.repository";
import type { CreateCustomerOrganizationInput } from "../schemas/create-customer-organization.schema";
import type {
  CreateCustomerOrganizationResult,
  CustomerOrganizationView,
} from "../types/response-types";

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

export interface CreateCustomerOrganizationActor {
  userId: string;
}

export async function createCustomerOrganizationForUser(
  input: CreateCustomerOrganizationInput,
  actor: CreateCustomerOrganizationActor,
): Promise<CreateCustomerOrganizationResult> {
  const row = await createCustomerOrganization({
    id: randomUUID(),
    name: input.name,
    legalName: input.legalName,
    npwp: input.npwp,
    industry: input.industry,
    address: input.address,
    organizationType: input.organizationType,
    accountOwnerId: actor.userId,
  });

  return {
    customerOrganization: toView(row),
    message: "Customer organization created.",
    status: 201,
  };
}