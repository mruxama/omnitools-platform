import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — OmniTools",
  description:
    "OmniTools terms of service and acceptable use guidelines.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-muted-foreground">Effective date: September 2026</p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using OmniTools, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">2. Permitted Use</h2>
          <p>
            OmniTools provides free digital utilities for personal, educational, and commercial purposes. You agree not to use the utilities to process illegal content or attempt to disrupt the availability of the platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">3. Disclaimer of Warranties</h2>
          <p>
            OmniTools is provided on an "as is" and "as available" basis without warranties of any kind. Financial calculators (e.g. Loan, Compound Interest, Sales Tax) provide informational approximations and do not constitute professional financial advice. Health calculators (e.g. BMI) provide general population references and do not replace certified medical consultation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">4. Limitation of Liability</h2>
          <p>
            Because all file conversions and calculations execute client-side on your own device, you remain solely responsible for maintaining backup copies of your original files. OmniTools and its developers shall not be liable for any data loss, damages, or financial decisions resulting from the use of the platform.
          </p>
        </section>
      </div>
    </div>
  );
}
