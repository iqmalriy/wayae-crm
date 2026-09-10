CREATE TABLE "contact_phone_reveal_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"contact_id" uuid NOT NULL,
	"user_id" text,
	"role" text,
	"revealed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "contact_phone_reveal_log_contactId_idx" ON "contact_phone_reveal_log" ("contact_id");--> statement-breakpoint
CREATE INDEX "contact_phone_reveal_log_userId_idx" ON "contact_phone_reveal_log" ("user_id");--> statement-breakpoint
ALTER TABLE "contact_phone_reveal_log" ADD CONSTRAINT "contact_phone_reveal_log_contact_id_contacts_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "contact_phone_reveal_log" ADD CONSTRAINT "contact_phone_reveal_log_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;