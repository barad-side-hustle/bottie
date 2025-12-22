import { type BlogPost } from "./posts";

export function generateBlogPostingSchema(post: BlogPost) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": post.authorOrg ? "Organization" : "Person",
      name: post.author || "Bottie",
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    image: `${baseUrl}${post.ogImage}`,
    url: `${baseUrl}/blog/${post.slug}`,
    keywords: post.keywords.join(", "),
    articleSection: post.category,
    inLanguage: post.locale || "en-US",
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

export function generateBlogSchema(locale: string = "en-US") {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Bottie Blog",
    description: "Learn how to automate Google review responses with AI",
    url: `${baseUrl}/${locale}/blog`,
    inLanguage: locale,
  };
}
