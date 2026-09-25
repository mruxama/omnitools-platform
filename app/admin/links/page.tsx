"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Network,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Loader2,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Link2,
  Check,
} from "lucide-react";

interface NodeItem {
  slug: string;
  inboundCount: number;
  outboundCount: number;
  isOrphan: boolean;
}

export default function AdminLinksPage() {
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [orphanPages, setOrphanPages] = useState<string[]>([]);
  const [mostLinked, setMostLinked] = useState<NodeItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalLinks, setTotalLinks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seo/links");
      const data = await res.json();
      if (data.ok) {
        setNodes(data.nodes || []);
        setOrphanPages(data.orphanPages || []);
        setMostLinked(data.mostLinked || []);
        setTotalPages(data.totalPages || 0);
        setTotalLinks(data.totalLinks || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await fetch("/api/seo/links", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        showToast(data.message || "Internal link graph rebalanced successfully!");
        fetchGraph();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecalculating(false);
    }
  };

  const avgInbound = totalPages > 0 ? (totalLinks / totalPages).toFixed(1) : "0";

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
            <Network className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Internal Link Graph & Orphan Radar
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Semantic relevance calculation, link budgets (1–3 contextual, 3–8 tools), and orphan page elimination.
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
        >
          {recalculating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          <span>{recalculating ? "Rebalancing..." : "Recalculate Link Graph"}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-card border border-border rounded-2xl">
          <span className="text-[11px] font-medium text-muted-foreground">Tracked Nodes (Pages)</span>
          <p className="text-xl font-bold font-mono text-foreground mt-1">{totalPages}</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl">
          <span className="text-[11px] font-medium text-muted-foreground">Internal Graph Connections</span>
          <p className="text-xl font-bold font-mono text-primary mt-1">{totalLinks}</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl">
          <span className="text-[11px] font-medium text-muted-foreground">Orphan Pages (0 Inbound)</span>
          <p className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {orphanPages.length}
          </p>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl">
          <span className="text-[11px] font-medium text-muted-foreground">Avg Inbound Links/Page</span>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {avgInbound}
          </p>
        </div>
      </div>

      {/* Orphan Warning Banner */}
      {orphanPages.length > 0 && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-foreground">
                {orphanPages.length} Orphan Page(s) Detected
              </h3>
              <p className="text-[11px] text-muted-foreground">
                These pages have zero inbound links from other conversions or formats, risking crawl budget starvation:{" "}
                <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
                  {orphanPages.join(", ")}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={handleRecalculate}
            className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors shrink-0 shadow-xs"
          >
            Auto-Link Orphans
          </button>
        </div>
      )}

      {/* Top Connected Hubs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most Linked */}
        <div className="p-5 bg-card border border-border rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              <span>Highest In-Degree Authority Pages</span>
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground font-semibold">
              Top Authority
            </span>
          </div>
          <div className="space-y-2">
            {mostLinked.map((node) => (
              <div
                key={node.slug}
                className="flex items-center justify-between p-2.5 bg-muted/20 border border-border/60 rounded-xl text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-mono font-semibold text-foreground">{node.slug}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {node.inboundCount} Inbound
                  </span>
                  <span className="text-muted-foreground">({node.outboundCount} Out)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Link Budget Policy Specs */}
        <div className="p-5 bg-card border border-border rounded-2xl space-y-3 shadow-xs">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Automated Link Budget Allocation Rules</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-muted/20 border border-border/60 rounded-xl flex items-center justify-between">
              <span className="text-muted-foreground">Contextual In-Content Links:</span>
              <span className="font-mono font-bold text-foreground">1 to 3 links (Score &ge; 0.70)</span>
            </div>
            <div className="p-2.5 bg-muted/20 border border-border/60 rounded-xl flex items-center justify-between">
              <span className="text-muted-foreground">Related Conversions:</span>
              <span className="font-mono font-bold text-foreground">2 to 5 links (Same format/cat)</span>
            </div>
            <div className="p-2.5 bg-muted/20 border border-border/60 rounded-xl flex items-center justify-between">
              <span className="text-muted-foreground">Format Knowledge Hub:</span>
              <span className="font-mono font-bold text-foreground">1 link (/formats/[slug])</span>
            </div>
            <div className="p-2.5 bg-muted/20 border border-border/60 rounded-xl flex items-center justify-between">
              <span className="text-muted-foreground">Category Studio Hub:</span>
              <span className="font-mono font-bold text-foreground">1 link (/convert/[category])</span>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Link Graph Nodes */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Link Graph Node Ledger</h3>
            <p className="text-xs text-muted-foreground">
              Inbound and outbound relationship graph across all indexed conversion pages.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs">Traversing link graph...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Page Node</th>
                  <th className="py-3 px-4">Inbound Links</th>
                  <th className="py-3 px-4">Outbound Links</th>
                  <th className="py-3 px-4">Orphan Risk</th>
                  <th className="py-3 px-4 text-right">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {nodes.map((node) => (
                  <tr key={node.slug} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold text-foreground">{node.slug}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {node.inboundCount}
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {node.outboundCount}
                    </td>
                    <td className="py-3 px-4">
                      {node.isOrphan ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          ORPHAN
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          LINKED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/convert/${node.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
