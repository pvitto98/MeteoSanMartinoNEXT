import { STATION } from "@/lib/config";
import type { SeriesPoint, StationNow, StationToday } from "@/lib/types";

const ECOWITT_BASE = "https://api.ecowitt.net/api/v3/device";

// Ask Ecowitt for metric units: °C, mm, hPa, km/h.
const METRIC_UNITS = {
  temp_unitid: 1,
  rainfall_unitid: 12,
  pressure_unitid: 3,
  wind_speed_unitid: 7,
};

type Reading = { time?: string; unit?: string; value?: string };
type ReadingList = { unit?: string; list?: Record<string, string> };
// Ecowitt payloads are deeply nested; we walk them defensively.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = any;

const hasKeys = () => Boolean(process.env.ECOWITT_APPLICATION_KEY && process.env.ECOWITT_API_KEY);

/**
 * Calls the Ecowitt API. In local development without credentials, set
 * DEV_UPSTREAM_URL (e.g. the production deployment) to proxy through its
 * raw /api/device/* routes instead.
 */
async function ecowitt(endpoint: "real_time" | "history", params: Record<string, string | number>) {
  let url: URL;
  if (hasKeys()) {
    url = new URL(`${ECOWITT_BASE}/${endpoint}`);
    url.searchParams.set("application_key", process.env.ECOWITT_APPLICATION_KEY!);
    url.searchParams.set("api_key", process.env.ECOWITT_API_KEY!);
    url.searchParams.set("mac", STATION.ecowittMac);
  } else if (process.env.DEV_UPSTREAM_URL) {
    url = new URL(`/api/device/${endpoint === "real_time" ? "real-time" : "history"}`, process.env.DEV_UPSTREAM_URL);
  } else {
    throw new Error("Missing ECOWITT_APPLICATION_KEY / ECOWITT_API_KEY");
  }
  for (const [k, v] of Object.entries({ ...METRIC_UNITS, ...params })) url.searchParams.set(k, String(v));

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Ecowitt ${endpoint} HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 0) throw new Error(`Ecowitt ${endpoint}: ${json.msg}`);
  return json.data as Raw;
}

/** Converts any unit Ecowitt may return to our metric baseline. */
function toMetric(value: number, unit = ""): number {
  switch (unit) {
    case "℉":
      return ((value - 32) * 5) / 9;
    case "mph":
      return value * 1.609344;
    case "m/s":
      return value * 3.6;
    case "inHg":
      return value * 33.8639;
    case "in":
    case "in/hr":
      return value * 25.4;
    case "mi":
      return value * 1.609344;
    default:
      return value;
  }
}

const round = (v: number, digits = 1) => Math.round(v * 10 ** digits) / 10 ** digits;

function num(r: Reading | undefined, digits = 1): number | null {
  if (!r || r.value === undefined || r.value === "" || r.value === "-") return null;
  const v = parseFloat(r.value);
  return Number.isFinite(v) ? round(toMetric(v, r.unit), digits) : null;
}

const req = (r: Reading | undefined, digits = 1) => num(r, digits) ?? 0;

export function normalizeNow(d: Raw): StationNow {
  const times = [d.outdoor?.temperature?.time, d.wind?.wind_speed?.time]
    .map((t: string | undefined) => (t ? parseInt(t, 10) * 1000 : 0))
    .filter(Boolean);
  const lightningTime = d.lightning?.distance?.time ? parseInt(d.lightning.distance.time, 10) * 1000 : null;

  return {
    updatedAt: times.length ? Math.max(...times) : Date.now(),
    outdoor: {
      temperature: req(d.outdoor?.temperature),
      feelsLike: req(d.outdoor?.feels_like),
      dewPoint: req(d.outdoor?.dew_point),
      humidity: req(d.outdoor?.humidity, 0),
    },
    indoor: { temperature: num(d.indoor?.temperature), humidity: num(d.indoor?.humidity, 0) },
    wind: {
      speed: req(d.wind?.wind_speed),
      gust: req(d.wind?.wind_gust),
      direction: req(d.wind?.wind_direction, 0),
      direction10m: num(d.wind?.["10_minute_average_wind_direction"], 0),
    },
    rain: {
      rate: req(d.rainfall?.rain_rate),
      daily: req(d.rainfall?.daily),
      event: req(d.rainfall?.event),
      hourly: num(d.rainfall?.["1_hour"]),
      last24h: num(d.rainfall?.["24_hours"]),
      weekly: req(d.rainfall?.weekly),
      monthly: req(d.rainfall?.monthly),
      yearly: req(d.rainfall?.yearly),
    },
    pressure: { relative: req(d.pressure?.relative), absolute: num(d.pressure?.absolute) },
    solar: { radiation: req(d.solar_and_uvi?.solar), uvi: req(d.solar_and_uvi?.uvi, 0) },
    air: {
      pm25: num(d.pm25_ch1?.pm25, 0),
      aqi: num(d.pm25_ch1?.real_time_aqi, 0),
      aqi24h: num(d.pm25_ch1?.["24_hours_aqi"], 0),
    },
    lightning: {
      countToday: req(d.lightning?.count, 0),
      lastDistanceKm: num(d.lightning?.distance, 0),
      lastTime: lightningTime,
    },
  };
}

function series(r: ReadingList | undefined, digits = 1): SeriesPoint[] {
  if (!r?.list) return [];
  return Object.entries(r.list)
    .map(([t, raw]) => ({ t: parseInt(t, 10) * 1000, v: parseFloat(raw) }))
    .filter((p) => Number.isFinite(p.v))
    .map((p) => ({ t: p.t, v: round(toMetric(p.v, r.unit), digits) }))
    .sort((a, b) => a.t - b.t);
}

export function normalizeToday(d: Raw): StationToday {
  return {
    temperature: series(d.outdoor?.temperature),
    feelsLike: series(d.outdoor?.feels_like),
    humidity: series(d.outdoor?.humidity, 0),
    pressure: series(d.pressure?.relative),
    solar: series(d.solar_and_uvi?.solar),
    uvi: series(d.solar_and_uvi?.uvi, 0),
    windSpeed: series(d.wind?.wind_speed),
    windGust: series(d.wind?.wind_gust),
    windDirection: series(d.wind?.wind_direction, 0),
    rainRate: series(d.rainfall?.rain_rate),
  };
}

/** "YYYY-MM-DD HH:mm:ss" in the station's timezone, as Ecowitt expects. */
function stationDateTime(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: STATION.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return { day: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour").replace("24", "00")}:${get("minute")}:${get("second")}` };
}

export async function getStationNow(): Promise<StationNow> {
  return normalizeNow(await ecowitt("real_time", { call_back: "all" }));
}

/**
 * Today's history since local midnight. We also include the last hours of
 * yesterday when it is early in the morning, so the pressure trend and the
 * chart are never empty right after midnight.
 */
export async function getStationToday(): Promise<StationToday> {
  const now = new Date();
  const { day, time } = stationDateTime(now);
  const start = stationDateTime(new Date(now.getTime() - 3 * 3600_000));
  const startDate = start.day < day ? `${start.day} ${start.time}` : `${day} 00:00:00`;

  const data = await ecowitt("history", {
    start_date: startDate,
    end_date: `${day} ${time}`,
    cycle_type: "auto",
    call_back:
      "outdoor.temperature,outdoor.feels_like,outdoor.humidity,pressure.relative,solar_and_uvi,wind.wind_speed,wind.wind_gust,wind.wind_direction,rainfall.rain_rate",
  });
  return normalizeToday(data);
}
