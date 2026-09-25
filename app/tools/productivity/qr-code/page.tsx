import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { QrCodeTool } from "@/components/tools/productivity/QrCodeTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Code Generator — Free Custom QR Codes Online",
  description:
    "Create high-resolution QR codes for websites, plain text, and WiFi networks with custom colors. Download as PNG with zero expiration.",
};

export default function QrCodePage() {
  return (
    <ToolPageLayout toolId="qr-code-generator">
      <QrCodeTool />
    </ToolPageLayout>
  );
}
