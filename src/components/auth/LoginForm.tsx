"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useLocale } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { Logo } from "@/components/ui/Logo";
import { GoogleSsoButton } from "@/components/ui/google-sso-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { sileo } from "sileo";
import { useTranslations } from "next-intl";
import { useAuthError } from "@/hooks/use-auth-error";

export function LoginForm() {
  const t = useTranslations("auth.loginPage");
  const getAuthError = useAuthError();
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      sileo.error({ title: getAuthError(error.message) });
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      setError(getAuthError(error.message));
      setIsLoading(false);
      return;
    }

    router.push(callbackURL);
    router.refresh();
  };

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

            <form onSubmit={handleEmailSignIn} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("passwordLabel")}</Label>
                  <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
                    {t("forgotPassword")}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("signInButton")}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {t("noAccount")}{" "}
              <Link
                href={
                  callbackURL !== `/${locale}/dashboard/home`
                    ? `/sign-up?callbackURL=${encodeURIComponent(callbackURL)}`
                    : "/sign-up"
                }
                className="font-medium text-primary hover:underline"
              >
                {t("signUpLink")}
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("termsPrefix")}{" "}
          <Link href="/terms" className="text-primary transition-all hover:underline">
            {t("termsLink")}
          </Link>{" "}
          {t("termsMiddle")}{" "}
          <Link href="/privacy" className="text-primary transition-all hover:underline">
            {t("privacyLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
