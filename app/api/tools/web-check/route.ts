import { NextRequest, NextResponse } from "next/server";
import dns from "dns/promises";
import dnsSync from "dns";
import tls from "tls";
import net from "net";

export const runtime = "nodejs";
export const maxDuration = 30; // 30 seconds max duration

// --- SECURITY HEADERS SPEC ---
interface SecurityHeaderCheck {
  header: string;
  name: string;
  description: string;
  present: boolean;
  value: string | null;
  importance: "critical" | "high" | "medium" | "low";
}

const CRITICAL_HEADERS: Array<{
  header: string;
  name: string;
  description: string;
  importance: SecurityHeaderCheck["importance"];
}> = [
  {
    header: "strict-transport-security",
    name: "HSTS (Strict-Transport-Security)",
    description: "Enforces secure HTTPS connections and prevents SSL-stripping attacks.",
    importance: "critical",
  },
  {
    header: "content-security-policy",
    name: "CSP (Content-Security-Policy)",
    description: "Mitigates Cross-Site Scripting (XSS) and code injection vulnerabilities.",
    importance: "critical",
  },
  {
    header: "x-frame-options",
    name: "X-Frame-Options",
    description: "Defends against clickjacking by preventing unauthorized framing.",
    importance: "high",
  },
  {
    header: "x-content-type-options",
    name: "X-Content-Type-Options",
    description: "Stops browsers from MIME-sniffing away from the declared content type.",
    importance: "high",
  },
  {
    header: "referrer-policy",
    name: "Referrer-Policy",
    description: "Controls what referrer information is sent along with outbound requests.",
    importance: "medium",
  },
  {
    header: "permissions-policy",
    name: "Permissions-Policy",
    description: "Restricts access to browser APIs like geolocation, camera, and microphone.",
    importance: "medium",
  },
  {
    header: "cross-origin-opener-policy",
    name: "COOP (Cross-Origin-Opener-Policy)",
    description: "Isolates the browsing context to defend against Spectre-style attacks.",
    importance: "low",
  },
  {
    header: "cross-origin-resource-policy",
    name: "CORP (Cross-Origin-Resource-Policy)",
    description: "Blocks other origins from reading sensitive static resources.",
    importance: "low",
  },
  {
    header: "cross-origin-embedder-policy",
    name: "COEP (Cross-Origin-Embedder-Policy)",
    description: "Prevents a document from loading non-CORS resources without explicit permission.",
    importance: "low",
  },
  {
    header: "x-xss-protection",
    name: "X-XSS-Protection",
    description: "Legacy filter against reflected Cross-Site Scripting.",
    importance: "low",
  },
];

// Normalize domain / URL input
function normalizeTarget(input: string): { hostname: string; url: string; baseDomain: string } {
  let trimmed = input.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = "https://" + trimmed;
  }
  const parsed = new URL(trimmed);
  const hostname = parsed.hostname.toLowerCase();
  const parts = hostname.split(".");
  const baseDomain = parts.length > 2 ? parts.slice(-2).join(".") : hostname;
  return {
    hostname,
    url: parsed.href,
    baseDomain,
  };
}

// 1. SSL / TLS Certificate Details
async function getSslDetails(hostname: string, port = 443) {
  return new Promise<any>((resolve) => {
    const socket = tls.connect(
      {
        host: hostname,
        port,
        servername: hostname,
        rejectUnauthorized: false,
        timeout: 4500,
      },
      () => {
        try {
          const cert = socket.getPeerCertificate(true);
          const cipher = socket.getCipher();
          const protocol = socket.getProtocol();

          if (!cert || Object.keys(cert).length === 0) {
            socket.destroy();
            return resolve(null);
          }

          const validToDate = new Date(cert.valid_to);
          const now = new Date();
          const msPerDay = 1000 * 60 * 60 * 24;
          const daysRemaining = Math.max(0, Math.floor((validToDate.getTime() - now.getTime()) / msPerDay));

          const result = {
            isValid: socket.authorized,
            authError: socket.authorizationError ? String(socket.authorizationError) : null,
            subject: (cert.subject as Record<string, string>) || {},
            issuer: (cert.issuer as Record<string, string>) || {},
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
            daysRemaining,
            serialNumber: cert.serialNumber || "",
            fingerprint: cert.fingerprint256 || cert.fingerprint || "",
            bits: cert.bits,
            protocol: protocol || "TLS",
            cipher: cipher ? cipher.name : undefined,
            san: cert.subjectaltname || "",
          };

          socket.end();
          resolve(result);
        } catch {
          socket.destroy();
          resolve(null);
        }
      }
    );

    socket.on("timeout", () => {
      socket.destroy();
      resolve(null);
    });

    socket.on("error", () => {
      socket.destroy();
      resolve(null);
    });
  });
}

