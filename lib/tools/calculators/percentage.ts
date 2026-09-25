export type PercentageMode =
  | "percent_of_number"
  | "is_what_percent"
  | "percent_increase"
  | "percent_decrease"
  | "percent_difference"
  | "original_value";

export interface PercentageResult {
  result: number;
  formula: string;
  explanation: string;
}

export function calculatePercentage(
  mode: PercentageMode,
  val1: number,
  val2: number
): PercentageResult {
  switch (mode) {
    case "percent_of_number": {
      // What is val1% of val2?
      const res = (val1 / 100) * val2;
      return {
        result: res,
        formula: `(${val1} ÷ 100) × ${val2} = ${res}`,
        explanation: `${val1}% of ${val2} is equal to ${res}.`,
      };
    }
    case "is_what_percent": {
      // val1 is what % of val2?
      if (val2 === 0) throw new Error("Cannot divide by zero.");
      const res = (val1 / val2) * 100;
      return {
        result: res,
        formula: `(${val1} ÷ ${val2}) × 100 = ${res}%`,
        explanation: `${val1} is ${res.toFixed(2)}% of ${val2}.`,
      };
    }
    case "percent_increase": {
      // Increase val1 by val2%
      const raw = val1 * (1 + val2 / 100);
      const res = Math.round(raw * 1e8) / 1e8;
      return {
        result: res,
        formula: `${val1} × (1 + ${val2} ÷ 100) = ${res}`,
        explanation: `Increasing ${val1} by ${val2}% results in ${res}.`,
      };
    }
    case "percent_decrease": {
      // Decrease val1 by val2%
      const raw = val1 * (1 - val2 / 100);
      const res = Math.round(raw * 1e8) / 1e8;
      return {
        result: res,
        formula: `${val1} × (1 - ${val2} ÷ 100) = ${res}`,
        explanation: `Decreasing ${val1} by ${val2}% results in ${res}.`,
      };
    }
    case "percent_difference": {
      // Percentage difference between val1 and val2: |v1 - v2| / ((v1 + v2)/2) * 100
      const avg = (val1 + val2) / 2;
      if (avg === 0) throw new Error("Average of values is zero.");
      const res = (Math.abs(val1 - val2) / Math.abs(avg)) * 100;
      return {
        result: res,
        formula: `|${val1} - ${val2}| ÷ ((${val1} + ${val2}) ÷ 2) × 100 = ${res.toFixed(2)}%`,
        explanation: `The percentage difference between ${val1} and ${val2} is ${res.toFixed(2)}%.`,
      };
    }
    case "original_value": {
      // val1 is val2% of what original number?
      if (val2 === 0) throw new Error("Percentage cannot be zero.");
      const res = val1 / (val2 / 100);
      return {
        result: res,
        formula: `${val1} ÷ (${val2} ÷ 100) = ${res}`,
        explanation: `${val1} is ${val2}% of ${res}.`,
      };
    }
  }
}
