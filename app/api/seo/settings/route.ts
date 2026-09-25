import { NextRequest, NextResponse } from "next/server";
import { getSeoSettingsDb, updateSeoSettingsDb } from "@/lib/db/repository";

export async function GET() {
  try {
    const settings = await getSeoSettingsDb();
    return NextResponse.json({ ok: true, settings });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to fetch SEO settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = await updateSeoSettingsDb(body);
    return NextResponse.json({ ok: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to update SEO settings" },
      { status: 500 }
    );
  }
}