// 2. Comprehensive DNS Records
async function getDnsRecords(hostname: string) {
  const safe = async <T>(promise: Promise<T>, fallback: T): Promise<T> => {
    try {
      return await promise;
    } catch {
      return fallback;
    }
  };

  const [a, aaaa, mx, txt, ns, cname, soa] = await Promise.all([
    safe(dns.resolve4(hostname), []),
    safe(dns.resolve6(hostname), []),
    safe(dns.resolveMx(hostname), []),
    safe(dns.resolveTxt(hostname), []),
    safe(dns.resolveNs(hostname), []),
    safe(dns.resolveCname(hostname), []),
    safe(dns.resolveSoa(hostname), null),
  ]);

  return {
    A: a,
    AAAA: aaaa,
    MX: mx.sort((x, y) => x.priority - y.priority),
    TXT: txt.map((chunks) => chunks.join("")),
    NS: ns,
    CNAME: cname,
    SOA: soa,
  };
}

// 3. IP Geolocation (Location)
async function getLocation(ip: string) {
  if (!ip || ip === "127.0.0.1" || ip === "localhost") return null;
  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(4000),
      headers: { Accept: "application/json" },
    });
    const d = await res.json();
    if (d && d.success !== false) {
      return {
        ip: d.ip,
        city: d.city,
        region: d.region,
        country: d.country,
        countryCode: d.country_code,
        postal: d.postal,
        latitude: d.latitude,
        longitude: d.longitude,
        org: d.connection?.org || d.connection?.isp || "Unknown Provider",
        isp: d.connection?.isp,
        asn: d.connection?.asn ? `AS${d.connection.asn}` : null,
        timezone: d.timezone?.id,
        flag: d.flag?.emoji || null,
      };
    }
  } catch {}
  return null;
}

// 4. Domain WHOIS / RDAP
async function getWhoisRdap(domain: string) {
  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      signal: AbortSignal.timeout(4500),
      headers: { Accept: "application/rdap+json, application/json" },
    });
    if (!res.ok) return null;
    const d = await res.json();
    if (d && !d.errorCode) {
      const events: Array<{ eventAction: string; eventDate: string }> = d.events || [];
      const created = events.find((e) => e.eventAction === "registration")?.eventDate || null;
      const updated = events.find((e) => e.eventAction === "last changed")?.eventDate || null;
      const expires = events.find((e) => e.eventAction === "expiration")?.eventDate || null;

      const registrarEntity = (d.entities || []).find((e: any) => (e.roles || []).includes("registrar"));
      const registrarName = registrarEntity?.vcardArray?.[1]?.find((f: any) => f[0] === "fn")?.[3] || null;

      let ageDays = 0;
      let ageYears = 0;
      if (created) {
        ageDays = Math.floor((Date.now() - new Date(created).getTime()) / (1000 * 60 * 60 * 24));
        ageYears = Math.floor(ageDays / 365);
      }

      return {
        domain: d.ldhName || domain,
        registrar: registrarName || "Unknown / Protected",
        createdDate: created,
        updatedDate: updated,
        expiresDate: expires,
        domainAgeDays: Math.max(0, ageDays),
        domainAgeYears: Math.max(0, ageYears),
        status: d.status || [],
        nameservers: (d.nameservers || []).map((ns: any) => ns.ldhName || ns),
      };
    }
  } catch {}
  return null;
}

