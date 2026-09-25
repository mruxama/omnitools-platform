import { NextResponse } from "next/server";
import { getIndexableConversionsDb, getSeoSettingsDb } from "@/lib/db/repository";

export async function GET() {
  const settings = await getSeoSettingsDb();
  const baseUrl = settings.domain || "https://omnitools.app";
  const conversions = await getIndexableConversionsDb();

  const xmlUrls = conversions
    .map((conv) => {
      const lastMod = (conv.updatedAt ? new Date(conv.updatedAt) : new Date()).toISOString();
      const priority = (conv.seoScore || 80) >= 90 ? "0.9" : "0.8";
      return `  <url>
    <loc>${baseUrl}/convert/${conv.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
