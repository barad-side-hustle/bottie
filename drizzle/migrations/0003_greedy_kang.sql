ALTER TABLE "businesses" ADD COLUMN "google_location_id" text;--> statement-breakpoint
CREATE INDEX "businesses_google_location_id_idx" ON "businesses" USING btree ("google_location_id");