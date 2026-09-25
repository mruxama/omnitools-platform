export interface DateDiffResult {
  calendarDays: number;
  workingDays: number;
  weeks: number;
  months: number;
}

export function calculateDateDifference(
  startDate: Date,
  endDate: Date,
  inclusive = false,
  weekendDays: number[] = [0, 6] // 0=Sun, 6=Sat
): DateDiffResult {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  const isReverse = end < start;
  const d1 = isReverse ? end : start;
  const d2 = isReverse ? start : end;

  const msPerDay = 1000 * 60 * 60 * 24;
  let calendarDays = Math.round((d2.getTime() - d1.getTime()) / msPerDay);
  if (inclusive) calendarDays += 1;

  // Working days count
  let workingDays = 0;
  const cur = new Date(d1);
  const finish = new Date(d2);
  if (!inclusive) {
    cur.setDate(cur.getDate() + 1); // exclusive start
  }

  while (cur <= finish) {
    const day = cur.getDay();
    if (!weekendDays.includes(day)) {
      workingDays++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  const weeks = Math.floor(calendarDays / 7);
  const months = Math.round((calendarDays / 30.4375) * 10) / 10;

  return {
    calendarDays,
    workingDays,
    weeks,
    months,
  };
}

export function addDurationToDate(
  date: Date,
  amount: number,
  unit: "days" | "weeks" | "months" | "years"
): Date {
  const res = new Date(date);
  if (unit === "days") res.setDate(res.getDate() + amount);
  else if (unit === "weeks") res.setDate(res.getDate() + amount * 7);
  else if (unit === "months") res.setMonth(res.getMonth() + amount);
  else if (unit === "years") res.setFullYear(res.getFullYear() + amount);
  return res;
}
