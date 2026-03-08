import { getAccessTokenFromRefreshToken } from "./business-profile";

const PERFORMANCE_API_BASE = "https://businessprofileperformance.googleapis.com/v1";

export type DailyMetric =
  | "BUSINESS_IMPRESSIONS_DESKTOP_MAPS"
  | "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH"
  | "BUSINESS_IMPRESSIONS_MOBILE_MAPS"
  | "BUSINESS_IMPRESSIONS_MOBILE_SEARCH"
  | "CALL_CLICKS"
  | "WEBSITE_CLICKS"
  | "BUSINESS_DIRECTION_REQUESTS";

interface GoogleDate {
  year: number;
  month: number;
  day: number;
}

interface DatedValue {
  date: GoogleDate;
  value?: string;
}

interface TimeSeries {
  datedValues: DatedValue[];
}

interface DailyMetricTimeSeries {
  dailyMetric: DailyMetric;
  timeSeries: TimeSeries;
}

interface FetchMultiDailyMetricsResponse {
  multiDailyMetricTimeSeries: {
    dailyMetricTimeSeries: DailyMetricTimeSeries[];
  }[];
}

export interface DailyMetricsData {
  date: string;
  searchImpressionsDesktop: number;
  searchImpressionsMobile: number;
  mapsImpressionsDesktop: number;
  mapsImpressionsMobile: number;
  websiteClicks: number;
  phoneCallClicks: number;
  directionRequests: number;
}

function toGoogleDate(date: Date): GoogleDate {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

function googleDateToString(d: GoogleDate): string {
  return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
}

const ALL_METRICS: DailyMetric[] = [
  "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
  "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
  "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
  "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
  "WEBSITE_CLICKS",
  "CALL_CLICKS",
  "BUSINESS_DIRECTION_REQUESTS",
];

export async function fetchDailyMetrics(
  locationId: string,
  refreshToken: string,
  startDate: Date,
  endDate: Date
): Promise<DailyMetricsData[]> {
  const accessToken = await getAccessTokenFromRefreshToken(refreshToken);

  const url = new URL(`${PERFORMANCE_API_BASE}/locations/${locationId}:fetchMultiDailyMetricsTimeSeries`);

  for (const metric of ALL_METRICS) {
    url.searchParams.append("dailyMetrics", metric);
  }

  const start = toGoogleDate(startDate);
  const end = toGoogleDate(endDate);
  url.searchParams.set("dailyRange.startDate.year", String(start.year));
  url.searchParams.set("dailyRange.startDate.month", String(start.month));
  url.searchParams.set("dailyRange.startDate.day", String(start.day));
  url.searchParams.set("dailyRange.endDate.year", String(end.year));
  url.searchParams.set("dailyRange.endDate.month", String(end.month));
  url.searchParams.set("dailyRange.endDate.day", String(end.day));

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Performance API error:", response.status, errorText);
    throw new Error(`Performance API request failed: ${response.status}`);
  }

  const data: FetchMultiDailyMetricsResponse = await response.json();

  const metricsByDate = new Map<string, Partial<DailyMetricsData>>();

  const metricFieldMap: Record<DailyMetric, keyof DailyMetricsData> = {
    BUSINESS_IMPRESSIONS_DESKTOP_SEARCH: "searchImpressionsDesktop",
    BUSINESS_IMPRESSIONS_MOBILE_SEARCH: "searchImpressionsMobile",
    BUSINESS_IMPRESSIONS_DESKTOP_MAPS: "mapsImpressionsDesktop",
    BUSINESS_IMPRESSIONS_MOBILE_MAPS: "mapsImpressionsMobile",
    WEBSITE_CLICKS: "websiteClicks",
    CALL_CLICKS: "phoneCallClicks",
    BUSINESS_DIRECTION_REQUESTS: "directionRequests",
  };

  for (const multi of data.multiDailyMetricTimeSeries || []) {
    for (const series of multi.dailyMetricTimeSeries || []) {
      const field = metricFieldMap[series.dailyMetric];
      if (!field) continue;

      for (const dv of series.timeSeries?.datedValues || []) {
        const dateStr = googleDateToString(dv.date);
        if (!metricsByDate.has(dateStr)) {
          metricsByDate.set(dateStr, { date: dateStr });
        }
        const entry = metricsByDate.get(dateStr)!;
        (entry as Record<string, unknown>)[field] = parseInt(dv.value || "0", 10);
      }
    }
  }

  return Array.from(metricsByDate.values())
    .map((entry) => ({
      date: entry.date!,
      searchImpressionsDesktop: entry.searchImpressionsDesktop || 0,
      searchImpressionsMobile: entry.searchImpressionsMobile || 0,
      mapsImpressionsDesktop: entry.mapsImpressionsDesktop || 0,
      mapsImpressionsMobile: entry.mapsImpressionsMobile || 0,
      websiteClicks: entry.websiteClicks || 0,
      phoneCallClicks: entry.phoneCallClicks || 0,
      directionRequests: entry.directionRequests || 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
