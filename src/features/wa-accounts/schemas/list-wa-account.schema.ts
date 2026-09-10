import { z } from "zod";

export const listWaAccountQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  sortBy: z
    .enum(["phone", "label", "createdAt", "userName"])
    .default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type ListWaAccountQuery = z.infer<typeof listWaAccountQuery>;