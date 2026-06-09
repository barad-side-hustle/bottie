const PLACES_BASE = "https://places.googleapis.com/v1";

const SEARCH_FIELD_MASK =
  "places.id,places.displayName,places.location,places.primaryType,places.rating,places.userRatingCount,places.businessStatus";
const DETAILS_FIELD_MASK = "id,displayName,location,primaryType,rating,userRatingCount,businessStatus";

export interface ResolvedPlace {
  placeId: string;
  displayName: string;
  latitude: number;
  longitude: number;
  primaryType: string | null;
  rating: number | null;
  userRatingCount: number | null;
  businessStatus: string | null;
}

export interface NearbyCompetitor {
  placeId: string;
  displayName: string;
  rating: number | null;
  userRatingCount: number | null;
  primaryType: string | null;
  businessStatus: string | null;
}

interface RawPlace {
  id?: string;
  displayName?: { text?: string };
  location?: { latitude?: number; longitude?: number };
  primaryType?: string;
  rating?: number;
  userRatingCount?: number;
  businessStatus?: string;
}

function toNearby(place: RawPlace): NearbyCompetitor {
  return {
    placeId: place.id ?? "",
    displayName: place.displayName?.text ?? "",
    rating: typeof place.rating === "number" ? place.rating : null,
    userRatingCount: typeof place.userRatingCount === "number" ? place.userRatingCount : null,
    primaryType: place.primaryType ?? null,
    businessStatus: place.businessStatus ?? null,
  };
}

function toResolved(place: RawPlace): ResolvedPlace | null {
  const lat = place.location?.latitude;
  const lng = place.location?.longitude;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  return {
    placeId: place.id ?? "",
    displayName: place.displayName?.text ?? "",
    latitude: lat,
    longitude: lng,
    primaryType: place.primaryType ?? null,
    rating: typeof place.rating === "number" ? place.rating : null,
    userRatingCount: typeof place.userRatingCount === "number" ? place.userRatingCount : null,
    businessStatus: place.businessStatus ?? null,
  };
}

export async function resolveOwnPlace(query: string, apiKey: string): Promise<ResolvedPlace | null> {
  try {
    const res = await fetch(`${PLACES_BASE}/places:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": SEARCH_FIELD_MASK,
      },
      body: JSON.stringify({ textQuery: query, languageCode: "en", maxResultCount: 1 }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Places searchText error for "${query}": ${res.status} ${err}`);
      return null;
    }

    const data = await res.json();
    const place: RawPlace | undefined = data.places?.[0];
    if (!place) return null;
    return toResolved(place);
  } catch (error) {
    console.error("Places searchText threw:", error);
    return null;
  }
}

export async function getPlaceDetails(placeId: string, apiKey: string): Promise<ResolvedPlace | null> {
  try {
    const res = await fetch(`${PLACES_BASE}/places/${encodeURIComponent(placeId)}`, {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": DETAILS_FIELD_MASK,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Places details error for "${placeId}": ${res.status} ${err}`);
      return null;
    }

    const place: RawPlace = await res.json();
    return toResolved(place);
  } catch (error) {
    console.error("Places details threw:", error);
    return null;
  }
}

export async function searchNearbyCompetitors(args: {
  latitude: number;
  longitude: number;
  includedPrimaryType: string;
  radiusMeters: number;
  maxResultCount?: number;
  apiKey: string;
}): Promise<NearbyCompetitor[] | null> {
  const { latitude, longitude, includedPrimaryType, radiusMeters, maxResultCount = 20, apiKey } = args;

  try {
    const res = await fetch(`${PLACES_BASE}/places:searchNearby`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": SEARCH_FIELD_MASK,
      },
      body: JSON.stringify({
        includedPrimaryTypes: [includedPrimaryType],
        maxResultCount,
        rankPreference: "POPULARITY",
        languageCode: "en",
        locationRestriction: {
          circle: {
            center: { latitude, longitude },
            radius: radiusMeters,
          },
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Places searchNearby error (${includedPrimaryType}): ${res.status} ${err}`);
      return null;
    }

    const data = await res.json();
    const places: RawPlace[] = data.places ?? [];
    return places.map(toNearby);
  } catch (error) {
    console.error("Places searchNearby threw:", error);
    return null;
  }
}
