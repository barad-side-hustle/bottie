import { getAllPosts } from "@/lib/blog/posts";
import { BlogCard } from "./BlogCard";
import { getTranslations } from "next-intl/server";

interface RelatedPostsProps {
  currentSlug: string;
  category: string;
  locale: string;
}

export async function RelatedPosts({ currentSlug, category, locale }: RelatedPostsProps) {
  const t = await getTranslations({ locale, namespace: "blog" });
  const allPosts = getAllPosts(locale);

  const relatedPosts = allPosts.filter((post) => post.slug !== currentSlug && post.category === category).slice(0, 3);

  if (relatedPosts.length === 0) return null;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">{t("relatedArticles")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <BlogCard key={post.slug} post={post} locale={locale} />
        ))}
      </div>
    </div>
  );
}
