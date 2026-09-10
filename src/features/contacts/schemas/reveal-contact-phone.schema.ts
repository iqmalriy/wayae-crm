import { z } from "zod";

export const revealContactPhoneInput = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Reason is required.")
    .max(500, "Reason must be 500 characters or less."),
});

export type RevealContactPhoneInput = z.infer<
  typeof revealContactPhoneInput
>;