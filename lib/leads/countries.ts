import type { Locale } from "@/lib/locale";

export interface CountryConfig {
  code: string;
  locale: Locale;
  dir: "ltr" | "rtl";
  countrySuffix: string;
  cities: string[];
  queryTemplates: string[];
  citiesPerRun: number;
  emailSender: string;
  emailReplyTo: string;
  needsTranslation: boolean;
}

const SHARED_QUERY_TEMPLATES = [
  "restaurants in {city}{suffix}",
  "cafes in {city}{suffix}",
  "event venues in {city}{suffix}",
  "hair salons in {city}{suffix}",
  "beauty salons in {city}{suffix}",
  "gyms in {city}{suffix}",
  "fitness studios in {city}{suffix}",
  "hotels in {city}{suffix}",
  "medical clinics in {city}{suffix}",
  "dental clinics in {city}{suffix}",
  "auto repair shops in {city}{suffix}",
  "spas in {city}{suffix}",
];

export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  IL: {
    code: "IL",
    locale: "he",
    dir: "rtl",
    countrySuffix: ", Israel",
    cities: [
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
      "Holon",
      "Bnei Brak",
      "Bat Yam",
      "Ashkelon",
      "Modiin",
      "Nahariya",
      "Acre",
      "Tiberias",
      "Nazareth",
      "Lod",
      "Ramla",
      "Kiryat Ata",
      "Kiryat Gat",
      "Kiryat Motzkin",
      "Kiryat Yam",
      "Kiryat Bialik",
      "Kiryat Shmona",
      "Or Yehuda",
      "Rosh HaAyin",
      "Hod HaSharon",
      "Givatayim",
      "Yokneam",
      "Afula",
      "Beit Shemesh",
      "Dimona",
      "Arad",
      "Sderot",
      "Ofakim",
      "Yavne",
      "Nesher",
      "Tirat Carmel",
      "Hadera",
      "Zichron Yaakov",
      "Caesarea",
      "Migdal HaEmek",
      "Carmiel",
    ],
    queryTemplates: SHARED_QUERY_TEMPLATES,
    citiesPerRun: 1,
    emailSender: "Alon from Bottie <alon@bottie.ai>",
    emailReplyTo: "alon@bottie.ai",
    needsTranslation: true,
  },
  US: {
    code: "US",
    locale: "en",
    dir: "ltr",
    countrySuffix: ", United States",
    cities: [
      "New York",
      "Los Angeles",
      "Chicago",
      "Houston",
      "Phoenix",
      "Philadelphia",
      "San Antonio",
      "San Diego",
      "Dallas",
      "Austin",
      "San Francisco",
      "Seattle",
      "Denver",
      "Boston",
      "Nashville",
      "Portland",
      "Las Vegas",
      "Miami",
      "Atlanta",
      "Minneapolis",
      "Tampa",
      "Charlotte",
      "Orlando",
      "San Jose",
      "Pittsburgh",
      "Sacramento",
      "Salt Lake City",
      "Raleigh",
      "Richmond",
      "Tucson",
    ],
    queryTemplates: SHARED_QUERY_TEMPLATES,
    citiesPerRun: 1,
    emailSender: "Alon from Bottie <alon@bottie.ai>",
    emailReplyTo: "alon@bottie.ai",
    needsTranslation: false,
  },
};

export function getCountryConfig(code: string): CountryConfig | undefined {
  return COUNTRY_CONFIGS[code.toUpperCase()];
}
