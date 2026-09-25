import { MetadataRoute } from "next";
import { getSeoSettingsDb } from "@/lib/db/repository";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSeoSettingsDb();
  const baseUrl = settings.domain || process.env.NEXT_PUBLIC_SITE_URL || "https://omnitools.app";

  const rules: MetadataRoute.Robots["rules"] = [
    {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/auth/", "/internal/"],
    },
  ];

  // If OpenAI Search crawler is allowed per SeoSettings:
  if (settings.allowOaiSearchBot) {
    rules.push({
      userAgent: "OAI-SearchBot",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    });
  }

  return {
    rules,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
