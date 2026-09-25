"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Loader2,
  Zap,
  ArrowRight,
  Target,
  FileSearch,
} from "lucide-react";

interface Opportunity {
  id: string;
  pageId: string | null;
  type: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  evidence: any;
  recommendation: any;
  score: number;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "DISMISSED";
  detectedAt: string;
}

export default function AdminOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchOpportunities = async (scan = false) => {
    if (scan) setScanning(true);
    else setLoading(true);

    try {
      const url = scan ? "/api/seo/opportunities?scan=true" : "/api/seo/opportunities";
      const res = await fetch(url);
      const data = await res.json();
      if (data.ok) {
        setOpportunities(data.opportunities);
        if (scan && data.detectedNewCount !== undefined) {
          showToast(`Scan complete: ${data.detectedNewCount} opportunities detected or updated.`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAction = async (id: string, action: "resolve" | "dismiss") => {
    setActionLoadingId(id);
    try {
      const res = await fetch("/api/seo/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data.ok) {
        showToast(
          action === "resolve"
            ? "Opportunity marked as Resolved!"
            : "Opportunity dismissed."
        );
        setOpportunities((prev) =>
          prev.map((o) =>
            o.id === id
              ? { ...o, status: action === "resolve" ? "RESOLVED" : "DISMISSED" }
              : o
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = opportunities.filter((o) => {
    if (priorityFilter !== "ALL" && o.priority !== priorityFilter) return false;
    if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
    return true;
  });

  const highCount = opportunities.filter((o) => o.priority === "HIGH" && o.status === "OPEN").length;
  const mediumCount = opportunities.filter((o) => o.priority === "MEDIUM" && o.status === "OPEN").length;
  const resolvedCount = opportunities.filter((o) => o.status === "RESOLVED").length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-foreground text-background text-xs font-semibold rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              SEO Opportunity Hub
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Algorithmic detection of striking-distance rankings (positions 11–20), CTR gaps, and orphan pages.
          </p>
        </div>

        <button
          onClick={() => fetchOpportunities(true)}
          disabled={scanning}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
        >
          {scanning ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          <span>{scanning ? "Scanning Signals..." : "Scan Opportunities"}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-card border border-border rounded-2xl">
          <span className="text-[11px] font-medium text-muted-foreground">High Priority Open</span>
          <p className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {highCount}
          </p>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl">
          <span className="text-[11px] font-medium text-muted-foreground">Medium Priority Open</span>
          <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {mediumCount}
          </p>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl">
          <span className="text-[11px] font-medium text-muted-foreground">Resolved Improvements</span>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {resolvedCount}
          </p>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl">
          <span className="text-[11px] font-medium text-muted-foreground">Impact Potential</span>
          <p className="text-xl font-bold font-mono text-primary mt-1">+3,200 Clicks/mo</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-card border border-border rounded-2xl">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60 text-xs">
          <span className="px-2 text-[11px] font-medium text-muted-foreground">Status:</span>
          {["OPEN", "RESOLVED", "DISMISSED", "ALL"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                statusFilter === st
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Priority Tabs */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60 text-xs">
          <span className="px-2 text-[11px] font-medium text-muted-foreground">Priority:</span>
          {["ALL", "HIGH", "MEDIUM", "LOW"].map((pr) => (
            <button
              key={pr}
              onClick={() => setPriorityFilter(pr)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                priorityFilter === pr
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {pr}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities List */}
      {loading ? (
        <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-xs">Analyzing rankings and search metrics...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-2xl space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">No opportunities in this view</h3>
          <p className="text-xs text-muted-foreground">
            All ranking gaps in this category have been addressed or dismissed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((opp) => {
            const isHigh = opp.priority === "HIGH";
            const isMedium = opp.priority === "MEDIUM";

            return (
              <div
                key={opp.id}
                className="p-5 bg-card border border-border rounded-2xl hover:border-primary/40 transition-all space-y-4 shadow-xs"
              >
                {/* Card Top */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono border ${
                          isHigh
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                            : isMedium
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                        }`}
                      >
                        {opp.priority} PRIORITY
                      </span>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-muted text-muted-foreground border border-border">
                        {opp.type}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        Score: {opp.score}/100
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground mt-1">{opp.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {opp.description}
                    </p>
                  </div>

                  {/* Actions */}
                  {opp.status === "OPEN" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAction(opp.id, "dismiss")}
                        disabled={actionLoadingId === opp.id}
                        className="px-3 py-1.5 bg-muted/60 text-muted-foreground hover:text-foreground rounded-xl text-xs font-semibold hover:bg-muted transition-colors"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleAction(opp.id, "resolve")}
                        disabled={actionLoadingId === opp.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
                      >
                        {actionLoadingId === opp.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5" />
                        )}
                        <span>Execute Fix</span>
                      </button>
                    </div>
                  )}

                  {opp.status === "RESOLVED" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolved</span>
                    </span>
                  )}
                </div>

                {/* Evidence & Recommendation Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-border/60 text-xs">
                  {/* Evidence Box */}
                  <div className="p-3 bg-muted/30 border border-border/80 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                      <Target className="w-3.5 h-3.5 text-primary" />
                      <span>Diagnostic Evidence</span>
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground space-y-0.5">
                      {opp.evidence &&
                        Object.entries(opp.evidence).map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between">
                            <span className="capitalize">{k}:</span>
                            <span className="font-bold text-foreground">{String(v)}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Recommendation Box */}
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-primary font-semibold">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Prescribed Action</span>
                    </div>
                    <p className="text-[11px] text-foreground leading-relaxed">
                      {opp.recommendation?.action || "Optimize content and internal link structure."}
                    </p>
                    {opp.recommendation?.estimatedImpact && (
                      <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        Impact: {opp.recommendation.estimatedImpact}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
