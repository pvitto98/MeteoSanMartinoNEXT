import { PrismaClient } from "@prisma/client";
import { STATION } from "@/lib/config";

/*
 * Builds one day of the archive from Weather Underground's daily summary
 * (highs/lows/averages, as every existing record) plus Ecowitt for lightning
 * and PM2.5. Safe by design:
 *  - never writes a day that already exists (the collection has no unique index);
 *  - never writes when Weather Underground has no data or the data is implausible;
 *  - `dryRun` computes and returns the record without touching the database.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = () => (globalForPrisma.prisma ??= new PrismaClient());

export type ArchiveOutcome =
  | { date: string; status: "exists" }
  | { date: string; status: "no-data"; reason: string }
  | { date: string; status: "preview" | "written"; record: Record<string, number | string> };

const DATE_RE = /^(\d{4})(\d{2})(\d{2})$/;

export function isArchiveDate(date: string) {
  const m = DATE_RE.exec(date);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

/** "YYYYMMDD" of `daysAgo` days before today, in the station's timezone (independent of the server's). */
export function stationDateDaysAgo(daysAgo: number) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: STATION.timezone }).format(new Date()); // YYYY-MM-DD
  const [y, m, d] = today.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d - daysAgo));
  return `${t.getUTCFullYear()}${String(t.getUTCMonth() + 1).padStart(2, "0")}${String(t.getUTCDate()).padStart(2, "0")}`;
}

type WuMetric = Record<string, number | null | undefined>;
interface WuObservation {
  epoch?: number;
  solarRadiationHigh?: number | null;
  uvHigh?: number | null;
  winddirAvg?: number | null;
  humidityHigh?: number | null;
  humidityLow?: number | null;
  humidityAvg?: number | null;
  metric?: WuMetric;
}

async function fetchWunderground(date: string): Promise<WuObservation | null> {
  const url = new URL("https://api.weather.com/v2/pws/history/daily");
  url.search = new URLSearchParams({
    stationId: STATION.wundergroundId,
    apiKey: process.env.WUNDER_API_KEY ?? "",
    format: "json",
    units: "m",
    numericPrecision: "decimal",
    date,
  }).toString();
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 204) return null; // WU answers "No Content" when the station has no data
  if (!res.ok) throw new Error(`Weather Underground HTTP ${res.status}`);
  const json = (await res.json()) as { observations?: WuObservation[] };
  return json.observations?.[0] ?? null;
}

async function fetchEcowittExtras(date: string) {
  const day = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  const url = new URL("https://api.ecowitt.net/api/v3/device/history");
  url.search = new URLSearchParams({
    application_key: process.env.ECOWITT_APPLICATION_KEY ?? "",
    api_key: process.env.ECOWITT_API_KEY ?? "",
    mac: STATION.ecowittMac,
    call_back: "lightning,pm25_ch1",
    cycle_type: "auto",
    start_date: `${day} 00:00:00`,
    end_date: `${day} 23:59:59`,
  }).toString();
  try {
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();
    const values = (list?: Record<string, string>) =>
      Object.values(list ?? {})
        .map(Number)
        .filter((v) => Number.isFinite(v));
    const lightning = values(json?.data?.lightning?.count?.list);
    const pm25 = values(json?.data?.pm25_ch1?.pm25?.list);
    return {
      // The station's lightning counter is cumulative for the day, so the max is the daily total.
      lightningCount: lightning.length ? Math.max(...lightning) : -1,
      pm25Avg: pm25.length ? pm25.reduce((s, v) => s + v, 0) / pm25.length : -1,
      pm25Max: pm25.length ? Math.max(...pm25) : -1,
      pm25Min: pm25.length ? Math.min(...pm25) : -1,
    };
  } catch {
    // -1 is the archive's "sensor unavailable" marker.
    return { lightningCount: -1, pm25Avg: -1, pm25Max: -1, pm25Min: -1 };
  }
}

function validate(o: WuObservation): string | null {
  const m = o.metric;
  if (!m) return "missing metric block";
  const { tempHigh, tempLow, tempAvg } = m;
  if (typeof tempHigh !== "number" || typeof tempLow !== "number" || typeof tempAvg !== "number") return "missing temperatures";
  if (tempLow < -15 || tempHigh > 48 || tempLow > tempHigh) return `implausible temperatures ${tempLow}…${tempHigh}`;
  if (typeof o.humidityAvg !== "number" || o.humidityAvg <= 0 || o.humidityAvg > 100) return "missing humidity";
  return null;
}

export async function archiveDay(date: string, { dryRun }: { dryRun: boolean }): Promise<ArchiveOutcome> {
  if (!isArchiveDate(date)) throw new Error(`Invalid date ${date}`);

  const existing = await prisma().weatherData.findFirst({ where: { date }, select: { id: true } });
  if (existing) return { date, status: "exists" };

  const obs = await fetchWunderground(date);
  if (!obs) return { date, status: "no-data", reason: "Weather Underground has no observations for this day" };
  const invalid = validate(obs);
  if (invalid) return { date, status: "no-data", reason: invalid };

  const m = obs.metric!;
  const n = (v: number | null | undefined) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
  const record = {
    date,
    year: +date.slice(0, 4),
    month: +date.slice(4, 6),
    day: +date.slice(6, 8),
    tempHigh: n(m.tempHigh),
    tempLow: n(m.tempLow),
    tempAvg: n(m.tempAvg),
    windspeedHigh: n(m.windspeedHigh),
    windspeedLow: n(m.windspeedLow),
    windspeedAvg: n(m.windspeedAvg),
    windgustHigh: n(m.windgustHigh),
    windgustLow: n(m.windgustLow),
    windgustAvg: n(m.windgustAvg),
    dewptHigh: n(m.dewptHigh),
    dewptLow: n(m.dewptLow),
    dewptAvg: n(m.dewptAvg),
    windchillHigh: n(m.windchillHigh),
    windchillLow: n(m.windchillLow),
    windchillAvg: n(m.windchillAvg),
    heatindexHigh: n(m.heatindexHigh),
    heatindexLow: n(m.heatindexLow),
    heatindexAvg: n(m.heatindexAvg),
    pressureMax: n(m.pressureMax),
    pressureMin: n(m.pressureMin),
    pressureTrend: n(m.pressureTrend),
    precipRate: n(m.precipRate),
    precipTotal: n(m.precipTotal),
    timestamp: n(obs.epoch),
    solarRadiationHigh: n(obs.solarRadiationHigh),
    uvHigh: n(obs.uvHigh),
    winddirAvg: n(obs.winddirAvg),
    humidityHigh: n(obs.humidityHigh),
    humidityLow: n(obs.humidityLow),
    humidityAvg: n(obs.humidityAvg),
    ...(await fetchEcowittExtras(date)),
  };

  if (dryRun) return { date, status: "preview", record };

  // Re-check right before writing in case a concurrent call stored the day meanwhile.
  if (await prisma().weatherData.findFirst({ where: { date }, select: { id: true } })) return { date, status: "exists" };
  await prisma().weatherData.create({ data: record });
  return { date, status: "written", record };
}

/** Days in the last `window` days (excluding today) that are missing from the archive. */
export async function missingRecentDays(window = 7) {
  const dates = Array.from({ length: window }, (_, i) => stationDateDaysAgo(i + 1));
  const present = await prisma().weatherData.findMany({ where: { date: { in: dates } }, select: { date: true } });
  const have = new Set(present.map((p) => p.date));
  return dates.filter((d) => !have.has(d)).reverse();
}
