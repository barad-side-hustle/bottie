import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { leads } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { getCitiesForToday, getQueriesForCities, searchPlaces, type Place } from "@/lib/leads/places";
import { scrapeEmails, pickBestEmail, withConcurrency } from "@/lib/leads/scraper";

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
    const cities = getCitiesForToday();
    const queries = getQueriesForCities(cities);

    console.log(`find-leads: searching cities [${cities.join(", ")}]`);

    const allPlaces: Array<Place & { searchQuery: string }> = [];
    const seenPlaceIds = new Set<string>();

    for (const query of queries) {
      if (Date.now() - startTime > TIMEOUT_MS) break;

      const places = await searchPlaces(query, env.GOOGLE_PLACES_API_KEY);
      for (const place of places) {
        if (place.placeId && !seenPlaceIds.has(place.placeId)) {
          seenPlaceIds.add(place.placeId);
          allPlaces.push({ ...place, searchQuery: query });
        }
      }
    }

    console.log(`find-leads: found ${allPlaces.length} unique places`);

    const placeIds = allPlaces.map((p) => p.placeId);
    const existingLeads =
      placeIds.length > 0
        ? await db
            .select({ googlePlaceId: leads.googlePlaceId })
            .from(leads)
            .where(inArray(leads.googlePlaceId, placeIds))
        : [];

    const existingIds = new Set(existingLeads.map((l) => l.googlePlaceId));
    const newPlaces = allPlaces.filter((p) => !existingIds.has(p.placeId));

    console.log(`find-leads: ${newPlaces.length} new places (${existingIds.size} already in DB)`);

    const placesWithWebsite = newPlaces.filter((p) => p.websiteUri);
    const placesWithoutWebsite = newPlaces.filter((p) => !p.websiteUri);

    const scrapeResults = await withConcurrency(placesWithWebsite, 5, async (place) => {
      if (Date.now() - startTime > TIMEOUT_MS) {
        return { place, email: "" };
      }
      const emails = await scrapeEmails(place.websiteUri!);
      return { place, email: pickBestEmail(emails) };
    });

    const leadsToInsert = [
      ...scrapeResults.map(({ place, email }) => ({
        googlePlaceId: place.placeId,
        businessName: place.displayName,
        email: email || null,
        websiteUrl: place.websiteUri || null,
        googleMapsUrl: place.googleMapsUri || null,
        address: place.formattedAddress || null,
        city: extractCityFromQuery(place.searchQuery),
        status: email ? ("pending" as const) : ("skipped" as const),
        searchQuery: place.searchQuery,
      })),
      ...placesWithoutWebsite.map((place) => ({
        googlePlaceId: place.placeId,
        businessName: place.displayName,
        email: null,
        websiteUrl: null,
        googleMapsUrl: place.googleMapsUri || null,
        address: place.formattedAddress || null,
        city: extractCityFromQuery(place.searchQuery),
        status: "skipped" as const,
        searchQuery: place.searchQuery,
      })),
    ];

    if (leadsToInsert.length > 0) {
      await db.insert(leads).values(leadsToInsert).onConflictDoNothing();
    }

    const emailsFound = scrapeResults.filter((r) => r.email).length;

    console.log(`find-leads: inserted ${leadsToInsert.length} leads, ${emailsFound} with emails`);

    return NextResponse.json({
      message: "Find-leads cron completed",
      citiesSearched: cities,
      placesFound: allPlaces.length,
      newLeads: leadsToInsert.length,
      emailsFound,
    });
  } catch (error) {
    console.error("Find-leads cron failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function extractCityFromQuery(searchQuery: string): string {
  const match = searchQuery.match(/in (.+?),/);
  return match?.[1] || "";
}
