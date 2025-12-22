import fs from "fs";
import path from "path";
import readingTime from "reading-time";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  authorOrg?: boolean;
  publishedAt: string;
  updatedAt?: string;
  keywords: string[];
  category: string;
  readingTime: number;
  ogImage: string;
  content: string;
  locale: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content/blog");

export function getPostBySlug(slug: string, locale: string = "en"): BlogPost | null {
  const localeDir = path.join(CONTENT_DIR, locale);
  const mdxPath = path.join(localeDir, `${slug}.mdx`);
  const metaPath = path.join(localeDir, `${slug}.meta.json`);

  if (!fs.existsSync(mdxPath) || !fs.existsSync(metaPath)) {
    return null;
  }

  const content = fs.readFileSync(mdxPath, "utf8");
  const metadata = JSON.parse(fs.readFileSync(metaPath, "utf8"));

  return {
    slug,
    title: metadata.title,
    excerpt: metadata.excerpt,
    author: metadata.author,
    authorOrg: metadata.authorOrg,
    publishedAt: metadata.publishedAt,
    updatedAt: metadata.updatedAt,
    keywords: metadata.keywords || [],
    category: metadata.category || "general",
    readingTime: Math.ceil(readingTime(content).minutes),
    ogImage: metadata.ogImage || `/images/blog/${slug}/og-image.jpg`,
    content,
    locale,
  };
}

export function getAllPosts(locale: string = "en"): BlogPost[] {
  const localeDir = path.join(CONTENT_DIR, locale);

  if (!fs.existsSync(localeDir)) {
    return [];
  }

  const files = fs.readdirSync(localeDir).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => getPostBySlug(file.replace(/\.mdx$/, ""), locale))
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getAllSlugs(locale: string = "en"): string[] {
  const localeDir = path.join(CONTENT_DIR, locale);

  if (!fs.existsSync(localeDir)) {
    return [];
  }

  return fs
    .readdirSync(localeDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}
