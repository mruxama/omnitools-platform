import { CategoryPageTemplate } from "@/components/tools/CategoryPageTemplate";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Online Productivity Tools — QR, Base64, Hash & Password",
  description:
    "Generate QR codes, compute SHA-256 and MD5 cryptographic hashes, generate strong random passwords, and encode/decode Base64 securely in your browser.",
};

export default function ProductivityCategoryPage() {
  return <CategoryPageTemplate categoryKey="productivity" />;
}
