"use client";

import { Link } from "@/i18n/routing";
import { Mail, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  const t = useTranslations("landing.footer");
  const currentYear = new Date().getFullYear();

  const linkClass = "text-sm text-ink-2 hover:text-foreground transition-colors cursor-pointer";
  const headingClass = "mb-4 text-xs font-semibold uppercase tracking-[0.06em] text-ink-2";

  return (
    <footer className="border-t border-border bg-surface pb-16 md:pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo href="/" variant="full" size="lg" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-2">{t("company.description")}</p>
            <div className="mt-5 flex flex-col gap-2">
              <Link href="/contact" className={`flex items-center gap-2 ${linkClass}`}>
                <Mail className="size-4" />
                <span>{t("company.contact")}</span>
              </Link>
              <div className="flex items-center gap-2 text-sm text-ink-2">
                <MapPin className="size-4" />
                <span>{t("company.location")}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className={headingClass}>{t("product.title")}</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  className={linkClass}
                >
                  {t("product.howItWorks")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                  className={linkClass}
                >
                  {t("product.pricing")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })}
                  className={linkClass}
                >
                  {t("product.faq")}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={headingClass}>{t("legal.title")}</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className={linkClass}>
                  {t("legal.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className={linkClass}>
                  {t("legal.terms")}
                </Link>
              </li>
              <li>
                <Link href="/about" className={linkClass}>
                  {t("legal.about")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between gap-2 border-t border-border py-6 sm:gap-4">
          <p className="text-xs text-ink-2 sm:text-sm">{t("copyright", { year: currentYear })}</p>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
