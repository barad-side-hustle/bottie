import { getAllPosts } from "@/lib/blog/posts";
import { BlogCard } from "./BlogCard";

interface RelatedPostsProps {
  currentSlug: string;
  category: string;
}

export async function RelatedPosts({ currentSlug, category }: RelatedPostsProps) {
  const allPosts = getAllPosts();

  const relatedPosts = allPosts.filter((post) => post.slug !== currentSlug && post.category === category).slice(0, 3);

  if (relatedPosts.length === 0) return null;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
