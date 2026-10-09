import * as SunCalc from "suncalc";
import { STATION } from "@/lib/config";
import { clamp, lerp, rainIntensity } from "@/lib/format";
import type { Forecast, StationNow, StationToday } from "@/lib/types";

export type IconKind =
  | "clear-day"
  | "clear-night"
  | "partly-day"
  | "partly-night"
  | "cloudy"
  | "overcast"
  | "fog"
  | "drizzle"
  | "rain"
  | "showers-day"
  | "showers-night"
  | "storm"
  | "storm-dry"
  | "snow"
  | "sleet";

/** Every icon kind, e.g. for previews. */
export const ICON_KINDS: IconKind[] = [
  "clear-day",
  "clear-night",
  "partly-day",
  "partly-night",
  "cloudy",
  "overcast",
  "fog",
  "drizzle",
  "rain",
  "showers-day",
  "showers-night",
  "storm",
  "storm-dry",
  "snow",
  "sleet",
];

const DEG = 180 / Math.PI;

/* ───────────────────────── Sun & moon ───────────────────────── */

/** Sun altitude in degrees (SunCalc ≥ 2 works in degrees, azimuth clockwise from north). */
export function sunAltitude(date: Date) {
  return SunCalc.getPosition(date, STATION.lat, STATION.lon).altitude;
}

/** Minutes east of UTC at the station on that date (handles CET/CEST). */
function stationUtcOffset(date: Date) {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: STATION.timezone, timeZoneName: "shortOffset" })
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName")?.value; // e.g. "GMT+2"
  const m = /GMT([+-]\d+)(?::(\d+))?/.exec(name ?? "");
  return m ? Number(m[1]) * 60 + Math.sign(Number(m[1])) * Number(m[2] ?? 0) : 60;
}

export function sunTimes(date: Date) {
  // Never null at Sicilian latitudes (no polar day or night).
  const t = SunCalc.getTimes(date, STATION.lat, STATION.lon, STATION.altitude, stationUtcOffset(date)) as Record<
    "sunrise" | "sunset" | "solarNoon" | "dawn" | "dusk",
    Date
  >;
  return { sunrise: t.sunrise, sunset: t.sunset, solarNoon: t.solarNoon, dawn: t.dawn, dusk: t.dusk };
}

export function moon(date: Date) {
  const { phase, fraction } = SunCalc.getMoonIllumination(date);
  const names = ["Luna nuova", "Luna crescente", "Primo quarto", "Gibbosa crescente", "Luna piena", "Gibbosa calante", "Ultimo quarto", "Luna calante"];
  return { phase, fraction, name: names[Math.round(phase * 8) % 8] };
}

/**
 * Theoretical global horizontal irradiance under a clear sky (Haurwitz model).
 * Comparing it with the pyranometer reading tells us how cloudy it really is.
 */
export function clearSkyIrradiance(altitudeDeg: number) {
  if (altitudeDeg <= 0) return 0;
  const cosZ = Math.sin(altitudeDeg / DEG);
  return 1098 * cosZ * Math.exp(-0.057 / cosZ);
}

/* ───────────────────────── Conditions ───────────────────────── */

export interface Condition {
  kind: IconKind;
  label: string;
  isDay: boolean;
  /** 0 = clear, 1 = fully overcast */
  cloudiness: number;
  /** mm/h, drives the rain particles */
  rainRate: number;
  /** Clear-sky index measured by the solar sensor (0–1+), when the sun is high enough. */
  clearSkyIndex: number | null;
  source: "sensore" | "modello" | "pressione";
}

const STORM_WINDOW_MS = 30 * 60_000;
const DRIZZLE_MAX_MMH = 0.5;
const STORM_RADIUS_KM = 25;
const SENSOR_MIN_ALTITUDE = 10;

function cloudLabel(cloudiness: number) {
  if (cloudiness < 0.2) return "Sereno";
  if (cloudiness < 0.5) return "Poco nuvoloso";
  if (cloudiness < 0.8) return "Nuvoloso";
  return "Coperto";
}

