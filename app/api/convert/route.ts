import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const inputFormat = (formData.get("inputFormat") as string) || "";
    const outputFormat = (formData.get("outputFormat") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "Missing required file parameter." }, { status: 400 });
    }

    // Security guards: 25MB upload limit
    const MAX_BYTES = 25 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File exceeds 25MB limit." }, { status: 413 });
    }

    // If external conversion provider is not configured via environment variable
    if (process.env.CONVERSION_PROVIDER !== "external" || !process.env.CONVERSION_API_KEY) {
      return NextResponse.json(
        {
          error: `Conversion for ${inputFormat} to ${outputFormat} requires an external processing provider key (CONVERSION_API_KEY).`,
        },
        { status: 501 }
      );
    }

    // External provider dispatch logic here (keeps API keys strictly server-side)
    return NextResponse.json({ status: "processed" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal conversion error." },
      { status: 500 }
    );
  }
}
