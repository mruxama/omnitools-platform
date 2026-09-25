import { describe, it, expect } from "vitest";
import {
  getAllBlogPostsDb,
  getBlogPostBySlugDb,
  saveBlogPostDb,
  deleteBlogPostDb,
} from "@/lib/db/repository";

describe("Blog Service & Repository", () => {
  it("should have pre-seeded educational blog posts", async () => {
    const posts = await getAllBlogPostsDb("all");
    expect(posts.length).toBeGreaterThanOrEqual(4);

    const publishedPosts = await getAllBlogPostsDb("published");
    expect(publishedPosts.length).toBeGreaterThanOrEqual(4);

    const firstPost = publishedPosts[0];
    expect(firstPost.title).toBeDefined();
    expect(firstPost.slug).toBeDefined();
    expect(firstPost.excerpt).toBeDefined();
    expect(firstPost.content).toBeDefined();
    expect(firstPost.category).toBeDefined();
    expect(firstPost.readingTime).toBeDefined();
    expect(firstPost.seoTitle).toBeDefined();
    expect(firstPost.seoDescription).toBeDefined();
  });

  it("should retrieve a blog post by its exact slug", async () => {
    const post = await getBlogPostBySlugDb("how-to-convert-jpg-to-webp-without-losing-quality");
    expect(post).not.toBeNull();
    expect(post?.slug).toBe("how-to-convert-jpg-to-webp-without-losing-quality");
    expect(post?.title).toContain("Convert JPG to WebP");
    expect(post?.status).toBe("PUBLISHED");
  });

  it("should return null for non-existent slug", async () => {
    const post = await getBlogPostBySlugDb("non-existent-article-slug-xyz");
    expect(post).toBeNull();
  });

  it("should create, update, and delete a blog post", async () => {
    const testSlug = "unit-test-guide-for-blog-posting";
    const newPost = {
      title: "Unit Test Guide for Blog Posting",
      slug: testSlug,
      category: "Developer Tools",
      author: "Test Runner",
      excerpt: "A brief excerpt for testing blog database operations.",
      content: "## Heading\\n\\nThis is test markdown content.\\n\\n{{converter:png-to-svg}}",
      tags: ["testing", "vitest", "blog"],
      status: "draft" as const,
      readingTime: 2,
      seoTitle: "Unit Test Guide - OmniTools",
      seoDescription: "A brief excerpt for testing blog database operations with 120+ chars for SEO.",
    };

    // 1. Create (save)
    const saved = await saveBlogPostDb(newPost);
    expect(saved).toBeDefined();
    expect(saved.slug).toBe(testSlug);
    expect(saved.status).toBe("draft");

    // 2. Verify draft does not show in public published list
    const publicPosts = await getAllBlogPostsDb("published");
    expect(publicPosts.some((p) => p.slug === testSlug)).toBe(false);

    // 3. Verify it shows in all list
    const allPosts = await getAllBlogPostsDb("all");
    expect(allPosts.some((p) => p.slug === testSlug)).toBe(true);

    // 4. Update status to published
    const updated = await saveBlogPostDb({
      ...saved,
      status: "published",
      title: "Updated Unit Test Guide Title",
    });
    expect(updated.status).toBe("published");
    expect(updated.title).toBe("Updated Unit Test Guide Title");

    // 5. Verify it now appears in public list
    const publicPostsAfterPublish = await getAllBlogPostsDb("published");
    expect(publicPostsAfterPublish.some((p) => p.slug === testSlug)).toBe(true);

    // 6. Delete
    const deleteResult = await deleteBlogPostDb(testSlug);
    expect(deleteResult).toBe(true);

    // 7. Verify it's gone
    const postAfterDelete = await getBlogPostBySlugDb(testSlug);
    expect(postAfterDelete).toBeNull();
  });

  it("should filter posts by status correctly", async () => {
    const published = await getAllBlogPostsDb("published");
    const drafts = await getAllBlogPostsDb("draft");
    const all = await getAllBlogPostsDb("all");

    expect(all.length).toBe(published.length + drafts.length);
    published.forEach((p) => expect(String(p.status).toLowerCase()).toBe("published"));
    drafts.forEach((p) => expect(String(p.status).toLowerCase()).toBe("draft"));
  });
});
