"use server";

import { createSafeAction } from "./safe-action";
import { PostsRepository } from "@/lib/db/repositories/posts.repository";
import { decryptToken } from "@/lib/google/business-profile";
import { createLocalPost, deleteLocalPost } from "@/lib/google/posts";
import { db } from "@/lib/db/client";
import { accountLocations, googleAccounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { cache } from "react";

const ContextSchema = z.object({
  locationId: z.string().uuid(),
});

const CreatePostSchema = ContextSchema.extend({
  summary: z.string().min(1).max(1500),
  topicType: z.enum(["STANDARD", "EVENT", "OFFER"]).default("STANDARD"),
  mediaUrl: z.string().url().optional(),
  callToAction: z
    .object({
      actionType: z.enum(["BOOK", "ORDER", "SHOP", "LEARN_MORE", "SIGN_UP", "CALL"]),
      url: z.string().url(),
    })
    .optional(),
  event: z
    .object({
      title: z.string().min(1),
      startDate: z.string(),
      endDate: z.string(),
    })
    .optional(),
  offer: z
    .object({
      couponCode: z.string().optional(),
      redeemOnlineUrl: z.string().url().optional(),
      termsConditions: z.string().optional(),
    })
    .optional(),
  publishImmediately: z.boolean().default(false),
});

const PostIdSchema = ContextSchema.extend({
  postId: z.string().uuid(),
});

const resolveLocationConnection = cache(async (locationId: string) => {
  const connection = await db.query.accountLocations.findFirst({
    where: and(eq(accountLocations.locationId, locationId), eq(accountLocations.connected, true)),
    orderBy: (al, { asc }) => [asc(al.createdAt)],
  });
  if (!connection) throw new Error("No connected account found for location");

  const account = await db.query.googleAccounts.findFirst({
    where: eq(googleAccounts.id, connection.accountId),
  });
  if (!account) throw new Error("Google account not found");

  return {
    googleBusinessId: connection.googleBusinessId,
    encryptedRefreshToken: account.googleRefreshToken,
  };
});

function parseDateToGoogleDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  };
}

export const listPosts = createSafeAction(ContextSchema, async ({ locationId }, { userId }) => {
  const repo = new PostsRepository(userId, locationId);
  return repo.list();
});

export const createPost = createSafeAction(
  CreatePostSchema,
  async ({ locationId, summary, topicType, mediaUrl, callToAction, event, offer, publishImmediately }, { userId }) => {
    const repo = new PostsRepository(userId, locationId);

    const post = await repo.create({
      locationId,
      summary,
      topicType,
      mediaUrl: mediaUrl || null,
      callToAction: callToAction || null,
      event: event || null,
      offer: offer || null,
      status: "draft",
    });

    if (publishImmediately) {
      try {
        const { googleBusinessId, encryptedRefreshToken } = await resolveLocationConnection(locationId);
        const refreshToken = await decryptToken(encryptedRefreshToken);

        const googlePost: Record<string, unknown> = {
          summary,
          topicType,
        };

        if (mediaUrl) {
          googlePost.media = [{ mediaFormat: "PHOTO", sourceUrl: mediaUrl }];
        }

        if (callToAction) {
          googlePost.callToAction = callToAction;
        }

        if (event && (topicType === "EVENT" || topicType === "OFFER")) {
          googlePost.event = {
            title: event.title,
            schedule: {
              startDate: parseDateToGoogleDate(event.startDate),
              endDate: parseDateToGoogleDate(event.endDate),
            },
          };
        }

        if (offer && topicType === "OFFER") {
          googlePost.offer = offer;
        }

        const result = await createLocalPost(
          googleBusinessId,
          googlePost as unknown as Parameters<typeof createLocalPost>[1],
          refreshToken
        );

        return await repo.update(post.id, {
          status: "published",
          googlePostName: result.name,
          publishedAt: new Date(),
        });
      } catch (error) {
        console.error("Failed to publish post to Google:", error);
        await repo.update(post.id, { status: "failed" });
        throw error;
      }
    }

    return post;
  }
);

export const publishPost = createSafeAction(PostIdSchema, async ({ locationId, postId }, { userId }) => {
  const repo = new PostsRepository(userId, locationId);
  const post = await repo.get(postId);
  if (!post) throw new Error("Post not found");

  const { googleBusinessId, encryptedRefreshToken } = await resolveLocationConnection(locationId);
  const refreshToken = await decryptToken(encryptedRefreshToken);

  const googlePost: Record<string, unknown> = {
    summary: post.summary,
    topicType: post.topicType,
  };

  if (post.mediaUrl) {
    googlePost.media = [{ mediaFormat: "PHOTO", sourceUrl: post.mediaUrl }];
  }

  if (post.callToAction) {
    googlePost.callToAction = post.callToAction;
  }

  if (post.event && (post.topicType === "EVENT" || post.topicType === "OFFER")) {
    googlePost.event = {
      title: post.event.title,
      schedule: {
        startDate: parseDateToGoogleDate(post.event.startDate),
        endDate: parseDateToGoogleDate(post.event.endDate),
      },
    };
  }

  if (post.offer && post.topicType === "OFFER") {
    googlePost.offer = post.offer;
  }

  const result = await createLocalPost(
    googleBusinessId,
    googlePost as unknown as Parameters<typeof createLocalPost>[1],
    refreshToken
  );

  return repo.update(postId, {
    status: "published",
    googlePostName: result.name,
    publishedAt: new Date(),
  });
});

export const deletePost = createSafeAction(PostIdSchema, async ({ locationId, postId }, { userId }) => {
  const repo = new PostsRepository(userId, locationId);
  const post = await repo.get(postId);
  if (!post) throw new Error("Post not found");

  if (post.googlePostName) {
    try {
      const { encryptedRefreshToken } = await resolveLocationConnection(locationId);
      const refreshToken = await decryptToken(encryptedRefreshToken);
      await deleteLocalPost(post.googlePostName, refreshToken);
    } catch (error) {
      console.error("Failed to delete post from Google:", error);
    }
  }

  await repo.delete(postId);
});
