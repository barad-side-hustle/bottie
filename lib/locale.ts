export type Locale = "en" | "he" | "es";

export const locales: Locale[] = ["en", "he", "es"] as const;
export const defaultLocale: Locale = "en";

type dirType = "ltr" | "rtl";

export const localeConfig = {
  en: {
    label: "English",
    dir: "ltr" as dirType,
  },
  he: {
    label: "עברית",
    dir: "rtl" as dirType,
  },
  es: {
    label: "Español",
    dir: "ltr" as dirType,
  },
} as const;

export const localeCodeMap: Record<Locale, string> = {
  en: "en_US",
  he: "he_IL",
  es: "es_ES",
};

export const localeDateMap: Record<Locale, string> = {
  en: "en-US",
  he: "he-IL",
  es: "es-ES",
};

export function getLocaleCode(locale: Locale): string {
  return localeCodeMap[locale];
}

export function getLocaleDir(locale: Locale): "ltr" | "rtl" {
  return localeConfig[locale].dir;
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
