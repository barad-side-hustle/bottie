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
import { GoogleSsoButton } from "@/components/ui/google-sso-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { useAuthError } from "@/hooks/use-auth-error";

export function SignUpForm() {
  const t = useTranslations("auth.signUpPage");
  const getAuthError = useAuthError();
  const locale = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);

    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: `/${locale}/dashboard/home`,
    });

    if (error) {
      setError(getAuthError(error.message));
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
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
                  {t("goToSignIn")}
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
          <p className="text-muted-foreground">{t("tagline")}</p>
        </div>

        <DashboardCard>
          <DashboardCardHeader className="text-center">
            <DashboardCardTitle className="justify-center">{t("title")}</DashboardCardTitle>
            <DashboardCardDescription>{t("description")}</DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-4">
            <GoogleSsoButton
              onClick={handleGoogleSignIn}
              isLoading={isGoogleLoading}
              label={t("googleButton")}
              labelLoading={t("googleButtonLoading")}
            />

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card text-muted-foreground px-2">{t("orContinueWith")}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("nameLabel")}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t("namePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="password">{t("passwordLabel")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("createAccountButton")}
              </Button>
            </form>

            <p className="text-muted-foreground text-center text-sm">
              {t("hasAccount")}{" "}
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
