"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { type BlogPost } from "@/lib/blog/posts";
import { Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";

interface BlogCardProps {
  post: BlogPost;
  locale?: string;
}

export function BlogCard({ post }: BlogCardProps) {
  const t = useTranslations("blog");
  const locale = useLocale();

  const getCategoryLabel = (category: string) => {
    try {
      return t(`categories.${category}`);
    } catch {
      return category;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{getCategoryLabel(post.category)}</Badge>
          </div>
          <CardTitle className="text-2xl hover:text-primary transition-colors">
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </CardTitle>
          <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
        </CardHeader>

        <CardContent className="flex-grow flex flex-col justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString(locale === "he" ? "he-IL" : "en-US", {
                  year: "numeric",
                  month: undefined,
                  day: "numeric",
                })}
              </time>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{t("minRead", { time: post.readingTime })}</span>
            </div>
          </div>

          <Button asChild variant="outline" className="w-full">
            <Link href={`/blog/${post.slug}`}>{t("readMore")}</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
