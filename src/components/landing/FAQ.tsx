"use client";

import { Card } from "@/components/ui/card";
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

        <div className="max-w-3xl mx-auto space-y-4">
          {Array.from({ length: FAQ_ITEM_COUNT }).map((_, index) => (
            <div
              key={index}
              className="group relative hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />

              <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/15 rounded-lg transition-all duration-500" />

              <Card className="relative overflow-hidden border border-border/40 shadow-sm hover:shadow-md rounded-lg bg-card">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-start p-6 flex items-center justify-between hover:bg-secondary/50 transition-all duration-300 cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-foreground pe-4">{t(`items.${index}.question`)}</h3>
                  <div className={cn("transition-transform duration-300", openIndex === index && "rotate-180")}>
                    <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </button>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows,opacity] duration-300",
                    openIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-0">
                      <p className="text-muted-foreground leading-relaxed">{t(`items.${index}.answer`)}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
