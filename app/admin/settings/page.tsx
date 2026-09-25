"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Shield,
  Bot,
  Sliders,
  Globe,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Check,
} from "lucide-react";

interface SeoSettingsState {
  siteName: string;
  domain: string;
  defaultTitleSuffix: string;
  defaultDescription: string;
  indexThreshold: number;
  autoGenerate: boolean;
  autoPublish: boolean;
  maxInternalLinks: number;
  allowOaiSearchBot: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SeoSettingsState>({
    siteName: "OmniTools",
    domain: "https://omnitools.app",
    defaultTitleSuffix: "OmniTools Universal Converter",
    defaultDescription: "100% private, free online file conversions in your browser.",
    indexThreshold: 80,
    autoGenerate: false,
    autoPublish: false,
    maxInternalLinks: 8,
    allowOaiSearchBot: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/seo/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.settings) {
          setSettings({
            siteName: data.settings.siteName || "OmniTools",
            domain: data.settings.domain || "https://omnitools.app",
            defaultTitleSuffix:
              data.settings.defaultTitleSuffix || "OmniTools Universal Converter",
            defaultDescription:
              data.settings.defaultDescription ||
              "100% private, free online file conversions in your browser.",
            indexThreshold: data.settings.indexThreshold ?? 80,
            autoGenerate: !!data.settings.autoGenerate,
            autoPublish: !!data.settings.autoPublish,
            maxInternalLinks: data.settings.maxInternalLinks ?? 8,
            allowOaiSearchBot: data.settings.allowOaiSearchBot ?? true,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/seo/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.ok) {
        showToast("SEO & Crawler configuration saved successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-xs">Loading SEO settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-foreground text-background text-xs font-semibold rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              SEO & Crawler Settings
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure indexing thresholds, internal link budgets, and AI crawler permissions.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saving ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Anti-Spam & Controlled Indexation Section */}
        <div className="p-5 bg-card border border-border rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Anti-Spam & Controlled Indexation Engine</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary">
              Doorway Defense
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Prevent search penalties by automatically applying <code className="text-foreground font-mono">noIndex</code> to low-demand, obscure, or redundant conversion permutations.
          </p>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-foreground">
                  Indexability Score Threshold:{" "}
                  <span className="font-mono font-bold text-primary">
                    {settings.indexThreshold} / 100
                  </span>
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Minimum score required for Robots: Index
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="1"
                value={settings.indexThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, indexThreshold: parseInt(e.target.value, 10) })
                }
                className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
                <span>50 (Permissive)</span>
                <span>80 (Recommended)</span>
                <span>95 (Strict / High Volume Only)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <label className="flex items-start gap-3 p-3 bg-muted/20 border border-border/60 rounded-xl cursor-pointer hover:bg-muted/40 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.autoGenerate}
                  onChange={(e) =>
                    setSettings({ ...settings, autoGenerate: e.target.checked })
                  }
                  className="mt-0.5 accent-primary w-4 h-4 rounded"
                />
                <div className="text-xs">
                  <span className="font-semibold text-foreground block">
                    Auto-Generate Eligible Pages
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    Automatically create draft SEO pages when new conversions are registered.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-muted/20 border border-border/60 rounded-xl cursor-pointer hover:bg-muted/40 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.autoPublish}
                  onChange={(e) =>
                    setSettings({ ...settings, autoPublish: e.target.checked })
                  }
                  className="mt-0.5 accent-primary w-4 h-4 rounded"
                />
                <div className="text-xs">
                  <span className="font-semibold text-foreground block">
                    Auto-Publish Above Threshold
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    Publish pages scoring &ge; {settings.indexThreshold} directly without manual review.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* AI Crawlers & Robots Policy */}
        <div className="p-5 bg-card border border-border rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-500" />
              <span>AI Search Crawlers &amp; GEO Permissions</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Robots.txt
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Control which automated crawlers can ingest entity data for generative engine answers.
          </p>

          <label className="flex items-start gap-3 p-3 bg-muted/20 border border-border/60 rounded-xl cursor-pointer hover:bg-muted/40 transition-colors">
            <input
              type="checkbox"
              checked={settings.allowOaiSearchBot}
              onChange={(e) =>
                setSettings({ ...settings, allowOaiSearchBot: e.target.checked })
              }
              className="mt-0.5 accent-primary w-4 h-4 rounded"
            />
            <div className="text-xs">
              <span className="font-semibold text-foreground block">
                Allow OAI-SearchBot (ChatGPT Search Engine)
              </span>
              <span className="text-muted-foreground text-[11px]">
                Enables OpenAI's search crawler to index converter specs, direct answers, and formats in robots.txt.
              </span>
            </div>
          </label>
        </div>

        {/* Brand & Canonical Domain Config */}
        <div className="p-5 bg-card border border-border rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <span>Brand &amp; Domain Identity</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Canonical Base URL
              </label>
              <input
                type="text"
                value={settings.domain}
                onChange={(e) => setSettings({ ...settings, domain: e.target.value })}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Default Title Suffix
              </label>
              <input
                type="text"
                value={settings.defaultTitleSuffix}
                onChange={(e) =>
                  setSettings({ ...settings, defaultTitleSuffix: e.target.value })
                }
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Default Meta Description
              </label>
              <textarea
                rows={2}
                value={settings.defaultDescription}
                onChange={(e) =>
                  setSettings({ ...settings, defaultDescription: e.target.value })
                }
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
