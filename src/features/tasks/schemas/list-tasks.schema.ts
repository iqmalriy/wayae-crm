import { z } from "zod";
import { taskStatuses } from "@/lib/db/schema";

export const listTasksQuery = z.object({
  status: z.enum(taskStatuses).optional(),
  leadId: z.string().trim().max(255).optional(),
  assigneeId: z.string().trim().max(255).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListTasksQuery = z.infer<typeof listTasksQuery>;
