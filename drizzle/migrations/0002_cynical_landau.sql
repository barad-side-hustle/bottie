ALTER TABLE "reviews" ADD COLUMN "classifications" jsonb;--> statement-breakpoint
CREATE INDEX "reviews_business_date_idx" ON "reviews" USING btree ("business_id","date");