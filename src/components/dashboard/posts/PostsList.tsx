"use client";

import { useTranslations, useFormatter } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
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
import type { LucideIcon } from "lucide-react";
import type { LocationPost } from "@/lib/db/schema/location-posts.schema";
import type { BadgeProps } from "@/components/ui/badge";

interface PostsListProps {
  posts: LocationPost[];
  locationId: string;
  onRefresh: () => void;
  onEdit: (post: LocationPost) => void;
}

export function PostsList({ posts, locationId, onRefresh, onEdit }: PostsListProps) {
  const t = useTranslations("dashboard.posts");

  if (posts.length === 0) {
    return <EmptyState icon={FileText} title={t("noPosts")} description={t("pageDescription")} />;
  }

  return (
    <DashboardCard>
      <DashboardCardContent className="p-0 divide-y divide-border/60">
        {posts.map((post) => (
          <PostRow key={post.id} post={post} locationId={locationId} onRefresh={onRefresh} onEdit={onEdit} />
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

const STATUS_CONFIG: Record<string, { icon: LucideIcon; variant: BadgeProps["variant"] }> = {
  draft: { icon: Clock, variant: "muted" },
  published: { icon: CheckCircle2, variant: "success" },
  failed: { icon: XCircle, variant: "destructive" },
};

function PostRow({
  post,
  locationId,
  onRefresh,
  onEdit,
}: {
  post: LocationPost;
  locationId: string;
  onRefresh: () => void;
  onEdit: (post: LocationPost) => void;
}) {
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
  const statusConfig = STATUS_CONFIG[post.status] ?? STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;

  const dateStr = post.publishedAt
    ? format.dateTime(new Date(post.publishedAt), { month: "short", day: "numeric", year: "numeric" })
    : format.dateTime(new Date(post.createdAt), { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="flex items-start gap-4 p-4 transition-colors first:rounded-t-3xl last:rounded-b-3xl hover:bg-muted/40">
      <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
        <TypeIcon className="size-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <Badge variant={statusConfig.variant}>
            <StatusIcon />
            {t(`status.${post.status}`)}
          </Badge>
          <span className="text-xs text-muted-foreground">{dateStr}</span>
        </div>

        <p className="line-clamp-2 text-sm">{post.summary}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-xs font-medium text-muted-foreground">{t(`types.${post.topicType}`)}</span>
          {post.mediaUrl && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ImageIcon className="size-3" />
            </span>
          )}
          {post.callToAction && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ExternalLink className="size-3" />
              {post.callToAction.actionType.replace("_", " ").toLowerCase()}
            </span>
          )}
          {post.event && <span className="truncate text-xs text-muted-foreground">{post.event.title}</span>}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {post.status === "draft" && (
          <>
            <Button size="icon-sm" variant="ghost" onClick={() => onEdit(post)} disabled={isLoading}>
              <Pencil className="size-3.5" />
            </Button>
            <Button size="icon-sm" variant="ghost" onClick={handleDelete} disabled={isLoading}>
              <Trash2 className="size-3.5" />
            </Button>
            <Button size="sm" variant="default" onClick={handlePublish} disabled={isLoading}>
              {t("publish")}
            </Button>
          </>
        )}
        {post.status !== "draft" && (
          <Button size="icon-sm" variant="ghost" onClick={handleDelete} disabled={isLoading}>
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
