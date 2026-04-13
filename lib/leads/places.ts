import type { CountryConfig } from "./countries";

const PLACES_API_URL = "https://places.googleapis.com/v1/places:searchText";

export interface Place {
  placeId: string;
  displayName: string;
  websiteUri?: string;
  googleMapsUri?: string;
  formattedAddress?: string;
}

export function getRandomCities(config: CountryConfig): string[] {
  const shuffled = [...config.cities].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, config.citiesPerRun);
}

export function getQueriesForCities(cities: string[], config: CountryConfig): string[] {
  const queries: string[] = [];
  for (const city of cities) {
    for (const template of config.queryTemplates) {
      queries.push(template.replace("{city}", city).replace("{suffix}", config.countrySuffix));
    }
  }
  return queries;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function searchPlaces(query: string, apiKey: string): Promise<Place[]> {
  const allPlaces: Place[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < 3; page++) {
    const body: Record<string, unknown> = {
      textQuery: query,
      languageCode: "en",
      maxResultCount: 20,
    };
    if (pageToken) {
      body.pageToken = pageToken;
    }

    const res = await fetch(PLACES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.websiteUri,places.googleMapsUri,places.formattedAddress,nextPageToken",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Places API error for "${query}" (page ${page}): ${res.status} ${err}`);
      break;
    }

    const data = await res.json();
    const places = data.places || [];

    for (const place of places) {
      allPlaces.push({
        placeId: place.id || "",
        displayName: place.displayName?.text || "",
        websiteUri: place.websiteUri,
        googleMapsUri: place.googleMapsUri,
        formattedAddress: place.formattedAddress,
      });
    }

    pageToken = data.nextPageToken;
    if (!pageToken) break;

    await sleep(200);
  }

  return allPlaces;
}
