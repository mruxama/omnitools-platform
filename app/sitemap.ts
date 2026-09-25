import { MetadataRoute } from "next";
import { TOOLS_REGISTRY, CATEGORIES } from "@/lib/tools/registry";
import {
  getAllFormatsDb,
  getIndexableConversionsDb,
  getSeoSettingsDb,
  getAllBlogPostsDb,
} from "@/lib/db/repository";
import { getAllCategories } from "@/lib/converter/categoryRegistry";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSeoSettingsDb();
  const baseUrl = settings.domain || process.env.NEXT_PUBLIC_SITE_URL || "https://omnitools.app";
  const now = new Date();

  // 1. Root & static legal/about pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/tools`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/omniget`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/web-check`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/convert`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/convert/workflow`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // 2. Category studio pages
  const categoryPages: MetadataRoute.Sitemap = getAllCategories().map((cat) => ({
    url: `${baseUrl}/convert/${cat.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  // 3. Tool directory pages
  const toolPages: MetadataRoute.Sitemap = TOOLS_REGISTRY.map((tool) => ({
    url: `${baseUrl}${tool.path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: tool.badges?.includes("popular") ? 0.9 : 0.7,
  }));

  // 4. Format Knowledge pages (/formats/[format])
  const formats = await getAllFormatsDb();
  const formatPages: MetadataRoute.Sitemap = formats
    .filter((f) => f.status !== "DISABLED")
    .map((f) => ({
      url: `${baseUrl}/formats/${f.slug}`,
      lastModified: f.updatedAt || now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  // 5. High-Value Indexable Conversion pages (/convert/[pair])
  const indexableConversions = await getIndexableConversionsDb();
  const conversionPages: MetadataRoute.Sitemap = indexableConversions.map((conv) => ({
    url: `${baseUrl}/convert/${conv.slug}`,
    lastModified: conv.updatedAt || now,
    changeFrequency: "weekly" as const,
    priority: (conv.seoScore || 80) >= 90 ? 0.9 : 0.8,
  }));

  // 6. Published Blog Articles (/blog/[slug])
  const blogPosts = await getAllBlogPostsDb("published");
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt || now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...formatPages,
    ...toolPages,
    ...conversionPages,
    ...blogPages,
  ];
}
