const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const CONTACT_PATHS = ["/contact", "/about", "/צור-קשר", "/contact-us"];

const NOISE_DOMAINS = [
  "example.com",
  "mysite.com",
  "email.com",
  "sentry.io",
  "wixpress.com",
  "wix.com",
  "wordpress.org",
  "wordpress.com",
  "w3.org",
  "schema.org",
  "googleapis.com",
  "google.com",
  "facebook.com",
  "twitter.com",
  "instagram.com",
  "wolt.com",
  "10bis.co.il",
  "weizmann.ac.il",
  "gov.il",
  "masorti.org.il",
  "melisron.co.il",
  "media-maven.co.il",
  "popway.co.il",
  "r2m.co.il",
  "o-s-yazamut.com",
];

const VALID_TLDS = new Set([
  "com",
  "co.il",
  "org.il",
  "net.il",
  "ac.il",
  "gov.il",
  "il",
  "org",
  "net",
  "io",
  "co",
  "ai",
  "me",
  "info",
  "biz",
  "show",
]);

const GENERIC_PREFIXES = ["info@", "noreply@", "no-reply@", "support@", "hello@", "contact@", "office@", "admin@"];

function cleanEmail(email: string): string {
  let cleaned = decodeURIComponent(email).trim();
  cleaned = cleaned.replace(/[^\x20-\x7E@.]/g, "");
  return cleaned;
}

function isValidEmail(email: string): boolean {
  const parts = email.split("@");
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  if (!local || !domain) return false;

  if (local.length > 64 || local.includes(" ")) return false;

  const domainParts = domain.split(".");
  if (domainParts.length < 2) return false;

  const lastTwo = domainParts.slice(-2).join(".");
  const lastOne = domainParts[domainParts.length - 1];
  if (!VALID_TLDS.has(lastTwo) && !VALID_TLDS.has(lastOne)) {
    if (lastOne.length < 2 || lastOne.length > 3) return false;
  }

  if (lastOne.length > 3 && !/[aeiou]/i.test(lastOne)) return false;

  return true;
}

async function fetchPageEmails(url: string): Promise<string[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);
    if (!res.ok) return [];

    const html = await res.text();
    const matches = html.match(EMAIL_REGEX) || [];

    return matches
      .map((e) => cleanEmail(e))
      .filter((email) => {
        if (!email) return false;
        const lower = email.toLowerCase();
        if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".svg")) return false;
        if (NOISE_DOMAINS.some((d) => lower.includes(d))) return false;
        if (!isValidEmail(lower)) return false;
        return true;
      });
  } catch {
    return [];
  }
}

export async function scrapeEmails(websiteUrl: string): Promise<string[]> {
  const emails = new Set<string>();

  const homeEmails = await fetchPageEmails(websiteUrl);
  homeEmails.forEach((e) => emails.add(e.toLowerCase()));

  if (emails.size === 0) {
    const base = websiteUrl.replace(/\/$/, "");
    for (const path of CONTACT_PATHS) {
      try {
        const pageEmails = await fetchPageEmails(base + path);
        pageEmails.forEach((e) => emails.add(e.toLowerCase()));
        if (emails.size > 0) break;
      } catch {}
    }
  }

  return [...emails];
}

export function pickBestEmail(emails: string[]): string {
  if (emails.length === 0) return "";

  const personal = emails.filter((e) => !GENERIC_PREFIXES.some((g) => e.toLowerCase().startsWith(g)));

  return personal.length > 0 ? personal[0] : emails[0];
}

export async function withConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
