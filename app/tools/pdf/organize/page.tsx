import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { OrganizePdfTool } from "@/components/tools/pdf/OrganizePdfTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organize PDF Pages — Reorder, Delete & Rotate Online",
  description:
    "Visually arrange PDF pages, delete unwanted sheets, duplicate pages, and rotate individual pages with instant browser-based download.",
};

export default function OrganizePdfPage() {
  return (
    <ToolPageLayout toolId="organize-pdf">
      <OrganizePdfTool />
    </ToolPageLayout>
  );
}