function cloudKind(cloudiness: number, isDay: boolean): IconKind {
  if (cloudiness < 0.2) return isDay ? "clear-day" : "clear-night";
  if (cloudiness < 0.5) return isDay ? "partly-day" : "partly-night";
  if (cloudiness < 0.8) return "cloudy";
  return "overcast";
}

/** Average solar radiation over the last 20 minutes, so a single passing cloud doesn't flip the sky. */
function recentSolar(now: StationNow, today?: StationToday) {
  const cutoff = now.updatedAt - 20 * 60_000;
  const recent = today?.solar.filter((p) => p.t >= cutoff).map((p) => p.v) ?? [];
  const values = [...recent, now.solar.radiation];
  return values.reduce((s, v) => s + v, 0) / values.length;
}

/**
 * Works out the sky from what the station actually measures:
 * lightning → rain gauge → fog (humidity/dew point) → pyranometer vs clear-sky
 * model during the day → Open-Meteo cloud cover at night → pressure as a last resort.
 */
export function deriveCondition(now: StationNow, today?: StationToday, forecast?: Forecast, date = new Date()): Condition {
  const altitude = sunAltitude(date);
  const isDay = altitude > -0.833;
  const base = { isDay, rainRate: now.rain.rate, clearSkyIndex: null as number | null };

  let cloudiness: number;
  let source: Condition["source"];
  if (altitude >= SENSOR_MIN_ALTITUDE) {
    const csi = recentSolar(now, today) / clearSkyIrradiance(altitude);
    base.clearSkyIndex = csi;
    // csi ≥ 0.85 is a clear sky; ≤ 0.3 is thick overcast.
    cloudiness = clamp((0.85 - csi) / 0.55, 0, 1);
    source = "sensore";
  } else if (forecast) {
    cloudiness = forecast.current.cloudCover / 100;
    source = "modello";
  } else {
    const p = now.pressure.relative;
    cloudiness = p >= 1018 ? 0.1 : p >= 1013 ? 0.4 : p >= 1008 ? 0.7 : 0.9;
    source = "pressione";
  }

  const recentStrike =
    now.lightning.lastTime !== null &&
    date.getTime() - now.lightning.lastTime < STORM_WINDOW_MS &&
    (now.lightning.lastDistanceKm ?? Infinity) <= STORM_RADIUS_KM;

  if (recentStrike) {
    const raining = now.rain.rate > 0;
    return { ...base, kind: raining ? "storm" : "storm-dry", label: raining ? "Temporale" : "Fulmini vicini", cloudiness: 1, source };
  }
  if (now.rain.rate > 0) {
    const t = now.outdoor.temperature;
    // Precipitation type from the air temperature at the station.
    if (t <= 0.5) return { ...base, kind: "snow", label: "Neve", cloudiness: 1, source };
    if (t <= 2) return { ...base, kind: "sleet", label: "Pioggia mista a neve", cloudiness: 1, source };
    const kind: IconKind = now.rain.rate < DRIZZLE_MAX_MMH ? "drizzle" : "rain";
    return { ...base, kind, label: kind === "drizzle" ? "Pioviggine" : rainIntensity(now.rain.rate), cloudiness: 1, source };
  }
  const spread = now.outdoor.temperature - now.outdoor.dewPoint;
  if (now.outdoor.humidity >= 97 && spread < 1 && now.wind.speed < 6) {
    return { ...base, kind: "fog", label: "Nebbia", cloudiness: 0.9, source };
  }
  return { ...base, kind: cloudKind(cloudiness, isDay), label: cloudLabel(cloudiness), cloudiness, source };
}

