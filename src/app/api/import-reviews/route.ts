import { getAuthenticatedUserId } from "@/lib/api/auth";
import { ReviewsRepository } from "@/lib/db/repositories/reviews.repository";
import { ReviewResponsesRepository } from "@/lib/db/repositories/review-responses.repository";
import { AccountsRepository } from "@/lib/db/repositories/accounts.repository";
import { AccountLocationsRepository } from "@/lib/db/repositories/account-locations.repository";
import { listReviews, starRatingToNumber, parseGoogleTimestamp, GoogleReview } from "@/lib/google/reviews";
import { decryptToken } from "@/lib/google/business-profile";
import { ReviewInsert, ReviewResponseInsert } from "@/lib/db/schema";
import { isDuplicateKeyError } from "@/lib/db/error-handlers";

export const runtime = "nodejs";

const MAX_IMPORT_COUNT = 500;
const BATCH_SIZE = 50;
const CONCURRENCY_LIMIT = 5;

function sendEvent(controller: ReadableStreamDefaultController, encoder: TextEncoder, data: Record<string, unknown>) {
  try {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  } catch {}
}

export async function POST(request: Request) {
  const { userId } = await getAuthenticatedUserId();

  let accountId: string | undefined;
  let locationId: string | undefined;

  try {
    const body = await request.json();
    accountId = body.accountId;
    locationId = body.locationId;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid or empty request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!accountId || !locationId) {
    return new Response(JSON.stringify({ error: "Missing accountId or locationId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const accountsRepo = new AccountsRepository(userId);
        const accountLocationsRepo = new AccountLocationsRepository(userId, accountId);
        const reviewsRepo = new ReviewsRepository(userId, locationId);
        const reviewResponsesRepo = new ReviewResponsesRepository(userId, accountId, locationId);

        const account = await accountsRepo.get(accountId);
        if (!account || !account.googleRefreshToken) {
          sendEvent(controller, encoder, { type: "error", message: "Account not found or missing credentials" });
          controller.close();
          return;
        }

        const accountLocation = await accountLocationsRepo.getByLocationId(locationId);
        if (!accountLocation || !accountLocation.googleBusinessId) {
          sendEvent(controller, encoder, { type: "error", message: "Location connection not found" });
          controller.close();
          return;
        }

        const refreshToken = await decryptToken(account.googleRefreshToken);

        let importedCount = 0;
        let totalFetchedCount = 0;
        let reviewBuffer: GoogleReview[] = [];
        let totalSent = false;

        const processReviewBatch = async (reviews: GoogleReview[]) => {
          for (let i = 0; i < reviews.length; i += CONCURRENCY_LIMIT) {
            const chunk = reviews.slice(i, i + CONCURRENCY_LIMIT);
            await Promise.all(
              chunk.map(async (googleReview) => {
                const existingReview = await reviewsRepo.findByGoogleReviewId(googleReview.reviewId);

                if (!existingReview) {
                  const hasReply = !!googleReview.reviewReply;

                  const reviewData: ReviewInsert = {
                    locationId,
                    googleReviewId: googleReview.reviewId,
                    googleReviewName: googleReview.name,
                    name: googleReview.reviewer.displayName,
                    photoUrl: googleReview.reviewer.profilePhotoUrl || null,
                    rating: starRatingToNumber(googleReview.starRating),
                    text: googleReview.comment || "",
                    date: parseGoogleTimestamp(googleReview.createTime),
                    updateTime: parseGoogleTimestamp(googleReview.updateTime),
                    receivedAt: new Date(),
                    isAnonymous: googleReview.reviewer.isAnonymous || false,
                    replyStatus: hasReply ? "posted" : "pending",
                    consumesQuota: false,
                    notificationSent: hasReply,
                  };

                  try {
                    const newReview = await reviewsRepo.create(reviewData);
                    importedCount++;

                    if (hasReply && googleReview.reviewReply && googleReview.reviewReply.comment) {
                      const responseData: Omit<ReviewResponseInsert, "accountId" | "locationId"> = {
                        reviewId: newReview.id,
                        text: googleReview.reviewReply.comment,
                        status: "posted",
                        postedAt: parseGoogleTimestamp(googleReview.reviewReply.updateTime),
                        createdAt: new Date(),
                        generatedBy: null,
                        type: "imported",
                      };

                      await reviewResponsesRepo.create(responseData);
                    }
                  } catch (error) {
                    if (isDuplicateKeyError(error)) {
                      return;
                    }
                    throw error;
                  }
                }
              })
            );
          }
        };

        for await (const reviewsResponse of listReviews(
          accountLocation.googleBusinessId,
          refreshToken,
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        )) {
          if (!totalSent) {
            const total = Math.min(reviewsResponse.totalReviewCount || 0, MAX_IMPORT_COUNT);
            sendEvent(controller, encoder, { type: "total", total });
            totalSent = true;

            if (total === 0) {
              sendEvent(controller, encoder, { type: "complete", imported: 0 });
              controller.close();
              return;
            }
          }

          if (reviewsResponse.reviews && reviewsResponse.reviews.length > 0) {
            let newReviews = reviewsResponse.reviews;

            if (totalFetchedCount + newReviews.length > MAX_IMPORT_COUNT) {
              newReviews = newReviews.slice(0, MAX_IMPORT_COUNT - totalFetchedCount);
            }

            totalFetchedCount += newReviews.length;
            reviewBuffer.push(...newReviews);

            if (reviewBuffer.length >= BATCH_SIZE) {
              await processReviewBatch(reviewBuffer);
              reviewBuffer = [];
              sendEvent(controller, encoder, { type: "progress", imported: importedCount });
            }

            if (totalFetchedCount >= MAX_IMPORT_COUNT) {
              break;
            }
          }
        }

        if (reviewBuffer.length > 0) {
          await processReviewBatch(reviewBuffer);
        }

        sendEvent(controller, encoder, { type: "complete", imported: importedCount });
        controller.close();
      } catch (error) {
        console.error("Error in review import stream:", error);
        try {
          sendEvent(controller, encoder, {
            type: "error",
            message: error instanceof Error ? error.message : "Import failed",
          });
          controller.close();
        } catch {}
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
