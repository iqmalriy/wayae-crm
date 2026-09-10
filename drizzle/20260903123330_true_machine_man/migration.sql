ALTER TABLE "contact_interactions" ADD COLUMN "saved_name" text;--> statement-breakpoint
ALTER TABLE "contact_interactions" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "contact_interactions" ALTER COLUMN "first_interaction_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "contact_interactions" ALTER COLUMN "first_interaction_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "contact_interactions" ALTER COLUMN "last_interaction_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "contact_interactions" ALTER COLUMN "last_interaction_at" DROP NOT NULL;