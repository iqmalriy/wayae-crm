import { z } from "zod";

export const createContactInput = z.object({
  phoneNumber: z
    .string()
    .trim()
    .regex(
      /^62\d{8,13}$/,
      "WhatsApp number must start with 62 (without 0 or +62), example: 6281234567890",
    ),
  displayName: z.string().trim().min(1, "Display name is required.").max(100),
  description: z.string().trim().max(500).optional(),
  isBusiness: z.boolean().optional().default(false),
  customerId: z
    .union([z.string().trim().max(255), z.literal("")])
    .transform((v) => v || undefined)
    .optional(),
});

export type CreateContactInput = z.infer<typeof createContactInput>;
