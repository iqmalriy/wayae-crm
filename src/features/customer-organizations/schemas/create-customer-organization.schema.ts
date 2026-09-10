import { z } from "zod";

export const createCustomerOrganizationInput = z.object({
  name: z.string().trim().min(1, "Name is required.").max(255),
  legalName: z.string().trim().max(255).optional(),
  npwp: z.string().trim().max(50).optional(),
  industry: z.string().trim().max(100).optional(),
  address: z.string().trim().max(500).optional(),
  organizationType: z.enum(["enterprise", "individual"]).optional(),
});

export type CreateCustomerOrganizationInput = z.infer<
  typeof createCustomerOrganizationInput
>;