import { NextResponse } from "next/server";
import { getAllFormatsDb, getSeoSettingsDb } from "@/lib/db/repository";

export async function GET() {
  const settings = await getSeoSettingsDb();
  const baseUrl = settings.domain || "https://omnitools.app";
  const formats = await getAllFormatsDb();

  const xmlUrls = formats
    .filter((f) => f.status !== "DISABLED")
    .map((f) => {
      const lastMod = (f.updatedAt ? new Date(f.updatedAt) : new Date()).toISOString();
      return `  <url>
    <loc>${baseUrl}/formats/${f.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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
