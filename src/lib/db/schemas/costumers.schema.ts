import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

export const organizationTypes = ["enterprise", "individual"] as const;
export type OrganizationType = (typeof organizationTypes)[number];

export const organizationStatuses = ["prospect", "active", "churned"] as const;
export type OrganizationStatus = (typeof organizationStatuses)[number];

export const customerOrganizations = pgTable(
  "customer_organizations",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    legalName: text("legal_name"),
    npwp: text("npwp"),
    industry: text("industry"),
    address: text("address"),
    organizationType: text("organization_type").$type<OrganizationType>(),
    status: text("status")
      .$type<OrganizationStatus>()
      .default("active")
      .notNull(),
    accountOwnerId: text("account_owner_id").references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    churnedAt: timestamp("churned_at", { withTimezone: true }),
    prospectAt: timestamp("prospect_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("customer_organizations_accountOwnerId_idx").on(table.accountOwnerId),
  ],
);

export const customerStatuses = ["active", "inactive"] as const;
export type CustomerStatus = (typeof customerStatuses)[number];

export const customers = pgTable(
  "customers",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").references(
      () => customerOrganizations.id,
    ),
    fullName: text("full_name").notNull(),
    jobTitle: text("job_title"),
    email: text("email"),
    notes: text("notes"),
    isDecisionMaker: boolean("is_decision_maker").default(false).notNull(),
    isPrimaryContact: boolean("is_primary_contact").default(false).notNull(),
    createdById: text("created_by_id").references(() => user.id),
    status: text("status").$type<CustomerStatus>().default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("customers_organizationId_idx").on(table.organizationId),
    index("customers_email_idx").on(table.email),
    index("customers_createdById_idx").on(table.createdById),
  ],
);
