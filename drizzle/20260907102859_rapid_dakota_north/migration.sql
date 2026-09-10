ALTER TABLE "tasks" DROP CONSTRAINT "tasks_approved_by_id_user_id_fkey";--> statement-breakpoint
DROP INDEX "tasks_review_status_idx";--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "requires_approval";--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "review_status";--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "approved_by_id";--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "approved_at";