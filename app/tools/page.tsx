import { AllToolsView } from "@/components/tools/AllToolsView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Free Online Tools",
  description:
    "Explore our complete directory of free, private, browser-based online tools for PDF editing, image conversion, calculators, and text formatting.",
};

export default function AllToolsPage() {
  return <AllToolsView initialCategory="all" />;
}
