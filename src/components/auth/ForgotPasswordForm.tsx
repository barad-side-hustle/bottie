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
      <div className="flex min-h-screen flex-col items-center justify-center bg-pastel-cream p-4">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <Logo href={"/"} size="lg" variant="full" />
              <div className="mt-6 flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
                <MailCheck className="size-7" />
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">{t("checkEmailTitle")}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{t("checkEmailDescription", { email })}</p>
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-pastel-cream p-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <Logo href={"/"} size="lg" variant="full" />
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
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
                  required
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("sendResetLink")}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {t("rememberPassword")}{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                {t("signInLink")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
