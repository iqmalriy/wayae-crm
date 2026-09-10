ALTER TABLE "customers" DROP CONSTRAINT "customers_email_key";--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "email" DROP NOT NULL;