import type {
  Location as DrizzleLocation,
  LocationInsert,
  AccountLocation as DrizzleAccountLocation,
} from "@/lib/db/schema";

export interface StarConfig {
  customInstructions: string;
  autoReply: boolean;
}

export type Location = DrizzleLocation;
export type AccountLocation = DrizzleAccountLocation;

export type LocationCreate = {
  googleBusinessId: string;
  googleLocationId: string;
  name: string;
  address: string;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  phoneNumber?: string | null;
  websiteUrl?: string | null;
  mapsUrl?: string | null;
  reviewUrl?: string | null;
  description?: string | null;
  photoUrl?: string | null;
  starConfigs: {
    1: StarConfig;
    2: StarConfig;
    3: StarConfig;
    4: StarConfig;
    5: StarConfig;
  };
};

export type LocationUpdate = Partial<Omit<LocationInsert, "id" | "googleLocationId" | "createdAt">>;

export type ToneOfVoice = "friendly" | "formal" | "humorous" | "professional";
export type LanguageMode = "hebrew" | "english" | "auto-detect";

export interface GoogleBusinessProfileLocation {
  accountId: string;
  id: string;
  locationId: string;
  name: string;
  address: string;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  phoneNumber: string | null;
  websiteUrl: string | null;
  mapsUrl: string | null;
  reviewUrl: string | null;
  description: string | null;
  photoUrl: string | null;
}

export type LocationWithConnection = Location & {
  accountLocation: AccountLocation;
};
