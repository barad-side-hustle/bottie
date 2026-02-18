import mustache from "mustache";
import { generateWithGemini } from "./core/gemini-client";
import { REVIEW_CLASSIFICATION_PROMPT } from "./prompts/review-classification-template";
import type { ReviewClassification, CategoryMention, ClassificationCategory } from "@/lib/types/classification.types";
import { CLASSIFICATION_CATEGORIES } from "@/lib/types/classification.types";
import { SchemaType, type ResponseSchema } from "@google/generative-ai";

const MODEL_VERSION = "gemini-3-flash-preview";

const classificationSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    sentiment: {
      type: SchemaType.STRING,
      format: "enum",
      enum: ["positive", "neutral", "negative"],
      description: "Overall sentiment of the review",
    },
    positives: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          category: {
            type: SchemaType.STRING,
            description: "Category name from the predefined list",
          },
          confidence: {
            type: SchemaType.NUMBER,
            description: "Confidence score between 0.5 and 1.0",
          },
          excerpt: {
            type: SchemaType.STRING,
            description: "Optional brief excerpt from the review",
          },
        },
        required: ["category", "confidence"],
      },
      description: "Categories mentioned positively in the review",
    },
    negatives: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          category: {
            type: SchemaType.STRING,
            description: "Category name from the predefined list",
          },
          confidence: {
            type: SchemaType.NUMBER,
            description: "Confidence score between 0.5 and 1.0",
          },
          excerpt: {
            type: SchemaType.STRING,
            description: "Optional brief excerpt from the review",
          },
        },
        required: ["category", "confidence"],
      },
      description: "Categories mentioned negatively in the review",
    },
    topics: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Key topics discussed in the review (2-4 word phrases)",
    },
  },
  required: ["sentiment", "positives", "negatives", "topics"],
};

interface ClassifyReviewInput {
  rating: number;
  text: string | null;
}

interface RawClassificationResponse {
  sentiment: "positive" | "neutral" | "negative";
  positives: Array<{
    category: string;
    confidence: number;
    excerpt?: string;
  }>;
  negatives: Array<{
    category: string;
    confidence: number;
    excerpt?: string;
  }>;
  topics: string[];
}

function validateCategoryMentions(
  mentions: Array<{ category: string; confidence: number; excerpt?: string }>
): CategoryMention[] {
  const validCategories = new Set<string>(CLASSIFICATION_CATEGORIES);

  return mentions
    .filter((m) => validCategories.has(m.category))
    .map((m) => ({
      category: m.category as ClassificationCategory,
      confidence: Math.max(0.5, Math.min(1.0, m.confidence)),
      excerpt: m.excerpt?.substring(0, 100),
    }));
}

export async function classifyReview(review: ClassifyReviewInput): Promise<ReviewClassification> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  if (!review.text || review.text.trim().length === 0) {
    return createRatingBasedClassification(review.rating);
  }

  const prompt = mustache.render(REVIEW_CLASSIFICATION_PROMPT, {
    rating: review.rating,
    text: review.text,
  });

  try {
    const response = await generateWithGemini(apiKey, prompt, MODEL_VERSION, 2048, classificationSchema);

    const parsed = JSON.parse(response) as RawClassificationResponse;

    return {
      sentiment: parsed.sentiment,
      positives: validateCategoryMentions(parsed.positives),
      negatives: validateCategoryMentions(parsed.negatives),
      topics: (parsed.topics || []).slice(0, 5),
      classifiedAt: new Date().toISOString(),
      modelVersion: MODEL_VERSION,
    };
  } catch (error) {
    console.error("Error classifying review:", error);

    return createRatingBasedClassification(review.rating);
  }
}

function createRatingBasedClassification(rating: number): ReviewClassification {
  let sentiment: "positive" | "neutral" | "negative";

  if (rating >= 4) {
    sentiment = "positive";
  } else if (rating <= 2) {
    sentiment = "negative";
  } else {
    sentiment = "neutral";
  }

  return {
    sentiment,
    positives: [],
    negatives: [],
    topics: [],
    classifiedAt: new Date().toISOString(),
    modelVersion: `rating-only-${rating}`,
  };
}
