import { NextRequest, NextResponse } from "next/server";
import { getAllBlogPostsDb, saveBlogPostDb } from "@/lib/db/repository";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/adminAuth";
import { PageStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const requestedStatus = searchParams.get("status");

    // Check if user is an authenticated admin
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    const isAdmin = Boolean(session);

    let statusFilter: PageStatus | "ALL" | undefined = PageStatus.PUBLISHED;
    if (isAdmin) {
      if (requestedStatus === "ALL") {
        statusFilter = "ALL";
      } else if (requestedStatus && Object.values(PageStatus).includes(requestedStatus as PageStatus)) {
        statusFilter = requestedStatus as PageStatus;
      }
    }

    const posts = await getAllBlogPostsDb({
      status: statusFilter,
      category,
      search,
    });

    return NextResponse.json({
      ok: true,
      total: posts.length,
      posts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate admin
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Admin session required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      category,
      tags,
      author,
      readingTime,
      status,
      seoTitle,
      seoDescription,
      canonicalUrl,
      schema,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ ok: false, error: "Missing required post title" }, { status: 400 });
    }

    // Auto-generate clean slug if not provided
    const cleanSlug = (
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    )
      .toLowerCase()
      .trim();

    const saved = await saveBlogPostDb({
      slug: cleanSlug,
      title: title.trim(),
      excerpt: excerpt?.trim() || null,
      content: content || "",
      coverImage: coverImage?.trim() || null,
      category: category?.trim() || "Guides",
      tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()) : [],
      author: author?.trim() || "OmniTools Editorial",
      readingTime: readingTime || undefined,
      status: status === "PUBLISHED" ? PageStatus.PUBLISHED : PageStatus.DRAFT,
      seoTitle: seoTitle?.trim() || `${title.trim()} | OmniTools Blog`,
      seoDescription: seoDescription?.trim() || excerpt?.trim() || null,
      canonicalUrl: canonicalUrl?.trim() || `https://omnitools.app/blog/${cleanSlug}`,
      schema: schema || null,
    });

    return NextResponse.json({
      ok: true,
      post: saved,
      message: "Blog post created successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to create blog post" },
      { status: 500 }
    );
  }
}
