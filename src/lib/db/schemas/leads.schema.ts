import { doublePrecision, index, pgSequence, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth.schema";
import { contacts } from "./contacts.schema";
import { customers } from "./costumers.schema";
import { customerOrganizations } from "./costumers.schema";

export const leadSources = ["inbound", "manual", "referral", "campaign"] as const;
export type LeadSource = (typeof leadSources)[number];

export const leadStages = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
] as const;
export type LeadStage = (typeof leadStages)[number];

export const leadNumberSequence = pgSequence("leads_lead_number_seq", {
  startWith: 1,
  increment: 1,
});

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Human-readable global identifier, e.g. "L-0001".
    leadNumber: text("lead_number").notNull(),

    // Scratchpad identity — provisional, not the canonical source of truth.
    name: text("name"),
    company: text("company"),
    phoneNumber: text("phone_number"),
    email: text("email"),

    // Pipeline
    stage: text("stage").$type<LeadStage>().default("new").notNull(),
    source: text("source").$type<LeadSource>().default("inbound").notNull(),
    ownerId: text("owner_id").references(() => user.id, {
      onDelete: "set null",
    }),
    assigneeId: text("assignee_id").references(() => user.id, {
      onDelete: "set null",
    }),
    estimatedValue: doublePrecision("estimated_value"),
    notes: text("notes"),

    // Optional links to canonical records once the lead is qualified.
    contactId: uuid("contact_id").references(() => contacts.id, {
      onDelete: "set null",
    }),
    customerOrganizationId: text("customer_organization_id").references(
      () => customerOrganizations.id,
      { onDelete: "set null" },
    ),
    customerId: text("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),

    // Outcome timestamps
    wonAt: timestamp("won_at", { withTimezone: true }),
    lostAt: timestamp("lost_at", { withTimezone: true }),
    stageChangedAt: timestamp("stage_changed_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("leads_owner_id_idx").on(t.ownerId),
    index("leads_assignee_id_idx").on(t.assigneeId),
    index("leads_stage_idx").on(t.stage),
    index("leads_source_idx").on(t.source),
    index("leads_contact_id_idx").on(t.contactId),
    index("leads_customer_org_id_idx").on(t.customerOrganizationId),
    index("leads_customer_id_idx").on(t.customerId),
    index("leads_stage_changed_at_idx").on(t.stageChangedAt),
    uniqueIndex("leads_phone_unique_idx")
      .on(t.phoneNumber)
      .where(
        sql`${t.deletedAt} is null and ${t.stage} <> 'lost'`,
      ),
    uniqueIndex("leads_lead_number_unique_idx").on(t.leadNumber),
  ],
);

export const leadActivities = pgTable(
  "lead_activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    body: text("body"),
    performedById: text("performed_by_id").references(() => user.id, {
      onDelete: "set null",
    }),

    // Only set for system-generated stage changes.
    fromStage: text("from_stage"),
    toStage: text("to_stage"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("lead_activities_lead_created_idx").on(t.leadId, t.createdAt),
    index("lead_activities_performed_by_idx").on(t.performedById),
  ],
);

export const taskStatuses = [
  "todo",
  "in_progress",
  "done",
] as const;
export type TaskStatus = (typeof taskStatuses)[number];

export const taskPriorities = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof taskPriorities)[number];

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id").references(() => leads.id, {
      onDelete: "cascade",
    }),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").$type<TaskStatus>().default("todo").notNull(),
    priority: text("priority").$type<TaskPriority>().default("medium").notNull(),
    assigneeId: text("assignee_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdById: text("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    dueAt: timestamp("due_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("tasks_lead_id_idx").on(t.leadId),
    index("tasks_assignee_id_idx").on(t.assigneeId),
    index("tasks_created_by_id_idx").on(t.createdById),
    index("tasks_status_idx").on(t.status),
    index("tasks_due_at_idx").on(t.dueAt),
  ],
);