import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostBySlugDb, getAllBlogPostsDb } from "@/lib/db/repository";
import MarkdownRenderer from "@/components/blog/MarkdownRenderer";
import {
  Clock,
  Folder,
  Calendar,
  User,
  ArrowLeft,
  ArrowRight,
  Share2,
  Tag,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Zap,
} from "lucide-react";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export const revalidate = 60; // Revalidate every 60s

export async function generateStaticParams() {
  const posts = await getAllBlogPostsDb("published");
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlugDb(params.slug);
  if (!post) {
    return {
      title: "Article Not Found | OmniTools Blog",
      description: "The requested article could not be found.",
    };
  }

  const title = post.seoTitle || `${post.title} | OmniTools Engineering`;
  const description = post.seoDescription || post.excerpt || undefined;
  const canonical = post.canonicalUrl || `https://omnitools.app/blog/${post.slug}`;
  const tags: string[] | undefined = Array.isArray(post.tags)
    ? (post.tags as any[]).map((t) => String(t))
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "OmniTools",
      type: "article",
      publishedTime: post.publishedAt?.toString() || post.createdAt.toString(),
      modifiedTime: post.updatedAt?.toString() || post.createdAt.toString(),
      authors: [post.author || "OmniTools Editorial Team"],
      tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlugDb(params.slug);

  if (!post) {
    notFound();
  }

  // Schema.org BlogPosting structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    author: {
      "@type": "Organization",
      name: post.author || "OmniTools Editorial Team",
      url: "https://omnitools.app",
    },
    publisher: {
      "@type": "Organization",
      name: "OmniTools",
      url: "https://omnitools.app",
      logo: {
        "@type": "ImageObject",
        url: "https://omnitools.app/favicon.ico",
      },
    },
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://omnitools.app/blog/${post.slug}`,
    },
    keywords: Array.isArray(post.tags) ? (post.tags as any[]).map((t) => String(t)).join(", ") : "",
    articleSection: post.category,
  };

  const formattedDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Schema.org JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Breadcrumbs Bar */}
      <div className="border-b border-border/60 bg-muted/20">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50" />
            <Link href="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50" />
            <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
              {post.category}
            </span>
          </nav>
        </div>
      </div>

      <article className="container max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
        {/* Article Header */}
        <header className="space-y-5 border-b border-border/60 pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Folder className="w-3.5 h-3.5" />
              <span>{post.category}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-muted-foreground bg-muted/60">
              <Clock className="w-3.5 h-3.5" />
              <span>{String(post.readingTime).includes("min") ? post.readingTime : `${post.readingTime} min read`}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-base sm:text-xl text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Author, Date & Privacy Seal */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/40 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm shadow-2xs">
                O
              </div>
              <div>
                <p className="font-semibold text-foreground">{post.author || "OmniTools Editorial Team"}</p>
                <div className="flex items-center gap-2 text-[11px]">
                  <span>Published {formattedDate}</span>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300 font-medium text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>100% In-Browser Privacy Verified</span>
            </div>
          </div>
        </header>

        {/* Main Article Body (Rendered with MarkdownRenderer) */}
        <div className="py-2">
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Article Footer & Tags */}
        <footer className="pt-8 border-t border-border space-y-8">
          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Tags:</span>
              </span>
              {(post.tags as any[]).map((tag: any) => (
                <span
                  key={String(tag)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted text-muted-foreground border border-border/60"
                >
                  #{String(tag)}
                </span>
              ))}
            </div>
          )}

          {/* Author Box */}
          <div className="p-6 rounded-2xl border border-border bg-card/60 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-primary/70 text-primary-foreground font-bold flex items-center justify-center text-lg shadow-sm shrink-0">
              O
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-foreground">
                About the OmniTools Engineering Team
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                OmniTools builds high-performance, private, client-side utility applications. Our guides are researched and validated to help engineers, creators, and professionals optimize digital media without sacrificing file privacy.
              </p>
            </div>
          </div>

          {/* Contextual Bottom Converter CTA */}
          <div className="p-8 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-background flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Zap className="w-3.5 h-3.5" />
                <span>Instant In-Browser Processing</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Try OmniTools Universal Converter Free
              </h3>
              <p className="text-xs text-muted-foreground max-w-md">
                Convert your images, documents, PDFs, audio, and video files with zero server uploads and zero privacy risk.
              </p>
            </div>

            <Link
              href="/convert"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 shadow-sm shrink-0"
            >
              <span>Launch Converter</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Back to Blog Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all guides</span>
            </Link>

            <Link
              href="/convert"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Browse all 1,200+ converters
            </Link>
          </div>
        </footer>
      </article>
    </div>
  );
}
