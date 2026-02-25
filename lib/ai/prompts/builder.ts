import { DEFAULT_BUSINESS_PROMPT_TEMPLATE } from "./template";
import type { Location, Review } from "@/lib/types";
import Mustache from "mustache";

function getStarCustomInstructions(star: 1 | 2 | 3 | 4 | 5, location: Location): string {
  return location.starConfigs?.[star]?.customInstructions || "";
}

export interface PromptSample {
  review: Review;
  reply: string;
  comment?: string | null;
}

export function buildReplyPrompt(
  location: Location,
  review: Review,
  approvedSamples: PromptSample[] = [],
  rejectedSamples: PromptSample[] = []
): string {
  const languageMode = location.languageMode;
  const isAutoDetect = languageMode === "auto-detect";
  const targetLanguage = isAutoDetect ? undefined : languageMode;

  const formatSample = (s: PromptSample) => {
    const reviewText = s.review.text ? `"${s.review.text}"` : "(no text)";
    let formatted = `Review (${s.review.rating}★): ${reviewText}\nReply: "${s.reply}"`;
    if (s.comment) {
      formatted += `\nUser feedback: "${s.comment}"`;
    }
    return formatted;
  };

  const templateData = {
    BUSINESS_NAME: location.name || "",
    BUSINESS_DESCRIPTION: location.description || "",
    BUSINESS_PHONE: location.phoneNumber || "",
    IS_AUTO_DETECT: isAutoDetect,
    TARGET_LANGUAGE: targetLanguage,
    TONE: location.toneOfVoice,
    ALLOWED_EMOJIS: location.allowedEmojis?.join(" ") || "",
    MAX_SENTENCES: location.maxSentences || 2,
    SIGNATURE: location.signature || "",
    CUSTOM_INSTRUCTIONS_1: getStarCustomInstructions(1, location),
    CUSTOM_INSTRUCTIONS_2: getStarCustomInstructions(2, location),
    CUSTOM_INSTRUCTIONS_3: getStarCustomInstructions(3, location),
    CUSTOM_INSTRUCTIONS_4: getStarCustomInstructions(4, location),
    CUSTOM_INSTRUCTIONS_5: getStarCustomInstructions(5, location),
    RATING: review.rating,
    REVIEWER_NAME: review.name || "",
    REVIEW_TEXT: review.text || "(no text)",
    APPROVED_SAMPLES: approvedSamples.length > 0 ? approvedSamples.map(formatSample).join("\n\n") : undefined,
    REJECTED_SAMPLES: rejectedSamples.length > 0 ? rejectedSamples.map(formatSample).join("\n\n") : undefined,
  };

  const template = DEFAULT_BUSINESS_PROMPT_TEMPLATE;
  return Mustache.render(template, templateData);
}
