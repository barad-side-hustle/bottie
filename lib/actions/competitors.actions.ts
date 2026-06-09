"use server";

import { z } from "zod";
import { createSafeAction } from "./safe-action";
import { LocationsController } from "@/lib/controllers";
import { SubscriptionsController } from "@/lib/controllers/subscriptions.controller";
import { CompetitorSnapshotsRepository } from "@/lib/db/repositories/competitor-snapshots.repository";
import {
  resolveOwnPlace,
  getPlaceDetails,
  searchNearbyCompetitors,
  type ResolvedPlace,
} from "@/lib/google/places-benchmark";
import { computeBenchmarkStats, filterCompetitors } from "@/lib/benchmark/compute";
import { env } from "@/lib/env";
import type {
  BenchmarkStats,
  CompetitorEntry,
  CompetitorSnapshotStatus,
  LocationCompetitorSnapshot,
} from "@/lib/db/schema";

const SNAPSHOT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const ERROR_RETRY_MS = 6 * 60 * 60 * 1000;
const FORCE_MIN_AGE_MS = 6 * 60 * 60 * 1000;
const DEFAULT_RADIUS_METERS = 2000;
const MAX_COMPETITORS = 20;

export interface CompetitorBenchmarkResult {
  status: CompetitorSnapshotStatus;
  fetchedAt: string;
  own: {
    placeId: string | null;
    displayName: string;
    rating: number | null;
    reviewCount: number | null;
    rank: number | null;
    totalRanked: number | null;
  };
  stats: BenchmarkStats | null;
  competitors: CompetitorEntry[];
  radiusMeters: number;
}

function isStale(snapshot: LocationCompetitorSnapshot): boolean {
  const age = Date.now() - snapshot.fetchedAt.getTime();
  const ttl = snapshot.status === "ok" || snapshot.status === "no_competitors" ? SNAPSHOT_TTL_MS : ERROR_RETRY_MS;
  return age > ttl;
}

function sortByRatingDesc(competitors: CompetitorEntry[]): CompetitorEntry[] {
  return [...competitors].sort(
    (a, b) => (b.rating ?? -1) - (a.rating ?? -1) || (b.userRatingCount ?? 0) - (a.userRatingCount ?? 0)
  );
}

function toResult(displayName: string, snapshot: LocationCompetitorSnapshot): CompetitorBenchmarkResult {
  return {
    status: snapshot.status,
    fetchedAt: snapshot.fetchedAt.toISOString(),
    own: {
      placeId: snapshot.placeId,
      displayName,
      rating: snapshot.ownRating,
      reviewCount: snapshot.ownReviewCount,
      rank: snapshot.stats?.ownRank ?? null,
      totalRanked: snapshot.stats?.totalRanked ?? null,
    },
    stats: snapshot.stats ?? null,
    competitors: sortByRatingDesc(snapshot.competitors ?? []),
    radiusMeters: snapshot.radiusMeters,
  };
}

export const getCompetitorBenchmark = createSafeAction(
  z.object({ locationId: z.string().uuid(), force: z.boolean().optional() }),
  async ({ locationId, force }, { userId }): Promise<CompetitorBenchmarkResult> => {
    const isPaid = await new SubscriptionsController().isLocationPaid(locationId);
    if (!isPaid) throw new Error("PRO_REQUIRED");

    const location = await new LocationsController(userId).getLocation(locationId);

    const repo = new CompetitorSnapshotsRepository(userId, locationId);
    const existing = await repo.getSnapshot();

    let shouldRefetch: boolean;
    if (!existing) {
      shouldRefetch = true;
    } else if (force) {
      shouldRefetch = Date.now() - existing.fetchedAt.getTime() >= FORCE_MIN_AGE_MS;
    } else {
      shouldRefetch = isStale(existing);
    }

    if (existing && !shouldRefetch) {
      return toResult(location.name, existing);
    }

    const apiKey = env.GOOGLE_PLACES_API_KEY;

    let resolved: ResolvedPlace | null = null;
    if (existing?.placeId) {
      resolved = await getPlaceDetails(existing.placeId, apiKey);
    }
    if (!resolved) {
      const query = [location.name, location.address, location.city, location.country].filter(Boolean).join(", ");
      resolved = await resolveOwnPlace(query, apiKey);
    }

    const fetchedAt = new Date();
    const radiusMeters = existing?.radiusMeters ?? DEFAULT_RADIUS_METERS;

    if (!resolved || !resolved.primaryType) {
      const snapshot = {
        locationId,
        placeId: resolved?.placeId ?? existing?.placeId ?? null,
        latitude: resolved?.latitude ?? null,
        longitude: resolved?.longitude ?? null,
        primaryType: resolved?.primaryType ?? null,
        ownRating: resolved?.rating ?? null,
        ownReviewCount: resolved?.userRatingCount ?? null,
        businessStatus: resolved?.businessStatus ?? null,
        competitors: [],
        stats: null,
        radiusMeters,
        status: "resolution_failed" as const,
        errorReason: !resolved ? "place_not_found" : "no_primary_type",
        fetchedAt,
      };
      await repo.upsertSnapshot(snapshot);
      return toResult(location.name, {
        ...snapshot,
        id: existing?.id ?? "",
        createdAt: fetchedAt,
        updatedAt: fetchedAt,
      });
    }

    const nearby = await searchNearbyCompetitors({
      latitude: resolved.latitude,
      longitude: resolved.longitude,
      includedPrimaryType: resolved.primaryType,
      radiusMeters,
      maxResultCount: MAX_COMPETITORS,
      apiKey,
    });

    if (nearby === null) {
      const snapshot = {
        locationId,
        placeId: resolved.placeId,
        latitude: resolved.latitude,
        longitude: resolved.longitude,
        primaryType: resolved.primaryType,
        ownRating: resolved.rating,
        ownReviewCount: resolved.userRatingCount,
        businessStatus: resolved.businessStatus,
        competitors: [],
        stats: null,
        radiusMeters,
        status: "api_error" as const,
        errorReason: "nearby_search_failed",
        fetchedAt,
      };
      await repo.upsertSnapshot(snapshot);
      return toResult(location.name, {
        ...snapshot,
        id: existing?.id ?? "",
        createdAt: fetchedAt,
        updatedAt: fetchedAt,
      });
    }

    const competitors = filterCompetitors(nearby, resolved.placeId);

    const baseSnapshot = {
      locationId,
      placeId: resolved.placeId,
      latitude: resolved.latitude,
      longitude: resolved.longitude,
      primaryType: resolved.primaryType,
      ownRating: resolved.rating,
      ownReviewCount: resolved.userRatingCount,
      businessStatus: resolved.businessStatus,
      radiusMeters,
      errorReason: null,
      fetchedAt,
    };

    if (competitors.length === 0) {
      const snapshot = { ...baseSnapshot, competitors: [], stats: null, status: "no_competitors" as const };
      await repo.upsertSnapshot(snapshot);
      return toResult(location.name, {
        ...snapshot,
        id: existing?.id ?? "",
        createdAt: fetchedAt,
        updatedAt: fetchedAt,
      });
    }

    const stats = computeBenchmarkStats(
      { placeId: resolved.placeId, rating: resolved.rating, userRatingCount: resolved.userRatingCount },
      competitors
    );
    const snapshot = { ...baseSnapshot, competitors, stats, status: "ok" as const };
    await repo.upsertSnapshot(snapshot);
    return toResult(location.name, { ...snapshot, id: existing?.id ?? "", createdAt: fetchedAt, updatedAt: fetchedAt });
  }
);
