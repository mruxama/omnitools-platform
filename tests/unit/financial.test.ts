import { describe, it, expect } from "vitest";
import {
  calculateLoan,
  calculateCompoundInterest,
  calculateSalesTax,
  calculateProfitMargin,
} from "@/lib/tools/calculators/financial";

describe("Financial Calculators", () => {
  it("calculates loan monthly installment accurately", () => {
    // $100,000 at 6% for 30 years -> ~$599.55/month
    const res = calculateLoan({
      principal: 100000,
      annualInterestRate: 6,
      termYears: 30,
    });
    expect(res.monthlyPayment).toBeCloseTo(599.55, 1);
    expect(res.totalPayment).toBeGreaterThan(100000);
    expect(res.totalInterest).toBe(res.totalPayment - 100000);
  });

  it("calculates forward and reverse sales tax", () => {
    const forward = calculateSalesTax(100, 10, "add_tax");
    expect(forward.netAmount).toBe(100);
    expect(forward.taxAmount).toBe(10);
    expect(forward.grossAmount).toBe(110);

    const reverse = calculateSalesTax(110, 10, "extract_tax");
    expect(reverse.netAmount).toBe(100);
    expect(reverse.taxAmount).toBe(10);
    expect(reverse.grossAmount).toBe(110);
  });

  it("calculates profit margin and markup", () => {
    // Cost = $40, Revenue = $100 -> Profit = $60, Margin = 60%, Markup = 150%
    const res = calculateProfitMargin(40, 100);
    expect(res.grossProfit).toBe(60);
    expect(res.profitMarginPercent).toBe(60);
    expect(res.markupPercent).toBe(150);
  });
});
