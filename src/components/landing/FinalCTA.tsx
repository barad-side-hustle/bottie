"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SectionBlock, SectionHeading } from "@/components/ui/section-block";

export function FinalCTA() {
  const t = useTranslations("landing.finalCTA");

  return (
    <SectionBlock
      tone="primary"
      width="md"
      className="overflow-hidden rounded-t-[2rem] md:rounded-t-[3rem] lg:rounded-t-[4rem]"
    >
      <div className="flex flex-col items-center text-center">
        <SectionHeading inverted title={t("title")} subtitle={t("description")} />

        <div className="mt-10">
          <Button asChild size="pill" className="bg-card text-primary shadow-lg hover:bg-card/90">
            <Link href="/login">{t("cta")}</Link>
          </Button>
        </div>

        <p className="mt-8 text-sm text-primary-foreground/60">{t("noCreditCard")}</p>
      </div>
    </SectionBlock>
  );
}
