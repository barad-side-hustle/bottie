import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog/posts";
import { generateBlogSchema } from "@/lib/blog/schema";
import { StructuredData } from "@/components/seo/StructuredData";
import { BlogCard } from "@/components/blog/BlogCard";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    title: "Blog | Bottie.ai",
    description: "Learn how to automate your Google review responses with AI",
    keywords:
      "ai review automation, google business reviews, automated responses, review management, ai tool to respond to google reviews, automatically reply to google reviews",
    openGraph: {
      title: "Blog | Bottie.ai",
      description: "Learn how to automate your Google review responses with AI",
      url: `${baseUrl}/blog`,
      siteName: "Bottie.ai",
      type: "website",
      images: [
        {
          url: `/images/blog/og-default.jpg`,
          width: 1200,
          height: 630,
          alt: "Bottie Blog",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Blog | Bottie.ai",
      description: "Learn how to automate your Google review responses with AI",
      images: [`/images/blog/og-default.jpg`],
    },
    alternates: {
      canonical: `${baseUrl}/blog`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BlogIndexPage() {
  const posts = getAllPosts();
  const schema = generateBlogSchema();

  return (
    <>
      <StructuredData data={schema} />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-muted-foreground">Learn how to automate your Google review responses with AI</p>
        </div>

        {posts.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-12">
            <p className="text-muted-foreground">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
