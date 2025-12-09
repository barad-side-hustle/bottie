export const CLASSIFICATION_CATEGORIES = [
  "service",
  "quality",
  "value",
  "cleanliness",
  "atmosphere",
  "professionalism",
  "communication",
  "wait_time",

  "location",
  "facilities",

  "food_quality",
  "menu_variety",

  "product_selection",
  "return_policy",

  "expertise",
  "results",
  "safety",
] as const;

export type ClassificationCategory = (typeof CLASSIFICATION_CATEGORIES)[number];

export interface CategoryMention {
  category: ClassificationCategory;
  confidence: number;
  excerpt?: string;
}

export interface ReviewClassification {
  sentiment: "positive" | "neutral" | "negative";
  positives: CategoryMention[];
  negatives: CategoryMention[];
  topics: string[];
  classifiedAt: string;
  modelVersion: string;
}

export interface ClassificationStats {
  totalReviews: number;
  classifiedReviews: number;
  averageRating: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topPositives: CategoryCount[];
  topNegatives: CategoryCount[];
}

export interface CategoryCount {
  category: ClassificationCategory;
  count: number;
  percentage: number;
}

export interface ClassificationTrend {
  date: string;
  totalReviews: number;
  averageRating: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
}

export interface InsightsDateRange {
  dateFrom: Date;
  dateTo: Date;
}

export const CATEGORY_TRANSLATION_KEYS: Record<ClassificationCategory, string> = {
  service: "categories.service",
  quality: "categories.quality",
  value: "categories.value",
  cleanliness: "categories.cleanliness",
  atmosphere: "categories.atmosphere",
  professionalism: "categories.professionalism",
  communication: "categories.communication",
  wait_time: "categories.waitTime",
  location: "categories.location",
  facilities: "categories.facilities",
  food_quality: "categories.foodQuality",
  menu_variety: "categories.menuVariety",
  product_selection: "categories.productSelection",
  return_policy: "categories.returnPolicy",
  expertise: "categories.expertise",
  results: "categories.results",
  safety: "categories.safety",
};
