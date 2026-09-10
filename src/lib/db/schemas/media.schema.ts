import {
  bigint,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { waAccounts } from "./whatsapp_accounts";

export const mediaStatuses = ["stored", "pending", "failed"] as const;
export type MediaStatus = (typeof mediaStatuses)[number];

export const mediaStorageProviders = ["s3", "local"] as const;
export type MediaStorageProvider = (typeof mediaStorageProviders)[number];

export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    waAccountId: uuid("wa_account_id")
      .notNull()
      .references(() => waAccounts.id, { onDelete: "cascade" }),
    messageId: text("message_id"),
    mediaId: text("media_id").notNull(),
    status: text("status")
      .$type<MediaStatus>()
      .default("stored")
      .notNull(),
    storageProvider: text("storage_provider").$type<MediaStorageProvider>(),
    storageKey: text("storage_key"),
    mimetype: text("mimetype"),
    filename: text("filename"),
    filesize: bigint("filesize", { mode: "number" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("media_media_id_idx").on(t.mediaId),
    index("media_wa_account_id_idx").on(t.waAccountId),
    index("media_message_id_idx").on(t.messageId),
  ],
);