import { z } from "zod";

export const updateWaAccountLabelInput = z.object({
  label: z.string().trim().min(1, "Label is required").max(100),
});

export type UpdateWaAccountLabelInput = z.infer<
  typeof updateWaAccountLabelInput
>;