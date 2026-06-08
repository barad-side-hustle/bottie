"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { PostComposer } from "@/components/dashboard/posts/PostComposer";
import { PostsList } from "@/components/dashboard/posts/PostsList";
import { listPosts } from "@/lib/actions/posts.actions";
import type { LocationPost } from "@/lib/db/schema/location-posts.schema";

export default function PostsPage() {
  const t = useTranslations("dashboard.posts");
  const params = useParams();
  const locationId = params.locationId as string;
  const [posts, setPosts] = useState<LocationPost[]>([]);
  const [editingPost, setEditingPost] = useState<LocationPost | null>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listPosts({ locationId }).then(setPosts).catch(console.error);
  }, [locationId]);

  const fetchPosts = useCallback(async () => {
    try {
      const result = await listPosts({ locationId });
      setPosts(result);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  }, [locationId]);

  const handleEdit = useCallback((post: LocationPost) => {
    setEditingPost(post);
    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingPost(null);
  }, []);

  return (
    <PageContainer>
      <PageHeader title={t("pageTitle")} description={t("pageDescription")} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,440px)_1fr]">
        <div ref={composerRef} className="lg:sticky lg:top-6 lg:self-start">
          <PostComposer
            key={editingPost?.id ?? "new"}
            locationId={locationId}
            editingPost={editingPost}
            onPostCreated={fetchPosts}
            onCancelEdit={handleCancelEdit}
          />
        </div>

        <DashboardCard>
          <DashboardCardHeader className="pb-0">
            <DashboardCardTitle>
              {t("pageTitle")}
              {posts.length > 0 && (
                <span className="text-base font-normal tabular-nums text-ink-3">{posts.length}</span>
              )}
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="pt-4">
            <PostsList posts={posts} locationId={locationId} onRefresh={fetchPosts} onEdit={handleEdit} />
          </DashboardCardContent>
        </DashboardCard>
      </div>
    </PageContainer>
  );
}
