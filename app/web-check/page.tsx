import React from "react";
import type { Metadata } from "next";
import { WebCheckTool } from "@/components/tools/productivity/WebCheckTool";

export const metadata: Metadata = {
  title: "Web-Check — Complete All-in-One Website Intelligence & OSINT Suite",
  description:
    "Comprehensive in-depth website intelligence analyzer. Inspect SSL/TLS certificates, full DNS records, security headers, tech stack, cookies, carbon footprint, WHOIS, open ports, and threat blocklists.",
  keywords: [
    "web check",
    "website osint",
    "website security analyzer",
    "ssl certificate checker",
    "dns lookup",
    "security headers",
    "tech stack detector",
    "carbon footprint website",
    "whois lookup",
    "ports scanner",
  ],
};

export default function StandaloneWebCheckPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <WebCheckTool isStandalone={true} />
    </div>
  );
}
