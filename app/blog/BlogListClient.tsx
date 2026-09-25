"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Clock,
  Folder,
  ArrowRight,
  Sparkles,
  Calendar,
  Tag,
} from "lucide-react";

interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  tags?: any;
  author?: string | null;
  readingTime?: string | number | null;
  publishedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface BlogListClientProps {
  posts: BlogPostItem[];
}

export default function BlogListClient({ posts }: BlogListClientProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");

  // Extract unique categories
  const categories = ["ALL", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];

  const filteredPosts = posts.filter((post) => {
    const q = search.toLowerCase();
    const matchSearch =
      post.title.toLowerCase().includes(q) ||
      (post.excerpt ? post.excerpt.toLowerCase().includes(q) : false) ||
      (Array.isArray(post.tags) && post.tags.some((t: any) => String(t).toLowerCase().includes(q)));
    const matchCategory = activeCategory === "ALL" || post.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const remainingPosts = filteredPosts.slice(1);

  return (
    <div className="space-y-10">
      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-border">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {cat === "ALL" ? "All Articles" : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guides, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
          />
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-card/40 rounded-3xl border border-dashed border-border">
          <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/40" />
          <h3 className="text-base font-bold text-foreground">No articles matched your criteria</h3>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search query or selecting a different category.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setActiveCategory("ALL");
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* Featured Article Card (shown if no specific search query or active filter) */}
          {featuredPost && (
            <div className="group relative rounded-3xl border border-border bg-card/70 hover:border-primary/40 transition-all duration-300 overflow-hidden shadow-xs hover:shadow-md p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-4 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      <Sparkles className="w-3 h-3" />
                      <span>Featured Guide</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                      <Folder className="w-3 h-3 text-primary" />
                      <span>{featuredPost.category}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{String(featuredPost.readingTime).includes("min") ? featuredPost.readingTime : `${featuredPost.readingTime} min read`}</span>
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors leading-tight">
                    <Link href={`/blog/${featuredPost.slug}`}>
                      {featuredPost.title}
                    </Link>
                  </h2>

                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground">
                    <span>By {featuredPost.author || "OmniTools Editorial"}</span>
                    <span>•</span>
                    <span>
                      {new Date(featuredPost.publishedAt || featuredPost.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 w-full lg:w-auto">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 shadow-sm transition-all w-full lg:w-auto"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Grid of Remaining Articles */}
          {remainingPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {remainingPosts.map((post) => (
                <article
                  key={post.id || post.slug}
                  className="group flex flex-col justify-between p-6 rounded-2xl border border-border bg-card/60 hover:border-primary/40 hover:bg-card/90 transition-all duration-200 shadow-2xs hover:shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-muted text-muted-foreground">
                        <Folder className="w-3 h-3 text-primary" />
                        <span>{post.category}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{String(post.readingTime).includes("min") ? post.readingTime : `${post.readingTime} min read`}</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-border/50 mt-6 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground text-[11px]">
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
