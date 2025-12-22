import { cookies, headers } from "next/headers";
import { unstable_noStore } from "next/cache";
import acceptLanguage from "accept-language";
import { defaultLocale, isValidLocale, type Locale } from "./locale";

let initialized = false;

export function initAcceptLanguage(locales: string[]): void {
  if (!initialized) {
    acceptLanguage.languages(locales);
    initialized = true;
  }
}

interface ResolveLocaleOptions {
  urlLocale?: string;
}

export async function resolveLocale(options?: ResolveLocaleOptions): Promise<Locale> {
  const { urlLocale } = options || {};

  if (urlLocale && isValidLocale(urlLocale)) {
    return urlLocale;
  }

  unstable_noStore();

  try {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get("NEXT_LOCALE");
    if (localeCookie?.value && isValidLocale(localeCookie.value)) {
      return localeCookie.value;
    }
  } catch (error) {
    console.debug("Error reading locale cookie:", error);
  }

  try {
    const headersList = await headers();
    const acceptLanguageHeader = headersList.get("accept-language");
    if (acceptLanguageHeader) {
      const detectedLocale = acceptLanguage.get(acceptLanguageHeader);
      if (detectedLocale && isValidLocale(detectedLocale)) {
        return detectedLocale;
      }
    }
  } catch (error) {
    console.warn("Error reading Accept-Language header:", error);
  }

  return defaultLocale;
}
