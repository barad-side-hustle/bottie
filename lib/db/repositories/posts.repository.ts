import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { locationPosts, type LocationPost, type LocationPostInsert } from "@/lib/db/schema";
import { createLocationAccessCondition } from "./access-conditions";

export class PostsRepository {
  constructor(
    private userId: string,
    private locationId: string
  ) {}

  private getAccessCondition() {
    return createLocationAccessCondition(this.userId, this.locationId);
  }

  async list() {
    return db.query.locationPosts.findMany({
      where: and(eq(locationPosts.locationId, this.locationId), this.getAccessCondition()),
      orderBy: [desc(locationPosts.createdAt)],
    });
  }

  async get(postId: string) {
    return db.query.locationPosts.findFirst({
      where: and(
        eq(locationPosts.id, postId),
        eq(locationPosts.locationId, this.locationId),
        this.getAccessCondition()
      ),
    });
  }

  async create(data: LocationPostInsert): Promise<LocationPost> {
    const [created] = await db
      .insert(locationPosts)
      .values({ ...data, locationId: this.locationId })
      .returning();
    if (!created) throw new Error("Failed to create post");
    return created;
  }

  async update(postId: string, data: Partial<LocationPost>): Promise<LocationPost> {
    const [updated] = await db
      .update(locationPosts)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(eq(locationPosts.id, postId), eq(locationPosts.locationId, this.locationId), this.getAccessCondition())
      )
      .returning();
    if (!updated) throw new Error("Post not found");
    return updated;
  }

  async delete(postId: string): Promise<void> {
    await db
      .delete(locationPosts)
      .where(
        and(eq(locationPosts.id, postId), eq(locationPosts.locationId, this.locationId), this.getAccessCondition())
      );
  }
}
