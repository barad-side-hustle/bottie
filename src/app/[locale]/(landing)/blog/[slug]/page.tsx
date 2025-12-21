import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { getAllSlugs, getPostBySlug } from "@/lib/blog/posts";
import { generateBlogPostingSchema } from "@/lib/blog/schema";
import { mdxComponents } from "@/lib/blog/mdx-components";
import { StructuredData } from "@/components/seo/StructuredData";
import { BlogPostLayout } from "@/components/blog/BlogPostLayout";

export async function generateStaticParams() {
  const locales = ["en", "he"];
  const params = [];

  for (const locale of locales) {
    const slugs = getAllSlugs(locale);
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;

  try {
    const post = getPostBySlug(slug, locale);
    if (!post) return {};

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return {
      title: post.title,
      description: post.excerpt,
      keywords: post.keywords.join(", "),
      authors: [{ name: post.author }],
      openGraph: {
        title: post.title,
        description: post.excerpt,
        url: `${baseUrl}/${locale}/blog/${slug}`,
        siteName: "Bottie.ai",
        type: "article",
        publishedTime: post.publishedAt,
        modifiedTime: post.updatedAt,
        authors: [post.author],
        images: [
          {
            url: post.ogImage,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt,
        images: [post.ogImage],
      },
      alternates: {
        canonical: `${baseUrl}/${locale}/blog/${slug}`,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch {
    return {};
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;

  let post;
  try {
    post = getPostBySlug(slug, locale);
    if (!post) {
      notFound();
    }
  } catch (error) {
    console.error(`Error loading blog post ${slug}:`, error);
    notFound();
  }

  const schema = generateBlogPostingSchema(post);

  return (
    <>
      <StructuredData data={schema} />
      <BlogPostLayout post={post} locale={locale}>
        <MDXRemote
          source={post.content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                rehypeSlug,
                [
                  rehypeAutolinkHeadings,
                  {
                    behavior: "wrap",
                    properties: {
                      className: ["anchor"],
                    },
                  },
                ],
              ],
            },
          }}
          components={mdxComponents}
        />
      </BlogPostLayout>
    </>
  );
}
