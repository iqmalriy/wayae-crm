import { z } from "zod";

export const listHeartbeatHistoryQuery = z.object({
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
});

export type ListHeartbeatHistoryQuery = z.infer<
  typeof listHeartbeatHistoryQuery
>;