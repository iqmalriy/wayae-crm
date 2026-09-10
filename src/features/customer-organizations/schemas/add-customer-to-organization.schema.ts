import { z } from "zod";

export const addCustomerToOrganizationInput = z.object({
  customerId: z.string().trim().min(1, "Customer is required."),
});

export type AddCustomerToOrganizationInput = z.infer<
  typeof addCustomerToOrganizationInput
>;