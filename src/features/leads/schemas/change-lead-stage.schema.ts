import { z } from "zod";

export const leadStages = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
] as const;

export const changeLeadStageInput = z.object({
  stage: z.enum(leadStages),
  note: z.string().trim().max(2000).optional(),
});

export type ChangeLeadStageInput = z.infer<typeof changeLeadStageInput>;