import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth.schema";
import { customers } from "./costumers.schema";
import { waAccounts } from "./whatsapp_accounts";

export const waIdTypes = ["c_us", "lid", "unknown"] as const;
export type WaIdType = (typeof waIdTypes)[number];

export const contactSources = ["inbound", "manual"] as const;
export type ContactSource = (typeof contactSources)[number];

export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    waJid: text("wa_jid"),
    waIdType: text("wa_id_type").$type<WaIdType>().default("unknown"),

    phoneNumber: text("phone_number").notNull(),
    displayName: text("display_name").notNull(),
    description: text("description"),
    isBusiness: boolean("is_business").notNull().default(false),
    addedBy: text("added_by").references(() => user.id),
    customerId: text("customer_id").references(() => customers.id),
    source: text("source").$type<ContactSource>().default("inbound").notNull(),

    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("contacts_waJid_idx")
      .on(table.waJid)
      .where(sql`${table.deletedAt} is null`),
    uniqueIndex("contacts_phoneNumber_unique_idx")
      .on(table.phoneNumber)
      .where(sql`${table.deletedAt} is null`),
    index("contacts_addedBy_idx").on(table.addedBy),
    index("contacts_customerId_idx").on(table.customerId),
    index("contacts_source_idx").on(table.source),
  ],
);

export const contactInteractions = pgTable(
  "contact_interactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    waAccountId: uuid("wa_account_id").references(() => waAccounts.id, {
      onDelete: "cascade",
    }),
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    savedName: text("saved_name"),
    firstInteractionAt: timestamp("first_interaction_at", {
      withTimezone: true,
    }),
    lastInteractionAt: timestamp("last_interaction_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("contact_interactions_contact_waAccount_idx").on(
      table.contactId,
      table.waAccountId,
    ),
    index("contact_interactions_waAccountId_idx").on(table.waAccountId),
    index("contact_interactions_userId_idx").on(table.userId),
  ],
);

export const contactPhoneRevealLogs = pgTable(
  "contact_phone_reveal_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    role: text("role"),
    reason: text("reason"),
    revealedAt: timestamp("revealed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("contact_phone_reveal_log_contactId_idx").on(table.contactId),
    index("contact_phone_reveal_log_userId_idx").on(table.userId),
  ],
);
