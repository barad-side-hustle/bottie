import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog/posts";
import { generateBlogSchema } from "@/lib/blog/schema";
import { StructuredData } from "@/components/seo/StructuredData";
import { BlogCard } from "@/components/blog/BlogCard";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    keywords: t("metadata.keywords"),
    openGraph: {
      title: t("metadata.title"),
      description: t("metadata.description"),
      url: `${baseUrl}/${locale}/blog`,
      siteName: "Bottie.ai",
      type: "website",
      images: [
        {
          url: `/images/blog/og-default.jpg`,
          width: 1200,
          height: 630,
          alt: t("metadata.title"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("metadata.title"),
      description: t("metadata.description"),
      images: [`/images/blog/og-default.jpg`],
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/blog`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BlogIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const posts = getAllPosts(locale);
  const schema = generateBlogSchema(locale);

  return (
    <>
      <StructuredData data={schema} />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("title")}</h1>
          <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
        </div>

        {posts.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-12">
            <p className="text-muted-foreground">{t("noPosts")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
