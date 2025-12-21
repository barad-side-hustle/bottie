import fs from "fs";
import path from "path";
import readingTime from "reading-time";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  keywords: string[];
  category: string;
  readingTime: number;
  ogImage: string;
  content: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content/blog");

export function getPostBySlug(slug: string): BlogPost {
  const mdxPath = path.join(CONTENT_DIR, `${slug}.mdx`);
  const metaPath = path.join(CONTENT_DIR, `${slug}.meta.json`);

  const content = fs.readFileSync(mdxPath, "utf8");
  const metadata = JSON.parse(fs.readFileSync(metaPath, "utf8"));

  return {
    slug,
    title: metadata.title,
    excerpt: metadata.excerpt,
    author: metadata.author,
    publishedAt: metadata.publishedAt,
    updatedAt: metadata.updatedAt,
    keywords: metadata.keywords || [],
    category: metadata.category || "general",
    readingTime: Math.ceil(readingTime(content).minutes),
    ogImage: metadata.ogImage || `/images/blog/${slug}/og-image.jpg`,
    content,
  };
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => getPostBySlug(file.replace(/\.mdx$/, "")))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}
