"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { SectionBlock, SectionHeading } from "@/components/ui/section-block";
import { cn } from "@/lib/utils";

const FAQ_ITEM_COUNT = 10;

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const t = useTranslations("landing.faq");

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <SectionBlock tone="cream" id="faq" tabIndex={-1} width="sm">
      <SectionHeading title={t("title")} subtitle={t("subtitle")} />

      <div className="mt-12 divide-y divide-hairline overflow-hidden rounded-lg border border-hairline bg-surface">
        {Array.from({ length: FAQ_ITEM_COUNT }).map((_, index) => (
          <div key={index}>
            <button
              onClick={() => toggleFAQ(index)}
              className="flex w-full cursor-pointer items-center justify-between px-6 py-5 text-start transition-colors hover:bg-surface-3"
            >
              <h3 className="pe-4 text-base font-medium text-foreground">{t(`items.${index}.question`)}</h3>
              <div className={cn("shrink-0 transition-transform duration-300", openIndex === index && "rotate-180")}>
                <ChevronDown className="size-4 text-ink-3" />
              </div>
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300",
                openIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-5 pt-0">
                  <p className="text-sm leading-relaxed text-ink-2">{t(`items.${index}.answer`)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionBlock>
  );
}
