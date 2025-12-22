import { type BlogPost } from "@/lib/blog/posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { TableOfContents } from "./TableOfContents";
import { RelatedPosts } from "./RelatedPosts";
import { SocialShareButtons } from "./SocialShareButtons";
import { getTranslations } from "next-intl/server";

interface BlogPostLayoutProps {
  post: BlogPost;
  children: React.ReactNode;
  locale: string;
}

export async function BlogPostLayout({ post, children, locale }: BlogPostLayoutProps) {
  const t = await getTranslations({ locale, namespace: "blog" });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${baseUrl}/${locale}/blog/${post.slug}`;

  const getCategoryLabel = (category: string) => {
    try {
      return t(`categories.${category}`);
    } catch {
      return category;
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <Button asChild variant="ghost" className="mb-8">
        <Link href="/blog">
          <ArrowLeft className="me-2 h-4 w-4" />
          {t("backToBlog")}
        </Link>
      </Button>

      <article className="max-w-4xl mx-auto">
        <header className="mb-12">
          <Badge variant="secondary" className="mb-4">
            {getCategoryLabel(post.category)}
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{post.title}</h1>

          <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-y border-border py-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.publishedAt}>
                  {t("publishedOn", {
                    date: new Date(post.publishedAt).toLocaleDateString(locale === "he" ? "he-IL" : "en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }),
                  })}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{t("minRead", { time: post.readingTime })}</span>
              </div>
            </div>

            <SocialShareButtons url={url} title={post.title} description={post.excerpt} />
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-[1fr_250px] lg:gap-12">
          <div className="prose prose-lg max-w-none prose-headings:scroll-mt-20 dark:prose-invert">{children}</div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents />
            </div>
          </aside>
        </div>

        <div className="mt-16 pt-16 border-t border-border">
          <RelatedPosts currentSlug={post.slug} category={post.category} locale={locale} />
        </div>
      </article>
    </div>
  );
}