/** WMO weather codes (Open-Meteo) → our icon set and an Italian label. */
export function wmo(code: number, isDay = true): { kind: IconKind; label: string } {
  if (code === 0) return { kind: isDay ? "clear-day" : "clear-night", label: "Sereno" };
  if (code === 1) return { kind: isDay ? "clear-day" : "clear-night", label: "Prevalentemente sereno" };
  if (code === 2) return { kind: isDay ? "partly-day" : "partly-night", label: "Poco nuvoloso" };
  if (code === 3) return { kind: "overcast", label: "Coperto" };
  if (code === 45 || code === 48) return { kind: "fog", label: "Nebbia" };
  if (code === 56 || code === 57) return { kind: "sleet", label: "Pioviggine gelata" };
  if (code >= 51 && code <= 55) return { kind: "drizzle", label: "Pioviggine" };
  if (code === 66 || code === 67) return { kind: "sleet", label: "Pioggia gelata" };
  if (code >= 61 && code <= 65) return { kind: "rain", label: code === 65 ? "Pioggia forte" : code === 61 ? "Pioggia debole" : "Pioggia" };
  if (code >= 71 && code <= 77) return { kind: "snow", label: "Neve" };
  if (code >= 80 && code <= 82) return { kind: isDay ? "showers-day" : "showers-night", label: code === 82 ? "Rovesci forti" : "Rovesci" };
  if (code === 85 || code === 86) return { kind: "snow", label: "Rovesci di neve" };
  if (code >= 95) return { kind: "storm", label: code >= 96 ? "Temporale con grandine" : "Temporale" };
  return { kind: "cloudy", label: "Nuvoloso" };
}

/* ───────────────────────── Sky palette ───────────────────────── */

type RGB = [number, number, number];
const hex = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
const mix = (a: RGB, b: RGB, t: number): RGB => a.map((v, i) => Math.round(lerp(v, b[i], t))) as RGB;
const css = (c: RGB) => `rgb(${c.join(",")})`;

// Sky colours keyed by sun altitude (degrees): [top, bottom, glow]
const SKY: [number, RGB, RGB, RGB][] = [
  [-18, hex("#050a1f"), hex("#121c42"), hex("#1f2b5c")],
  [-8, hex("#0d1640"), hex("#2c2f6b"), hex("#4b3f86")],
  [-2, hex("#22306e"), hex("#b35d6e"), hex("#f08a5d")],
  [4, hex("#2f55a4"), hex("#f0a36b"), hex("#ffd38a")],
  [14, hex("#1f63c6"), hex("#86bdf0"), hex("#fff2c4")],
  [40, hex("#1557c0"), hex("#6fb1f2"), hex("#ffffff")],
];
const OVERCAST_DAY: [RGB, RGB] = [hex("#3e4c63"), hex("#7a889c")];
const OVERCAST_NIGHT: [RGB, RGB] = [hex("#0c111d"), hex("#232a3a")];

export interface SkyPalette {
  top: string;
  bottom: string;
  glow: string;
  /** Solid colour for <meta name="theme-color">. */
  theme: string;
  /** 0 at night, 1 in full daylight: drives stars and glow intensity. */
  daylight: number;
}

export function skyPalette(altitude: number, cloudiness: number, raining: boolean): SkyPalette {
  const a = clamp(altitude, SKY[0][0], SKY[SKY.length - 1][0]);
  let i = 1;
  while (i < SKY.length - 1 && a > SKY[i][0]) i++;
  const [a0, t0, b0, g0] = SKY[i - 1];
  const [a1, t1, b1, g1] = SKY[i];
  const k = (a - a0) / (a1 - a0);
  let top = mix(t0, t1, k);
  let bottom = mix(b0, b1, k);
  const glow = mix(g0, g1, k);

  const daylight = clamp((altitude + 8) / 20, 0, 1);
  const grey = clamp(cloudiness * 0.85 + (raining ? 0.15 : 0), 0, 1);
  const overcastTop = mix(OVERCAST_NIGHT[0], OVERCAST_DAY[0], daylight);
  const overcastBottom = mix(OVERCAST_NIGHT[1], OVERCAST_DAY[1], daylight);
  top = mix(top, overcastTop, grey);
  bottom = mix(bottom, overcastBottom, grey);

  return { top: css(top), bottom: css(bottom), glow: css(glow), theme: css(top), daylight };
}
