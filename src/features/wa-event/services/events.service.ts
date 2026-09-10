import {
  findAccountOwnerId,
  markAccountOffline,
} from "../repositories/wa-event.repository";
import { handleContactFromMessage } from "./contact-handling.service";
import { handleConversationMessage } from "./conversation-handling.service";
import {
  connectionStatusPayload,
  messageReceivedPayload,
  type EventsInput,
} from "../schemas/events.schema";

export interface EventsResult {
  processed: number;
  ignored: number;
}

async function handleMessageReceived(
  waAccountId: string,
  accountOwnerId: string | null,
  payload: unknown,
): Promise<void> {
  const parsed = messageReceivedPayload.safeParse(payload);
  console.log(parsed);
  if (!parsed.success) return;

  const message = parsed.data;
  if (message.chatType !== "chat") return;
  if (!message.chatId) return;

  const ts = message.timestamp
    ? new Date(message.timestamp * 1000)
    : new Date();

  const contact =
    !message.fromMe && message.contact
      ? await handleContactFromMessage(
          waAccountId,
          accountOwnerId,
          message.contact,
          ts,
        )
      : null;

  await handleConversationMessage(
    waAccountId,
    accountOwnerId,
    message,
    contact?.id ?? null,
  );
}

async function handleConnectionStatus(
  waAccountId: string,
  payload: unknown,
): Promise<void> {
  const parsed = connectionStatusPayload.safeParse(payload);
  if (!parsed.success) return;

  if (parsed.data.state === "hook-lost") {
    await markAccountOffline(waAccountId);
  }
}

export async function processEvents(
  waAccountId: string,
  input: EventsInput,
): Promise<EventsResult> {
  let processed = 0;
  let ignored = 0;
  const accountOwnerId = await findAccountOwnerId(waAccountId);

  for (const event of input.events) {
    try {
      switch (event.type) {
        case "message.received":
          await handleMessageReceived(
            waAccountId,
            accountOwnerId,
            event.payload,
          );
          break;
        case "connection.status":
          await handleConnectionStatus(waAccountId, event.payload);
          break;
        default:
          ignored += 1;
          continue;
      }
      processed += 1;
    } catch (error) {
      console.error("wa-event: failed to process event", event.type, error);
      ignored += 1;
    }
  }

  return { processed, ignored };
}
