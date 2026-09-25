"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  TrendingUp,
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Calendar,
  Check,
} from "lucide-react";

interface QueryRow {
  id: string;
  query: string;
  pageUrl: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface InspectionData {
  url: string;
  verdict: string;
  coverageState: string;
  robotstxtState: string;
  indexingState: string;
  lastCrawlTime: string | null;
  pageFetchState: string;
  mobileUsability: string;
}

export default function AdminSearchConsolePage() {
  const [metrics, setMetrics] = useState({
    totalClicks: 5420,
    totalImpressions: 125600,
    avgCtr: 4.3,
    avgPosition: 7.8,
  });
  const [queries, setQueries] = useState<QueryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [submittingSitemap, setSubmittingSitemap] = useState(false);

  // URL Inspection state
  const [inspectInput, setInspectInput] = useState("https://omnitools.app/convert/jpg-to-webp");
  const [inspecting, setInspecting] = useState(false);
  const [inspectionResult, setInspectionResult] = useState<InspectionData | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchScData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/search-console/sync");
      const data = await res.json();
      if (data.ok) {
        if (data.metrics) setMetrics(data.metrics);
        if (data.queries) setQueries(data.queries);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/search-console/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync" }),
      });
      const data = await res.json();
      if (data.ok) {
        showToast(data.message || "Search Console sync complete!");
        fetchScData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const handleSubmitSitemap = async () => {
    setSubmittingSitemap(true);
    try {
      const res = await fetch("/api/search-console/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit-sitemap" }),
      });
      const data = await res.json();
      if (data.ok) {
        showToast("Sitemap submitted to Google Search Console successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingSitemap(false);
    }
  };

  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectInput.trim()) return;

    setInspecting(true);
    try {
      const res = await fetch("/api/search-console/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inspectInput.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setInspectionResult(data.inspection);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInspecting(false);
    }
  };

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
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Google Search Console
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time search performance, query positions, CTR benchmarks, and live URL inspection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSubmitSitemap}
            disabled={submittingSitemap}
            className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
          >
            {submittingSitemap ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 text-primary" />
            )}
            <span>Submit Sitemap</span>
          </button>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            {syncing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>{syncing ? "Syncing..." : "Sync Performance"}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-card border border-border rounded-2xl">
          <span className="text-[11px] font-medium text-muted-foreground">Total Organic Clicks</span>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.totalClicks.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl">
          <span className="text-[11px] font-medium text-muted-foreground">Total Impressions</span>
          <p className="text-xl font-bold font-mono text-foreground mt-1">
            {metrics.totalImpressions.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl">
          <span className="text-[11px] font-medium text-muted-foreground">Average CTR</span>
          <p className="text-xl font-bold font-mono text-primary mt-1">{metrics.avgCtr}%</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl">
          <span className="text-[11px] font-medium text-muted-foreground">Average Position</span>
          <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {metrics.avgPosition}
          </p>
        </div>
      </div>

      {/* URL Inspection Tool */}
      <div className="p-5 bg-card border border-border rounded-2xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Live Google URL Inspection Tool</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Directly query Google Search Console API for index status, crawl time, and mobile usability.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary font-bold">
            API v3
          </span>
        </div>

        <form onSubmit={handleInspect} className="flex gap-2">
          <input
            type="text"
            value={inspectInput}
            onChange={(e) => setInspectInput(e.target.value)}
            placeholder="Enter absolute URL to inspect (e.g. https://omnitools.app/convert/jpg-to-webp)..."
            className="flex-1 px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
          />
          <button
            type="submit"
            disabled={inspecting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
          >
            {inspecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Inspect</span>
          </button>
        </form>

        {inspectionResult && (
          <div className="p-4 bg-muted/20 border border-border/80 rounded-xl space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-foreground font-mono">
                  {inspectionResult.url}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {inspectionResult.verdict}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/60 text-xs font-mono">
              <div className="p-2 bg-card rounded-lg border border-border/60">
                <span className="text-[10px] text-muted-foreground block">Coverage State</span>
                <span className="font-semibold text-foreground">{inspectionResult.coverageState}</span>
              </div>
              <div className="p-2 bg-card rounded-lg border border-border/60">
                <span className="text-[10px] text-muted-foreground block">Robots.txt</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {inspectionResult.robotstxtState}
                </span>
              </div>
              <div className="p-2 bg-card rounded-lg border border-border/60">
                <span className="text-[10px] text-muted-foreground block">Mobile Usability</span>
                <span className="font-semibold text-foreground">
                  {inspectionResult.mobileUsability}
                </span>
              </div>
              <div className="p-2 bg-card rounded-lg border border-border/60">
                <span className="text-[10px] text-muted-foreground block">Last Crawled</span>
                <span className="font-semibold text-muted-foreground">
                  {inspectionResult.lastCrawlTime
                    ? new Date(inspectionResult.lastCrawlTime).toLocaleDateString()
                    : "Recently"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Search Queries Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Search Analytics Queries</h3>
            <p className="text-xs text-muted-foreground">
              Top organic queries driving traffic and impression share across conversions.
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground font-semibold">
            {queries.length} Queries Tracked
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs">Fetching search analytics...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Search Query</th>
                  <th className="py-3 px-4">Landing Page</th>
                  <th className="py-3 px-4 text-right">Clicks</th>
                  <th className="py-3 px-4 text-right">Impressions</th>
                  <th className="py-3 px-4 text-right">CTR</th>
                  <th className="py-3 px-4 text-right">Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {queries.map((q) => {
                  const ctrPct = (q.ctr * 100).toFixed(1);
                  const isHighPosition = q.position <= 5;
                  const isStrikingDistance = q.position > 10 && q.position <= 20;

                  return (
                    <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">
                        <span>{q.query}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-muted-foreground line-clamp-1 max-w-xs">
                          {q.pageUrl.replace("https://omnitools.app", "")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                        {q.clicks.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                        {q.impressions.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-primary">
                        {ctrPct}%
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                            isHighPosition
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : isStrikingDistance
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          #{q.position.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
