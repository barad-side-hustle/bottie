ALTER TABLE "subscriptions" RENAME COLUMN "stripe_customer_id" TO "polar_customer_id";--> statement-breakpoint
ALTER TABLE "subscriptions" RENAME COLUMN "stripe_subscription_id" TO "polar_subscription_id";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "plan_tier";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "stripe_price_id";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "feature_overrides";