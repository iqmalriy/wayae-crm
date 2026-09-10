import { z } from "zod";

export const heartbeatInput = z.object({
  wid: z.string().trim().min(1, "wid is required"),
  phone: z.string().trim().min(1, "phone is required"),
  version: z.string().trim().min(1, "protocol version is required"),
  extVersion: z.string().trim().min(1, "extension version is required"),
  queueSize: z.number().int().nonnegative().nullish(),
  ts: z.number().int().nullish(),
});

export type HeartbeatInput = z.infer<typeof heartbeatInput>;