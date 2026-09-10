import { z } from "zod";

export const updateContactInput = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, "Display name is required.")
      .max(100)
      .optional(),
    description: z.string().trim().max(500).nullable().optional(),
    isBusiness: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided.",
  });

export type UpdateContactInput = z.infer<typeof updateContactInput>;