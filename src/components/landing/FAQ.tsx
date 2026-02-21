"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const FAQ_ITEM_COUNT = 8;

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const t = useTranslations("landing.faq");

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div id="faq" tabIndex={-1}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">{t("title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        <div className="max-w-3xl mx-auto rounded-2xl border border-border/60 bg-primary/[0.03] shadow-sm overflow-hidden divide-y divide-border/40">
          {Array.from({ length: FAQ_ITEM_COUNT }).map((_, index) => (
            <div key={index}>
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-start px-6 py-5 flex items-center justify-between cursor-pointer"
              >
                <h3 className="text-base font-medium text-foreground pe-4">{t(`items.${index}.question`)}</h3>
                <div className={cn("transition-transform duration-300 shrink-0", openIndex === index && "rotate-180")}>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
                    <p className="text-sm text-muted-foreground leading-relaxed">{t(`items.${index}.answer`)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
