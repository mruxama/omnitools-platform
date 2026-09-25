import { NextRequest, NextResponse } from "next/server";
import { searchConsoleService } from "@/lib/seo/searchConsoleService";

export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch (parseErr) {
      return NextResponse.json({ ok: false, error: "Invalid JSON payload" }, { status: 400 });
    }

    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ ok: false, error: "Valid URL is required" }, { status: 400 });
    }

    const inspection = await searchConsoleService.inspectUrl(url);

    return NextResponse.json({
      ok: true,
      inspection,
    });
  } catch (error: any) {
    console.error("URL Inspection route error:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "URL Inspection failed" },
      { status: 500 }
    );
  }
}
