import { z } from "zod";

export const leadStages = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
] as const;

export const leadSources = ["inbound", "manual", "referral", "campaign"] as const;

export const listLeadsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  stage: z.enum(leadStages).optional(),
  ownerId: z.string().optional(),
  assigneeId: z.string().optional(),
  // When true, restrict to leads owned by or assigned to the actor.
  mine: z.coerce.boolean().optional(),
  // When true, exclude won and lost leads.
  excludeClosed: z.coerce.boolean().optional(),
  sortBy: z
    .enum(["name", "company", "stage", "ownerId", "assigneeId", "estimatedValue", "createdAt"])
    .default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type ListLeadsQuery = z.infer<typeof listLeadsQuery>;