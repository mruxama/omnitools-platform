export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalHours: number;
  totalWeeks: number;
  dayOfWeekBorn: string;
  nextBirthdayDays: number;
  nextBirthdayDayOfWeek: string;
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function calculateAge(birthDate: Date, targetDate: Date = new Date()): AgeResult {
  if (birthDate > targetDate) {
    throw new Error("Date of birth cannot be in the future.");
  }

  const bYear = birthDate.getFullYear();
  const bMonth = birthDate.getMonth();
  const bDay = birthDate.getDate();

  const tYear = targetDate.getFullYear();
  const tMonth = targetDate.getMonth();
  const tDay = targetDate.getDate();

  let years = tYear - bYear;
  let months = tMonth - bMonth;
  let days = tDay - bDay;

  if (days < 0) {
    months--;
    // Days in previous month
    const prevMonthDays = new Date(tYear, tMonth, 0).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  // Total milliseconds difference
  const diffTime = targetDate.getTime() - birthDate.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor(diffTime / (1000 * 60 * 60));
  const totalWeeks = Math.floor(totalDays / 7);

  // Next birthday calculation
  let nextBday = new Date(tYear, bMonth, bDay);
  if (nextBday < targetDate) {
    nextBday = new Date(tYear + 1, bMonth, bDay);
  }
  const diffNextBday = nextBday.getTime() - targetDate.getTime();
  const nextBirthdayDays = Math.ceil(diffNextBday / (1000 * 60 * 60 * 24));

  return {
    years,
    months,
    days,
    totalDays,
    totalHours,
    totalWeeks,
    dayOfWeekBorn: DAYS_OF_WEEK[birthDate.getDay()],
    nextBirthdayDays,
    nextBirthdayDayOfWeek: DAYS_OF_WEEK[nextBday.getDay()],
  };
}
