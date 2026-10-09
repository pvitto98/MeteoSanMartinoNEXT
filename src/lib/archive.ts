import { circularMean, MONTHS_SHORT } from "@/lib/format";
import type { DailyRecord } from "@/lib/types";

/** Sensors write -1 when they were offline for the day. */
export const isValid = (v: number) => Number.isFinite(v) && v !== -1;

export const RAIN_DAY_MM = 1;

export interface Summary {
  days: number;
  tempAvg: number;
  tempHigh: { value: number; date: string };
  tempLow: { value: number; date: string };
  rain: number;
  rainyDays: number;
  gust: { value: number; date: string };
  windDir: number;
  lightning: number;
}

export function summarize(days: DailyRecord[]): Summary | null {
  if (!days.length) return null;
  const by = (pick: (d: DailyRecord) => number, mode: "max" | "min") =>
    days.reduce(
      (best, d) => {
        const v = pick(d);
        if (!isValid(v)) return best;
        return (mode === "max" ? v > best.value : v < best.value) ? { value: v, date: d.date } : best;
      },
      { value: mode === "max" ? -Infinity : Infinity, date: "" },
    );

  return {
    days: days.length,
    tempAvg: days.reduce((s, d) => s + d.tempAvg, 0) / days.length,
    tempHigh: by((d) => d.tempHigh, "max"),
    tempLow: by((d) => d.tempLow, "min"),
    rain: days.reduce((s, d) => s + (isValid(d.precipTotal) ? d.precipTotal : 0), 0),
    rainyDays: days.filter((d) => d.precipTotal >= RAIN_DAY_MM).length,
    gust: by((d) => d.windgustHigh, "max"),
    windDir: circularMean(days.map((d) => d.winddirAvg)),
    lightning: days.reduce((s, d) => s + (isValid(d.lightningCount) ? d.lightningCount : 0), 0),
  };
}

export interface Bucket {
  key: string;
  label: string;
  low: number;
  high: number;
  avg: number;
  rain: number;
  /** The days in this bucket (one for daily buckets). */
  days: DailyRecord[];
}

export function dailyBuckets(days: DailyRecord[]): Bucket[] {
  return days.map((d) => ({
    key: d.date,
    label: String(d.day),
    low: d.tempLow,
    high: d.tempHigh,
    avg: d.tempAvg,
    rain: isValid(d.precipTotal) ? d.precipTotal : 0,
    days: [d],
  }));
}

export function monthlyBuckets(days: DailyRecord[]): Bucket[] {
  const months = new Map<number, DailyRecord[]>();
  for (const d of days) months.set(d.month, [...(months.get(d.month) ?? []), d]);
  return [...months.entries()]
    .sort(([a], [b]) => a - b)
    .map(([m, list]) => ({
      key: String(m),
      label: MONTHS_SHORT[m - 1],
      low: Math.min(...list.map((d) => d.tempLow)),
      high: Math.max(...list.map((d) => d.tempHigh)),
      avg: list.reduce((s, d) => s + d.tempAvg, 0) / list.length,
      rain: list.reduce((s, d) => s + (isValid(d.precipTotal) ? d.precipTotal : 0), 0),
      days: list,
    }));
}
