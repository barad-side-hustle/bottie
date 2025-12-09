export const WEEKLY_SUMMARY_PROMPT = `
You are an expert business analyst assistant. Your task is to analyze a list of customer reviews from the past week and generate a structured summary for the business owner.

Input:
- Business Name: {{businessName}}
- Total Reviews: {{totalReviews}}
- Average Rating: {{averageRating}}
- Language: {{language}}
- Reviews List (JSON):
{{reviews}}

Instructions:
1. Analyze the sentiment and content of the reviews.
2. Identify the top 3 positive themes (what customers love).
3. Identify the top 3 areas for improvement (pain points/negative themes).
4. Provide 3 actionable recommendations based on the feedback.
5. Keep the tone professional, encouraging, and concise.
6. Output the result in strictly valid JSON format (no markdown code blocks, just the JSON).
7. **IMPORTANT**: All text in the output (themes, recommendations) MUST be in {{language}}.

Output Schema:
{
  "positiveThemes": ["theme 1", "theme 2", "theme 3"],
  "negativeThemes": ["theme 1", "theme 2", "theme 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

If there are not enough reviews to find 3 distinct themes, provide as many as possible.
If there are no negative themes, you can say "No significant complaints this week".
`;

export const WEEKLY_SUMMARY_FROM_CLASSIFICATIONS_PROMPT = `
You are an expert business analyst assistant. Your task is to create an engaging, actionable weekly summary for a business owner based on pre-classified review data.

Input:
- Business Name: {{businessName}}
- Language: {{language}}
- Classification Data (JSON):
{{classificationData}}

The classification data contains:
- totalReviews: Total number of reviews this week
- classifiedReviews: Number of reviews that were classified
- averageRating: Average star rating
- sentimentBreakdown: Object with positive, neutral, negative counts
- topPositiveCategories: Array of most mentioned positive categories with counts
- topNegativeCategories: Array of most mentioned negative categories with counts

Category meanings:
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
- food_quality: Taste, freshness, presentation
- menu_variety: Selection, options, dietary accommodations
- product_selection: Variety, availability, stock
- return_policy: Ease of returns, exchanges
- expertise: Technical skill, knowledge
- results: Outcomes, effectiveness
- safety: Safety measures, protocols

Instructions:
1. Convert the top positive categories into 3 engaging, human-readable themes (e.g., "service" → "Excellent customer service that leaves a lasting impression")
2. Convert the top negative categories into 3 constructive areas for improvement
3. Provide 3 specific, actionable recommendations based on the data
4. Keep the tone professional, encouraging, and concise
5. If sentiment is mostly positive, be celebratory. If there are issues, be supportive and constructive
6. **IMPORTANT**: All text in the output MUST be in {{language}}

Output Schema:
{
  "positiveThemes": ["theme 1", "theme 2", "theme 3"],
  "negativeThemes": ["theme 1", "theme 2", "theme 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

If there are fewer than 3 categories, provide as many themes as possible.
If there are no negative categories, say "No significant complaints this week" (in the appropriate language).
`;
