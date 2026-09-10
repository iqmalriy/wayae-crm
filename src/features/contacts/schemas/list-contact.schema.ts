import { z } from "zod";

export const listContactQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  customerId: z.string().optional(),
  unassigned: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  sortBy: z
    .enum(["displayName", "phoneNumber", "source", "createdAt", "lastSeenAt"])
    .default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type ListContactQuery = z.infer<typeof listContactQuery>;