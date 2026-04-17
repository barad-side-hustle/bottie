import { generateWithGemini } from "@/lib/ai/core/gemini-client";
import { env } from "@/lib/env";
import { SchemaType, type ResponseSchema } from "@google/generative-ai";

interface LeadInput {
  businessName: string;
  city: string;
}

interface TranslationResult {
  hebrewBusinessName: string;
  hebrewCity: string;
  shortName: string;
}

const responseSchema: ResponseSchema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      hebrewBusinessName: { type: SchemaType.STRING },
      hebrewCity: { type: SchemaType.STRING },
      shortName: { type: SchemaType.STRING },
    },
    required: ["hebrewBusinessName", "hebrewCity", "shortName"],
  },
};

function buildPrompt(leads: LeadInput[]): string {
  const entries = leads.map((l, i) => `${i + 1}. "${l.businessName}" in "${l.city}"`).join("\n");

  return `Translate the following business names and city names to Hebrew.

For each entry, provide:
1. hebrewBusinessName -Transliterate the business name into Hebrew. If it's already Hebrew, keep it as-is. For English brand names, transliterate phonetically (e.g., "Augustine" → "אוגוסטין", "The Coffee Shop" → "דה קופי שופ"). If the name contains a Hebrew word, use the Hebrew version.
2. hebrewCity -The Hebrew name of the city (e.g., "Ra'anana" → "רעננה", "Tel Aviv" → "תל אביב").
3. shortName -A clean, short version of the business name in Hebrew suitable for use in an email subject line. Strip keyword stuffing, pipe-separated tags, SEO descriptions, and any promotional text. Keep only the core business name. Examples:
   - "אדריכלית גוף ותנועה| יציבה נכונה| פילאטיס תראפיה| מפחית כאבים" → "אדריכלית גוף ותנועה"
   - "חומוס אבו חסן - Abu Hassan - The best hummus in Jaffa" → "חומוס אבו חסן"
   - "Dr. Sarah Cohen - Dermatologist | Skin Care | Tel Aviv" → "ד״ר שרה כהן"

Return a JSON array with one object per entry, in the same order.

Entries:
${entries}`;
}

export async function translateLeadNames(leads: LeadInput[]): Promise<Map<number, TranslationResult>> {
  const results = new Map<number, TranslationResult>();

  if (leads.length === 0) return results;

  try {
    const prompt = buildPrompt(leads);
    const raw = await generateWithGemini(env.GEMINI_API_KEY, prompt, "gemini-3-flash-preview", 16384, responseSchema);

    const parsed: TranslationResult[] = JSON.parse(raw);

    for (let i = 0; i < Math.min(parsed.length, leads.length); i++) {
      const item = parsed[i];
      if (item?.hebrewBusinessName && item?.hebrewCity) {
        results.set(i, item);
      }
    }
  } catch (error) {
    console.error("[translate] Gemini translation failed", {
      error: error instanceof Error ? error.message : String(error),
      leadCount: leads.length,
    });
    throw error;
  }

  return results;
}
