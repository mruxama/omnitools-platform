import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { WordCounterTool } from "@/components/tools/text/WordCounterTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word Counter — Count Words, Characters & Reading Time",
  description:
    "Free online word counter and character counter with estimated reading time and sentence statistics. 100% private in-browser analysis.",
};

export default function WordCounterPage() {
  return (
    <ToolPageLayout toolId="word-counter">
      <WordCounterTool />
    </ToolPageLayout>
  );
}
