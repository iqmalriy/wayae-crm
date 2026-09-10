import {
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

export const waAccounts = pgTable(
  "wa_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    phone: text("phone").notNull(),
    label: text("label").notNull().default(""),
    tokenHash: text("token_hash").notNull(),
    lastHeartbeatAt: timestamp("last_heartbeat_at", { withTimezone: true }),
    extVersion: text("ext_version"),
    protocolVersion: text("protocol_version"),
    queueSize: integer("queue_size"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("wa_account_user_phone_idx")
      .on(t.userId, t.phone)
      .where(sql`${t.deletedAt} is null`),
    uniqueIndex("wa_accounts_token_hash_idx").on(t.tokenHash),
    index("wa_account_user_idx").on(t.userId),
  ],
);

export const waAccountHeartbeats = pgTable(
  "wa_account_heartbeats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    waAccountId: uuid("wa_account_id")
      .notNull()
      .references(() => waAccounts.id, { onDelete: "cascade" }),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("wa_account_heartbeats_account_received_idx").on(
      t.waAccountId,
      t.receivedAt,
    ),
    index("wa_account_heartbeats_waAccountId_idx").on(t.waAccountId),
  ],
);
