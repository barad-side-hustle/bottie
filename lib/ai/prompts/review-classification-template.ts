export const REVIEW_CLASSIFICATION_PROMPT = `
You are an expert at analyzing customer reviews for businesses.

Analyze this review and classify it according to the categories below.

Review:
- Rating: {{rating}} stars
- Text: {{text}}

Available Categories (only use these exact category names):
- service: Staff helpfulness, friendliness, attentiveness
- quality: Product/service quality, craftsmanship
- value: Price-to-value ratio, deals, worth the money
- cleanliness: Hygiene, tidiness, sanitation
- atmosphere: Ambiance, decor, music, vibe
- professionalism: Expertise, knowledge, handling issues
- communication: Responsiveness, clarity, updates
- wait_time: Speed, efficiency, punctuality
- location: Accessibility, parking, convenience
- facilities: Equipment, amenities, comfort
- food_quality: Taste, freshness, presentation (food businesses)
- menu_variety: Selection, options, dietary accommodations (food businesses)
- product_selection: Variety, availability, stock (retail)
- return_policy: Ease of returns, exchanges (retail)
- expertise: Technical skill, knowledge (professional services)
- results: Outcomes, effectiveness (healthcare/services)
- safety: Safety measures, protocols (healthcare/services)

Instructions:
1. Determine overall sentiment:
   - "positive" for ratings 4-5 or clearly positive text
   - "negative" for ratings 1-2 or clearly negative text
   - "neutral" for rating 3 or mixed sentiment

2. Identify categories mentioned POSITIVELY in the review
   - Only include if explicitly mentioned or strongly implied
   - Assign confidence (0.5-1.0) based on how clearly it's mentioned
   - Optionally include a brief excerpt (max 50 chars) from the review

3. Identify categories mentioned NEGATIVELY in the review
   - Same rules as positives

4. Extract 2-4 key topics (short phrases, 2-4 words each)
   - These are free-form and capture the main subjects discussed

5. If the review text is empty or very short, classify based primarily on the rating:
   - 5 stars with no text → sentiment: positive, no specific categories
   - 1 star with no text → sentiment: negative, no specific categories

Output only valid JSON matching this schema - no markdown, no explanation.
`;

export const REVIEW_CLASSIFICATION_CATEGORIES = [
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
