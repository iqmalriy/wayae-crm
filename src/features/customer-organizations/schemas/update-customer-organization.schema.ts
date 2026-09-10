import { z } from "zod";

export const updateCustomerOrganizationInput = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(255).optional(),
    legalName: z.string().trim().max(255).nullable().optional(),
    npwp: z.string().trim().max(50).nullable().optional(),
    industry: z.string().trim().max(100).nullable().optional(),
    address: z.string().trim().max(500).nullable().optional(),
    organizationType: z.enum(["enterprise", "individual"]).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided.",
  });

export type UpdateCustomerOrganizationInput = z.infer<
  typeof updateCustomerOrganizationInput
>;