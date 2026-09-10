import { z } from "zod";

export const listMessagesQuery = z.object({
  cursor: z.coerce.number().int().min(0).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  dir: z.enum(["older", "newer"]).default("older"),
});

export type ListMessagesQuery = z.infer<typeof listMessagesQuery>;