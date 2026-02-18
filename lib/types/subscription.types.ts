import type { Subscription as DrizzleSubscription } from "@/lib/db/schema";

export type BillingInterval = "monthly" | "yearly";

export type Subscription = DrizzleSubscription;
