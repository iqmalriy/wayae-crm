import { z } from "zod";

export const createUserInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email.").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128),
  role: z.enum(["admin", "staff"]).default("staff"),
});

export type CreateUserInput = z.infer<typeof createUserInput>;