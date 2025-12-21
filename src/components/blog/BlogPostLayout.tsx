import { type BlogPost } from "@/lib/blog/posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { TableOfContents } from "./TableOfContents";
import { RelatedPosts } from "./RelatedPosts";
import { SocialShareButtons } from "./SocialShareButtons";

interface BlogPostLayoutProps {
  post: BlogPost;
  children: React.ReactNode;
}

export async function BlogPostLayout({ post, children }: BlogPostLayoutProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${baseUrl}/blog/${post.slug}`;

  const categoryLabels: Record<string, string> = {
    automation: "Automation",
    ai: "AI",
    reviews: "Reviews",
    general: "General",
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <Button asChild variant="ghost" className="mb-8">
        <Link href="/blog">
          <ArrowLeft className="me-2 h-4 w-4" />
          Back to Blog
        </Link>
      </Button>

      <article className="max-w-4xl mx-auto">
        <header className="mb-12">
          <Badge variant="secondary" className="mb-4">
            {categoryLabels[post.category] || post.category}
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{post.title}</h1>

          <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-y border-border py-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.publishedAt}>
                  Published on {new Date(post.publishedAt).toLocaleDateString("en-US")}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.readingTime} min read</span>
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
          <RelatedPosts currentSlug={post.slug} category={post.category} />
        </div>
      </article>
    </div>
  );
}
