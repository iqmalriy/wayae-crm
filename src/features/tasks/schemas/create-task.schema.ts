import { z } from "zod";

export const taskPriorities = ["low", "medium", "high"] as const;

export const createTaskInput = z.object({
  leadId: z.string().trim().min(1, "Lead is required.").max(255),
  title: z.string().trim().min(1, "Title is required.").max(200),
  description: z.string().trim().max(2000).optional(),
  priority: z.enum(taskPriorities).optional().default("medium"),
  assigneeId: z.string().trim().max(255).optional(),
  dueAt: z.string().trim().datetime({ offset: true }).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskInput>;