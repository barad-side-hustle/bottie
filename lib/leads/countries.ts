import type { Locale } from "@/lib/locale";

export interface CountryConfig {
  code: string;
  locale: Locale;
  dir: "ltr" | "rtl";
  countrySuffix: string;
  cities: string[];
  queryTemplates: string[];
  citiesPerRun: number;
  emailSender: string;
  emailReplyTo: string;
  needsTranslation: boolean;
}
