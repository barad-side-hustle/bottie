"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useAuthError } from "@/hooks/use-auth-error";

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("auth.resetPasswordPage");
  const getAuthError = useAuthError();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("passwordsMismatch"));
      return;
    }

    setLoading(true);

    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
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
                <CheckCircle2 className="size-7" />
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">{t("successTitle")}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{t("successDescription")}</p>
            </div>

            <div className="mt-8">
              <Button asChild className="w-full">
                <Link href="/login">{t("goToSignIn")}</Link>
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
                <Label htmlFor="password">{t("newPasswordLabel")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("newPasswordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("confirmPasswordLabel")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t("confirmPasswordPlaceholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("resetButton")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
