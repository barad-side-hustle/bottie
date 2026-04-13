import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { LeadsRepository } from "@/lib/db/repositories";
import { getRandomCities, getQueriesForCities, searchPlaces, type Place } from "@/lib/leads/places";
import { COUNTRY_CONFIGS, getCountryConfig, type CountryConfig } from "@/lib/leads/countries";
import { isSocialMediaUrl } from "@/lib/leads/scraper";

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
    const configs: CountryConfig[] = countryParam
      ? ([getCountryConfig(countryParam)].filter(Boolean) as CountryConfig[])
      : Object.values(COUNTRY_CONFIGS);

    if (configs.length === 0) {
      return NextResponse.json({ error: `Unknown country: ${countryParam}` }, { status: 400 });
    }

    const leadsRepo = new LeadsRepository();
    const results: Record<
      string,
      { cities: string[]; placesFound: number; newLeads: number; withWebsite: number; skipped: number }
    > = {};

    for (const countryConfig of configs) {
      if (Date.now() - startTime > TIMEOUT_MS) {
        console.warn("[find-leads] Timeout approaching, stopping before next country");
        break;
      }

      const cities = getRandomCities(countryConfig);
      const queries = getQueriesForCities(cities, countryConfig);

      console.log("[find-leads] Starting search", {
        country: countryConfig.code,
        cities,
        queriesCount: queries.length,
      });

      const allPlaces: Array<Place & { searchQuery: string }> = [];
      const seenPlaceIds = new Set<string>();

      for (const query of queries) {
        if (Date.now() - startTime > TIMEOUT_MS) {
          console.warn("[find-leads] Timeout approaching, stopping search early");
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

      const placeIds = allPlaces.map((p) => p.placeId);
      const existingIds = await leadsRepo.findExistingPlaceIds(placeIds);
      const newPlaces = allPlaces.filter((p) => !existingIds.has(p.placeId));

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

      results[countryConfig.code] = {
        cities,
        placesFound: allPlaces.length,
        newLeads: leadsToInsert.length,
        withWebsite: leadsToInsert.filter((l) => l.status === "pending").length,
        skipped: leadsToInsert.filter((l) => l.status === "skipped").length,
      };
    }

    const elapsedMs = Date.now() - startTime;

    console.log("[find-leads] Cron run completed", { results, elapsedMs });

    return NextResponse.json({ message: "Find-leads cron completed", results, elapsedMs });
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    console.error("[find-leads] Cron run failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      elapsedMs,
    });

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function extractCityFromQuery(searchQuery: string): string {
  const match = searchQuery.match(/in (.+?),/);
  return match?.[1] || "";
}
