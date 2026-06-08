"use client";

import { useTranslations, useFormatter } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
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
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <EmptyState icon={FileText} title={t("noPosts")} description={t("pageDescription")} />
      </div>
    );
  }

  return (
    <ul className="divide-y divide-hairline">
      {posts.map((post) => (
        <PostRow key={post.id} post={post} locationId={locationId} onRefresh={onRefresh} onEdit={onEdit} />
      ))}
    </ul>
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
    <li className="group flex gap-4 py-4 transition-colors first:pt-0">
      {post.mediaUrl ? (
        <img src={post.mediaUrl} alt="" className="size-12 shrink-0 rounded-md border border-hairline object-cover" />
      ) : (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface-2">
          <TypeIcon className="size-4 text-ink-3" strokeWidth={1.5} aria-hidden />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-2">{t(`types.${post.topicType}`)}</span>
          <span className="text-ink-3" aria-hidden>
            ·
          </span>
          <span className="text-xs tabular-nums text-ink-3">{dateStr}</span>
          <Badge variant={statusConfig.variant} className="ms-auto shrink-0">
            <StatusIcon />
            {t(`status.${post.status}`)}
          </Badge>
        </div>

        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink">{post.summary}</p>

        {(post.mediaUrl || post.callToAction || post.event) && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
            {post.mediaUrl && (
              <span className="inline-flex items-center gap-1">
                <ImageIcon className="size-3" strokeWidth={1.5} aria-hidden />
              </span>
            )}
            {post.callToAction && (
              <span className="inline-flex items-center gap-1">
                <ExternalLink className="size-3" strokeWidth={1.5} aria-hidden />
                {post.callToAction.actionType.replace("_", " ").toLowerCase()}
              </span>
            )}
            {post.event && <span className="truncate">{post.event.title}</span>}
          </div>
        )}

        <div className="mt-2.5 flex items-center gap-1">
          {post.status === "draft" ? (
            <>
              <Button size="icon-sm" variant="ghost" onClick={() => onEdit(post)} disabled={isLoading}>
                <Pencil className="size-3.5" />
              </Button>
              <Button size="icon-sm" variant="ghost" onClick={handleDelete} disabled={isLoading}>
                <Trash2 className="size-3.5" />
              </Button>
              <Button size="sm" variant="default" onClick={handlePublish} disabled={isLoading} className="ms-1">
                {t("publish")}
              </Button>
            </>
          ) : (
            <Button size="icon-sm" variant="ghost" onClick={handleDelete} disabled={isLoading}>
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}
