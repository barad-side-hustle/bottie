import { type BlogPost } from "./posts";

export function generateBlogPostingSchema(post: BlogPost) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    image: `${baseUrl}${post.ogImage}`,
    url: `${baseUrl}/blog/${post.slug}`,
    keywords: post.keywords.join(", "),
    articleSection: post.category,
    inLanguage: "en-US",
    publisher: {
      "@type": "Organization",
      name: "Bottie.ai",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/images/logo-full.svg`,
      },
    },
  };
}

export function generateBlogSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Bottie Blog",
    description: "Learn how to automate Google review responses with AI",
    url: `${baseUrl}/blog`,
    inLanguage: "en-US",
  };
}
