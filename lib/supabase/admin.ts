import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export function createAdminClient() {
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    cookies: {
      getAll() {
        return [];
      },
      setAll(_cookiesToSet) {},
    },
  });
}
