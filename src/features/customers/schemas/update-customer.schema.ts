import { z } from "zod";

export const updateCustomerInput = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required.")
    .max(255)
    .optional(),
  email: z.string().trim().email("Invalid email.").max(255).nullable().optional(),
  organizationId: z.string().trim().max(255).optional(),
  jobTitle: z.string().trim().max(255).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  isDecisionMaker: z.boolean().optional(),
  isPrimaryContact: z.boolean().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type UpdateCustomerInput = z.infer<typeof updateCustomerInput>;