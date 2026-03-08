"use client";

import { useTranslations, useFormatter } from "next-intl";
import { Button } from "@/components/ui/button";
import { DashboardCard, DashboardCardContent } from "@/components/ui/dashboard-card";
import { publishPost, deletePost } from "@/lib/actions/posts.actions";
import {
  Trash2,
  ExternalLink,
  Pencil,
  FileText,
  CalendarDays,
  Tag,
  Clock,
  CheckCircle2,
  XCircle,
  ImageIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { LocationPost } from "@/lib/db/schema/location-posts.schema";

interface PostsListProps {
  posts: LocationPost[];
  locationId: string;
  onRefresh: () => void;
}

export function PostsList({ posts, locationId, onRefresh }: PostsListProps) {
  const t = useTranslations("dashboard.posts");

  if (posts.length === 0) {
    return (
      <DashboardCard>
        <DashboardCardContent className="py-16 text-center">
          <FileText className="size-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">{t("noPosts")}</p>
        </DashboardCardContent>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard>
      <DashboardCardContent className="p-0 divide-y divide-border/40">
        {posts.map((post) => (
          <PostRow key={post.id} post={post} locationId={locationId} onRefresh={onRefresh} />
        ))}
      </DashboardCardContent>
    </DashboardCard>
  );
}

const TYPE_ICON = {
  STANDARD: FileText,
  EVENT: CalendarDays,
  OFFER: Tag,
} as const;

const STATUS_CONFIG = {
  draft: {
    icon: Clock,
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
  published: {
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
  },
  failed: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
} as const;

function PostRow({ post, locationId, onRefresh }: { post: LocationPost; locationId: string; onRefresh: () => void }) {
  const t = useTranslations("dashboard.posts");
  const format = useFormatter();
  const [isLoading, setIsLoading] = useState(false);

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      await publishPost({ locationId, postId: post.id });
      onRefresh();
    } catch (error) {
      console.error("Failed to publish post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deletePost({ locationId, postId: post.id });
      onRefresh();
    } catch (error) {
      console.error("Failed to delete post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const TypeIcon = TYPE_ICON[post.topicType] || FileText;
  const statusConfig = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;

  const dateStr = post.publishedAt
    ? format.dateTime(new Date(post.publishedAt), { month: "short", day: "numeric", year: "numeric" })
    : format.dateTime(new Date(post.createdAt), { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="flex items-start gap-4 p-4 transition-colors hover:bg-muted/30">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/5 shrink-0 mt-0.5">
        <TypeIcon className="size-5 text-primary/70" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              statusConfig.bg,
              statusConfig.color
            )}
          >
            <StatusIcon className="size-3" />
            {t(`status.${post.status}`)}
          </div>
          <span className="text-xs text-muted-foreground">{dateStr}</span>
        </div>

        <p className="text-sm line-clamp-2">{post.summary}</p>

        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-muted-foreground">{t(`types.${post.topicType}`)}</span>
          {post.mediaUrl && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <ImageIcon className="size-3" />
            </span>
          )}
          {post.callToAction && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <ExternalLink className="size-3" />
              {post.callToAction.actionType.replace("_", " ").toLowerCase()}
            </span>
          )}
          {post.event && <span className="text-xs text-muted-foreground">{post.event.title}</span>}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {post.status === "draft" && (
          <>
            <Button size="icon" variant="ghost" className="size-8" disabled={isLoading}>
              <Pencil className="size-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="size-8" onClick={handleDelete} disabled={isLoading}>
              <Trash2 className="size-3.5" />
            </Button>
            <Button size="sm" variant="default" onClick={handlePublish} disabled={isLoading}>
              {t("publish")}
            </Button>
          </>
        )}
        {post.status !== "draft" && (
          <Button size="icon" variant="ghost" className="size-8" onClick={handleDelete} disabled={isLoading}>
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
