const PLACES_API_URL = "https://places.googleapis.com/v1/places:searchText";

const CITIES = [
  "Tel Aviv",
  "Jerusalem",
  "Haifa",
  "Beer Sheva",
  "Netanya",
  "Herzliya",
  "Ramat Gan",
  "Eilat",
  "Rishon LeZion",
  "Petah Tikva",
  "Ashdod",
  "Rehovot",
  "Kfar Saba",
  "Ra'anana",
];

const QUERY_TEMPLATES = ["restaurants in {city}, Israel", "event venues in {city}, Israel", "cafes in {city}, Israel"];

export interface Place {
  placeId: string;
  displayName: string;
  websiteUri?: string;
  googleMapsUri?: string;
  formattedAddress?: string;
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

const CITIES_PER_RUN = 3;

export function getCitiesForToday(): string[] {
  const day = getDayOfYear();
  const totalRotations = Math.ceil(CITIES.length / CITIES_PER_RUN);
  const rotationIndex = day % totalRotations;
  const start = rotationIndex * CITIES_PER_RUN;
  return CITIES.slice(start, start + CITIES_PER_RUN);
}

export function getQueriesForCities(cities: string[]): string[] {
  const queries: string[] = [];
  for (const city of cities) {
    for (const template of QUERY_TEMPLATES) {
      queries.push(template.replace("{city}", city));
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
