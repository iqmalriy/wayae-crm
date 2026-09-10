import { z } from "zod";

export const createLeadActivityInput = z.object({
  body: z.string().trim().min(1, "Activity body is required.").max(2000),
});

export type CreateLeadActivityInput = z.infer<typeof createLeadActivityInput>;