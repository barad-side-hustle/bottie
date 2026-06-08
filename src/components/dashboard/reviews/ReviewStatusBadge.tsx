"use client";

import { ReplyStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ResponsiveTooltip } from "@/components/ui/tooltip";
import { User, Bot } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReviewWithLatestGeneration } from "@/lib/db/repositories";

export function ReviewStatusBadge({ review }: { review: ReviewWithLatestGeneration }) {
  const t = useTranslations("dashboard.reviews.card");
  const status = review.replyStatus as ReplyStatus;

  if (status === "pending" && !review.latestAiReply) {
    return (
      <ResponsiveTooltip title={t("status.generating")} description={t("statusDescription.generating")}>
        <span className="cursor-default">
          <Badge variant="muted">{t("status.generating")}</Badge>
        </span>
      </ResponsiveTooltip>
    );
  }

  const failedDesc =
    review.failureReason === "quota" ? t("statusDescription.failedQuota") : t("statusDescription.failed");

  const statusMap = {
    pending: {
      label: t("status.pending"),
      variant: "warning" as const,
      description: t("statusDescription.pending"),
    },
    posted: {
      label: t("status.posted"),
      variant: "success" as const,
      description: t("statusDescription.posted"),
    },
    failed: {
      label: review.failureReason === "quota" ? t("status.quotaExceeded") : t("status.failed"),
      variant: "destructive" as const,
      description: failedDesc,
    },
  };

  const statusInfo = statusMap[status] || statusMap.pending;

  let badgeElement;
  if (status === "posted") {
    const Icon = review.latestAiReplyPostedBy ? User : Bot;
    badgeElement = (
      <Badge variant={statusInfo.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  } else {
    badgeElement = <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  }

  return (
    <ResponsiveTooltip title={statusInfo.label} description={statusInfo.description}>
      <span className="cursor-default">{badgeElement}</span>
    </ResponsiveTooltip>
  );
}
