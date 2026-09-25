import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { WebCheckTool } from "@/components/tools/productivity/WebCheckTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web-Check — Free Website OSINT, SSL & Security Headers Inspector",
  description:
    "Analyze website security posture, SSL/TLS certificate validity, DNS records (A, MX, TXT, NS), HTTP security headers, and server latency with Web-Check online.",
  keywords: [
    "web check",
    "website security analyzer",
    "ssl certificate checker",
    "dns lookup tool",
    "security headers analyzer",
    "hsts checker",
    "csp validator",
    "osint website tool",
  ],
};

export default function WebCheckPage() {
  return (
    <ToolPageLayout toolId="web-check">
      <WebCheckTool />
    </ToolPageLayout>
  );
}
