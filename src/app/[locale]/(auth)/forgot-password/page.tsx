import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  await params;

  return <ForgotPasswordForm />;
}
