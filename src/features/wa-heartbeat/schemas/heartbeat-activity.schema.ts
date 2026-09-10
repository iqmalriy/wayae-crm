import { z } from "zod";

export const heartbeatActivityQuery = z.object({
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  bucket: z.enum(["minute", "hour", "day"]).optional(),
});

export type HeartbeatActivityQuery = z.infer<typeof heartbeatActivityQuery>;
export type HeartbeatBucket = NonNullable<HeartbeatActivityQuery["bucket"]>;