import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

/**
 * Checks whether native ffmpeg is available on the system PATH.
 */
async function isFfmpegAvailable(): Promise<boolean> {
  try {
    await execFileAsync("ffmpeg", ["-version"]);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  const hasFfmpeg = await isFfmpegAvailable();
  return NextResponse.json({
    status: "ok",
    hasFfmpeg,
    supportedEngines: hasFfmpeg
      ? ["native-ffmpeg", "browser-mediarecorder"]
      : ["browser-mediarecorder"],
    message: hasFfmpeg
      ? "Native FFmpeg is available for production video watermarking."
      : "Native FFmpeg binary not detected on server. Client-side browser processing is enabled.",
  });
}

export async function POST(req: NextRequest) {
  try {
    const hasFfmpeg = await isFfmpegAvailable();
    if (!hasFfmpeg) {
      return NextResponse.json(
        {
          error:
            "Native FFmpeg is not installed on this server instance. Video watermarking will proceed via the client-side browser processing engine.",
          fallback: "browser-mediarecorder",
        },
        { status: 501 }
      );
    }

    // In environments with native ffmpeg installed:
    return NextResponse.json({
      status: "ready",
      message: "FFmpeg worker ready to accept jobs.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal video processing error" },
      { status: 500 }
    );
  }
}
