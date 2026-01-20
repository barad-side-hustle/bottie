import { createServerClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();

  return { supabaseResponse, user: data?.claims?.sub ? { id: data.claims.sub } : null, supabase };
}

export async function checkOnboardingStatus(supabase: SupabaseClient, userId: string) {
  try {
    const { data: userAccounts } = await supabase.from("user_accounts").select("account_id").eq("user_id", userId);

    if (!userAccounts || userAccounts.length === 0) return false;

    const accountIds = userAccounts.map((ua: { account_id: string }) => ua.account_id);

    const { count } = await supabase
      .from("account_locations")
      .select("*", { count: "exact", head: true })
      .in("account_id", accountIds);

    return (count || 0) > 0;
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return false;
  }
}
