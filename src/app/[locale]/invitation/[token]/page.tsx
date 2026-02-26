import { redirect } from "next/navigation";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { acceptInvitation } from "@/lib/actions/location-members.actions";
import { InvitationErrorClient } from "./InvitationErrorClient";

export const dynamic = "force-dynamic";

const errorKeyMap: Record<string, string> = {
  INVITATION_NOT_FOUND: "notFound",
  INVITATION_CANCELLED: "cancelled",
  INVITATION_ALREADY_USED: "alreadyUsed",
  INVITATION_EXPIRED: "expired",
  INVITATION_EMAIL_MISMATCH: "emailMismatch",
  INVITATION_INVALID: "notFound",
};

export default async function InvitationPage({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params;

  try {
    await getAuthenticatedUserId();
  } catch {
    const returnUrl = encodeURIComponent(`/${locale}/invitation/${token}`);
    redirect(`/${locale}/login?callbackURL=${returnUrl}`);
  }

  let redirectTo: string | null = null;
  let errorKey: string | null = null;

  try {
    const member = await acceptInvitation({ token });
    redirectTo = `/${locale}/dashboard/locations/${member.locationId}/reviews`;
  } catch (err) {
    const rawMessage = err instanceof Error ? err.message : "";
    errorKey = errorKeyMap[rawMessage] || "genericError";
  }

  if (redirectTo) {
    redirect(redirectTo);
  }

  return <InvitationErrorClient errorKey={errorKey!} locale={locale} />;
}