// 5. DNSSEC Check
async function getDnssec(domain: string) {
  try {
    const [keyRes, dsRes, aRes] = await Promise.all([
      fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=DNSKEY`, {
        signal: AbortSignal.timeout(3500),
        headers: { Accept: "application/dns-json" },
      }).then((r) => r.json()).catch(() => ({})),
      fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=DS`, {
        signal: AbortSignal.timeout(3500),
        headers: { Accept: "application/dns-json" },
      }).then((r) => r.json()).catch(() => ({})),
      fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`, {
        signal: AbortSignal.timeout(3500),
        headers: { Accept: "application/dns-json" },
      }).then((r) => r.json()).catch(() => ({})),
    ]);

    const dnskeyFound = Boolean(keyRes.Answer && keyRes.Answer.length > 0);
    const dsFound = Boolean(dsRes.Answer && dsRes.Answer.length > 0);
    const rrsigAuthenticated = Boolean(aRes.AD);

    return {
      isConfigured: dnskeyFound || dsFound,
      dnskeyFound,
      dsFound,
      rrsigAuthenticated,
    };
  } catch {
    return { isConfigured: false, dnskeyFound: false, dsFound: false, rrsigAuthenticated: false };
  }
}

// 6. Mail Configuration (SPF, DMARC, BIMI, MX)
async function getMailConfig(domain: string, mxRecords: any[], txtRecords: string[]) {
  const safeTxt = async (name: string) => {
    try {
      const records = await dns.resolveTxt(name);
      return records.map((r) => r.join(""));
    } catch {
      return [];
    }
  };

  const [dmarc, bimi] = await Promise.all([
    safeTxt(`_dmarc.${domain}`),
    safeTxt(`default._bimi.${domain}`),
  ]);

  const spf = txtRecords.find((t) => t.toLowerCase().startsWith("v=spf1")) || null;
  const dmarcRecord = dmarc.find((t) => t.toLowerCase().startsWith("v=dmarc1")) || null;
  const bimiRecord = bimi.find((t) => t.toLowerCase().startsWith("v=bimi1")) || null;

  // Provider detection
  const detectedServices: string[] = [];
  const mxHostnames = mxRecords.map((m) => (m.exchange || "").toLowerCase());

  if (mxHostnames.some((h) => h.includes("google") || h.includes("googlemail"))) detectedServices.push("Google Workspace");
  if (mxHostnames.some((h) => h.includes("outlook") || h.includes("microsoft"))) detectedServices.push("Microsoft 365");
  if (mxHostnames.some((h) => h.includes("protonmail") || h.includes("proton"))) detectedServices.push("ProtonMail");
  if (mxHostnames.some((h) => h.includes("zoho"))) detectedServices.push("Zoho Mail");
  if (mxHostnames.some((h) => h.includes("mimecast"))) detectedServices.push("Mimecast Security");
  if (mxHostnames.some((h) => h.includes("pphosted"))) detectedServices.push("Proofpoint");
  if (mxHostnames.some((h) => h.includes("mailgun"))) detectedServices.push("Mailgun");
  if (mxHostnames.some((h) => h.includes("sendgrid"))) detectedServices.push("SendGrid");

  return {
    mxCount: mxRecords.length,
    mailServices: detectedServices,
    spf: {
      configured: Boolean(spf),
      record: spf,
    },
    dmarc: {
      configured: Boolean(dmarcRecord),
      record: dmarcRecord,
      policy: dmarcRecord?.match(/p=([^;]+)/i)?.[1]?.trim() || null,
    },
    bimi: {
      configured: Boolean(bimiRecord),
      record: bimiRecord,
    },
  };
}

// 7. Open Ports Check
async function getOpenPorts(hostname: string) {
  const PORTS_TO_TEST = [21, 22, 25, 53, 80, 110, 143, 443, 3306, 5432, 8080, 8443];

  const checkPort = (port: number) => {
    return new Promise<{ port: number; open: boolean }>((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(1200);
      socket.once("connect", () => {
        socket.destroy();
        resolve({ port, open: true });
      });
      socket.once("timeout", () => {
        socket.destroy();
        resolve({ port, open: false });
      });
      socket.once("error", () => {
        socket.destroy();
        resolve({ port, open: false });
      });
      socket.connect(port, hostname);
    });
  };

  const results = await Promise.all(PORTS_TO_TEST.map(checkPort));
  const open = results.filter((r) => r.open).map((r) => r.port);
  const closed = results.filter((r) => !r.open).map((r) => r.port);

  return { checked: PORTS_TO_TEST.length, open, closed };
}

// 8. DNS Blocklists & Sinkholes Check
async function getBlocklists(domain: string) {
  const SERVERS = [
    { name: "AdGuard", ip: "176.103.130.130" },
    { name: "CleanBrowsing", ip: "185.228.168.9" },
    { name: "Cloudflare Family", ip: "1.1.1.3" },
    { name: "Quad9 Threat Blocking", ip: "9.9.9.9" },
  ];

  const SINK_IPS = new Set(["0.0.0.0", "127.0.0.1", "::1", "::"]);

  const checkServer = (name: string, serverIp: string) => {
    return new Promise<{ server: string; isBlocked: boolean }>((resolve) => {
      try {
        const resolver = new dnsSync.Resolver({ timeout: 2000, tries: 1 });
        resolver.setServers([serverIp]);
        resolver.resolve4(domain, (err, addrs) => {
          if (err) {
            resolve({ server: name, isBlocked: err.code === "NXDOMAIN" || err.code === "SERVFAIL" });
            return;
          }
          const blocked = (addrs || []).some((ip) => SINK_IPS.has(ip));
          resolve({ server: name, isBlocked: blocked });
        });
      } catch {
        resolve({ server: name, isBlocked: false });
      }
    });
  };

  const results = await Promise.all(SERVERS.map((s) => checkServer(s.name, s.ip)));
  return {
    isFlagged: results.some((r) => r.isBlocked),
    results,
  };
}

// 9. Carbon Footprint (Sustainable Web Design model)
function getCarbonFootprint(bytesTransferred: number) {
  const bytes = Math.max(1500, bytesTransferred);
  const KWH_PER_GB = 0.3;
  const FIRST_VISIT = 0.25;
  const RETURN_VISIT = 0.75;
  const RETURN_DATA_PCT = 0.02;
  const GRID_INTENSITY = 494; // grams per kWh

  const adjustedBytes = bytes * (FIRST_VISIT + RETURN_VISIT * RETURN_DATA_PCT);
  const energyKwh = (adjustedBytes / 1073741824) * KWH_PER_GB;
  const co2Grams = energyKwh * GRID_INTENSITY;

  const REFERENCE_MEDIAN_GRAMS = 0.001;
  const pct = 50 - 15 * Math.log2(Math.max(0.0001, co2Grams) / REFERENCE_MEDIAN_GRAMS);
  const cleanerThanPct = Math.max(1, Math.min(99, Math.round(pct)));

  let ecoGrade = "A+";
  if (co2Grams > 0.015) ecoGrade = "F";
  else if (co2Grams > 0.008) ecoGrade = "E";
  else if (co2Grams > 0.004) ecoGrade = "D";
  else if (co2Grams > 0.002) ecoGrade = "C";
  else if (co2Grams > 0.001) ecoGrade = "B";
  else if (co2Grams > 0.0005) ecoGrade = "A";

  return {
    bytes,
    co2Grams: parseFloat(co2Grams.toFixed(4)),
    energyKwh: parseFloat(energyKwh.toFixed(6)),
    cleanerThanPct,
    ecoGrade,
  };
}

// 10. Tranco Global Rank
async function getGlobalRank(domain: string) {
  try {
    const res = await fetch(`https://tranco-list.eu/api/ranks/domain/${encodeURIComponent(domain)}`, {
      signal: AbortSignal.timeout(3500),
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const d = await res.json();
      const rank = d?.ranks?.[0]?.rank || null;
      return {
        rank,
        isRanked: Boolean(rank),
      };
    }
  } catch {}
  return { rank: null, isRanked: false };
}

