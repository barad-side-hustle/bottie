export interface ProfileHealthBreakdown {
  label: string;
  status: "complete" | "incomplete" | "warning";
  score: number;
  maxScore: number;
  actionItem?: string;
}

export interface ProfileHealthResult {
  score: number;
  breakdown: ProfileHealthBreakdown[];
}

interface ProfileHealthInput {
  description: string | null;
  phoneNumber: string | null;
  websiteUrl: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  responseRate: number;
  averageRating: number | null;
}

export function calculateProfileHealth(input: ProfileHealthInput): ProfileHealthResult {
  const breakdown: ProfileHealthBreakdown[] = [];

  const hasDescription = !!input.description?.trim();
  breakdown.push({
    label: "description",
    status: hasDescription ? "complete" : "incomplete",
    score: hasDescription ? 15 : 0,
    maxScore: 15,
    actionItem: hasDescription ? undefined : "addDescription",
  });

  const hasPhone = !!input.phoneNumber?.trim();
  breakdown.push({
    label: "phoneNumber",
    status: hasPhone ? "complete" : "incomplete",
    score: hasPhone ? 15 : 0,
    maxScore: 15,
    actionItem: hasPhone ? undefined : "addPhoneNumber",
  });

  const hasWebsite = !!input.websiteUrl?.trim();
  breakdown.push({
    label: "websiteUrl",
    status: hasWebsite ? "complete" : "incomplete",
    score: hasWebsite ? 15 : 0,
    maxScore: 15,
    actionItem: hasWebsite ? undefined : "addWebsiteUrl",
  });

  const hasAddress = !!(input.address?.trim() && input.city?.trim() && input.country?.trim());
  breakdown.push({
    label: "address",
    status: hasAddress ? "complete" : "incomplete",
    score: hasAddress ? 15 : 0,
    maxScore: 15,
    actionItem: hasAddress ? undefined : "completeAddress",
  });

  const responseRateScore = input.responseRate >= 80 ? 20 : input.responseRate >= 50 ? 10 : 0;
  breakdown.push({
    label: "responseRate",
    status: input.responseRate >= 80 ? "complete" : input.responseRate >= 50 ? "warning" : "incomplete",
    score: responseRateScore,
    maxScore: 20,
    actionItem: input.responseRate < 80 ? "improveResponseRate" : undefined,
  });

  const avgRating = input.averageRating ?? 0;
  const ratingScore = avgRating >= 4.0 ? 20 : avgRating >= 3.0 ? 10 : 0;
  breakdown.push({
    label: "averageRating",
    status: avgRating >= 4.0 ? "complete" : avgRating >= 3.0 ? "warning" : "incomplete",
    score: ratingScore,
    maxScore: 20,
    actionItem: avgRating < 4.0 ? "improveRating" : undefined,
  });

  const score = breakdown.reduce((sum, item) => sum + item.score, 0);

  return { score, breakdown };
}
