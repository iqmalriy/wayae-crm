import type { ConversationPollRow } from "../repositories/conversation.repository";
import {
  listChangedConversations,
  totalUnreadCount,
} from "../repositories/conversation.repository";
import type {
  PollConversationsOutput,
  PolledConversation,
} from "../types/response-types";

function resolveName(row: ConversationPollRow): string | null {
  return (
    row.customerName ??
    row.title ??
    row.contactDisplayName ??
    row.contactPhone ??
    null
  );
}

function toPolled(row: ConversationPollRow): PolledConversation {
  return {
    id: row.id,
    name: resolveName(row),
    lastMessageAt: row.lastMessageAt?.toISOString() ?? null,
    lastMessageFromMe: row.lastMessageFromMe,
    lastMessagePreview: row.lastMessagePreview,
    unreadCount: row.unreadCount,
  };
}

export async function pollConversations(
  user: { id: string; role: string | null | undefined },
  since: string | undefined,
): Promise<PollConversationsOutput> {
  const isAdmin = user.role === "admin";
  const sinceDate = since ? new Date(since) : null;

  const rows = await listChangedConversations({
    since: sinceDate,
    callerId: user.id,
    isAdmin,
  });

  const totalUnread = await totalUnreadCount({ callerId: user.id, isAdmin });

  return {
    conversations: rows.map(toPolled),
    totalUnreadCount: totalUnread,
    serverTs: new Date().toISOString(),
  };
}