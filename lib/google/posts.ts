import { getAccessTokenFromRefreshToken } from "./business-profile";

const GOOGLE_MY_BUSINESS_API_BASE = "https://mybusiness.googleapis.com/v4";

interface GoogleLocalPost {
  name: string;
  languageCode?: string;
  summary: string;
  topicType: "STANDARD" | "EVENT" | "OFFER" | "ALERT";
  state?: "LIVE" | "PROCESSING" | "REJECTED";
  callToAction?: {
    actionType: "BOOK" | "ORDER" | "SHOP" | "LEARN_MORE" | "SIGN_UP" | "CALL";
    url: string;
  };
  event?: {
    title: string;
    schedule: {
      startDate: { year: number; month: number; day: number };
      startTime?: { hours: number; minutes: number; seconds: number; nanos: number };
      endDate: { year: number; month: number; day: number };
      endTime?: { hours: number; minutes: number; seconds: number; nanos: number };
    };
  };
  offer?: {
    couponCode?: string;
    redeemOnlineUrl?: string;
    termsConditions?: string;
  };
  media?: {
    mediaFormat: "PHOTO" | "VIDEO";
    sourceUrl: string;
  }[];
  createTime?: string;
  updateTime?: string;
  searchUrl?: string;
}

interface CreatePostRequest {
  summary: string;
  topicType: "STANDARD" | "EVENT" | "OFFER";
  languageCode?: string;
  callToAction?: {
    actionType: string;
    url: string;
  };
  event?: GoogleLocalPost["event"];
  offer?: GoogleLocalPost["offer"];
  media?: GoogleLocalPost["media"];
}

async function makeAuthorizedRequest<T>(
  url: string,
  accessToken: string,
  method: string = "GET",
  body?: unknown
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Google Posts API error:", {
      status: response.status,
      statusText: response.statusText,
      url,
      method,
      errorBody: errorText,
    });
    throw new Error(`Google Posts API request failed: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text);
}

export async function createLocalPost(
  locationName: string,
  post: CreatePostRequest,
  refreshToken: string
): Promise<GoogleLocalPost> {
  const accessToken = await getAccessTokenFromRefreshToken(refreshToken);
  const url = `${GOOGLE_MY_BUSINESS_API_BASE}/${locationName}/localPosts`;
  return makeAuthorizedRequest<GoogleLocalPost>(url, accessToken, "POST", post);
}

export async function deleteLocalPost(postName: string, refreshToken: string): Promise<void> {
  const accessToken = await getAccessTokenFromRefreshToken(refreshToken);
  const url = `${GOOGLE_MY_BUSINESS_API_BASE}/${postName}`;
  await makeAuthorizedRequest(url, accessToken, "DELETE");
}
