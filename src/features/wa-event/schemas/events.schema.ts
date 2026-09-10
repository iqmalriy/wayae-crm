import { z } from "zod";

export const eventEnvelope = z.object({
  type: z.string().min(1, "type is required"),
  version: z.string().nullish(),
  ts: z.number().int().nullish(),
});

export const waContactPayload = z.object({
  chatId: z.string().nullish(),
  phone: z.string().nullish(),
  name: z.string().nullish(),
  pushName: z.string().nullish(),
  isBusiness: z.boolean().nullish(),
  isMe: z.boolean().nullish(),
});

export const messageReceivedPayload = z.object({
  id: z.string().min(1, "id is required"),
  chatId: z.string().nullish(),
  chatType: z.string().nullish(),
  from: z.string().nullish(),
  chatPhone: z.string().nullish(),
  accountWid: z.string().nullish(),
  accountPhone: z.string().nullish(),
  to: z.string().nullish(),
  body: z.string().nullish(),
  timestamp: z.number().int().nullish(),
  fromMe: z.boolean().nullish(),
  hasMedia: z.boolean().nullish(),
  type: z.string().nullish(),
  ack: z.number().nullish(),
  contact: waContactPayload.nullable(),
  media: z
    .object({
      mediaId: z.string().nullish(),
      mimetype: z.string().nullish(),
      filename: z.string().nullish(),
      filesize: z.number().nullish(),
    })
    .nullable(),
});

export const connectionStatusPayload = z.object({
  state: z.string().min(1, "state is required"),
  wid: z.string().nullish(),
});

export const eventsInput = z.object({
  events: z
    .array(
      z.object({
        type: z.string().min(1, "type is required"),
        version: z.string().nullish(),
        ts: z.number().int().nullish(),
        payload: z.record(z.string(), z.unknown()).nullish(),
      }),
    )
    .max(50, "batch exceeds 50 events"),
});

export type EventsInput = z.infer<typeof eventsInput>;
export type MessageReceivedPayload = z.infer<typeof messageReceivedPayload>;
export type ConnectionStatusPayload = z.infer<typeof connectionStatusPayload>;
export type WaContactPayload = z.infer<typeof waContactPayload>;