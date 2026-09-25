import React from "react";
import { HowToStep } from "@/lib/tools/registry";
import { CheckCircle2 } from "lucide-react";

interface HowToSectionProps {
  toolName: string;
  steps: HowToStep[];
}

export function HowToSection({ toolName, steps }: HowToSectionProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <section className="space-y-4 pt-4 border-t border-border">
      <h2 className="text-xl font-bold text-foreground">
        How to Use {toolName}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className="relative p-5 bg-card border border-border rounded-2xl space-y-2"
          >
            <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              {index + 1}
            </div>
            <h3 className="font-semibold text-sm text-foreground">{step.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
