ALTER TABLE "review_responses" ADD COLUMN "feedback" text;--> statement-breakpoint
ALTER TABLE "review_responses" ADD COLUMN "feedback_comment" text;--> statement-breakpoint
CREATE INDEX "review_responses_location_feedback_created_idx" ON "review_responses" USING btree ("location_id","feedback","created_at");--> statement-breakpoint
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_feedback_check" CHECK ("review_responses"."feedback" IS NULL OR "review_responses"."feedback" IN ('liked', 'disliked'));