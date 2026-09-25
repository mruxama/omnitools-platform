"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Folder,
  Sparkles,
  Save,
  X,
  Loader2,
  FileText,
  Globe,
  Code2,
  Check,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import MarkdownRenderer from "@/components/blog/MarkdownRenderer";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  category: string;
  tags: string[];
  author: string;
  readingTime: number;
  status: "published" | "draft";
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  schema?: any;
  views: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_CATEGORIES = [
  "Image Conversion",
  "Privacy & Security",
  "PDF Optimization",
  "Document Conversion",
  "Audio & Video",
  "Developer Tools",
];

export default function AdminBlogStudio() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modal / Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");
  const [editorView, setEditorView] = useState<"split" | "edit" | "preview">("split");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [formAuthor, setFormAuthor] = useState("OmniTools Editorial Team");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formCoverImage, setFormCoverImage] = useState("");
  const [formStatus, setFormStatus] = useState<"published" | "draft">("draft");
  const [formSeoTitle, setFormSeoTitle] = useState("");
  const [formSeoDesc, setFormSeoDesc] = useState("");
  const [formCanonical, setFormCanonical] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/blog");
      const data = await res.json();
      if (data.ok && Array.isArray(data.posts)) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error("Failed to fetch blog posts:", err);
      showToast("Failed to load blog posts", "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper to generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!slugManuallyEdited && (!editingPost || !editingPost.slug)) {
      setFormSlug(generateSlug(val));
    }
  };

  const openNewPostModal = () => {
    setEditingPost(null);
    setFormTitle("");
    setFormSlug("");
    setFormCategory(DEFAULT_CATEGORIES[0]);
    setFormAuthor("OmniTools Editorial Team");
    setFormExcerpt("");
    setFormContent(
      "## Overview\n\n" +
      "Briefly introduce what this guide covers and why users need it.\n\n" +
      "> [!TIP]\n" +
      "> Did you know? All file transformations on OmniTools occur 100% inside your local web browser without uploading anything to remote servers.\n\n" +
      "## Step-by-Step Guide\n\n" +
      "1. Navigate to the converter tool.\n" +
      "2. Drag and drop your file into the upload zone.\n" +
      "3. Select your desired output quality and parameters.\n" +
      "4. Click **Convert** and instantly download your converted file.\n\n" +
      "{{converter:jpg-to-webp:Convert JPG to WebP Online}}\n\n" +
      "## Key Benefits\n\n" +
      "| Feature | OmniTools Client-Side | Traditional Cloud Converters |\n" +
      "| :--- | :--- | :--- |\n" +
      "| **Privacy** | 100% Client-Side | Uploads files to cloud server |\n" +
      "| **Speed** | Near-instant (Zero latency) | Queue delays & network uploads |\n" +
      "| **Cost** | 100% Free Forever | Hidden paywalls & size caps |\n\n" +
      "## Frequently Asked Questions\n\n" +
      "### Is this conversion safe for sensitive documents?\n" +
      "Yes. Because OmniTools runs locally using WebAssembly and Web Crypto in your browser, your files never leave your device.\n"
    );
    setFormTags("conversion, file format, productivity, seo");
    setFormCoverImage("");
    setFormStatus("published");
    setFormSeoTitle("");
    setFormSeoDesc("");
    setFormCanonical("");
    setSlugManuallyEdited(false);
    setActiveTab("content");
    setEditorView("split");
    setIsEditorOpen(true);
  };

  const openEditPostModal = (post: BlogPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormSlug(post.slug);
    setFormCategory(post.category);
    setFormAuthor(post.author || "OmniTools Editorial Team");
    setFormExcerpt(post.excerpt);
    setFormContent(post.content);
    setFormTags(Array.isArray(post.tags) ? post.tags.join(", ") : "");
    setFormCoverImage(post.coverImage || "");
    setFormStatus(post.status);
    setFormSeoTitle(post.seoTitle || post.title);
    setFormSeoDesc(post.seoDescription || post.excerpt);
    setFormCanonical(post.canonicalUrl || "");
    setSlugManuallyEdited(true);
    setActiveTab("content");
    setEditorView("split");
    setIsEditorOpen(true);
  };

  const calculateReadingTime = (text: string) => {
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const handleSave = async (statusOverride?: "published" | "draft") => {
    if (!formTitle.trim()) {
      showToast("Post title is required", "error");
      return;
    }
    if (!formSlug.trim()) {
      showToast("Post slug is required", "error");
      return;
    }
    if (!formContent.trim()) {
      showToast("Post content cannot be empty", "error");
      return;
    }

    const currentStatus = statusOverride || formStatus;
    const readingTime = calculateReadingTime(formContent);
    const tagsArray = formTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: formTitle.trim(),
      slug: generateSlug(formSlug.trim()),
      category: formCategory,
      author: formAuthor.trim() || "OmniTools Editorial Team",
      excerpt: formExcerpt.trim() || formTitle.trim(),
      content: formContent,
      coverImage: formCoverImage.trim() || null,
      tags: tagsArray,
      status: currentStatus,
      readingTime,
      seoTitle: formSeoTitle.trim() || formTitle.trim(),
      seoDescription: formSeoDesc.trim() || formExcerpt.trim(),
      canonicalUrl: formCanonical.trim() || null,
    };

    try {
      setSaving(true);
      if (editingPost) {
        // Update
        const res = await fetch(`/api/blog/${editingPost.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "Failed to update article");
        showToast("Article updated successfully!");
      } else {
        // Create
        const res = await fetch("/api/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "Failed to create article");
        showToast("Article created successfully!");
      }

      setIsEditorOpen(false);
      fetchPosts();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "An error occurred while saving", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (post: BlogPost) => {
    const nextStatus = post.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/blog/${post.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to toggle status");
      showToast(`Article marked as ${nextStatus}`);
      fetchPosts();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to change status", "error");
    }
  };

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/blog/${slug}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to delete article");
      showToast("Article deleted successfully");
      fetchPosts();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to delete article", "error");
    }
  };

  // Filtered posts
  const filteredPosts = posts.filter((p) => {
    const matchQuery =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));
    const matchCategory = selectedCategory === "ALL" || p.category === selectedCategory;
    const matchStatus = selectedStatus === "ALL" || p.status === selectedStatus;
    return matchQuery && matchCategory && matchStatus;
  });

  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-100"
              : "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-100"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          )}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Blog & SEO Guides Studio</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary">
              AEO + GEO Ready
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Write high-ranking educational content, answer blocks, and contextual conversion links to dominate SERPs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPosts}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted/50 text-foreground transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={openNewPostModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-95 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Article</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Total Articles</span>
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">{posts.length}</p>
          <p className="text-[11px] text-muted-foreground">Indexed in sitemap</p>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {publishedCount}
          </p>
          <p className="text-[11px] text-muted-foreground">Live on /blog directory</p>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Drafts</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {draftCount}
          </p>
          <p className="text-[11px] text-muted-foreground">Unpublished work in progress</p>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Total Organic Views</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">
            {totalViews.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground">Reader engagement</p>
        </div>
      </div>

      {/* Controls: Search and Filters */}
      <div className="p-4 rounded-2xl border border-border bg-card/60 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, excerpt, slug, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            >
              <option value="ALL">All Categories</option>
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            >
              <option value="ALL">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="p-4">Article</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Read Time</th>
                <th className="p-4">Views</th>
                <th className="p-4">Last Updated</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    <span>Loading blog articles...</span>
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="font-semibold text-sm text-foreground">No blog posts found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {search || selectedCategory !== "ALL" || selectedStatus !== "ALL"
                        ? "Try clearing your search filters"
                        : "Create your first SEO article to drive high-intent organic traffic"}
                    </p>
                    <button
                      onClick={openNewPostModal}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Write Article</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id || post.slug} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 max-w-sm">
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground text-sm line-clamp-1">
                          {post.title}
                        </p>
                        <p className="text-muted-foreground text-[11px] font-mono">
                          /blog/{post.slug}
                        </p>
                        <p className="text-muted-foreground text-[11px] line-clamp-1">
                          {post.excerpt}
                        </p>
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-muted/60 text-foreground border border-border/60">
                        <Folder className="w-3 h-3 text-primary" />
                        <span>{post.category}</span>
                      </span>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(post)}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                          post.status === "published"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            post.status === "published" ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                        />
                        <span className="capitalize">{post.status}</span>
                      </button>
                    </td>

                    <td className="p-4 whitespace-nowrap text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span>{post.readingTime} min</span>
                      </span>
                    </td>

                    <td className="p-4 whitespace-nowrap font-mono text-muted-foreground">
                      {post.views?.toLocaleString() || 0}
                    </td>

                    <td className="p-4 whitespace-nowrap text-muted-foreground text-[11px]">
                      {new Date(post.updatedAt || post.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="p-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          title="View Live Article"
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => openEditPostModal(post)}
                          title="Edit Article"
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(post.slug, post.title)}
                          title="Delete Article"
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-card border border-border w-full max-w-6xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    {editingPost ? "Edit Article" : "Create New Article"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Auto-generates Google Snippets and Schema.org BlogPosting data
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-xl border border-border bg-background p-0.5 text-xs">
                  <button
                    onClick={() => setActiveTab("content")}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      activeTab === "content"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Content & Markdown
                  </button>
                  <button
                    onClick={() => setActiveTab("seo")}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                      activeTab === "seo"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>SEO & Schema</span>
                  </button>
                </div>

                <button
                  onClick={() => handleSave("draft")}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted/50 transition-colors"
                >
                  Save Draft
                </button>

                <button
                  onClick={() => handleSave("published")}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 shadow-sm transition-all"
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Publish</span>
                </button>

                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {activeTab === "content" ? (
                <div className="space-y-5">
                  {/* Basic Metadata Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                        <span>Article Title *</span>
                        <span className="text-[11px] font-normal text-muted-foreground">
                          {formTitle.length} characters
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., How to Convert JPG to WebP for 80% Smaller Images"
                        value={formTitle}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                      />
                    </div>

                    {/* Slug */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Permanent URL Slug *
                      </label>
                      <div className="flex items-center rounded-xl border border-border bg-muted/30 px-3 py-1.5">
                        <span className="text-xs text-muted-foreground font-mono mr-1">/blog/</span>
                        <input
                          type="text"
                          value={formSlug}
                          onChange={(e) => {
                            setSlugManuallyEdited(true);
                            setFormSlug(e.target.value);
                          }}
                          placeholder="how-to-convert-jpg-to-webp"
                          className="w-full bg-transparent text-xs text-foreground font-mono focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Category</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {DEFAULT_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                        <span>Short Summary / Excerpt</span>
                        <span className="text-[11px] font-normal text-muted-foreground">
                          Used in cards and search previews
                        </span>
                      </label>
                      <textarea
                        rows={2}
                        value={formExcerpt}
                        onChange={(e) => setFormExcerpt(e.target.value)}
                        placeholder="A concise 1-2 sentence overview of what the reader will learn..."
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                      />
                    </div>

                    {/* Author & Tags */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Author</label>
                      <input
                        type="text"
                        value={formAuthor}
                        onChange={(e) => setFormAuthor(e.target.value)}
                        placeholder="OmniTools Editorial Team"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={formTags}
                        onChange={(e) => setFormTags(e.target.value)}
                        placeholder="webp, privacy, performance, tutorials"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Content Editor Toolbar */}
                  <div className="space-y-2 pt-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-muted/40 border border-border">
                      {/* Markdown helpers */}
                      <div className="flex flex-wrap items-center gap-1 text-xs">
                        <button
                          type="button"
                          onClick={() => setFormContent((c) => c + "\n\n## New Heading\n")}
                          className="px-2 py-1 rounded hover:bg-muted font-bold text-foreground"
                          title="Add Heading"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormContent((c) => c + "\n\n### Subheading\n")}
                          className="px-2 py-1 rounded hover:bg-muted font-semibold text-foreground"
                          title="Add Subheading"
                        >
                          H3
                        </button>
                        <span className="w-px h-4 bg-border mx-1" />
                        <button
                          type="button"
                          onClick={() => setFormContent((c) => c + " **bold text** ")}
                          className="px-2 py-1 rounded hover:bg-muted font-bold text-foreground"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormContent((c) => c + " *italic text* ")}
                          className="px-2 py-1 rounded hover:bg-muted italic text-foreground"
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormContent((c) => c + " `code` ")}
                          className="px-2 py-1 rounded hover:bg-muted font-mono text-primary text-[11px]"
                        >
                          &lt;&gt;
                        </button>
                        <span className="w-px h-4 bg-border mx-1" />
                        <button
                          type="button"
                          onClick={() => setFormContent((c) => c + "\n> [!TIP]\n> Add a helpful tip here.\n")}
                          className="px-2 py-1 rounded hover:bg-muted text-[11px] text-emerald-600 font-medium"
                        >
                          + Tip Box
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormContent((c) => c + "\n{{converter:jpg-to-webp:Convert JPG to WebP Now}}\n")}
                          className="px-2 py-1 rounded hover:bg-muted text-[11px] text-primary font-medium"
                        >
                          + Converter CTA
                        </button>
                      </div>

                      {/* View Mode Toggle */}
                      <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-0.5 text-xs">
                        <button
                          type="button"
                          onClick={() => setEditorView("edit")}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium ${
                            editorView === "edit" ? "bg-muted text-foreground font-semibold" : "text-muted-foreground"
                          }`}
                        >
                          Editor
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorView("split")}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium hidden md:inline-block ${
                            editorView === "split" ? "bg-muted text-foreground font-semibold" : "text-muted-foreground"
                          }`}
                        >
                          Split
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorView("preview")}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium ${
                            editorView === "preview" ? "bg-muted text-foreground font-semibold" : "text-muted-foreground"
                          }`}
                        >
                          Preview
                        </button>
                      </div>
                    </div>

                    {/* Editor & Preview Area */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Editor */}
                      {(editorView === "edit" || editorView === "split") && (
                        <div className={`flex flex-col space-y-1.5 ${editorView === "edit" ? "md:col-span-2" : ""}`}>
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                            <span>Markdown Source</span>
                            <span>{formContent.split(/\s+/).filter(Boolean).length} words • ~{calculateReadingTime(formContent)} min read</span>
                          </div>
                          <textarea
                            rows={18}
                            value={formContent}
                            onChange={(e) => setFormContent(e.target.value)}
                            placeholder="Write your article in Markdown..."
                            className="w-full p-4 text-xs font-mono rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-y h-[450px]"
                          />
                        </div>
                      )}

                      {/* Live Markdown Preview */}
                      {(editorView === "preview" || editorView === "split") && (
                        <div className={`flex flex-col space-y-1.5 ${editorView === "preview" ? "md:col-span-2" : ""}`}>
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                            <span>Live Formatted Preview</span>
                            <span className="text-emerald-500 font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Live Render
                            </span>
                          </div>
                          <div className="p-5 rounded-xl border border-border bg-card/60 overflow-y-auto h-[450px] space-y-4">
                            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                              {formTitle || "Untitled Article"}
                            </h1>
                            {formExcerpt && (
                              <p className="text-sm text-muted-foreground italic border-l-2 border-primary pl-3 py-1">
                                {formExcerpt}
                              </p>
                            )}
                            <MarkdownRenderer content={formContent} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* SEO & SCHEMA TAB */
                <div className="space-y-6">
                  {/* Google SERP Snippet Preview */}
                  <div className="p-5 rounded-2xl border border-border bg-card/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                          Google Search Snippet Preview
                        </h3>
                      </div>
                      <span className="text-[11px] text-muted-foreground">Mobile & Desktop SERP</span>
                    </div>

                    {/* Google Card Simulation */}
                    <div className="p-4 rounded-xl border border-border/80 bg-background space-y-1 max-w-2xl font-sans">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                          O
                        </div>
                        <span className="text-[12px] text-foreground font-medium">omnitools.app</span>
                        <span className="text-muted-foreground">› blog › {formSlug || "slug"}</span>
                      </div>
                      <h4 className="text-[#1a0dab] dark:text-[#8ab4f8] text-base sm:text-lg font-medium hover:underline cursor-pointer line-clamp-1">
                        {formSeoTitle || formTitle || "Untitled Article - OmniTools"}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {formSeoDesc || formExcerpt || "Read this complete guide to discover step-by-step techniques, local client-side security, and instant tools."}
                      </p>
                    </div>
                  </div>

                  {/* SEO Inputs */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* SEO Title */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                        <span>SEO Title Tag</span>
                        <span
                          className={`text-[11px] font-mono ${
                            formSeoTitle.length >= 50 && formSeoTitle.length <= 60
                              ? "text-emerald-500 font-bold"
                              : formSeoTitle.length > 60
                              ? "text-rose-500 font-bold"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formSeoTitle.length} / 60 characters (ideal: 50-60)
                        </span>
                      </div>
                      <input
                        type="text"
                        value={formSeoTitle}
                        onChange={(e) => setFormSeoTitle(e.target.value)}
                        placeholder="e.g., How to Convert JPG to WebP - 100% Free & Private | OmniTools"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none"
                      />
                    </div>

                    {/* SEO Meta Description */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                        <span>SEO Meta Description</span>
                        <span
                          className={`text-[11px] font-mono ${
                            formSeoDesc.length >= 120 && formSeoDesc.length <= 160
                              ? "text-emerald-500 font-bold"
                              : formSeoDesc.length > 160
                              ? "text-rose-500 font-bold"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formSeoDesc.length} / 160 characters (ideal: 120-160)
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        value={formSeoDesc}
                        onChange={(e) => setFormSeoDesc(e.target.value)}
                        placeholder="Enter an action-oriented meta description summarizing the key benefit for searchers..."
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none leading-relaxed"
                      />
                    </div>

                    {/* Canonical URL */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Canonical URL (Optional override)
                      </label>
                      <input
                        type="text"
                        value={formCanonical}
                        onChange={(e) => setFormCanonical(e.target.value)}
                        placeholder="https://omnitools.app/blog/..."
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* AEO / GEO AI Engine Readiness Checklist */}
                  <div className="p-5 rounded-2xl border border-border bg-card/60 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Answer Engine Optimization (AEO & GEO) Checklist</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl border border-border/80 bg-background flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">Clear Question Headings</p>
                          <p className="text-[11px] text-muted-foreground">Uses H2s and H3s that match user queries directly.</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl border border-border/80 bg-background flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">Concise Answer Block</p>
                          <p className="text-[11px] text-muted-foreground">Direct answer in the first 100 words for AI citations.</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl border border-border/80 bg-background flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">Structured Comparisons</p>
                          <p className="text-[11px] text-muted-foreground">Markdown tables and ordered lists for quick AI parsing.</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl border border-border/80 bg-background flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">Conversion CTA Injected</p>
                          <p className="text-[11px] text-muted-foreground">Links traffic directly to client-side converter tools.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Schema.org JSON-LD Structured Data Preview */}
                  <div className="p-5 rounded-2xl border border-border bg-card/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-primary" />
                        <span>Schema.org BlogPosting JSON-LD</span>
                      </h3>
                      <span className="text-[10px] font-mono text-emerald-500 font-semibold">
                        Valid Schema
                      </span>
                    </div>
                    <pre className="p-4 rounded-xl bg-background border border-border text-[11px] font-mono text-muted-foreground overflow-x-auto">
                      <code>
                        {JSON.stringify(
                          {
                            "@context": "https://schema.org",
                            "@type": "BlogPosting",
                            headline: formSeoTitle || formTitle || "Article Title",
                            description: formSeoDesc || formExcerpt || "Article Excerpt",
                            author: {
                              "@type": "Organization",
                              name: formAuthor || "OmniTools Editorial Team",
                            },
                            publisher: {
                              "@type": "Organization",
                              name: "OmniTools",
                              url: "https://omnitools.app",
                            },
                            datePublished: editingPost?.publishedAt || new Date().toISOString(),
                            dateModified: new Date().toISOString(),
                            mainEntityOfPage: `https://omnitools.app/blog/${formSlug || "slug"}`,
                          },
                          null,
                          2
                        )}
                      </code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
