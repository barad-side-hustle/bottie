"use client";

import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useAuthError } from "@/hooks/use-auth-error";

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPasswordPage");
  const getAuthError = useAuthError();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    if (error) {
      setError(getAuthError(error.message));
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper p-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-hairline bg-card p-8 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <Logo href={"/"} size="lg" variant="full" />
              <MailCheck className="mt-6 size-6 text-ink-3" aria-hidden="true" />
              <h1 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-foreground">{t("checkEmailTitle")}</h1>
              <p className="mt-2 text-sm text-ink-2">{t("checkEmailDescription", { email })}</p>
            </div>

            <div className="mt-8">
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">{t("backToSignIn")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-hairline bg-card p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <Logo href={"/"} size="lg" variant="full" />
            <h1 className="mt-6 text-2xl font-semibold tracking-[-0.02em] text-foreground">{t("title")}</h1>
            <p className="mt-2 text-sm text-ink-2">{t("description")}</p>
          </div>

          <div className="mt-8 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("emailLabel")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "forgot-error" : undefined}
                  required
                />
                {error && (
                  <p id="forgot-error" role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("sendResetLink")}
              </Button>
            </form>

            <p className="text-center text-sm text-ink-2">
              {t("rememberPassword")}{" "}
              <Link href="/login" className="font-medium text-accent-text hover:underline">
                {t("signInLink")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
