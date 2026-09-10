import { z } from "zod";

export const createWaAccountInput = z.object({
  userId: z.string().trim().min(1, "User is required."),
  phone: z
    .string()
    .trim()
    .regex(
      /^62\d{8,13}$/,
      "WhatsApp number must start with 62 (without 0 or +62), example: 6281234567890",
    ),
  label: z
    .string()
    .trim()
    .min(1, "Label is required.")
    .max(100, "Label is too long."),
});

export type CreateWaAccountInput = z.infer<typeof createWaAccountInput>;
