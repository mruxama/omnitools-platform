export interface BmiResult {
  bmi: number;
  category: string;
  categoryColor: string;
  healthyWeightMinKg: number;
  healthyWeightMaxKg: number;
}

export function calculateBmiMetric(heightCm: number, weightKg: number): BmiResult {
  if (heightCm <= 0 || weightKg <= 0) {
    throw new Error("Height and weight must be greater than zero.");
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  const minKg = 18.5 * (heightM * heightM);
  const maxKg = 24.9 * (heightM * heightM);

  let category = "Normal weight";
  let categoryColor = "text-emerald-600 dark:text-emerald-400";

  if (bmi < 18.5) {
    category = "Underweight";
    categoryColor = "text-blue-500";
  } else if (bmi < 25) {
    category = "Normal weight";
    categoryColor = "text-emerald-600 dark:text-emerald-400";
  } else if (bmi < 30) {
    category = "Overweight";
    categoryColor = "text-amber-500";
  } else if (bmi < 35) {
    category = "Obesity Class I";
    categoryColor = "text-orange-500";
  } else if (bmi < 40) {
    category = "Obesity Class II";
    categoryColor = "text-red-500";
  } else {
    category = "Obesity Class III";
    categoryColor = "text-red-600";
  }

  return {
    bmi: Math.round(bmi * 10) / 10,
    category,
    categoryColor,
    healthyWeightMinKg: Math.round(minKg * 10) / 10,
    healthyWeightMaxKg: Math.round(maxKg * 10) / 10,
  };
}

export function calculateBmiImperial(
  heightFeet: number,
  heightInches: number,
  weightLbs: number
): BmiResult {
  const totalInches = heightFeet * 12 + heightInches;
  const heightCm = totalInches * 2.54;
  const weightKg = weightLbs * 0.45359237;
  return calculateBmiMetric(heightCm, weightKg);
}
