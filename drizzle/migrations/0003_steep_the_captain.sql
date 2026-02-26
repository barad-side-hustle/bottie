ALTER TABLE "reviews" DROP CONSTRAINT "reviews_reply_status_check";--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "failure_reason" text;--> statement-breakpoint
UPDATE "reviews" SET "reply_status" = 'failed', "failure_reason" = 'quota' WHERE "reply_status" = 'quota_exceeded';--> statement-breakpoint
UPDATE "reviews" SET "failure_reason" = 'generation' WHERE "reply_status" = 'failed' AND "failure_reason" IS NULL;--> statement-breakpoint
DELETE FROM "reviews" WHERE "reply_status" = 'rejected';--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_failure_reason_check" CHECK ("reviews"."failure_reason" IS NULL OR "reviews"."failure_reason" IN ('generation', 'posting', 'quota'));--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reply_status_check" CHECK ("reviews"."reply_status" IN ('pending', 'posted', 'failed'));
