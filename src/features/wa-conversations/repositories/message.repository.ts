import { and, asc, desc, eq, gt, isNull, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";

export type MessageRow = typeof messages.$inferSelect;

export interface ListMessagesParams {
  conversationId: string;
  cursor: number | null;
  limit: number;
  dir: "older" | "newer";
}

export async function findAccessibleConversation(
  conversationId: string,
  callerId: string,
  isAdmin: boolean,
): Promise<{ id: string } | null> {
  const [row] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        isNull(conversations.deletedAt),
        isAdmin ? undefined : eq(conversations.ownerId, callerId),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function softDeleteMessage(
  conversationId: string,
  messageId: string,
): Promise<boolean> {
  const rows = await db
    .update(messages)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(messages.id, messageId),
        eq(messages.conversationId, conversationId),
        isNull(messages.deletedAt),
      ),
    )
    .returning({ id: messages.id });
  return rows.length > 0;
}

export async function listMessagePage(
  params: ListMessagesParams,
): Promise<{ rows: MessageRow[]; hasMore: boolean }> {
  const { conversationId, cursor, limit, dir } = params;

  const conditions = [eq(messages.conversationId, conversationId), isNull(messages.deletedAt)];
  if (cursor) {
    conditions.push(dir === "older" ? lt(messages.seq, cursor) : gt(messages.seq, cursor));
  }

  const rows = await db
    .select()
    .from(messages)
    .where(and(...conditions))
    .orderBy(dir === "older" ? desc(messages.seq) : asc(messages.seq))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;

  // Return chronologically ascending for display regardless of dir.
  return { rows: page.reverse(), hasMore };
}