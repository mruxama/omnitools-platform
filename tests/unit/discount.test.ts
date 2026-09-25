import { describe, it, expect } from "vitest";
import { calculateDiscount } from "@/lib/tools/calculators/discount";

describe("Discount Calculator", () => {
  it("calculates basic discount without tax", () => {
    const res = calculateDiscount({
      originalPrice: 100,
      discountPercentage: 20,
    });
    expect(res.discountAmount).toBe(20);
    expect(res.priceAfterDiscount).toBe(80);
    expect(res.totalPayable).toBe(80);
    expect(res.totalSavings).toBe(20);
  });

  it("calculates stacked coupons and sales tax properly", () => {
    // $100 with 20% off -> $80. Then 10% coupon -> $72. Then 10% tax on $72 -> $7.20. Total payable = $79.20.
    const res = calculateDiscount({
      originalPrice: 100,
      discountPercentage: 20,
      couponPercentage: 10,
      taxPercentage: 10,
    });
    expect(res.discountAmount).toBe(20);
    expect(res.couponAmount).toBe(8);
    expect(res.priceAfterDiscount).toBe(72);
    expect(res.taxAmount).toBe(7.2);
    expect(res.totalPayable).toBe(79.2);
    expect(res.totalSavings).toBe(28);
  });

  it("handles 0% discount and 100% discount", () => {
    const zero = calculateDiscount({ originalPrice: 50, discountPercentage: 0 });
    expect(zero.totalPayable).toBe(50);
    expect(zero.totalSavings).toBe(0);

    const full = calculateDiscount({ originalPrice: 50, discountPercentage: 100 });
    expect(full.totalPayable).toBe(0);
    expect(full.totalSavings).toBe(50);
  });
});
