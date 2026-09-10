import { z } from "zod";

export const createCustomerInput = z.object({
  fullName: z.string().trim().min(1, "Full name is required.").max(255),
  email: z
    .union([
      z.literal(""),
      z.string().trim().email("Invalid email.").max(255),
    ])
    .optional()
    .transform((value) =>
      value === undefined || value === "" ? undefined : value,
    ),
  organizationId: z.string().optional(),
  jobTitle: z.string().trim().max(255).optional(),
  notes: z.string().trim().max(2000).optional(),
  isDecisionMaker: z.boolean().optional(),
  isPrimaryContact: z.boolean().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerInput>;
