"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  Loader2,
  Sparkles,
  Eye,
  Check,
  Edit3,
  X,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Save,
  HelpCircle,
  ListOrdered,
} from "lucide-react";

interface SeoPageItem {
  id: string;
  slug: string;
  type: string;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  canonicalUrl?: string | null;
  intro: string | null;
  content: any;
  faq: any;
  howTo: any;
  schema: any;
  seoScore: number | null;
  aeoScore: number | null;
  geoScore: number | null;
  indexable: boolean;
  status: string;
  updatedAt: string;
}

export default function AdminSeoPages() {
  const [pages, setPages] = useState<SeoPageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [indexableFilter, setIndexableFilter] = useState("ALL");
  const [regeneratingSlug, setRegeneratingSlug] = useState<string | null>(null);
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editor Modal State
  const [editingPage, setEditingPage] = useState<SeoPageItem | null>(null);
  const [editTab, setEditTab] = useState<"meta" | "content" | "structured" | "schema">("meta");
  const [saving, setSaving] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  // Editor Form Fields
  const [editTitle, setEditTitle] = useState("");
  const [editMetaDesc, setEditMetaDesc] = useState("");
  const [editH1, setEditH1] = useState("");
  const [editCanonical, setEditCanonical] = useState("");
  const [editStatus, setEditStatus] = useState("PUBLISHED");
  const [editIndexable, setEditIndexable] = useState(true);
  const [editIntro, setEditIntro] = useState("");
  const [editHowToSteps, setEditHowToSteps] = useState<string[]>([]);
  const [editFaqs, setEditFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [editSchemaText, setEditSchemaText] = useState("");

  const fetchPages = async (targetPage = page, targetPageSize = pageSize) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (indexableFilter !== "ALL") params.set("indexable", indexableFilter);
      params.set("page", targetPage.toString());
      params.set("pageSize", targetPageSize.toString());

      const res = await fetch(`/api/seo/pages?${params.toString()}`);
      const data = await res.json();
      if (data.ok) {
        setPages(data.pages);
        setTotal(data.total);
        setPage(data.page || targetPage);
        setPageSize(data.pageSize || targetPageSize);
        setTotalPages(data.totalPages || Math.ceil(data.total / targetPageSize) || 1);
      }
    } catch (err) {
      console.error("Failed to load pages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPages(1, pageSize);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, indexableFilter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openEditor = (p: SeoPageItem) => {
    setEditingPage(p);
    setEditTab("meta");
    setSchemaError(null);
    setEditTitle(p.title || "");
    setEditMetaDesc(p.metaDescription || "");
    setEditH1(p.h1 || "");
    setEditCanonical(p.canonicalUrl || `https://omnitools.app/convert/${p.slug}`);
    setEditStatus(p.status || "PUBLISHED");
    setEditIndexable(p.indexable);
    setEditIntro(p.intro || "");

    // Extract how-to steps
    let steps: string[] = [];
    if (Array.isArray(p.howTo)) {
      steps = p.howTo;
    } else if (p.howTo && Array.isArray(p.howTo.steps)) {
      steps = p.howTo.steps.map((s: any) => (typeof s === "string" ? s : s.text || s.name || ""));
    } else if (p.content && Array.isArray(p.content.howToSteps)) {
      steps = p.content.howToSteps;
    }
    setEditHowToSteps(steps.length > 0 ? steps : ["Upload your file", "Select desired target options", "Download converted file"]);

    // Extract FAQs
    let faqs: { question: string; answer: string }[] = [];
    if (Array.isArray(p.faq)) {
      faqs = p.faq.map((f: any) => ({
        question: f.question || f.q || "",
        answer: f.answer || f.a || "",
      }));
    }
    setEditFaqs(faqs);

    // Format Schema JSON
    setEditSchemaText(p.schema ? JSON.stringify(p.schema, null, 2) : "{}");
  };

  const closeEditor = () => {
    setEditingPage(null);
    setSchemaError(null);
  };

  const handleSaveEditor = async () => {
    if (!editingPage) return;

    let parsedSchema = null;
    if (editSchemaText.trim()) {
      try {
        parsedSchema = JSON.parse(editSchemaText);
        setSchemaError(null);
      } catch (err: any) {
        setSchemaError(`Invalid JSON in Schema: ${err.message}`);
        setEditTab("schema");
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        slug: editingPage.slug,
        title: editTitle,
        metaDescription: editMetaDesc,
        h1: editH1,
        canonicalUrl: editCanonical,
        status: editStatus,
        indexable: editIndexable,
        intro: editIntro,
        howTo: editHowToSteps,
        faq: editFaqs,
        schema: parsedSchema,
      };

      const res = await fetch("/api/seo/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        showToast(`Page "${editingPage.slug}" updated successfully!`);
        setPages((prev) =>
          prev.map((item) =>
            item.slug === editingPage.slug
              ? {
                  ...item,
                  ...payload,
                }
              : item
          )
        );
        closeEditor();
      } else {
        showToast(`Failed to update: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      showToast(`Error saving page: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async (slug: string) => {
    setRegeneratingSlug(slug);
    try {
      const res = await fetch("/api/seo/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "regenerate", slug }),
      });
      const data = await res.json();
      if (data.ok) {
        showToast(`Page "${slug}" regenerated with fresh AEO/GEO scores!`);
        fetchPages();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRegeneratingSlug(null);
    }
  };

  const handleToggleIndexable = async (slug: string, currentVal: boolean) => {
    setTogglingSlug(slug);
    try {
      const res = await fetch("/api/seo/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, indexable: !currentVal }),
      });
      const data = await res.json();
      if (data.ok) {
        showToast(`Indexability updated for "${slug}"`);
        setPages((prev) =>
          prev.map((p) => (p.slug === slug ? { ...p, indexable: !currentVal } : p))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingSlug(null);
    }
  };

  const handleStatusChange = async (slug: string, newStatus: string) => {
    try {
      const res = await fetch("/api/seo/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, status: newStatus }),
      });
      const data = await res.json();
      if (data.ok) {
        showToast(`Status updated to ${newStatus}`);
        setPages((prev) =>
          prev.map((p) => (p.slug === slug ? { ...p, status: newStatus } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const indexableCount = pages.filter((p) => p.indexable).length;
  const avgSeo =
    pages.length > 0
      ? Math.round(pages.reduce((sum, p) => sum + (p.seoScore || 80), 0) / pages.length)
      : 85;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-foreground text-background text-xs font-semibold rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">SEO Pages Directory</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage programmatic conversion landing pages, indexability rules, and AEO/GEO scores.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchPages()}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-card border border-border rounded-2xl">
          <span className="text-[11px] font-medium text-muted-foreground">Total Generated Pages</span>
          <p className="text-xl font-bold font-mono text-foreground mt-1">{total}</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl">
          <span className="text-[11px] font-medium text-muted-foreground">Indexable (Robots: Index)</span>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {indexableCount}
          </p>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl">
          <span className="text-[11px] font-medium text-muted-foreground">Suppressed (NoIndex)</span>
          <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {total - indexableCount}
          </p>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl">
          <span className="text-[11px] font-medium text-muted-foreground">Average SEO Score</span>
          <p className="text-xl font-bold font-mono text-primary mt-1">{avgSeo} / 100</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-card border border-border rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by slug, title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 p-1 rounded-xl border border-border/60">
            <span className="px-2 text-[11px] font-medium">Status:</span>
            {["ALL", "PUBLISHED", "DRAFT"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  statusFilter === st
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Indexable Filter */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 p-1 rounded-xl border border-border/60">
            <span className="px-2 text-[11px] font-medium">Index:</span>
            {["ALL", "true", "false"].map((val) => (
              <button
                key={val}
                onClick={() => setIndexableFilter(val)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  indexableFilter === val
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {val === "ALL" ? "All" : val === "true" ? "Indexed" : "NoIndex"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs">Loading SEO landing pages...</p>
          </div>
        ) : pages.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
            <h3 className="text-sm font-semibold text-foreground">No SEO pages matched your query</h3>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search criteria or trigger a system bootstrap.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Page Target / Slug</th>
                  <th className="py-3 px-4">Scores (SEO / AEO / GEO)</th>
                  <th className="py-3 px-4">Indexable</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {pages.map((p) => {
                  const seoScore = p.seoScore || 80;
                  const scoreColor =
                    seoScore >= 90
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      : seoScore >= 75
                      ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
                      : "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20";

                  const liveUrl =
                    p.type === "FORMAT" ? `/formats/${p.slug}` : `/convert/${p.slug}`;

                  return (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-foreground">{p.slug}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground border border-border/80">
                            {p.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-md">
                          {p.title || "No meta title configured"}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-lg border text-[11px] font-mono font-bold ${scoreColor}`}
                          >
                            SEO {seoScore}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            AEO {p.aeoScore || 85}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            GEO {p.geoScore || 82}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleIndexable(p.slug, p.indexable)}
                          disabled={togglingSlug === p.slug}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                            p.indexable
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                          }`}
                        >
                          {togglingSlug === p.slug ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : p.indexable ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          <span>{p.indexable ? "Index" : "NoIndex"}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={p.status}
                          onChange={(e) => handleStatusChange(p.slug, e.target.value)}
                          className="px-2 py-1 bg-muted/40 border border-border rounded-lg text-[11px] font-medium text-foreground focus:outline-none"
                        >
                          <option value="PUBLISHED">PUBLISHED</option>
                          <option value="DRAFT">DRAFT</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openEditor(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-card border border-border rounded-lg text-[11px] font-semibold text-foreground hover:bg-muted transition-colors"
                          title="Edit SEO metadata, copy, FAQs, and schema"
                        >
                          <Edit3 className="w-3 h-3 text-primary" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleRegenerate(p.slug)}
                          disabled={regeneratingSlug === p.slug}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-card border border-border rounded-lg text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="Regenerate copy, AEO answers and FAQs"
                        >
                          <Sparkles
                            className={`w-3 h-3 text-primary ${
                              regeneratingSlug === p.slug ? "animate-spin" : ""
                            }`}
                          />
                          <span>{regeneratingSlug === p.slug ? "Building..." : "Regenerate"}</span>
                        </button>

                        <Link
                          href={liveUrl}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-3 bg-card border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            <span>
              Showing {total === 0 ? 0 : (page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, total)} of {total} pages
            </span>
            <div className="flex items-center gap-1.5">
              <span>Page size:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const newSize = parseInt(e.target.value, 10);
                  setPageSize(newSize);
                  fetchPages(1, newSize);
                }}
                className="px-2 py-1 bg-muted/40 border border-border rounded-lg text-xs font-semibold text-foreground focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => fetchPages(page - 1, pageSize)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-card border border-border rounded-lg font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-2 font-mono font-medium text-foreground">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page >= totalPages || loading}
              onClick={() => fetchPages(page + 1, pageSize)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-card border border-border rounded-lg font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SEO Page Editor Modal */}
      {editingPage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Edit SEO Page: <span className="font-mono text-primary">{editingPage.slug}</span>
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Customize headlines, metadata, structured How-To, FAQs, and JSON-LD schema.
                  </p>
                </div>
              </div>
              <button
                onClick={closeEditor}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 px-5 pt-3 border-b border-border bg-card">
              <button
                onClick={() => setEditTab("meta")}
                className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  editTab === "meta"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Meta & Headers
              </button>
              <button
                onClick={() => setEditTab("content")}
                className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  editTab === "content"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Intro & Copy
              </button>
              <button
                onClick={() => setEditTab("structured")}
                className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  editTab === "structured"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                How-To & FAQs ({editHowToSteps.length} steps / {editFaqs.length} FAQs)
              </button>
              <button
                onClick={() => setEditTab("schema")}
                className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  editTab === "schema"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>JSON-LD Schema</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {schemaError && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{schemaError}</span>
                </div>
              )}

              {/* Tab 1: Meta & Headers */}
              {editTab === "meta" && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-foreground block mb-1">
                      H1 Headline
                    </label>
                    <input
                      type="text"
                      value={editH1}
                      onChange={(e) => setEditH1(e.target.value)}
                      placeholder="Convert JPG to WEBP Online Free"
                      className="w-full p-2.5 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="font-semibold text-foreground">SEO Title Tag</label>
                      <span className={`text-[11px] ${editTitle.length > 60 ? "text-amber-500 font-bold" : "text-muted-foreground"}`}>
                        {editTitle.length}/60 characters
                      </span>
                    </div>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Best JPG to WEBP Converter - Fast & Free | OmniTools"
                      className="w-full p-2.5 bg-muted/30 border border-border rounded-xl text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="font-semibold text-foreground">Meta Description</label>
                      <span className={`text-[11px] ${editMetaDesc.length > 160 ? "text-amber-500 font-bold" : "text-muted-foreground"}`}>
                        {editMetaDesc.length}/160 characters
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={editMetaDesc}
                      onChange={(e) => setEditMetaDesc(e.target.value)}
                      placeholder="Convert your images directly in your browser with zero server uploads..."
                      className="w-full p-2.5 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="font-semibold text-foreground block mb-1">
                        Canonical URL
                      </label>
                      <input
                        type="text"
                        value={editCanonical}
                        onChange={(e) => setEditCanonical(e.target.value)}
                        className="w-full p-2 bg-muted/30 border border-border rounded-xl text-foreground font-mono text-[11px] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-foreground block mb-1">Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full p-2 bg-muted/30 border border-border rounded-xl text-foreground text-xs focus:outline-none"
                      >
                        <option value="PUBLISHED">PUBLISHED</option>
                        <option value="DRAFT">DRAFT</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-foreground block mb-1">
                        Search Indexing
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditIndexable(!editIndexable)}
                        className={`w-full p-2 rounded-xl border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                          editIndexable
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {editIndexable ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        <span>{editIndexable ? "Indexable (Index, Follow)" : "NoIndex (Suppressed)"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Intro & Copy */}
              {editTab === "content" && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-foreground block mb-1">
                      Introductory Overview Narrative
                    </label>
                    <textarea
                      rows={8}
                      value={editIntro}
                      onChange={(e) => setEditIntro(e.target.value)}
                      placeholder="Describe this conversion, why it matters, compression savings, and key advantages..."
                      className="w-full p-3 bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Rendered on the landing page below the converter widget and in AI search overview summaries.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: How-To & FAQs */}
              {editTab === "structured" && (
                <div className="space-y-6 text-xs">
                  {/* How-To Steps */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ListOrdered className="w-4 h-4 text-primary" />
                        <h3 className="font-bold text-foreground">How-To Steps</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditHowToSteps([...editHowToSteps, "New step"])}
                        className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Step</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {editHowToSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={step}
                            onChange={(e) => {
                              const updated = [...editHowToSteps];
                              updated[idx] = e.target.value;
                              setEditHowToSteps(updated);
                            }}
                            className="flex-1 p-2 bg-muted/30 border border-border rounded-xl text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setEditHowToSteps(editHowToSteps.filter((_, i) => i !== idx))
                            }
                            className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-muted"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FAQs */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-primary" />
                        <h3 className="font-bold text-foreground">Frequently Asked Questions</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setEditFaqs([
                            ...editFaqs,
                            { question: "What is this converter?", answer: "An online high-speed converter." },
                          ])
                        }
                        className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add FAQ</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {editFaqs.map((faq, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-muted/20 border border-border/80 rounded-xl space-y-2 relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground text-[11px]">FAQ #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => setEditFaqs(editFaqs.filter((_, i) => i !== idx))}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Question"
                            value={faq.question}
                            onChange={(e) => {
                              const updated = [...editFaqs];
                              updated[idx].question = e.target.value;
                              setEditFaqs(updated);
                            }}
                            className="w-full p-2 bg-card border border-border rounded-lg text-foreground font-semibold text-xs focus:outline-none"
                          />
                          <textarea
                            rows={2}
                            placeholder="Answer"
                            value={faq.answer}
                            onChange={(e) => {
                              const updated = [...editFaqs];
                              updated[idx].answer = e.target.value;
                              setEditFaqs(updated);
                            }}
                            className="w-full p-2 bg-card border border-border rounded-lg text-foreground text-xs focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: JSON-LD Schema */}
              {editTab === "schema" && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-foreground block">
                      Custom JSON-LD Structured Data
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(editSchemaText);
                          setEditSchemaText(JSON.stringify(parsed, null, 2));
                          setSchemaError(null);
                        } catch (err: any) {
                          setSchemaError(`Format error: ${err.message}`);
                        }
                      }}
                      className="px-2.5 py-1 bg-muted text-muted-foreground hover:text-foreground rounded-lg font-mono text-[10px]"
                    >
                      Format JSON
                    </button>
                  </div>
                  <textarea
                    rows={12}
                    value={editSchemaText}
                    onChange={(e) => {
                      setEditSchemaText(e.target.value);
                      setSchemaError(null);
                    }}
                    className="w-full p-3 bg-muted/40 border border-border rounded-xl font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                    placeholder="{ ... }"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Directly inject WebApplication, FAQPage, HowTo, and BreadcrumbList structured data into Google search rich snippets.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
              <button
                type="button"
                onClick={closeEditor}
                className="px-4 py-2 bg-card border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveEditor}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? "Saving Changes..." : "Save SEO Page"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
