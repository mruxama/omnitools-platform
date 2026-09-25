export interface DiscountInputs {
  originalPrice: number;
  discountPercentage: number;
  couponPercentage?: number;
  taxPercentage?: number;
}

export interface DiscountOutputs {
  discountAmount: number;
  priceAfterDiscount: number;
  couponAmount: number;
  taxAmount: number;
  totalPayable: number;
  totalSavings: number;
  effectiveDiscountPercentage: number;
}

export function calculateDiscount(inputs: DiscountInputs): DiscountOutputs {
  const price = Math.max(0, inputs.originalPrice);
  const discPct = Math.min(100, Math.max(0, inputs.discountPercentage));
  const couponPct = Math.min(100, Math.max(0, inputs.couponPercentage || 0));
  const taxPct = Math.max(0, inputs.taxPercentage || 0);

  // 1. Initial primary discount
  const discountAmount = price * (discPct / 100);
  let currentPrice = price - discountAmount;

  // 2. Secondary stacked coupon discount
  const couponAmount = currentPrice * (couponPct / 100);
  currentPrice = currentPrice - couponAmount;

  // 3. Sales tax calculated on discounted payable price
  const taxAmount = currentPrice * (taxPct / 100);
  const totalPayable = currentPrice + taxAmount;

  const totalSavings = discountAmount + couponAmount;
  const effectiveDiscountPercentage = price > 0 ? (totalSavings / price) * 100 : 0;

  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    priceAfterDiscount: Math.round(currentPrice * 100) / 100,
    couponAmount: Math.round(couponAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalPayable: Math.round(totalPayable * 100) / 100,
    totalSavings: Math.round(totalSavings * 100) / 100,
    effectiveDiscountPercentage: Math.round(effectiveDiscountPercentage * 10) / 10,
  };
}
