import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { PasswordGeneratorTool } from "@/components/tools/productivity/PasswordGeneratorTool";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Password Generator — Strong Random Password Generator",
  description:
    "Generate cryptographically secure passwords with custom lengths and character sets using client-side CSPRNG. Measure entropy in real time.",
};

export default function PasswordGeneratorPage() {
  return (
    <ToolPageLayout toolId="password-generator">
      <PasswordGeneratorTool />
    </ToolPageLayout>
  );
}
