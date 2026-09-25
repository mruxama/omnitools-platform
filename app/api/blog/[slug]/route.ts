import { NextRequest, NextResponse } from "next/server";
import { getBlogPostBySlugDb, saveBlogPostDb, deleteBlogPostDb } from "@/lib/db/repository";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/adminAuth";
import { PageStatus } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await getBlogPostBySlugDb(params.slug);
    if (!post) {
      return NextResponse.json({ ok: false, error: "Blog post not found" }, { status: 404 });
    }

    // If draft, only allow authenticated admin
    if (post.status !== PageStatus.PUBLISHED) {
      const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
      const session = await verifySessionToken(token);
      if (!session) {
        return NextResponse.json({ ok: false, error: "Blog post not found" }, { status: 404 });
      }
    }

    return NextResponse.json({ ok: true, post });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  return handleUpdate(request, params.slug);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  return handleUpdate(request, params.slug);
}

async function handleUpdate(request: NextRequest, slug: string) {
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

    const existing = await getBlogPostBySlugDb(slug);
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Blog post not found" }, { status: 404 });
    }

    const body = await request.json();
    const updatePayload: Record<string, any> = {
      slug,
      title: body.title !== undefined ? body.title : existing.title,
    };

    if (body.excerpt !== undefined) updatePayload.excerpt = body.excerpt;
    if (body.content !== undefined) updatePayload.content = body.content;
    if (body.coverImage !== undefined) updatePayload.coverImage = body.coverImage;
    if (body.category !== undefined) updatePayload.category = body.category;
    if (body.tags !== undefined) updatePayload.tags = body.tags;
    if (body.author !== undefined) updatePayload.author = body.author;
    if (body.readingTime !== undefined) updatePayload.readingTime = body.readingTime;
    if (body.status !== undefined) {
      updatePayload.status = body.status === "PUBLISHED" ? PageStatus.PUBLISHED : PageStatus.DRAFT;
    }
    if (body.seoTitle !== undefined) updatePayload.seoTitle = body.seoTitle;
    if (body.seoDescription !== undefined) updatePayload.seoDescription = body.seoDescription;
    if (body.canonicalUrl !== undefined) updatePayload.canonicalUrl = body.canonicalUrl;
    if (body.schema !== undefined) updatePayload.schema = body.schema;

    const saved = await saveBlogPostDb(updatePayload as any);

    return NextResponse.json({
      ok: true,
      post: saved,
      message: "Blog post updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to update blog post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
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

    const success = await deleteBlogPostDb(params.slug);
    if (!success) {
      return NextResponse.json({ ok: false, error: "Blog post not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      message: `Blog post "${params.slug}" deleted successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