// 11. Wayback Machine History
async function getWaybackArchive(domain: string) {
  try {
    const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(
      domain
    )}&output=json&fl=timestamp,statuscode,digest,length&collapse=timestamp:8&limit=500`;
    const res = await fetch(cdxUrl, {
      signal: AbortSignal.timeout(4000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 1) {
      data.shift(); // remove header row
      const firstTimestamp = data[0][0];
      const lastTimestamp = data[data.length - 1][0];

      const formatTs = (ts: string) =>
        `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`;

      return {
        firstScan: formatTs(firstTimestamp),
        lastScan: formatTs(lastTimestamp),
        totalDaysArchived: data.length,
        scanUrl: `https://web.archive.org/web/*/${domain}`,
      };
    }
  } catch {}
  return null;
}

// 12. Security.txt (.well-known/security.txt)
async function getSecurityTxt(baseUrl: string) {
  const origin = new URL(baseUrl).origin;
  const paths = ["/.well-known/security.txt", "/security.txt"];

  for (const p of paths) {
    try {
      const res = await fetch(`${origin}${p}`, {
        signal: AbortSignal.timeout(3000),
        headers: { "User-Agent": "OmniTools-WebCheck/2.0" },
      });
      if (res.ok) {
        const text = await res.text();
        if (text && !text.toLowerCase().includes("<html")) {
          const lines = text.split("\n");
          const fields: Record<string, string> = {};
          for (const line of lines) {
            const m = line.match(/^([^#:][^:]*):\s*(.+)$/);
            if (m) fields[m[1].trim().toLowerCase()] = m[2].trim();
          }
          return {
            present: true,
            path: p,
            contact: fields["contact"] || null,
            encryption: fields["encryption"] || null,
            policy: fields["policy"] || null,
            hiring: fields["hiring"] || null,
            isPgpSigned: text.includes("-----BEGIN PGP SIGNED MESSAGE-----"),
          };
        }
      }
    } catch {}
  }
  return { present: false, path: null, contact: null, encryption: null, policy: null, isPgpSigned: false };
}

// 13. HTML Metadata, OpenGraph, Social, Links, and Tech Stack
function parseHtmlMetadata(html: string, pageUrl: string, headers: Record<string, string>) {
  const getTag = (pattern: RegExp) => {
    const match = html.match(pattern);
    return match ? match[1].trim() : null;
  };

  const title = getTag(/<title[^>]*>([^<]+)<\/title>/i);
  const description = getTag(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
    getTag(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const keywords = getTag(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["']/i);
  const canonical = getTag(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  const favicon = getTag(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i);
  const themeColor = getTag(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']*)["']/i);
  const author = getTag(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']*)["']/i);

  // OpenGraph
  const ogTitle = getTag(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
  const ogDescription = getTag(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
  const ogImage = getTag(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
  const ogUrl = getTag(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']*)["']/i);
  const ogType = getTag(/<meta[^>]*property=["']og:type["'][^>]*content=["']([^"']*)["']/i);
  const ogSiteName = getTag(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']*)["']/i);

  // Twitter
  const twitterCard = getTag(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']*)["']/i);
  const twitterSite = getTag(/<meta[^>]*name=["']twitter:site["'][^>]*content=["']([^"']*)["']/i);
  const twitterCreator = getTag(/<meta[^>]*name=["']twitter:creator["'][^>]*content=["']([^"']*)["']/i);
  const twitterTitle = getTag(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']*)["']/i);
  const twitterDescription = getTag(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']*)["']/i);
  const twitterImage = getTag(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']*)["']/i);

  // Discovered Links
  const linkMatches = [...html.matchAll(/href=["'](https?:\/\/[^"'\s>]+|\/[^"'\s>]+)["']/gi)];
  const internalLinks = new Set<string>();
  const externalLinks = new Set<string>();
  const parsedHost = new URL(pageUrl).hostname;

  for (const m of linkMatches) {
    const raw = m[1];
    try {
      const resolved = new URL(raw, pageUrl);
      if (resolved.hostname === parsedHost) {
        if (internalLinks.size < 15) internalLinks.add(resolved.pathname);
      } else {
        if (externalLinks.size < 15) externalLinks.add(resolved.hostname);
      }
    } catch {}
  }

  // Tech Stack Detection from HTML & Headers
  const techStack: Array<{ name: string; category: string; evidence: string }> = [];
  const lowerHtml = html.toLowerCase();
  const lowerHeaders = JSON.stringify(headers).toLowerCase();

  const addTech = (name: string, category: string, evidence: string) => {
    if (!techStack.some((t) => t.name === name)) {
      techStack.push({ name, category, evidence });
    }
  };

  // Frontend frameworks
  if (lowerHtml.includes("__next_data__") || lowerHeaders.includes("x-nextjs")) addTech("Next.js", "Web Framework", "Next.js data payload / headers");
  if (lowerHtml.includes("react") || lowerHtml.includes("data-reactroot")) addTech("React", "JavaScript UI Library", "React attributes in markup");
  if (lowerHtml.includes("__nuxt__") || lowerHtml.includes("data-v-")) addTech("Nuxt.js / Vue", "Web Framework", "Vue/Nuxt attributes");
  if (lowerHtml.includes("ng-version") || lowerHtml.includes("ng-")) addTech("Angular", "Web Framework", "Angular attributes");
  if (lowerHtml.includes("tailwind") || lowerHtml.includes("tw-")) addTech("Tailwind CSS", "CSS Framework", "Tailwind stylesheets/classes");
  if (lowerHtml.includes("bootstrap")) addTech("Bootstrap", "CSS Framework", "Bootstrap stylesheets");
  if (lowerHtml.includes("jquery")) addTech("jQuery", "JavaScript Library", "jQuery script found");

  // CMS & Ecommerce
  if (lowerHtml.includes("wp-content") || lowerHtml.includes("wp-includes")) addTech("WordPress", "CMS", "WordPress directory paths");
  if (lowerHtml.includes("cdn.shopify.com") || lowerHtml.includes("shopify.")) addTech("Shopify", "Ecommerce", "Shopify assets CDN");

  // Analytics & Tags
  if (lowerHtml.includes("googletagmanager.com") || lowerHtml.includes("google-analytics.com")) addTech("Google Analytics", "Analytics", "Google Tag Manager script");
  if (lowerHtml.includes("plausible.io")) addTech("Plausible Analytics", "Analytics", "Plausible script");

  // Hosting & CDN
  if (headers["server"]?.toLowerCase().includes("cloudflare") || headers["cf-ray"]) addTech("Cloudflare", "CDN & WAF", "Cloudflare edge headers");
  if (headers["x-vercel-id"] || headers["server"]?.toLowerCase().includes("vercel")) addTech("Vercel", "Hosting Platform", "Vercel serverless headers");
  if (headers["x-amz-cf-id"] || headers["via"]?.toLowerCase().includes("cloudfront")) addTech("Amazon CloudFront", "CDN", "AWS CloudFront edge headers");
  if (headers["x-fastly-request-id"]) addTech("Fastly", "CDN", "Fastly edge headers");
  if (headers["server"]?.toLowerCase().includes("nginx")) addTech("Nginx", "Web Server", "Server banner");
  if (headers["server"]?.toLowerCase().includes("apache")) addTech("Apache HTTP Server", "Web Server", "Server banner");

  return {
    socialTags: {
      title,
      description,
      keywords,
      canonicalUrl: canonical,
      favicon,
      themeColor,
      author,
      ogTitle,
      ogDescription,
      ogImage,
      ogUrl,
      ogType,
      ogSiteName,
      twitterCard,
      twitterSite,
      twitterCreator,
      twitterTitle,
      twitterDescription,
      twitterImage,
    },
    techStack,
    links: {
      internal: Array.from(internalLinks),
      external: Array.from(externalLinks),
      totalDiscovered: linkMatches.length,
    },
  };
}

// 14. Cookies Parser & Audit
function parseCookies(setCookieHeader?: string | string[]) {
  if (!setCookieHeader) return { count: 0, items: [] };
  const rawList = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  const items = rawList.map((str) => {
    const parts = str.split(";").map((p) => p.trim());
    const [nameVal, ...attrs] = parts;
    const [name, ...valParts] = nameVal.split("=");
    const value = valParts.join("=");

    const attrMap: Record<string, string | boolean> = {};
    for (const a of attrs) {
      const [k, v] = a.split("=");
      attrMap[k.toLowerCase()] = v || true;
    }

    return {
      name: name.trim(),
      value: value.length > 24 ? value.slice(0, 24) + "..." : value,
      secure: Boolean(attrMap["secure"]),
      httpOnly: Boolean(attrMap["httponly"]),
      sameSite: (attrMap["samesite"] as string) || "Not Set",
      domain: (attrMap["domain"] as string) || null,
      path: (attrMap["path"] as string) || "/",
    };
  });

  return { count: items.length, items };
}

// 15. Robots.txt and Sitemap discovery
async function getRobotsAndSitemap(hostname: string) {
  let robotsPresent = false;
  let sampleDirectives: string[] = [];
  let sitemapUrlFromRobots: string | null = null;
  let robotsLineCount = 0;

  try {
    const res = await fetch(`https://${hostname}/robots.txt`, {
      signal: AbortSignal.timeout(3500),
      headers: { "User-Agent": "OmniTools-WebCheck/2.0" },
    });
    if (res.ok) {
      robotsPresent = true;
      const text = await res.text();
      const lines = text.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
      robotsLineCount = lines.length;
      sampleDirectives = lines.slice(0, 10);
      for (const line of lines) {
        if (line.toLowerCase().startsWith("sitemap:")) {
          sitemapUrlFromRobots = line.split(/\s+/)[1]?.trim() || null;
          break;
        }
      }
    }
  } catch {}

  const sitemapTarget = sitemapUrlFromRobots || `https://${hostname}/sitemap.xml`;
  let sitemapPresent = false;
  let sitemapUrlCount = 0;
  let sampleSitemapUrls: string[] = [];

  try {
    const sRes = await fetch(sitemapTarget, {
      signal: AbortSignal.timeout(3500),
      headers: { "User-Agent": "OmniTools-WebCheck/2.0", Accept: "application/xml, text/xml" },
    });
    if (sRes.ok) {
      const xml = await sRes.text();
      if (xml.includes("<urlset") || xml.includes("<sitemapindex")) {
        sitemapPresent = true;
        const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)];
        sitemapUrlCount = matches.length;
        sampleSitemapUrls = matches.slice(0, 5).map((m) => m[1]);
      }
    }
  } catch {}

  return {
    robots: {
      present: robotsPresent,
      url: `https://${hostname}/robots.txt`,
      lineCount: robotsLineCount,
      sampleDirectives,
    },
    sitemap: {
      present: sitemapPresent,
      url: sitemapTarget,
      urlCount: sitemapUrlCount,
      sampleUrls: sampleSitemapUrls,
    },
  };
}

// 16. Firewall & WAF Detection
function detectFirewall(headers: Record<string, string>) {
  if (headers["cf-ray"] || headers["server"]?.toLowerCase().includes("cloudflare")) {
    return { detected: true, name: "Cloudflare Web Application Firewall & DDoS Protection", confidence: "High" };
  }
  if (headers["x-amz-cf-id"] || headers["via"]?.toLowerCase().includes("cloudfront")) {
    return { detected: true, name: "AWS CloudFront / AWS WAF", confidence: "High" };
  }
  if (headers["x-fastly-request-id"]) {
    return { detected: true, name: "Fastly Next-Gen WAF", confidence: "High" };
  }
  if (headers["x-akamai-transformed"] || headers["server"]?.toLowerCase().includes("akamai")) {
    return { detected: true, name: "Akamai Edge Defense & App Security", confidence: "High" };
  }
  if (headers["x-sucuri-id"]) {
    return { detected: true, name: "Sucuri CloudProxy WAF", confidence: "High" };
  }
  if (headers["x-iinfo"] || headers["incap_ses"]) {
    return { detected: true, name: "Imperva Incapsula WAF", confidence: "High" };
  }
  if (headers["x-vercel-id"]) {
    return { detected: true, name: "Vercel Edge Network Security & Firewall", confidence: "High" };
  }
  return { detected: false, name: "None Detected / Custom Shield", confidence: "Low" };
}

// --- MAIN HANDLER ---
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetInput = body.target || body.url;

    if (!targetInput || typeof targetInput !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'target' or 'url' in request payload." },
        { status: 400 }
      );
    }

    let parsed: { hostname: string; url: string; baseDomain: string };
    try {
      parsed = normalizeTarget(targetInput);
    } catch {
      return NextResponse.json({ error: "Invalid domain or URL format." }, { status: 400 });
    }

    const { hostname, url, baseDomain } = parsed;

    // Execute Initial Network Probes in Parallel
    const [dnsData, sslData, dnssecData, openPortsData, whoisData] = await Promise.all([
      getDnsRecords(hostname),
      getSslDetails(hostname),
      getDnssec(hostname),
      getOpenPorts(hostname),
      getWhoisRdap(baseDomain),
    ]);

    // GeoIP using Primary IP from DNS
    const primaryIp = dnsData.A[0] || "";
    const locationData = await getLocation(primaryIp);

    // Manual Redirect Tracking & Page Fetch
    const redirectHops: string[] = [url];
    let currentUrl = url;
    let finalRes: Response | null = null;
    let responseHtml = "";
    let responseHeaders: Record<string, string> = {};
    let rawSetCookie: string[] = [];
    const startTime = Date.now();

    for (let i = 0; i < 6; i++) {
      try {
        const res = await fetch(currentUrl, {
          method: "GET",
          redirect: "manual",
          signal: AbortSignal.timeout(6000),
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 OmniTools-WebCheck/2.0",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
        });

        if (res.headers.get("set-cookie")) {
          rawSetCookie.push(res.headers.get("set-cookie")!);
        }

        if (res.status >= 300 && res.status < 400) {
          const loc = res.headers.get("location");
          if (!loc) {
            finalRes = res;
            break;
          }
          currentUrl = new URL(loc, currentUrl).href;
          redirectHops.push(currentUrl);
        } else {
          finalRes = res;
          responseHtml = await res.text();
          break;
        }
      } catch {
        break;
      }
    }

    const latencyMs = Date.now() - startTime;
    const httpStatus = finalRes ? finalRes.status : 0;
    const httpStatusText = finalRes ? finalRes.statusText : "Connection Timed Out";

    if (finalRes) {
      finalRes.headers.forEach((val, key) => {
        responseHeaders[key.toLowerCase()] = val;
      });
    }

    // Secondary parallel queries (Email config, Robots, Sitemap, Carbon, Tranco, Wayback, Security.txt, Blocklists)
    const [mailConfigData, robotsSitemapData, securityTxtData, blocklistsData, globalRankData, waybackData] =
      await Promise.all([
        getMailConfig(hostname, dnsData.MX, dnsData.TXT),
        getRobotsAndSitemap(hostname),
        getSecurityTxt(url),
        getBlocklists(hostname),
        getGlobalRank(baseDomain),
        getWaybackArchive(baseDomain),
      ]);

    // Parse HTML metadata, social tags, links, and technologies
    const htmlMeta = parseHtmlMetadata(responseHtml, currentUrl, responseHeaders);
    const cookiesData = parseCookies(rawSetCookie);
    const firewallData = detectFirewall(responseHeaders);
    const carbonData = getCarbonFootprint(responseHtml.length || 35000);

    // Security Headers Audit
    const securityHeaders: SecurityHeaderCheck[] = CRITICAL_HEADERS.map((item) => {
      const val = responseHeaders[item.header] || null;
      return {
        header: item.header,
        name: item.name,
        description: item.description,
        present: Boolean(val),
        value: val,
        importance: item.importance,
      };
    });

    // HSTS Analysis
    const hstsRaw = responseHeaders["strict-transport-security"] || "";
    const hstsData = {
      enabled: Boolean(hstsRaw),
      raw: hstsRaw,
      maxAge: hstsRaw.match(/max-age=(\d+)/i)?.[1] ? parseInt(hstsRaw.match(/max-age=(\d+)/i)![1], 10) : null,
      includeSubDomains: /includeSubDomains/i.test(hstsRaw),
      preload: /preload/i.test(hstsRaw),
    };

    // Calculate Comprehensive Security Score & Letter Grade
    let score = 20; // baseline
    if (sslData?.isValid && sslData.daysRemaining > 0) score += 30;
    if (hstsData.enabled) score += 15;
    if (hstsData.preload) score += 5;
    if (responseHeaders["content-security-policy"]) score += 20;
    if (responseHeaders["x-frame-options"]) score += 5;
    if (responseHeaders["x-content-type-options"]) score += 5;
    if (dnssecData.isConfigured) score += 5;
    if (blocklistsData.isFlagged) score -= 30;

    score = Math.min(100, Math.max(0, score));

    let grade = "F";
    if (score >= 90) grade = "A+";
    else if (score >= 80) grade = "A";
    else if (score >= 70) grade = "B";
    else if (score >= 60) grade = "C";
    else if (score >= 50) grade = "D";

    // High quality live screenshot preview URL
    const screenshotUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=900&h=600`;

    return NextResponse.json({
      target: targetInput,
      hostname,
      baseDomain,
      url,
      finalUrl: currentUrl,
      scannedAt: new Date().toISOString(),
      latencyMs,
      status: {
        code: httpStatus,
        text: httpStatusText,
        online: httpStatus >= 200 && httpStatus < 400,
      },
      screenshotUrl,
      securityScore: {
        score,
        grade,
        headersAudited: securityHeaders.length,
        headersPassed: securityHeaders.filter((h) => h.present).length,
      },
      securityHeaders,
      hsts: hstsData,
      ssl: sslData,
      dns: dnsData,
      dnssec: dnssecData,
      location: locationData,
      whois: whoisData,
      mailConfig: mailConfigData,
      openPorts: openPortsData,
      blocklists: blocklistsData,
      carbon: carbonData,
      rank: globalRankData,
      archives: waybackData,
      socialTags: htmlMeta.socialTags,
      techStack: htmlMeta.techStack,
      linkedPages: htmlMeta.links,
      cookies: cookiesData,
      firewall: firewallData,
      robots: robotsSitemapData.robots,
      sitemap: robotsSitemapData.sitemap,
      securityTxt: securityTxtData,
      redirects: {
        hops: redirectHops,
        count: redirectHops.length - 1,
        hasRedirected: redirectHops.length > 1,
      },
      serverInfo: {
        serverHeader: responseHeaders["server"] || "Hidden / Protected",
        poweredBy: responseHeaders["x-powered-by"] || null,
        contentType: responseHeaders["content-type"] || null,
      },
      rawHeaders: responseHeaders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to analyze target website." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("target") || searchParams.get("url");

  if (!target) {
    return NextResponse.json(
      { error: "Query parameter 'target' or 'url' is required." },
      { status: 400 }
    );
  }

  return POST(
    new NextRequest(req.url, {
      method: "POST",
      body: JSON.stringify({ target }),
      headers: { "Content-Type": "application/json" },
    })
  );
}
