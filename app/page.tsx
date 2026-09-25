import { HomeClient } from "@/components/home/HomeClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OmniTools — Free Online Tools for Everyday Tasks",
  description:
    "Compress files, convert images, manage PDFs, and solve everyday calculations — all in one place with 100% browser-based privacy.",
};

export default function HomePage() {
  return <HomeClient />;
}
