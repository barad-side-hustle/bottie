"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { PostComposer } from "@/components/dashboard/posts/PostComposer";
import { PostsList } from "@/components/dashboard/posts/PostsList";
import { listPosts } from "@/lib/actions/posts.actions";
import type { LocationPost } from "@/lib/db/schema/location-posts.schema";

export default function PostsPage() {
  const t = useTranslations("dashboard.posts");
  const params = useParams();
  const locationId = params.locationId as string;
  const [posts, setPosts] = useState<LocationPost[]>([]);

  const fetchPosts = useCallback(async () => {
    try {
      const result = await listPosts({ locationId });
      setPosts(result);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  }, [locationId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <PageContainer>
      <PageHeader title={t("pageTitle")} description={t("pageDescription")} />

      <div className="mt-6 space-y-6">
        <PostComposer locationId={locationId} onPostCreated={fetchPosts} />
        <PostsList posts={posts} locationId={locationId} onRefresh={fetchPosts} />
      </div>
    </PageContainer>
  );
}
