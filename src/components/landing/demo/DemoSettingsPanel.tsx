"use client";

import { Label } from "@/components/ui/label";
import { ToggleChip } from "@/components/ui/toggle-chip";
import type { ToneOfVoice } from "@/lib/types";
import { useTranslations } from "next-intl";
import type { DemoLanguage } from "./demo-data";

interface DemoSettingsPanelProps {
  tone: ToneOfVoice;
  language: DemoLanguage;
  onToneChange: (value: ToneOfVoice) => void;
  onLanguageChange: (value: DemoLanguage) => void;
}

const toneOptions: ToneOfVoice[] = ["professional", "friendly", "formal", "humorous"];
const languageOptions: DemoLanguage[] = ["auto-detect", "english", "hebrew", "spanish"];

export function DemoSettingsPanel({ tone, language, onToneChange, onLanguageChange }: DemoSettingsPanelProps) {
  const t = useTranslations("landing.demo.settings");

  return (
    <div className="rounded-2xl border border-border/60 bg-primary/[0.03] shadow-sm p-6 lg:sticky lg:top-8 h-fit">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t("toneOfVoice")}
          </Label>
          <div className="flex flex-wrap gap-2">
            {toneOptions.map((option) => (
              <ToggleChip key={option} selected={tone === option} onToggle={() => onToneChange(option)}>
                {t(`toneOptions.${option}`)}
              </ToggleChip>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("language")}</Label>
          <div className="flex flex-wrap gap-2">
            {languageOptions.map((option) => (
              <ToggleChip key={option} selected={language === option} onToggle={() => onLanguageChange(option)}>
                {t(`languageOptions.${option === "auto-detect" ? "autoDetect" : option}`)}
              </ToggleChip>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
