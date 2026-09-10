import { z } from "zod";

export const leadSources = ["inbound", "manual", "referral", "campaign"] as const;

export const updateLeadInput = z.object({
  name: z.string().trim().max(100).nullable().optional(),
  company: z.string().trim().max(200).nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  email: z
    .string()
    .trim()
    .email("Invalid email.")
    .max(255)
    .nullable()
    .optional(),
  source: z.enum(leadSources).optional(),
  assigneeId: z.string().trim().max(255).optional(),
  estimatedValue: z
    .union([z.string(), z.number()])
    .nullable()
    .optional()
    .refine(
      (v) => v === null || v === undefined || Number.isFinite(Number(v)),
      { message: "Estimated value must be a valid number." },
    )
    .refine(
      (v) => v === null || v === undefined || Number(v) > 0,
      { message: "Estimated value must be positive." },
    )
    .transform((v) => (v === undefined ? undefined : v === null ? null : Number(v))),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export type UpdateLeadInput = z.infer<typeof updateLeadInput>;