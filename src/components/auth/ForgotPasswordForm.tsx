"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-background to-muted p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Logo className="justify-center mb-4" href={"/"} size="xl" variant="full" />
          </div>
          <DashboardCard>
            <DashboardCardHeader className="text-center">
              <DashboardCardTitle className="justify-center">{t("checkEmailTitle")}</DashboardCardTitle>
              <DashboardCardDescription>{t("checkEmailDescription", { email })}</DashboardCardDescription>
            </DashboardCardHeader>
            <DashboardCardContent>
              <Link href="/login">
                <Button variant="outline" className="w-full cursor-pointer">
                  {t("backToSignIn")}
                </Button>
              </Link>
            </DashboardCardContent>
          </DashboardCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="justify-center mb-4" href={"/"} size="xl" variant="full" />
        </div>

        <DashboardCard>
          <DashboardCardHeader className="text-center">
            <DashboardCardTitle className="justify-center">{t("title")}</DashboardCardTitle>
            <DashboardCardDescription>{t("description")}</DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-4">
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

              {error && <p className="text-destructive text-sm">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("sendResetLink")}
              </Button>
            </form>

            <p className="text-muted-foreground text-center text-sm">
              {t("rememberPassword")}{" "}
              <Link href="/login" className="text-primary hover:underline">
                {t("signInLink")}
              </Link>
            </p>
          </DashboardCardContent>
        </DashboardCard>
      </div>
    </div>
  );
}
