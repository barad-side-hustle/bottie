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
    <div className="h-fit rounded-lg border border-hairline bg-surface p-6 lg:sticky lg:top-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-3">{t("toneOfVoice")}</Label>
          <div className="flex flex-wrap gap-2">
            {toneOptions.map((option) => (
              <ToggleChip key={option} selected={tone === option} onToggle={() => onToneChange(option)}>
                {t(`toneOptions.${option}`)}
              </ToggleChip>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-3">{t("language")}</Label>
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
