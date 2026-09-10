import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  conversations,
  messages,
  type ConversationChatType,
} from "@/lib/db/schema";

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type ConversationRow = typeof conversations.$inferSelect;
export type MessageRow = typeof messages.$inferSelect;

export interface CreateConversationValues {
  waAccountId: string;
  chatId: string;
  chatType: ConversationChatType;
  contactId: string | null;
  title: string | null;
  ownerId: string | null;
}

export interface InsertMessageValues {
  conversationId: string;
  waAccountId: string;
  messageId: string;
  ownerId: string | null;
  fromMe: boolean;
  body: string | null;
  type: string | null;
  mediaId: string | null;
  mimetype: string | null;
  filename: string | null;
  filesize: number | null;
  receivedAt: Date;
}

export async function getOrCreateConversation(
  tx: Tx,
  values: CreateConversationValues,
): Promise<ConversationRow> {
  await tx
    .insert(conversations)
    .values(values)
    .onConflictDoNothing({
      target: [conversations.waAccountId, conversations.chatId],
      where: sql`${conversations.deletedAt} is null`,
    });

  const [row] = await tx
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.waAccountId, values.waAccountId),
        eq(conversations.chatId, values.chatId),
        isNull(conversations.deletedAt),
      ),
    )
    .limit(1);

  return row;
}

export async function updateConversationContactId(
  tx: Tx,
  conversationId: string,
  contactId: string,
): Promise<void> {
  await tx
    .update(conversations)
    .set({ contactId, updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));
}

export async function insertMessage(
  tx: Tx,
  values: InsertMessageValues,
): Promise<MessageRow | null> {
  const rows = await tx
    .insert(messages)
    .values(values)
    .onConflictDoNothing({
      target: [messages.waAccountId, messages.messageId],
      where: sql`${messages.deletedAt} is null`,
    })
    .returning();

  return rows[0] ?? null;
}

export async function updateConversationOnMessage(
  tx: Tx,
  conversationId: string,
  values: {
    receivedAt: Date;
    fromMe: boolean;
    preview: string | null;
  },
): Promise<void> {
  await tx
    .update(conversations)
    .set({
      messageCount: sql`${conversations.messageCount} + 1`,
      lastMessageAt: values.receivedAt,
      lastMessageFromMe: values.fromMe,
      lastMessagePreview: values.preview,
      status: "open",
      closedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(conversations.id, conversationId));
}