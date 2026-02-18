import { sql } from "drizzle-orm";

export const serviceRolePolicy = {
  for: "all" as const,
  to: ["postgres", "service_role"] as const,
  using: sql`true`,
  withCheck: sql`true`,
};
