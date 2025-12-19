import { createActionClient } from "@/lib/supabase/action";
import { NextRequest } from "next/server";
import { createLocaleAwareRedirect } from "@/lib/api/auth";
import { isNewUserSignup } from "@/lib/utils/user-helpers";
import { sendNewUserNotification, sendUserWelcomeEmail } from "@/lib/utils/email-service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard/home";

  if (code) {
    const supabase = await createActionClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const userId = data.user.id;

      const newUser = await isNewUserSignup(userId);

      if (newUser) {
        const userEmail = data.user.email;

        if (!userEmail) {
          console.warn("[auth/callback] New user signup detected but no email available:", {
            userId,
            userMetadata: data.user.user_metadata,
          });
        } else {
          const userName =
            data.user.user_metadata?.full_name || data.user.user_metadata?.name || userEmail.split("@")[0];

          console.log("[auth/callback] New user signup detected:", {
            userId,
            userEmail,
          });

          sendNewUserNotification({
            userEmail,
            userName: userName || "New User",
            userId,
            signupTimestamp: new Date(),
          }).catch((error) => {
            console.error("[auth/callback] Failed to send admin notification:", error);
          });

          sendUserWelcomeEmail({
            userEmail,
            userName: userName || "there",
            userId,
          }).catch((error) => {
            console.error("[auth/callback] Failed to send welcome email:", error);
          });
        }
      }

      return await createLocaleAwareRedirect(next, undefined, userId);
    }
  }

  return await createLocaleAwareRedirect("/auth-code-error");
}
