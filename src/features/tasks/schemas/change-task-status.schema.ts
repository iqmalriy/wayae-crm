import { z } from "zod";
import { taskStatuses } from "@/lib/db/schema";

export const changeTaskStatusInput = z.object({
  status: z.enum(taskStatuses),
  note: z.string().trim().max(2000).optional(),
});

export type ChangeTaskStatusInput = z.infer<typeof changeTaskStatusInput>;
