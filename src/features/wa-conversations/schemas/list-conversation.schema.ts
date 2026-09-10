import { z } from "zod";

export const listConversationQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  status: z.enum(["open", "closed"]).optional(),
  waAccountId: z.string().optional(),
  sortBy: z
    .enum(["lastMessageAt", "title", "createdAt"])
    .default("lastMessageAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type ListConversationQuery = z.infer<typeof listConversationQuery>;