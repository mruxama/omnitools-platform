import { NextResponse } from "next/server";
import { runSeoBootstrap } from "@/lib/seo/bootstrap";

export async function POST() {
  try {
    const result = await runSeoBootstrap();
    return NextResponse.json({ ok: true, result });
  } catch (error: any) {
    console.error("SEO Bootstrap error:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to run SEO bootstrap" },
      { status: 500 }
    );
  }
}
