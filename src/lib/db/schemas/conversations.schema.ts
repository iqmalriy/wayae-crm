import {
  bigint,
  bigserial,
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth.schema";
import { waAccounts } from "./whatsapp_accounts";
import { contacts } from "./contacts.schema";
import { media } from "./media.schema";

export const conversationChatTypes = ["chat", "group"] as const;
export type ConversationChatType = (typeof conversationChatTypes)[number];

export const conversationStatuses = ["open", "closed"] as const;
export type ConversationStatus = (typeof conversationStatuses)[number];

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    waAccountId: uuid("wa_account_id")
      .notNull()
      .references(() => waAccounts.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id").references(() => contacts.id, {
      onDelete: "set null",
    }),
    chatId: text("chat_id").notNull(),
    chatType: text("chat_type")
      .$type<ConversationChatType>()
      .default("chat")
      .notNull(),
    title: text("title"),
    status: text("status")
      .$type<ConversationStatus>()
      .default("open")
      .notNull(),
    ownerId: text("owner_id").references(() => user.id, {
      onDelete: "set null",
    }),
    messageCount: integer("message_count").notNull().default(0),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    lastMessageFromMe: boolean("last_message_from_me"),
    lastMessagePreview: text("last_message_preview"),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("conversations_wa_account_chat_idx")
      .on(t.waAccountId, t.chatId)
      .where(sql`${t.deletedAt} is null`),
    index("conversations_wa_account_last_message_idx").on(
      t.waAccountId,
      t.lastMessageAt,
    ),
    index("conversations_contact_id_idx").on(t.contactId),
    index("conversations_owner_id_idx").on(t.ownerId),
    index("conversations_status_idx").on(t.status),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    seq: bigserial("seq", { mode: "number" }),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    waAccountId: uuid("wa_account_id")
      .notNull()
      .references(() => waAccounts.id, { onDelete: "cascade" }),
    ownerId: text("owner_id").references(() => user.id, {
      onDelete: "set null",
    }),
    messageId: text("message_id").notNull(),
    fromMe: boolean("from_me").notNull().default(false),
    body: text("body"),
    type: text("type"),
    mediaId: text("media_id").references(() => media.mediaId, {
      onDelete: "set null",
    }),
    mimetype: text("mimetype"),
    filename: text("filename"),
    filesize: integer("filesize"),
    receivedAt: timestamp("received_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("messages_wa_account_message_id_idx")
      .on(t.waAccountId, t.messageId)
      .where(sql`${t.deletedAt} is null`),
    index("messages_conversation_seq_idx").on(t.conversationId, t.seq),
    index("messages_wa_account_received_at_idx").on(
      t.waAccountId,
      t.receivedAt,
    ),
  ],
);

export const conversationReads = pgTable(
  "conversation_reads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lastReadMessageSeq: bigint("last_read_message_seq", { mode: "number" })
      .notNull()
      .default(0),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("conversation_reads_conversation_user_idx").on(
      t.conversationId,
      t.userId,
    ),
    index("conversation_reads_user_idx").on(t.userId),
  ],
);
