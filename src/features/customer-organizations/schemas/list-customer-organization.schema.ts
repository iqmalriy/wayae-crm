import { z } from "zod";

export const listCustomerOrganizationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  type: z.enum(["enterprise", "individual"]).optional(),
  status: z.enum(["prospect", "active", "churned"]).optional(),
  sortBy: z
    .enum(["name", "status", "organizationType", "updatedAt"])
    .default("updatedAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type ListCustomerOrganizationQuery = z.infer<
  typeof listCustomerOrganizationQuery
>;