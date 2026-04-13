import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { LeadsRepository } from "@/lib/db/repositories";
import { getRandomCities, getQueriesForCities, searchPlaces, type Place } from "@/lib/leads/places";
import { COUNTRY_CONFIGS, getCountryConfig } from "@/lib/leads/countries";
import { isSocialMediaUrl } from "@/lib/leads/scraper";
import { sendEmail } from "@/lib/utils/email-service";
import { CronSummaryEmail } from "@/lib/emails/cron-summary";

export const maxDuration = 300;

function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${env.CRON_SECRET}`;
  if (!authHeader || !secureCompare(authHeader, expected)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const startTime = Date.now();
  const TIMEOUT_MS = 240_000;

  try {
    const countryParam = req.nextUrl.searchParams.get("country")?.toUpperCase();
    const countryConfig = countryParam ? getCountryConfig(countryParam) : COUNTRY_CONFIGS.IL;

    if (!countryConfig) {
      return NextResponse.json({ error: `Unknown country: ${countryParam}` }, { status: 400 });
    }

    const cities = getRandomCities(countryConfig);
    const queries = getQueriesForCities(cities, countryConfig);

    console.log("[find-leads] Starting cron run", {
      country: countryConfig.code,
      cities,
      queriesCount: queries.length,
    });

    const allPlaces: Array<Place & { searchQuery: string }> = [];
    const seenPlaceIds = new Set<string>();

    for (const query of queries) {
      if (Date.now() - startTime > TIMEOUT_MS) {
        console.warn("[find-leads] Timeout approaching, stopping search early", {
          elapsedMs: Date.now() - startTime,
          queriesCompleted: queries.indexOf(query),
          queriesTotal: queries.length,
        });
        break;
      }

      const places = await searchPlaces(query, env.GOOGLE_PLACES_API_KEY);
      console.log(`[find-leads] Query "${query}" returned ${places.length} results`);

      for (const place of places) {
        if (place.placeId && !seenPlaceIds.has(place.placeId)) {
          seenPlaceIds.add(place.placeId);
          allPlaces.push({ ...place, searchQuery: query });
        }
      }
    }

    console.log("[find-leads] Search phase complete", {
      uniquePlaces: allPlaces.length,
      elapsedMs: Date.now() - startTime,
    });

    const leadsRepo = new LeadsRepository();
    const placeIds = allPlaces.map((p) => p.placeId);
    const existingIds = await leadsRepo.findExistingPlaceIds(placeIds);
    const newPlaces = allPlaces.filter((p) => !existingIds.has(p.placeId));

    console.log("[find-leads] Dedup against DB complete", {
      newPlaces: newPlaces.length,
      alreadyInDb: existingIds.size,
    });

    const leadsToInsert = newPlaces.map((place) => {
      const hasSocialMedia = place.websiteUri && isSocialMediaUrl(place.websiteUri);
      const hasWebsite = place.websiteUri && !hasSocialMedia;

      return {
        googlePlaceId: place.placeId,
        businessName: place.displayName,
        email: null,
        websiteUrl: place.websiteUri || null,
        googleMapsUrl: place.googleMapsUri || null,
        address: place.formattedAddress || null,
        city: extractCityFromQuery(place.searchQuery),
        country: countryConfig.code,
        status: hasWebsite ? ("pending" as const) : ("skipped" as const),
        searchQuery: place.searchQuery,
      };
    });

    await leadsRepo.insertMany(leadsToInsert);

    const withWebsite = leadsToInsert.filter((l) => l.status === "pending").length;
    const skipped = leadsToInsert.filter((l) => l.status === "skipped").length;
    const elapsedMs = Date.now() - startTime;

    const summary = {
      country: countryConfig.code,
      citiesSearched: cities,
      placesFound: allPlaces.length,
      newLeads: leadsToInsert.length,
      withWebsite,
      skipped,
      elapsedMs,
    };

    console.log("[find-leads] Cron run completed", summary);

    await sendEmail(
      "alon@bottie.ai",
      `Find Leads (${countryConfig.code}): ${leadsToInsert.length} leads from ${cities.join(", ")}`,
      CronSummaryEmail({
        cronName: `Find Leads (${countryConfig.code})`,
        status: "success",
        lines: [
          `Country: ${countryConfig.code}`,
          `Cities: ${cities.join(", ")}`,
          `Places found: ${allPlaces.length}`,
          `New leads: ${leadsToInsert.length}`,
          `With website (pending scrape): ${withWebsite}`,
          `Skipped (no website / social media): ${skipped}`,
          `Duration: ${(elapsedMs / 1000).toFixed(1)}s`,
        ],
      })
    );

    return NextResponse.json({ message: "Find-leads cron completed", ...summary });
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    console.error("[find-leads] Cron run failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      elapsedMs,
    });

    await sendEmail(
      "alon@bottie.ai",
      "Find Leads: FAILED",
      CronSummaryEmail({
        cronName: "Find Leads",
        status: "error",
        lines: [
          `Error: ${error instanceof Error ? error.message : String(error)}`,
          `Duration: ${(elapsedMs / 1000).toFixed(1)}s`,
        ],
      })
    ).catch(() => {});

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function extractCityFromQuery(searchQuery: string): string {
  const match = searchQuery.match(/in (.+?),/);
  return match?.[1] || "";
}
