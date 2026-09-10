ALTER TABLE "customers" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "department";--> statement-breakpoint
ALTER TABLE "customer_organizations" ALTER COLUMN "status" SET DEFAULT 'active';