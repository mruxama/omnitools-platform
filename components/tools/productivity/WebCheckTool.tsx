"use client";

import React, { useState } from "react";
import {
  Globe,
  ShieldCheck,
  ShieldAlert,
  Server,
  Network,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Download,
  Search,
  ExternalLink,
  Lock,
  Unlock,
  AlertTriangle,
  FileCode,
  Layers,
  Leaf,
  Mail,
  Share2,
  FileText,
  Activity,
  History,
  TrendingUp,
  Cpu,
  Cookie,
  Compass,
  ArrowRight,
} from "lucide-react";

interface ScanResult {
  target: string;
  hostname: string;
  baseDomain: string;
  url: string;
  finalUrl: string;
  scannedAt: string;
  latencyMs: number;
  status: {
    code: number;
    text: string;
    online: boolean;
  };
  screenshotUrl: string;
  securityScore: {
    score: number;
    grade: string;
    headersAudited: number;
    headersPassed: number;
  };
  securityHeaders: Array<{
    header: string;
    name: string;
    description: string;
    present: boolean;
    value: string | null;
    importance: "critical" | "high" | "medium" | "low";
  }>;
  hsts: {
    enabled: boolean;
    raw: string;
    maxAge: number | null;
    includeSubDomains: boolean;
    preload: boolean;
  };
  ssl: {
    isValid: boolean;
    authError: string | null;
    subject: Record<string, string>;
    issuer: Record<string, string>;
    validFrom: string;
    validTo: string;
    daysRemaining: number;
    serialNumber: string;
    fingerprint: string;
    bits?: number;
    protocol?: string;
    cipher?: string;
    san?: string;
  } | null;
  dns: {
    A: string[];
    AAAA: string[];
    MX: Array<{ exchange: string; priority: number }>;
    TXT: string[];
    NS: string[];
    CNAME: string[];
    SOA: any;
  };
  dnssec: {
    isConfigured: boolean;
    dnskeyFound: boolean;
    dsFound: boolean;
    rrsigAuthenticated: boolean;
  };
  location: {
    ip: string;
    city: string;
    region: string;
    country: string;
    countryCode: string;
    postal: string;
    latitude: number;
    longitude: number;
    org: string;
    isp?: string;
    asn?: string;
    timezone?: string;
    flag?: string;
  } | null;
  whois: {
    domain: string;
    registrar: string;
    createdDate: string | null;
    updatedDate: string | null;
    expiresDate: string | null;
    domainAgeDays: number;
    domainAgeYears: number;
    status: string[];
    nameservers: string[];
  } | null;
  mailConfig: {
    mxCount: number;
    mailServices: string[];
    spf: { configured: boolean; record: string | null };
    dmarc: { configured: boolean; record: string | null; policy: string | null };
    bimi: { configured: boolean; record: string | null };
  };
  openPorts: {
    checked: number;
    open: number[];
    closed: number[];
  };
  blocklists: {
    isFlagged: boolean;
    results: Array<{ server: string; isBlocked: boolean }>;
  };
  carbon: {
    bytes: number;
    co2Grams: number;
    energyKwh: number;
    cleanerThanPct: number;
    ecoGrade: string;
  };
  rank: {
    rank: number | null;
    isRanked: boolean;
  };
  archives: {
    firstScan: string;
    lastScan: string;
    totalDaysArchived: number;
    scanUrl: string;
  } | null;
  socialTags: {
    title: string | null;
    description: string | null;
    keywords: string | null;
    canonicalUrl: string | null;
    favicon: string | null;
    themeColor: string | null;
    author: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImage: string | null;
    ogUrl: string | null;
    ogType: string | null;
    ogSiteName: string | null;
    twitterCard: string | null;
    twitterSite: string | null;
    twitterCreator: string | null;
    twitterTitle: string | null;
    twitterDescription: string | null;
    twitterImage: string | null;
  };
  techStack: Array<{ name: string; category: string; evidence: string }>;
  linkedPages: {
    internal: string[];
    external: string[];
    totalDiscovered: number;
  };
  cookies: {
    count: number;
    items: Array<{
      name: string;
      value: string;
      secure: boolean;
      httpOnly: boolean;
      sameSite: string;
      domain: string | null;
      path: string;
    }>;
  };
  firewall: {
    detected: boolean;
    name: string;
    confidence: string;
  };
  robots: {
    present: boolean;
    url: string;
    lineCount: number;
    sampleDirectives: string[];
  };
  sitemap: {
    present: boolean;
    url: string;
    urlCount: number;
    sampleUrls: string[];
  };
  securityTxt: {
    present: boolean;
    path: string | null;
    contact: string | null;
    encryption: string | null;
    policy: string | null;
    isPgpSigned: boolean;
  };
  redirects: {
    hops: string[];
    count: number;
    hasRedirected: boolean;
  };
  serverInfo: {
    serverHeader: string;
    poweredBy: string | null;
    contentType: string | null;
  };
  rawHeaders: Record<string, string>;
}

