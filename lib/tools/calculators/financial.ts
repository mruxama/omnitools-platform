// --- LOAN PAYMENT CALCULATOR ---
export interface LoanInputs {
  principal: number;
  annualInterestRate: number; // percentage e.g. 5.5
  termYears: number;
}

export interface LoanOutputs {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
}

export function calculateLoan(inputs: LoanInputs): LoanOutputs {
  const p = Math.max(0, inputs.principal);
  const r = (inputs.annualInterestRate / 100) / 12;
  const n = Math.max(1, inputs.termYears * 12);

  if (p === 0) {
    return { monthlyPayment: 0, totalPayment: 0, totalInterest: 0 };
  }

  if (r === 0) {
    const m = p / n;
    return {
      monthlyPayment: Math.round(m * 100) / 100,
      totalPayment: p,
      totalInterest: 0,
    };
  }

  const monthlyPayment = (p * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
  const totalPayment = monthlyPayment * n;
  const totalInterest = totalPayment - p;

  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
  };
}

// --- COMPOUND INTEREST CALCULATOR ---
export interface CompoundInterestInputs {
  principal: number;
  annualRate: number; // percentage
  years: number;
  monthlyDeposit?: number;
  frequency: "annually" | "semi-annually" | "quarterly" | "monthly" | "daily";
}

export interface YearlyBreakdown {
  year: number;
  balance: number;
  totalInvested: number;
  totalInterest: number;
}

export interface CompoundInterestOutputs {
  futureValue: number;
  totalDeposited: number;
  totalInterestEarned: number;
  breakdown: YearlyBreakdown[];
}

export function calculateCompoundInterest(
  inputs: CompoundInterestInputs
): CompoundInterestOutputs {
  const P = Math.max(0, inputs.principal);
  const r = inputs.annualRate / 100;
  const t = Math.max(1, inputs.years);
  const PMT = Math.max(0, inputs.monthlyDeposit || 0);

  const freqMap = {
    annually: 1,
    "semi-annually": 2,
    quarterly: 4,
    monthly: 12,
    daily: 365,
  };
  const n = freqMap[inputs.frequency] || 12;

  let currentBalance = P;
  let totalDeposited = P;
  const breakdown: YearlyBreakdown[] = [];

  for (let year = 1; year <= t; year++) {
    // 12 monthly cycles in a year
    for (let m = 0; m < 12; m++) {
      currentBalance += PMT;
      totalDeposited += PMT;
      // Monthly interest compounding approximation
      currentBalance *= 1 + r / 12;
    }

    breakdown.push({
      year,
      balance: Math.round(currentBalance * 100) / 100,
      totalInvested: Math.round(totalDeposited * 100) / 100,
      totalInterest: Math.round((currentBalance - totalDeposited) * 100) / 100,
    });
  }

  return {
    futureValue: Math.round(currentBalance * 100) / 100,
    totalDeposited: Math.round(totalDeposited * 100) / 100,
    totalInterestEarned: Math.round((currentBalance - totalDeposited) * 100) / 100,
    breakdown,
  };
}

// --- SALES TAX CALCULATOR ---
export interface SalesTaxOutputs {
  netAmount: number;
  taxAmount: number;
  grossAmount: number;
}

export function calculateSalesTax(
  amount: number,
  taxRatePercent: number,
  mode: "add_tax" | "extract_tax"
): SalesTaxOutputs {
  const rate = Math.max(0, taxRatePercent) / 100;
  const val = Math.max(0, amount);

  if (mode === "add_tax") {
    const tax = val * rate;
    return {
      netAmount: Math.round(val * 100) / 100,
      taxAmount: Math.round(tax * 100) / 100,
      grossAmount: Math.round((val + tax) * 100) / 100,
    };
  } else {
    // Reverse sales tax
    const net = val / (1 + rate);
    const tax = val - net;
    return {
      netAmount: Math.round(net * 100) / 100,
      taxAmount: Math.round(tax * 100) / 100,
      grossAmount: Math.round(val * 100) / 100,
    };
  }
}

// --- PROFIT MARGIN CALCULATOR ---
export interface ProfitMarginOutputs {
  grossProfit: number;
  profitMarginPercent: number;
  markupPercent: number;
}

export function calculateProfitMargin(
  cost: number,
  revenue: number
): ProfitMarginOutputs {
  const c = Math.max(0, cost);
  const r = Math.max(0, revenue);

  const profit = r - c;
  const margin = r > 0 ? (profit / r) * 100 : 0;
  const markup = c > 0 ? (profit / c) * 100 : 0;

  return {
    grossProfit: Math.round(profit * 100) / 100,
    profitMarginPercent: Math.round(margin * 10) / 10,
    markupPercent: Math.round(markup * 10) / 10,
  };
}
