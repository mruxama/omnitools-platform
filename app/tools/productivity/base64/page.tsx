import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { Base64Tool } from "@/components/tools/productivity/Base64Tool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Base64 Encode & Decode Online — UTF-8 String & File Tool",
  description:
    "Encode and decode strings and files to/from Base64 with full UTF-8 Unicode character support. Free, secure, and client-side.",
};

export default function Base64Page() {
  return (
    <ToolPageLayout toolId="base64-codec">
      <Base64Tool />
    </ToolPageLayout>
  );
}
