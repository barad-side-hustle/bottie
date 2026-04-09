import { generateWithGemini } from "@/lib/ai/core/gemini-client";
import { env } from "@/lib/env";
import { SchemaType, type ResponseSchema } from "@google/generative-ai";

interface LeadInput {
  businessName: string;
  city: string;
  searchQuery: string;
}

interface TranslationResult {
  hebrewBusinessName: string;
  hebrewCity: string;
  personalizedOpening: string;
}

const responseSchema: ResponseSchema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      hebrewBusinessName: { type: SchemaType.STRING },
      hebrewCity: { type: SchemaType.STRING },
      personalizedOpening: { type: SchemaType.STRING },
    },
    required: ["hebrewBusinessName", "hebrewCity", "personalizedOpening"],
  },
};

function buildPrompt(leads: LeadInput[]): string {
  const entries = leads
    .map((l, i) => {
      const type = l.searchQuery.split(" in ")[0] || "business";
      return `${i + 1}. "${l.businessName}" in "${l.city}" (${type})`;
    })
    .join("\n");

  return `You are helping write personalized cold outreach emails in Hebrew for a Google review management tool called Bottie.ai.

For each business below, provide:
1. hebrewBusinessName — Transliterate the business name into Hebrew. If it's already Hebrew, keep it as-is. For English brand names, transliterate phonetically (e.g., "Augustine" → "אוגוסטין", "The Coffee Shop" → "דה קופי שופ"). If the name contains a Hebrew word, use the Hebrew version.
2. hebrewCity — The Hebrew name of the city (e.g., "Ra'anana" → "רעננה", "Tel Aviv" → "תל אביב").
3. personalizedOpening — 1-2 natural Hebrew sentences for a cold email opening. Mention something relevant to their business type and city. The tone should be friendly and professional, as if written by a real person (not a bot). Do NOT include a greeting — just the personalized content. Do NOT mention Bottie.ai in this text.

Return a JSON array with one object per business, in the same order.

Businesses:
${entries}`;
}

export async function translateAndPersonalizeLeads(leads: LeadInput[]): Promise<Map<number, TranslationResult>> {
  const results = new Map<number, TranslationResult>();

  if (leads.length === 0) return results;

  try {
    const prompt = buildPrompt(leads);
    const raw = await generateWithGemini(
      env.GEMINI_API_KEY,
      prompt,
      "gemini-2.5-flash-preview-05-20",
      4096,
      responseSchema
    );

    const parsed: TranslationResult[] = JSON.parse(raw);

    for (let i = 0; i < Math.min(parsed.length, leads.length); i++) {
      const item = parsed[i];
      if (item?.hebrewBusinessName && item?.hebrewCity) {
        results.set(i, item);
      }
    }
  } catch (error) {
    console.error("[translate] Gemini translation failed, falling back to original names", {
      error: error instanceof Error ? error.message : String(error),
      leadCount: leads.length,
    });
  }

  return results;
}
