"use client";

import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Logo } from "@/components/ui/Logo";
import { GoogleSsoButton } from "@/components/ui/google-sso-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("callbackURL") || `/${locale}/dashboard/home`;

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);

    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL,
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
                <Link
                  href={
                    callbackURL !== `/${locale}/dashboard/home`
                      ? `/login?callbackURL=${encodeURIComponent(callbackURL)}`
                      : "/login"
                  }
                >
                  {t("goToSignIn")}
                </Link>
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
            <GoogleSsoButton
              onClick={handleGoogleSignIn}
              isLoading={isGoogleLoading}
              label={t("googleButton")}
              labelLoading={t("googleButtonLoading")}
            />

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t("orContinueWith")}</span>
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

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("createAccountButton")}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {t("hasAccount")}{" "}
              <Link
                href={
                  callbackURL !== `/${locale}/dashboard/home`
                    ? `/login?callbackURL=${encodeURIComponent(callbackURL)}`
                    : "/login"
                }
                className="font-medium text-primary hover:underline"
              >
                {t("signInLink")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
