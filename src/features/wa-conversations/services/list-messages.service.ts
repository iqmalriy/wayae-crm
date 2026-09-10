import { AppError } from "@/lib/errors";
import {
  findAccessibleConversation,
  listMessagePage,
  type MessageRow,
} from "../repositories/message.repository";
import type { ListMessagesQuery } from "../schemas/list-messages.schema";
import type {
  ListMessagesOutput,
  MessageView,
} from "../types/response-types";

function toView(row: MessageRow): MessageView {
  const hasMedia = Boolean(row.mediaId);
  return {
    id: row.id,
    seq: row.seq ?? 0,
    fromMe: row.fromMe,
    body: row.body,
    type: row.type,
    media: hasMedia
      ? {
          mediaId: row.mediaId,
          mimetype: row.mimetype,
          filename: row.filename,
          filesize: row.filesize,
        }
      : null,
    receivedAt: row.receivedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listConversationMessages(
  user: { id: string; role: string | null | undefined },
  conversationId: string,
  query: ListMessagesQuery,
): Promise<ListMessagesOutput> {
  const isAdmin = user.role === "admin";
  const conversation = await findAccessibleConversation(
    conversationId,
    user.id,
    isAdmin,
  );
  if (!conversation) {
    throw new AppError("NOT_FOUND", {
      message: "Conversation not found.",
    });
  }

  const { rows, hasMore } = await listMessagePage({
    conversationId,
    cursor: query.cursor ?? null,
    limit: query.limit,
    dir: query.dir,
  });

  const last = rows.length > 0 ? rows[rows.length - 1] : null;
  const nextCursor =
    hasMore && last ? (last.seq ?? null) : null;

  return {
    messages: rows.map(toView),
    nextCursor,
    hasMore,
  };
}