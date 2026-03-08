"use server";

import { createSafeAction } from "./safe-action";
import { z } from "zod";
import { calculateProfileHealth, type ProfileHealthResult } from "@/lib/profile-health";
import { db } from "@/lib/db/client";
import { reviews, locations } from "@/lib/db/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { createLocationAccessCondition } from "@/lib/db/repositories/access-conditions";

const GetProfileHealthSchema = z.object({
  locationId: z.string().uuid(),
});

export const getProfileHealth = createSafeAction(
  GetProfileHealthSchema,
  async ({ locationId }, { userId }): Promise<ProfileHealthResult> => {
    const location = await db.query.locations.findFirst({
      where: and(eq(locations.id, locationId), createLocationAccessCondition(userId, locationId)),
      columns: {
        description: true,
        phoneNumber: true,
        websiteUrl: true,
        address: true,
        city: true,
        country: true,
      },
    });

    if (!location) {
      throw new Error("Location not found");
    }

    const statsResult = await db
      .select({
        totalReviews: count(),
        repliedReviews: sql<number>`COUNT(*) FILTER (WHERE ${reviews.replyStatus} = 'posted')`,
        averageRating: sql<number>`ROUND(AVG(${reviews.rating})::numeric, 1)`,
      })
      .from(reviews)
      .where(eq(reviews.locationId, locationId));

    const stats = statsResult[0];
    const totalReviews = Number(stats?.totalReviews || 0);
    const repliedReviews = Number(stats?.repliedReviews || 0);
    const responseRate = totalReviews > 0 ? Math.round((repliedReviews / totalReviews) * 100) : 0;
    const averageRating = totalReviews > 0 ? Number(stats?.averageRating || 0) : null;

    return calculateProfileHealth({
      description: location.description,
      phoneNumber: location.phoneNumber,
      websiteUrl: location.websiteUrl,
      address: location.address,
      city: location.city,
      country: location.country,
      responseRate,
      averageRating,
    });
  }
);