const PRESET_DOMAINS = ["github.com", "cloudflare.com", "wikipedia.org", "google.com"];

export function WebCheckTool({ isStandalone = false }: { isStandalone?: boolean }) {
  const [target, setTarget] = useState("github.com");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [activeTab, setActiveTab] = useState<
    "website" | "security" | "ssl" | "dns" | "whois" | "network" | "headers"
  >("website");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleScan = async (domainToScan?: string) => {
    const domain = (domainToScan || target).trim();
    if (!domain) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tools/web-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: domain }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to scan target");
      }

      setResult(data);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred while analyzing the target.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadJsonReport = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `web-check-${result.hostname}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "B":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "C":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "D":
      case "F":
      default:
        return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Standalone Hero Banner if on /web-check */}
      {isStandalone && (
        <div className="text-center max-w-3xl mx-auto space-y-3 pt-4 pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Globe className="w-3.5 h-3.5" /> All-in-One Website Intelligence & OSINT Suite
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Web-Check Security Suite
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Comprehensive in-depth website reconnaissance: SSL/TLS, DNS records, security headers,
            technologies, cookies, carbon footprint, WHOIS, open ports, and threat blocklists.
          </p>
        </div>
      )}

      {/* Target input search bar */}
      <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan();
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="relative flex-1">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. github.com, cloudflare.com, or https://example.com"
              className="w-full pl-11 pr-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-base"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !target.trim()}
            className="inline-flex items-center justify-center px-7 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-sm shrink-0"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                Auditing 25+ Points...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Deep Scan Website
              </span>
            )}
          </button>
        </form>

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground">Try live sample:</span>
          {PRESET_DOMAINS.map((domain) => (
            <button
              key={domain}
              type="button"
              onClick={() => {
                setTarget(domain);
                handleScan(domain);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              {domain}
            </button>
          ))}
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Analysis failed</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Results Explorer */}
      {result && (
        <div className="space-y-6">
          {/* Top Level Metrics Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
            {/* Security Grade */}
            <div className="p-4 sm:p-5 bg-card border border-border rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Security Grade
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xl sm:text-2xl font-bold border ${getGradeColor(
                      result.securityScore.grade
                    )}`}
                  >
                    {result.securityScore.grade}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {result.securityScore.score}/100
                  </span>
                </div>
              </div>
              <ShieldCheck className="w-7 h-7 text-primary/40" />
            </div>

            {/* Server Status */}
            <div className="p-4 sm:p-5 bg-card border border-border rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Status & Latency
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      result.status.online ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                    }`}
                  />
                  <span className="text-sm sm:text-base font-semibold text-foreground">
                    {result.status.code} ({result.latencyMs}ms)
                  </span>
                </div>
              </div>
              <Activity className="w-7 h-7 text-primary/40" />
            </div>

            {/* SSL Expiry */}
            <div className="p-4 sm:p-5 bg-card border border-border rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  SSL / TLS
                </span>
                <div className="mt-1">
                  {result.ssl?.isValid ? (
                    <span className="text-xs sm:text-sm font-semibold text-emerald-500 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      {result.ssl.daysRemaining} days left
                    </span>
                  ) : (
                    <span className="text-xs sm:text-sm font-semibold text-rose-500 flex items-center gap-1">
                      <Unlock className="w-3.5 h-3.5" />
                      Expired/Invalid
                    </span>
                  )}
                </div>
              </div>
              <ShieldAlert className="w-7 h-7 text-primary/40" />
            </div>

            {/* Location */}
            <div className="p-4 sm:p-5 bg-card border border-border rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Hosting Location
                </span>
                <p className="mt-1 text-xs sm:text-sm font-semibold text-foreground truncate max-w-[120px]">
                  {result.location ? `${result.location.city || result.location.country}` : "Global Anycast"}
                </p>
              </div>
              <Compass className="w-7 h-7 text-primary/40" />
            </div>

            {/* Global Rank */}
            <div className="p-4 sm:p-5 bg-card border border-border rounded-2xl col-span-2 md:col-span-1 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Global Rank
                </span>
                <p className="mt-1 text-xs sm:text-sm font-semibold text-foreground">
                  {result.rank.rank ? `#${result.rank.rank.toLocaleString()}` : "Top 1M+"}
                </p>
              </div>
              <TrendingUp className="w-7 h-7 text-primary/40" />
            </div>
          </div>

          {/* Navigation Bar for All 6 Specialized Portions */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {[
                { id: "website", label: "Website & Content", icon: Globe },
                { id: "security", label: "Security & Threats", icon: ShieldCheck },
                { id: "ssl", label: "SSL / TLS", icon: Lock },
                { id: "dns", label: "DNS Records", icon: Network },
                { id: "whois", label: "Domain & WHOIS", icon: FileText },
                { id: "network", label: "Server, Mail & Ports", icon: Server },
                { id: "headers", label: "Raw Headers", icon: FileCode },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={downloadJsonReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium hover:bg-muted text-foreground transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Download Audit JSON
            </button>
          </div>

          {/* ======================================================== */}
          {/* PORTION 1: THE WEBSITE & FRONTEND (DEDICATED PORTION)   */}
          {/* ======================================================== */}
          {activeTab === "website" && (
            <div className="space-y-6">
              {/* Highlight Header */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">
                      Website Architecture & Frontend Analysis
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Live preview, HTML metadata, OpenGraph social cards, tech stack, cookies, and crawl policies.
                    </p>
                  </div>
                </div>
                <a
                  href={result.finalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-semibold hover:border-primary transition-colors text-foreground shrink-0"
                >
                  Visit Website <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Grid: Live Preview & Social Card */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Live Website Preview Thumbnail */}
                <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-primary" /> Live Website Screenshot
                    </h4>
                    <span className="text-[11px] text-muted-foreground">Rendered 900x600</span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden border border-border bg-muted/40 aspect-video flex items-center justify-center">
                    <img
                      src={result.screenshotUrl}
                      alt={`Preview of ${result.hostname}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="text-xs space-y-1 pt-1">
                    <p className="font-semibold text-foreground">
                      {result.socialTags.title || result.hostname}
                    </p>
                    <p className="text-muted-foreground line-clamp-2">
                      {result.socialTags.description || "No description meta tag provided."}
                    </p>
                  </div>
                </div>

                {/* OpenGraph & Social Cards Preview */}
                <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-primary" /> OpenGraph & Social Cards
                    </h4>
                    <span className="text-[11px] text-muted-foreground">
                      Type: {result.socialTags.ogType || "website"}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-background border border-border space-y-3 text-xs">
                    {result.socialTags.ogImage && (
                      <div className="rounded-lg overflow-hidden border border-border max-h-40">
                        <img
                          src={result.socialTags.ogImage}
                          alt="OpenGraph visual"
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                        {result.socialTags.ogSiteName || result.hostname}
                      </span>
                      <p className="font-bold text-sm text-foreground mt-0.5">
                        {result.socialTags.ogTitle || result.socialTags.title || "No Title"}
                      </p>
                      <p className="text-muted-foreground mt-1 line-clamp-2">
                        {result.socialTags.ogDescription || result.socialTags.description || "No description"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground block text-[10px]">Twitter Card</span>
                      <span className="font-medium text-foreground">
                        {result.socialTags.twitterCard || "Summary"}
                      </span>
                    </div>
                    <div className="p-2.5 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground block text-[10px]">Twitter Handle</span>
                      <span className="font-medium text-foreground">
                        {result.socialTags.twitterSite || result.socialTags.twitterCreator || "None"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technologies / Tech Stack */}
              <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-base flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-primary" /> Discovered Technology Stack ({result.techStack.length})
                  </h4>
                  <span className="text-xs text-muted-foreground">Frameworks, CMS & Hosting</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {result.techStack.map((tech, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-background border border-border flex items-start justify-between gap-2"
                    >
                      <div>
                        <p className="font-bold text-sm text-foreground">{tech.name}</p>
                        <span className="text-xs text-muted-foreground block mt-0.5">
                          {tech.category}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        Detected
                      </span>
                    </div>
                  ))}
                  {result.techStack.length === 0 && (
                    <div className="p-4 text-xs text-muted-foreground col-span-3">
                      Standard HTML / Hidden Stack signatures.
                    </div>
                  )}
                </div>
              </div>

              {/* Two Column: Cookies & Carbon Footprint */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cookies Audit */}
                <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-base flex items-center gap-2">
                      <Cookie className="w-4 h-4 text-primary" /> Cookies Audit ({result.cookies.count})
                    </h4>
                    <span className="text-xs text-muted-foreground">HTTP Set-Cookie</span>
                  </div>
                  <div className="space-y-2.5">
                    {result.cookies.items.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-background border border-border text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-foreground">{c.name}</span>
                          <div className="flex items-center gap-1.5">
                            {c.secure && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">
                                Secure
                              </span>
                            )}
                            {c.httpOnly && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold text-[10px]">
                                HttpOnly
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px]">
                              SameSite: {c.sameSite}
                            </span>
                          </div>
                        </div>
                        <p className="font-mono text-muted-foreground text-[11px] truncate">
                          Value: {c.value}
                        </p>
                      </div>
                    ))}
                    {result.cookies.count === 0 && (
                      <p className="text-xs text-muted-foreground py-4 text-center">
                        Zero tracking or session cookies set during initial HTTP response.
                      </p>
                    )}
                  </div>
                </div>

                {/* Carbon Footprint */}
                <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-base flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-emerald-500" /> Carbon Footprint (SWD v4)
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Eco Grade: {result.carbon.ecoGrade}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-background border border-border space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-black text-foreground">
                        {result.carbon.co2Grams} g
                      </span>
                      <span className="text-xs text-muted-foreground">CO2 per page visit</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${result.carbon.cleanerThanPct}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cleaner than <strong className="text-emerald-500">{result.carbon.cleanerThanPct}%</strong> of tested web pages globally.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground block text-[10px]">Payload Size</span>
                      <span className="font-semibold text-foreground">
                        {(result.carbon.bytes / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <div className="p-2.5 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground block text-[10px]">Energy / Visit</span>
                      <span className="font-semibold text-foreground">
                        {result.carbon.energyKwh} kWh
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Crawl Policies: Robots.txt & Sitemap & Security.txt */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Robots.txt */}
                <div className="p-5 bg-card border border-border rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-sm flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-primary" /> Robots.txt
                    </h5>
                    {result.robots.present ? (
                      <span className="text-emerald-500 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Found
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">Missing</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {result.robots.lineCount} directive lines discovered.
                  </p>
                  {result.robots.sampleDirectives.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-background border border-border font-mono text-[11px] space-y-1 max-h-32 overflow-y-auto">
                      {result.robots.sampleDirectives.map((d, i) => (
                        <p key={i} className="text-muted-foreground truncate">{d}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sitemap */}
                <div className="p-5 bg-card border border-border rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-sm flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-primary" /> Sitemap.xml
                    </h5>
                    {result.sitemap.present ? (
                      <span className="text-emerald-500 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Found
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">Missing</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {result.sitemap.urlCount} indexed URLs discovered.
                  </p>
                  {result.sitemap.sampleUrls.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-background border border-border font-mono text-[11px] space-y-1 max-h-32 overflow-y-auto">
                      {result.sitemap.sampleUrls.map((u, i) => (
                        <p key={i} className="text-muted-foreground truncate">{u}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Security.txt */}
                <div className="p-5 bg-card border border-border rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-sm flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-primary" /> Security.txt
                    </h5>
                    {result.securityTxt.present ? (
                      <span className="text-emerald-500 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Configured
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">Not Found</span>
                    )}
                  </div>
                  <div className="text-xs space-y-1">
                    <p>
                      <span className="text-muted-foreground">Contact:</span>{" "}
                      <span className="font-medium text-foreground">{result.securityTxt.contact || "N/A"}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">PGP Signed:</span>{" "}
                      <span>{result.securityTxt.isPgpSigned ? "Yes" : "No"}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Redirect Chain & Discovered Links */}
              <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Compass className="w-4 h-4 text-primary" /> Redirect Chain & Discovered Page Links
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block mb-2 font-medium">
                      Redirect Hops ({result.redirects.count})
                    </span>
                    <div className="space-y-1.5 font-mono">
                      {result.redirects.hops.map((hop, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border">
                          <span className="font-bold text-primary">#{idx + 1}</span>
                          <span className="truncate">{hop}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground block mb-2 font-medium">
                      Discovered Internal Routes ({result.linkedPages.internal.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {result.linkedPages.internal.map((link, idx) => (
                        <span key={idx} className="px-2 py-1 rounded bg-muted font-mono text-[11px] text-foreground">
                          {link}
                        </span>
                      ))}
                      {result.linkedPages.internal.length === 0 && (
                        <span className="text-muted-foreground">No relative paths found in root HTML.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PORTION 2: SECURITY & THREATS                            */}
          {/* ======================================================== */}
          {activeTab === "security" && (
            <div className="space-y-6">
              {/* Firewall & WAF Status Banner */}
              <div className="p-5 rounded-2xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                  <div>
                    <h4 className="font-bold text-base text-foreground">
                      Firewall / WAF: {result.firewall.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Confidence: {result.firewall.confidence} | Edge DDoS Protection Active
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">HSTS Preload:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      result.hsts.preload
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {result.hsts.preload ? "Preloaded" : "Not Preloaded"}
                  </span>
                </div>
              </div>

              {/* DNSSEC & Blocklists Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* DNSSEC Status */}
                <div className="p-5 bg-card border border-border rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" /> DNSSEC Cryptographic Validation
                    </h4>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        result.dnssec.isConfigured
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {result.dnssec.isConfigured ? "Secured" : "Unsigned"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 bg-background rounded-lg border border-border">
                      <span className="text-muted-foreground block text-[10px]">DNSKEY</span>
                      <span className="font-bold">{result.dnssec.dnskeyFound ? "Present" : "None"}</span>
                    </div>
                    <div className="p-2.5 bg-background rounded-lg border border-border">
                      <span className="text-muted-foreground block text-[10px]">DS Record</span>
                      <span className="font-bold">{result.dnssec.dsFound ? "Present" : "None"}</span>
                    </div>
                    <div className="p-2.5 bg-background rounded-lg border border-border">
                      <span className="text-muted-foreground block text-[10px]">RRSIG Auth</span>
                      <span className="font-bold">{result.dnssec.rrsigAuthenticated ? "Verified" : "No"}</span>
                    </div>
                  </div>
                </div>

                {/* Threat Blocklists (DNS Sinkhole Tests) */}
                <div className="p-5 bg-card border border-border rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-primary" /> Reputation & Blocklists
                    </h4>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        !result.blocklists.isFlagged
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-rose-500/10 text-rose-500"
                      }`}
                    >
                      {!result.blocklists.isFlagged ? "Clean & Trusted" : "Flagged by Resolvers"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {result.blocklists.results.map((b, i) => (
                      <div key={i} className="p-2 rounded-lg bg-background border border-border flex items-center justify-between">
                        <span className="text-muted-foreground">{b.server}</span>
                        <span className={`font-semibold ${b.isBlocked ? "text-rose-500" : "text-emerald-500"}`}>
                          {b.isBlocked ? "Blocked" : "OK"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Complete Security Headers Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-base">
                    HTTP Security Headers ({result.securityScore.headersPassed}/{result.securityScore.headersAudited})
                  </h4>
                  <span className="text-xs text-muted-foreground">Standardized OWASP Audit</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {result.securityHeaders.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        item.present
                          ? "bg-card border-border hover:border-emerald-500/30"
                          : "bg-muted/20 border-dashed border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {item.present ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-500" />
                            )}
                            <span className="font-semibold text-sm text-foreground">{item.name}</span>
                            <span
                              className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                item.importance === "critical"
                                  ? "bg-rose-500/10 text-rose-500"
                                  : item.importance === "high"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {item.importance}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>

                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            item.present
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-rose-500/10 text-rose-500"
                          }`}
                        >
                          {item.present ? "Present" : "Missing"}
                        </span>
                      </div>

                      {item.value && (
                        <div className="mt-3 p-2.5 rounded-lg bg-background border border-border font-mono text-xs text-muted-foreground break-all flex items-center justify-between gap-2">
                          <span className="text-foreground">{item.value}</span>
                          <button
                            onClick={() => copyToClipboard(item.value!, `hdr-${idx}`)}
                            className="text-muted-foreground hover:text-foreground shrink-0"
                          >
                            {copiedKey === `hdr-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PORTION 3: SSL / TLS CERTIFICATE                         */}
          {/* ======================================================== */}
          {activeTab === "ssl" && (
            <div className="p-6 bg-card border border-border rounded-2xl space-y-6">
              {result.ssl ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border">
                    <div>
                      <div className="flex items-center gap-2">
                        {result.ssl.isValid ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-500" />
                        )}
                        <h4 className="font-semibold text-base">
                          {result.ssl.isValid ? "Certificate Valid & Trusted" : "Certificate Untrusted"}
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.ssl.protocol} | Cipher: {result.ssl.cipher || "N/A"} | Bits: {result.ssl.bits || 256}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black text-foreground">
                        {result.ssl.daysRemaining}
                      </span>
                      <span className="text-xs text-muted-foreground block">days until renewal</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-3">
                      <h5 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">
                        Issued To (Subject)
                      </h5>
                      <div className="p-4 rounded-xl bg-background border border-border space-y-2">
                        <p>
                          <span className="text-muted-foreground">Common Name (CN):</span>{" "}
                          <span className="font-mono font-medium">{result.ssl.subject.CN || "N/A"}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Organization (O):</span>{" "}
                          <span>{result.ssl.subject.O || "N/A"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">
                        Issued By (Issuer Authority)
                      </h5>
                      <div className="p-4 rounded-xl bg-background border border-border space-y-2">
                        <p>
                          <span className="text-muted-foreground">Issuer Name:</span>{" "}
                          <span className="font-medium">{result.ssl.issuer.CN || result.ssl.issuer.O || "N/A"}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Country:</span>{" "}
                          <span>{result.ssl.issuer.C || "N/A"}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground block mb-1">Valid From</span>
                      <span>{new Date(result.ssl.validFrom).toUTCString()}</span>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground block mb-1">Valid To</span>
                      <span>{new Date(result.ssl.validTo).toUTCString()}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                    <span className="text-muted-foreground text-xs block">SHA-256 Fingerprint</span>
                    <span className="font-mono text-xs break-all">{result.ssl.fingerprint}</span>
                  </div>

                  {result.ssl.san && (
                    <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                      <span className="text-muted-foreground text-xs block">Subject Alternative Names (SANs)</span>
                      <span className="font-mono text-xs break-all text-muted-foreground">{result.ssl.san}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <Unlock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No SSL / TLS certificate could be obtained for this host.</p>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* PORTION 4: DNS RECORDS                                   */}
          {/* ======================================================== */}
          {activeTab === "dns" && (
            <div className="space-y-4">
              {/* A Records */}
              <div className="p-5 bg-card border border-border rounded-2xl">
                <h4 className="font-semibold text-sm mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-mono font-bold bg-primary/10 text-primary rounded-md">
                      A
                    </span>
                    IPv4 Addresses ({result.dns.A.length})
                  </span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {result.dns.A.map((ip, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-background border border-border font-mono text-xs flex items-center justify-between"
                    >
                      <span>{ip}</span>
                      <button
                        onClick={() => copyToClipboard(ip, `a-${idx}`)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {copiedKey === `a-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* MX Records */}
              <div className="p-5 bg-card border border-border rounded-2xl">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-mono font-bold bg-blue-500/10 text-blue-500 rounded-md">
                    MX
                  </span>
                  Mail Exchange Servers ({result.dns.MX.length})
                </h4>
                <div className="space-y-2">
                  {result.dns.MX.map((mx, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-background border border-border text-xs flex items-center justify-between font-mono"
                    >
                      <span>
                        <strong className="text-primary mr-2">[{mx.priority}]</strong>
                        {mx.exchange}
                      </span>
                      <button
                        onClick={() => copyToClipboard(mx.exchange, `mx-${idx}`)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {copiedKey === `mx-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nameservers */}
              <div className="p-5 bg-card border border-border rounded-2xl">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-mono font-bold bg-purple-500/10 text-purple-500 rounded-md">
                    NS
                  </span>
                  Authoritative Nameservers ({result.dns.NS.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                  {result.dns.NS.map((ns, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-background border border-border flex items-center justify-between">
                      <span>{ns}</span>
                      <button
                        onClick={() => copyToClipboard(ns, `ns-${idx}`)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {copiedKey === `ns-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* TXT Records */}
              {result.dns.TXT.length > 0 && (
                <div className="p-5 bg-card border border-border rounded-2xl">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-mono font-bold bg-amber-500/10 text-amber-500 rounded-md">
                      TXT
                    </span>
                    Text / Verification Records ({result.dns.TXT.length})
                  </h4>
                  <div className="space-y-2">
                    {result.dns.TXT.map((txt, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-background border border-border font-mono text-xs break-all flex items-start justify-between gap-2"
                      >
                        <span>{txt}</span>
                        <button
                          onClick={() => copyToClipboard(txt, `txt-${idx}`)}
                          className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
                        >
                          {copiedKey === `txt-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* PORTION 5: DOMAIN & WHOIS                                */}
          {/* ======================================================== */}
          {activeTab === "whois" && (
            <div className="p-6 bg-card border border-border rounded-2xl space-y-6">
              {result.whois ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                    <div>
                      <h4 className="font-bold text-lg text-foreground">{result.whois.domain}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Registrar: <strong className="text-foreground">{result.whois.registrar}</strong>
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-2xl font-bold text-foreground">
                        {result.whois.domainAgeYears} years
                      </span>
                      <span className="text-xs text-muted-foreground block">
                        ({result.whois.domainAgeDays.toLocaleString()} days old)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                    <div className="p-3 bg-background border border-border rounded-xl">
                      <span className="text-muted-foreground block text-[10px]">Registered On</span>
                      <span className="font-bold text-sm text-foreground">
                        {result.whois.createdDate ? new Date(result.whois.createdDate).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    <div className="p-3 bg-background border border-border rounded-xl">
                      <span className="text-muted-foreground block text-[10px]">Expires On</span>
                      <span className="font-bold text-sm text-foreground">
                        {result.whois.expiresDate ? new Date(result.whois.expiresDate).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    <div className="p-3 bg-background border border-border rounded-xl">
                      <span className="text-muted-foreground block text-[10px]">Last Updated</span>
                      <span className="font-bold text-sm text-foreground">
                        {result.whois.updatedDate ? new Date(result.whois.updatedDate).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>

                  {result.whois.status.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Registry Status Flags</span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.whois.status.map((st, i) => (
                          <span key={i} className="px-2.5 py-1 rounded bg-muted text-[11px] font-mono text-muted-foreground">
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>WHOIS / RDAP registry records are private or protected for this domain.</p>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* PORTION 6: SERVER, NETWORK, MAIL & PORTS                 */}
          {/* ======================================================== */}
          {activeTab === "network" && (
            <div className="space-y-6">
              {/* Server Geolocation */}
              {result.location && (
                <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
                  <h4 className="font-semibold text-base flex items-center gap-2">
                    <Compass className="w-4 h-4 text-primary" /> Server Physical Location & IP
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-background border border-border">
                      <span className="text-muted-foreground block text-[10px]">Country</span>
                      <span className="font-bold text-sm flex items-center gap-1.5">
                        {result.location.flag} {result.location.country}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-background border border-border">
                      <span className="text-muted-foreground block text-[10px]">City / Region</span>
                      <span className="font-bold text-sm">{result.location.city}, {result.location.region}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-background border border-border">
                      <span className="text-muted-foreground block text-[10px]">ISP / Organization</span>
                      <span className="font-bold text-sm truncate block">{result.location.org}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-background border border-border">
                      <span className="text-muted-foreground block text-[10px]">ASN & Coordinates</span>
                      <span className="font-bold text-sm">{result.location.asn || "N/A"} ({result.location.latitude.toFixed(2)}, {result.location.longitude.toFixed(2)})</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Configuration (SPF, DMARC, BIMI) */}
              <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-base flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" /> Email Security & Mail Configuration
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {result.mailConfig.mailServices.join(", ") || "Custom Mail Server"}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-background border border-border space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">SPF Record</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${result.mailConfig.spf.configured ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                        {result.mailConfig.spf.configured ? "Active" : "Missing"}
                      </span>
                    </div>
                    <p className="font-mono text-muted-foreground break-all text-[11px]">
                      {result.mailConfig.spf.record || "No v=spf1 record published."}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-background border border-border space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">DMARC Policy</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${result.mailConfig.dmarc.configured ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                        {result.mailConfig.dmarc.policy ? `p=${result.mailConfig.dmarc.policy}` : "Missing"}
                      </span>
                    </div>
                    <p className="font-mono text-muted-foreground break-all text-[11px]">
                      {result.mailConfig.dmarc.record || "No _dmarc record configured."}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-background border border-border space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">BIMI Verification</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${result.mailConfig.bimi.configured ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
                        {result.mailConfig.bimi.configured ? "Configured" : "None"}
                      </span>
                    </div>
                    <p className="font-mono text-muted-foreground break-all text-[11px]">
                      {result.mailConfig.bimi.record || "No BIMI visual mark specified."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Open Ports Scanner */}
              <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-base flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" /> Active TCP Ports Scanner ({result.openPorts.open.length} Open)
                  </h4>
                  <span className="text-xs text-muted-foreground">Scanned standard ports</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.openPorts.open.map((port) => (
                    <span
                      key={port}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-mono text-xs font-bold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Port {port} (Open)
                    </span>
                  ))}
                  {result.openPorts.closed.map((port) => (
                    <span
                      key={port}
                      className="px-3 py-1.5 rounded-xl bg-muted/40 border border-border text-muted-foreground font-mono text-xs flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5 opacity-40" /> Port {port}
                    </span>
                  ))}
                </div>
              </div>

              {/* Historical Archive (Wayback Machine) */}
              {result.archives && (
                <div className="p-6 bg-card border border-border rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-base flex items-center gap-2">
                      <History className="w-4 h-4 text-primary" /> Historical Archive (Wayback Machine)
                    </h4>
                    <a
                      href={result.archives.scanUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                    >
                      View Timeline <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 bg-background border border-border rounded-xl">
                      <span className="text-muted-foreground block text-[10px]">First Seen Snapshot</span>
                      <span className="font-bold text-sm">{result.archives.firstScan}</span>
                    </div>
                    <div className="p-3 bg-background border border-border rounded-xl">
                      <span className="text-muted-foreground block text-[10px]">Most Recent Snapshot</span>
                      <span className="font-bold text-sm">{result.archives.lastScan}</span>
                    </div>
                    <div className="p-3 bg-background border border-border rounded-xl">
                      <span className="text-muted-foreground block text-[10px]">Archived Snapshots</span>
                      <span className="font-bold text-sm">{result.archives.totalDaysArchived} dates</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* PORTION 7: RAW HEADERS TABLE                             */}
          {/* ======================================================== */}
          {activeTab === "headers" && (
            <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-primary" /> All HTTP Response Headers ({Object.keys(result.rawHeaders).length})
                </h4>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(result.rawHeaders, null, 2), "all-headers")}
                  className="text-xs inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  {copiedKey === "all-headers" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy JSON
                    </>
                  )}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="border-b border-border text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4 font-semibold">Header Name</th>
                      <th className="py-2 font-semibold">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {Object.entries(result.rawHeaders).map(([key, val], idx) => (
                      <tr key={idx} className="hover:bg-muted/30">
                        <td className="py-2 pr-4 font-semibold text-primary whitespace-nowrap align-top">
                          {key}
                        </td>
                        <td className="py-2 text-foreground break-all">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
