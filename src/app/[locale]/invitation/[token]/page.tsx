import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { acceptInvitation } from "@/lib/actions/location-members.actions";

export const dynamic = "force-dynamic";

export default async function InvitationPage({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params;

  try {
    await getAuthenticatedUserId();
  } catch {
    const returnUrl = encodeURIComponent(`/${locale}/invitation/${token}`);
    redirect(`/${locale}/login?callbackURL=${returnUrl}`);
  }

  try {
    const member = await acceptInvitation({ token });
    redirect(`/${locale}/dashboard/locations/${member.locationId}/reviews`);
  } catch (err) {
    const t = await getTranslations({ locale, namespace: "invitation" });
    const message = err instanceof Error ? err.message : t("genericError");

    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-muted-foreground">{message}</p>
          <a href={`/${locale}/dashboard/home`} className="inline-block text-primary underline underline-offset-4">
            {t("goToDashboard")}
          </a>
        </div>
      </div>
    );
  }
}
