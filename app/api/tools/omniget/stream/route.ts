import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";
export const maxDuration = 60;

function getYtDlpExecutable(): { path: string; source: string } | null {
  const candidates: Array<{ path: string; source: string }> = [
    {
      path: path.resolve(process.cwd(), "external/yt-dlp/yt-dlp.exe"),
      source: "embedded",
    },
    {
      path: path.resolve(process.cwd(), "external/omniget/bin/yt-dlp.exe"),
      source: "omniget-bin",
    },
    {
      path: process.env.APPDATA
        ? path.join(process.env.APPDATA, "wtf.tonho.omniget/bin/yt-dlp.exe")
        : "",
      source: "managed",
    },
  ].filter((c) => c.path.length > 0);

  for (const c of candidates) {
    try {
      if (fs.existsSync(c.path)) {
        return c;
      }
    } catch {}
  }
  return null;
}

/**
 * OmniGet Media Stream & Download Endpoint
 * STRICT POLICY:
 * 1. ONLY downloads media from the exact URL provided by the user.
 * 2. NEVER falls back to any hardcoded video or different media.
 * 3. If unable to extract or download, returns an explicit error stating why.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url")?.trim() || "";
    const quality = searchParams.get("quality") || "1080p";
    const type = searchParams.get("type") || "video"; // "video" | "audio"
    const requestedFilename = searchParams.get("filename") || "media";

    if (!targetUrl) {
      return NextResponse.json(
        {
          error: "No media URL provided.",
          details: "Please provide the exact media link to download.",
        },
        { status: 400 }
      );
    }

    let urlObj: URL;
    try {
      urlObj = new URL(targetUrl);
    } catch {
      return NextResponse.json(
        {
          error: "Invalid media URL format.",
          details: `The provided URL "${targetUrl}" is not a valid HTTP/HTTPS address.`,
        },
        { status: 400 }
      );
    }

    const hostname = urlObj.hostname.toLowerCase();

    // Check if the URL is from platforms known to block serverless datacenter IP video streaming
    const isCloudRestrictedPlatform =
      hostname.includes("youtube.com") ||
      hostname.includes("youtu.be") ||
      hostname.includes("instagram.com") ||
      hostname.includes("tiktok.com") ||
      hostname.includes("twitter.com") ||
      hostname.includes("x.com") ||
      hostname.includes("udemy.com") ||
      hostname.includes("hotmart.com");

    // Case 1: Direct media stream links (e.g. .mp4, .webm, .mp3, .m4a, .mov, .ogg, .wav, or direct CDN video files)
    const isDirectMediaLink = /\.(mp4|webm|mp3|m4a|ogg|wav|mov)(\?|$)/i.test(targetUrl);

    // If yt-dlp is available locally, resolve the exact stream URL
    const ytDlp = getYtDlpExecutable();
    let streamUrlToFetch = targetUrl;
    let usedYtDlp = false;

    if (!isDirectMediaLink && ytDlp) {
      try {
        let formatArg = "bestvideo[height<=1080]/best";
        if (type === "audio") {
          formatArg = "140/bestaudio[ext=m4a]/bestaudio/best";
        } else if (quality.includes("2160") || quality.includes("4k")) {
          formatArg = "bestvideo[height<=2160]/best";
        } else if (quality.includes("1440")) {
          formatArg = "bestvideo[height<=1440]/best";
        } else if (quality.includes("720")) {
          formatArg = "bestvideo[height<=720]/best";
        } else if (quality.includes("480")) {
          formatArg = "bestvideo[height<=480]/best";
        }

        const { stdout } = await execFileAsync(
          ytDlp.path,
          ["-g", "-f", formatArg, "--no-playlist", targetUrl],
          { timeout: 12000 }
        );

        const lines = stdout.trim().split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
        if (lines.length > 0 && lines[0].startsWith("http")) {
          streamUrlToFetch = lines[0];
          usedYtDlp = true;
        }
      } catch (err) {
        // Continue to direct/fallback fetch
      }
    }

    if (isDirectMediaLink || usedYtDlp || !isCloudRestrictedPlatform) {
      try {
        const upstreamRes = await fetch(streamUrlToFetch, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 OmniGet/1.0",
            Accept: "*/*",
          },
          signal: AbortSignal.timeout(18000),
        });

        if (!upstreamRes.ok) {
          return NextResponse.json(
            {
              error: `Upstream media server at ${hostname} returned HTTP ${upstreamRes.status} (${upstreamRes.statusText}).`,
              details:
                upstreamRes.status === 403
                  ? "Access denied by media host. The server blocks direct external downloads or requires session cookies/CORS authorization."
                  : upstreamRes.status === 404
                  ? "The media resource was not found at this URL."
                  : `Failed to fetch video stream: status code ${upstreamRes.status}.`,
              url: targetUrl,
              statusCode: upstreamRes.status,
            },
            { status: upstreamRes.status }
          );
        }

        const rawContentType = upstreamRes.headers.get("content-type") || "";

        // If the URL returned HTML instead of media
        if (rawContentType.includes("text/html") && !isDirectMediaLink) {
          // Attempt to extract <video src="..."> or <meta property="og:video" ...>
          const html = await upstreamRes.text();
          const videoMatch =
            html.match(/<video[^>]*src=["']([^"']*)["']/i) ||
            html.match(/<meta[^>]*property=["'](?:og:video|og:video:url)["'][^>]*content=["']([^"']*)["']/i);

          if (videoMatch && videoMatch[1]) {
            let extractedUrl = videoMatch[1];
            if (extractedUrl.startsWith("//")) extractedUrl = "https:" + extractedUrl;
            if (extractedUrl.startsWith("/")) extractedUrl = urlObj.origin + extractedUrl;

            // Fetch the extracted video stream
            const extractedRes = await fetch(extractedUrl, {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 OmniGet/1.0",
              },
              signal: AbortSignal.timeout(15000),
            });

            if (extractedRes.ok && extractedRes.body) {
              const contentType = type === "audio" ? "audio/mpeg" : "video/mp4";
              const extension = type === "audio" ? "mp3" : "mp4";
              const cleanFilename = `${requestedFilename.replace(/[^a-zA-Z0-9_ -]/g, "").trim() || "video"}_${quality}.${extension}`;

              const headers = new Headers();
              headers.set("Content-Type", contentType);
              headers.set(
                "Content-Disposition",
                `attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`
              );
              headers.set("Cache-Control", "public, max-age=3600");

              return new Response(extractedRes.body as any, {
                status: 200,
                headers,
              });
            }
          }

          // If no video tag was extractable from the HTML page
          return NextResponse.json(
            {
              error: `Unable to extract direct downloadable media from ${hostname}.`,
              details:
                "The URL points to a web page rather than a direct media file, and no public video stream could be found in the page markup.",
              url: targetUrl,
            },
            { status: 422 }
          );
        }

        // It is a direct media stream!
        const contentType =
          rawContentType.startsWith("video/") || rawContentType.startsWith("audio/")
            ? rawContentType
            : type === "audio"
            ? "audio/mpeg"
            : "video/mp4";

        const extension = type === "audio" ? "mp3" : "mp4";
        const cleanFilename = `${requestedFilename.replace(/[^a-zA-Z0-9_ -]/g, "").trim() || "video"}_${quality}.${extension}`;

        const headers = new Headers();
        headers.set("Content-Type", contentType);
        headers.set(
          "Content-Disposition",
          `attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`
        );
        headers.set("Cache-Control", "public, max-age=86400");

        const contentLength = upstreamRes.headers.get("content-length");
        if (contentLength) {
          headers.set("Content-Length", contentLength);
        }

        return new Response(upstreamRes.body as any, {
          status: 200,
          headers,
        });
      } catch (fetchErr: any) {
        return NextResponse.json(
          {
            error: `Failed to connect to ${hostname}: ${fetchErr?.message || "Network timeout or unreachable host."}`,
            details: "Verify the link is accessible and allows public downloads.",
            url: targetUrl,
          },
          { status: 502 }
        );
      }
    }

    // Case 2: Protected / DRM / Bot-restricted platform (YouTube, TikTok, Twitter/X, Instagram, Udemy)
    // Cloud serverless datacenter IPs cannot bypass YouTube SABR/bot checks without local browser session
    const platformName = hostname.includes("youtube") || hostname.includes("youtu.be")
      ? "YouTube"
      : hostname.includes("tiktok")
      ? "TikTok"
      : hostname.includes("instagram")
      ? "Instagram"
      : hostname.includes("twitter") || hostname.includes("x.com")
      ? "X (Twitter)"
      : hostname.includes("udemy")
      ? "Udemy"
      : "Protected Media Platform";

    return NextResponse.json(
      {
        error: `${platformName} blocks direct cloud serverless video extraction.`,
        details: `${platformName} actively blocks cloud server IPs (Vercel/AWS) from extracting raw stream URLs. To download this video without restrictions, use the OmniGet Desktop Engine or run the local CLI command on your computer where your residential IP and browser cookies are recognized.`,
        platform: platformName,
        url: targetUrl,
        requiresLocalEngine: true,
        cliCommand: `omniget download "${targetUrl}" --quality ${quality}`,
        ytdlpCommand: `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" "${targetUrl}"`,
      },
      { status: 422 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Internal streaming error.",
        details: err?.message || "An unexpected error occurred during stream proxying.",
      },
      { status: 500 }
    );
  }
}
