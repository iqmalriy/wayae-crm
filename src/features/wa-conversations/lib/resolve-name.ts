import type { ConversationView } from "../types/response-types";

export function resolveConversationName(
  conversation: ConversationView,
): string {
  return (
    conversation.customer?.name ??
    conversation.contact?.displayName ??
    conversation.contact?.phone ??
    conversation.title ??
    "Unknown"
  );
}
