const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const CONTACT_PATHS = ["/contact", "/about", "/צור-קשר", "/contact-us", "/contactus", "/צרו-קשר", "/about-us"];

export const SOCIAL_MEDIA_DOMAINS = [
  "instagram.com",
  "facebook.com",
  "fb.com",
  "fb.me",
  "tiktok.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "youtube.com",
  "youtu.be",
  "linktr.ee",
  "waze.com",
];

export function isSocialMediaUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return SOCIAL_MEDIA_DOMAINS.some((domain) => hostname === domain || hostname.endsWith("." + domain));
  } catch {
    return false;
  }
}

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

function linkSignals(...signals: (AbortSignal | undefined)[]): AbortSignal {
  const controller = new AbortController();
  for (const s of signals) {
    if (!s) continue;
    if (s.aborted) {
      controller.abort(s.reason);
      break;
    }
    s.addEventListener("abort", () => controller.abort(s.reason), { once: true });
  }
  return controller.signal;
}

async function headExists(url: string, parentSignal?: AbortSignal): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const signal = linkSignals(controller.signal, parentSignal);

    const res = await fetch(url, {
      method: "HEAD",
      signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

async function fetchPageEmails(url: string, parentSignal?: AbortSignal): Promise<string[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const signal = linkSignals(controller.signal, parentSignal);

    const res = await fetch(url, {
      signal,
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

export async function scrapeEmails(websiteUrl: string, signal?: AbortSignal): Promise<string[]> {
  const emails = new Set<string>();

  const homeEmails = await fetchPageEmails(websiteUrl, signal);
  homeEmails.forEach((e) => emails.add(e.toLowerCase()));

  const base = websiteUrl.replace(/\/$/, "");
  let origin: string;
  try {
    origin = new URL(websiteUrl).origin;
  } catch {
    origin = base;
  }
  const candidateBases = base === origin ? [base] : [base, origin];

  for (const path of CONTACT_PATHS) {
    if (signal?.aborted) break;
    for (const candidateBase of candidateBases) {
      if (signal?.aborted) break;
      try {
        const url = candidateBase + path;
        const exists = await headExists(url, signal);
        if (!exists) continue;
        const pageEmails = await fetchPageEmails(url, signal);
        pageEmails.forEach((e) => emails.add(e.toLowerCase()));
      } catch {}
    }
    if (emails.size >= 3) break;
  }

  return [...emails];
}

function extractHost(url: string): string | null {
  try {
    const withScheme = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return new URL(withScheme).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function pickBestEmail(emails: string[], websiteUrl?: string): string {
  if (emails.length === 0) return "";
  if (emails.length === 1) return emails[0];

  const lowered = [...new Set(emails.map((e) => e.toLowerCase()))];
  const siteHost = websiteUrl ? extractHost(websiteUrl) : null;
  const siteRoot = siteHost ? siteHost.split(".").slice(-2).join(".") : null;

  const score = (email: string): number => {
    const [local, domain] = email.split("@");
    if (!local || !domain) return -1000;
    let s = 0;
    if (siteRoot && (domain === siteRoot || domain.endsWith(`.${siteRoot}`))) s += 100;
    if (!GENERIC_PREFIXES.some((g) => local.startsWith(g.replace("@", "")))) s += 30;
    s -= Math.min(local.length, 30);
    return s;
  };

  return lowered.slice().sort((a, b) => score(b) - score(a))[0];
}

export async function withConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
