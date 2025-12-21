"use client";

import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  FacebookIcon,
  LinkedinIcon,
  XIcon,
} from "react-share";
import { useTranslations } from "next-intl";

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description: string;
}

export function SocialShareButtons({ url, title, description }: SocialShareButtonsProps) {
  const t = useTranslations("blog");

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">{t("share")}</span>
      <div className="flex items-center gap-2">
        <TwitterShareButton url={url} title={title}>
          <XIcon size={32} round />
        </TwitterShareButton>

        <LinkedinShareButton url={url} title={title} summary={description}>
          <LinkedinIcon size={32} round />
        </LinkedinShareButton>

        <FacebookShareButton url={url} hashtag="#AI">
          <FacebookIcon size={32} round />
        </FacebookShareButton>
      </div>
    </div>
  );
}
