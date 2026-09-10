import { z } from "zod";

export const updateUserInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(100).optional(),
  email: z.string().trim().toLowerCase().email("Enter a valid email.").max(255).optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128)
    .optional(),
  role: z.enum(["admin", "staff"]).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserInput>;