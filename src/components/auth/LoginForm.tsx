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
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-hairline bg-card p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <Logo href={"/"} size="lg" variant="full" />
            <h1 className="mt-6 text-2xl font-semibold tracking-[-0.02em] text-foreground">{t("title")}</h1>
            <p className="mt-2 text-sm text-ink-2">{t("description")}</p>
          </div>

          <div className="mt-8 space-y-4">
            <GoogleSsoButton
              onClick={handleGoogleSignIn}
              isLoading={isGoogleLoading}
              label={t("googleButton")}
              labelLoading={t("googleButtonLoading")}
            />

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-2 text-xs font-semibold uppercase tracking-[0.06em] text-ink-3">
                  {t("orContinueWith")}
                </span>
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
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "login-error" : undefined}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("passwordLabel")}</Label>
                  <Link href="/forgot-password" className="text-xs text-ink-2 transition-colors hover:text-accent-text">
                    {t("forgotPassword")}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "login-error" : undefined}
                  required
                />
                {error && (
                  <p id="login-error" role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("signInButton")}
              </Button>
            </form>

            <p className="text-center text-sm text-ink-2">
              {t("noAccount")}{" "}
              <Link
                href={
                  callbackURL !== `/${locale}/dashboard/home`
                    ? `/sign-up?callbackURL=${encodeURIComponent(callbackURL)}`
                    : "/sign-up"
                }
                className="font-medium text-accent-text hover:underline"
              >
                {t("signUpLink")}
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-ink-2">
          {t("termsPrefix")}{" "}
          <Link href="/terms" className="text-accent-text transition-colors hover:underline">
            {t("termsLink")}
          </Link>{" "}
          {t("termsMiddle")}{" "}
          <Link href="/privacy" className="text-accent-text transition-colors hover:underline">
            {t("privacyLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
