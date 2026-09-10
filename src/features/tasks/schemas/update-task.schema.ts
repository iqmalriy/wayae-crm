import { z } from "zod";
import { taskPriorities } from "./create-task.schema";

export const updateTaskInput = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  priority: z.enum(taskPriorities).optional(),
  assigneeId: z.string().trim().max(255).nullable().optional(),
  dueAt: z.string().trim().datetime({ offset: true }).nullable().optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskInput>;
