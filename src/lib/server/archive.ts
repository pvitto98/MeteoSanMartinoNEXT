import { PrismaClient } from "@prisma/client";
import type { DailyRecord, Records, RecordEntry } from "@/lib/types";
import { STATION } from "@/lib/config";

// Reuse one client across hot reloads and warm serverless invocations.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
function prisma() {
  globalForPrisma.prisma ??= new PrismaClient();
  return globalForPrisma.prisma;
}

/** Local development without DATABASE_URL reads the archive from DEV_UPSTREAM_URL. */
const readsFromUpstream = () => !process.env.DATABASE_URL && Boolean(process.env.DEV_UPSTREAM_URL);

async function upstream<T>(path: string): Promise<T> {
  const res = await fetch(new URL(path, process.env.DEV_UPSTREAM_URL), { cache: "no-store" });
  if (!res.ok) throw new Error(`Upstream ${path} HTTP ${res.status}`);
  return res.json();
}

export async function getYears(): Promise<number[]> {
  if (readsFromUpstream()) {
    const { years } = await upstream<{ years: string[] }>("/api/metadata");
    return years.map(Number).sort((a, b) => a - b);
  }
  const rows = await prisma().weatherData.findMany({ select: { year: true }, distinct: ["year"] });
  return rows.map((r) => r.year).sort((a, b) => a - b);
}

/**
 * The collection has no unique index on `date`, and a retried cron once stored
 * the same day several times. Keep the first record per day so totals aren't inflated.
 */
function uniqueByDate(rows: DailyRecord[]): DailyRecord[] {
  const seen = new Set<string>();
  return rows.filter((r) => (seen.has(r.date) ? false : (seen.add(r.date), true)));
}

export async function getDays(year: number, month?: number): Promise<DailyRecord[]> {
  if (readsFromUpstream()) {
    const q = new URLSearchParams({ year: String(year) });
    if (month) q.set("month", String(month));
    const { weatherData } = await upstream<{ weatherData: DailyRecord[] }>(`/api/weather?${q}`);
    return uniqueByDate(weatherData);
  }
  const rows = await prisma().weatherData.findMany({
    where: { year, ...(month ? { month } : {}) },
    orderBy: { date: "asc" },
  });
  return uniqueByDate(rows as unknown as DailyRecord[]);
}

async function getAllDays(): Promise<DailyRecord[]> {
  if (readsFromUpstream()) {
    const years = await getYears();
    const all = await Promise.all(years.map((y) => getDays(y)));
    return all.flat();
  }
  const rows = await prisma().weatherData.findMany({ orderBy: { date: "asc" } });
  return uniqueByDate(rows as unknown as DailyRecord[]);
}

/** Sensors report -1 when they were offline for the day. */
const valid = (v: number) => Number.isFinite(v) && v !== -1;

// Physically plausible ranges at 550 m in Sicily: anything outside is a sensor glitch.
const within = (v: number, min: number, max: number) => (v >= min && v <= max ? v : NaN);
const PRESSURE = [960, 1050] as const;
const UV_MAX = 12;

function extreme(days: DailyRecord[], pick: (d: DailyRecord) => number, mode: "max" | "min"): RecordEntry {
  let best: RecordEntry = { value: mode === "max" ? -Infinity : Infinity, date: "" };
  for (const d of days) {
    const v = pick(d);
    if (!valid(v)) continue;
    if (mode === "max" ? v > best.value : v < best.value) best = { value: v, date: d.date };
  }
  return best;
}

function longestSpell(days: DailyRecord[], match: (d: DailyRecord) => boolean) {
  let best = { days: 0, from: "", to: "" };
  let run = 0;
  let from = "";
  for (const d of days) {
    if (match(d)) {
      if (run === 0) from = d.date;
      run++;
      if (run > best.days) best = { days: run, from, to: d.date };
    } else {
      run = 0;
    }
  }
  return best;
}

const RAIN_DAY_MM = 1;

export async function getRecords(): Promise<Records> {
  const days = (await getAllDays()).sort((a, b) => a.date.localeCompare(b.date));

  const byYear = new Map<number, DailyRecord[]>();
  for (const d of days) byYear.set(d.year, [...(byYear.get(d.year) ?? []), d]);

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: STATION.timezone, month: "2-digit", day: "2-digit" })
    .format(new Date())
    .replace("-", "");

  return {
    since: days[0]?.date ?? "",
    days: days.length,
    hottest: extreme(days, (d) => d.tempHigh, "max"),
    coldest: extreme(days, (d) => d.tempLow, "min"),
    warmestNight: extreme(days, (d) => d.tempLow, "max"),
    coolestDay: extreme(days, (d) => d.tempHigh, "min"),
    wettest: extreme(days, (d) => d.precipTotal, "max"),
    strongestGust: extreme(days, (d) => d.windgustHigh, "max"),
    highestUv: extreme(days, (d) => within(d.uvHigh, 0, UV_MAX), "max"),
    mostLightning: extreme(days, (d) => d.lightningCount, "max"),
    highestPressure: extreme(days, (d) => within(d.pressureMax, ...PRESSURE), "max"),
    lowestPressure: extreme(days, (d) => within(d.pressureMin, ...PRESSURE), "min"),
    longestDrySpell: longestSpell(days, (d) => d.precipTotal < RAIN_DAY_MM),
    longestWetSpell: longestSpell(days, (d) => d.precipTotal >= RAIN_DAY_MM),
    years: [...byYear.entries()].map(([year, list]) => ({
      year,
      rain: Math.round(list.reduce((s, d) => s + (valid(d.precipTotal) ? d.precipTotal : 0), 0) * 10) / 10,
      tempAvg: Math.round((list.reduce((s, d) => s + d.tempAvg, 0) / list.length) * 10) / 10,
      tempHigh: Math.max(...list.map((d) => d.tempHigh)),
      tempLow: Math.min(...list.map((d) => d.tempLow)),
      rainyDays: list.filter((d) => d.precipTotal >= RAIN_DAY_MM).length,
      days: list.length,
    })),
    onThisDay: days.filter((d) => d.date.slice(4) === today).reverse(),
  };
}
