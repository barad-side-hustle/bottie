"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { buildLocationBreadcrumbs } from "@/lib/utils/breadcrumbs";
import { useSidebarData } from "@/contexts/SidebarDataContext";
import { PostComposer } from "@/components/dashboard/posts/PostComposer";
import { PostsList } from "@/components/dashboard/posts/PostsList";
import { listPosts } from "@/lib/actions/posts.actions";
import type { LocationPost } from "@/lib/db/schema/location-posts.schema";

export default function PostsPage() {
  const t = useTranslations("dashboard.posts");
  const tBreadcrumbs = useTranslations("breadcrumbs");
  const params = useParams();
  const locationId = params.locationId as string;
  const { locations } = useSidebarData();
  const locationName = locations.find((l) => l.locationId === locationId)?.locationName ?? "";
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
      <div className="mb-4">
        <Breadcrumbs
          items={buildLocationBreadcrumbs({
            locationName,
            locationId,
            currentSection: "posts",
            t: tBreadcrumbs,
          })}
        />
      </div>
      <PageHeader title={t("pageTitle")} description={t("pageDescription")} />

      <div className="mt-6 space-y-6">
        <div ref={composerRef}>
          <PostComposer
            key={editingPost?.id ?? "new"}
            locationId={locationId}
            editingPost={editingPost}
            onPostCreated={fetchPosts}
            onCancelEdit={handleCancelEdit}
          />
        </div>
        <PostsList posts={posts} locationId={locationId} onRefresh={fetchPosts} onEdit={handleEdit} />
      </div>
    </PageContainer>
  );
}
