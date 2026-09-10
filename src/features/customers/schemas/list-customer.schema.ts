import { z } from "zod";

export const listCustomerQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  organizationId: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  isDecisionMaker: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  unassigned: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  sortBy: z
    .enum(["fullName", "email", "status", "createdAt", "updatedAt"])
    .default("updatedAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type ListCustomerQuery = z.infer<typeof listCustomerQuery>;