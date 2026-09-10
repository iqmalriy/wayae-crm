import type {
  ConversationCursor,
  ConversationListRow,
  SortField,
} from "../repositories/conversation.repository";
import { listConversationPage } from "../repositories/conversation.repository";
import type { ListConversationQuery } from "../schemas/list-conversation.schema";
import type {
  ConversationView,
  ListConversationsOutput,
} from "../types/response-types";

const SORT_FIELDS: SortField[] = ["lastMessageAt", "title", "createdAt"];

function decodeCursor(raw: string | undefined): ConversationCursor | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8"),
    ) as Partial<ConversationCursor>;
    if (
      !parsed ||
      typeof parsed.id !== "string" ||
      !SORT_FIELDS.includes(parsed.field as SortField)
    ) {
      return null;
    }
    return {
      field: parsed.field as SortField,
      dir: parsed.dir === "asc" ? "asc" : "desc",
      value: String(parsed.value ?? ""),
      id: parsed.id,
    };
  } catch {
    return null;
  }
}

function encodeCursor(
  row: ConversationListRow,
  sortBy: SortField,
  sortDir: "asc" | "desc",
): string {
  const value =
    row.sortValue instanceof Date
      ? row.sortValue.toISOString()
      : String(row.sortValue ?? "");
  const payload = { field: sortBy, dir: sortDir, value, id: row.id };
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function toView(row: ConversationListRow): ConversationView {
  return {
    id: row.id,
    title: row.title,
    chatType: row.chatType,
    status: row.status,
    ownerId: row.ownerId,
    ownerName: row.ownerName,
    unreadCount: row.unreadCount,
    messageCount: row.messageCount,
    lastMessageAt: row.lastMessageAt?.toISOString() ?? null,
    lastMessageFromMe: row.lastMessageFromMe,
    lastMessagePreview: row.lastMessagePreview,
    contact: row.contactId
      ? {
          id: row.contactId,
          phone: row.contactPhone ?? "",
          displayName: row.contactDisplayName ?? "",
        }
      : null,
    customer:
      row.customerId && row.customerName
        ? { id: row.customerId, name: row.customerName }
        : null,
    waAccount: row.waAccountId
      ? {
          id: row.waAccountId,
          phone: row.waAccountPhone ?? "",
          label: row.waAccountLabel ?? "",
        }
      : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listConversations(
  user: { id: string; role: string | null | undefined },
  query: ListConversationQuery,
): Promise<ListConversationsOutput> {
  const isAdmin = user.role === "admin";
  const { rows, hasMore } = await listConversationPage({
    limit: query.limit,
    cursor: decodeCursor(query.cursor),
    search: query.search,
    status: query.status,
    waAccountId: query.waAccountId,
    sortBy: query.sortBy,
    sortDir: query.sortDir,
    callerId: user.id,
    isAdmin,
  });

  const last = rows.length > 0 ? rows[rows.length - 1] : null;
  const nextCursor =
    hasMore && last ? encodeCursor(last, query.sortBy, query.sortDir) : null;

  return {
    conversations: rows.map(toView),
    nextCursor,
    hasMore,
  };
}