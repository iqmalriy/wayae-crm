import { AppError } from "@/lib/errors";
import { CustomerOrganizationNotFoundError } from "../api-error/errors";
import {
  clearCustomerOrganization,
  findCustomerIdsByOrganization,
  findCustomerOrganizationById,
  softDeleteCustomerOrganization,
} from "../repositories/customer-organization.repository";

export interface DeleteCustomerOrganizationActor {
  userId: string;
  role: "admin" | "staff";
}

export async function softDeleteCustomerOrganizationForUser(
  id: string,
  actor: DeleteCustomerOrganizationActor,
): Promise<{ message: string }> {
  if (actor.role !== "admin") {
    throw new AppError("FORBIDDEN", {
      message: "Only admins can delete customer organizations.",
    });
  }

  const existing = await findCustomerOrganizationById(id);
  if (!existing) throw new CustomerOrganizationNotFoundError();

  const customerIds = await findCustomerIdsByOrganization(id);
  await clearCustomerOrganization(customerIds);
  await softDeleteCustomerOrganization(id);

  return {
    message: `Customer organization deleted. ${customerIds.length} customer${
      customerIds.length === 1 ? "" : "s"
    } detached from this organization.`,
  };
}